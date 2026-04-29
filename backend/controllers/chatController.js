import { buildVectorStore } from "../vectorStore.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import { db } from "../firebaseAdmin.js";
dotenv.config();

let message, history = [], userName = "", userEmail = "";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const extractPriceRange = (msg) => {
  const duoiMatch = msg.match(/dưới\s*(\d+(?:[.,]\d+)?)\s*(tr|triệu|m)/i);
  if (duoiMatch) return { min: 0, max: parseFloat(duoiMatch[1].replace(",", ".")) * 1_000_000 };

  const tamMatch = msg.match(/(?:tầm|khoảng|tầm giá)\s*(\d+(?:[.,]\d+)?)\s*(tr|triệu|m)/i);
  if (tamMatch) {
    const c = parseFloat(tamMatch[1].replace(",", ".")) * 1_000_000;
    return { min: c * 0.7, max: c * 1.3 };
  }

  const rangeMatch = msg.match(/(\d+)\s*(tr|triệu)?\s*(?:đến|~|-)\s*(\d+)\s*(tr|triệu)/i);
  if (rangeMatch) return {
    min: parseFloat(rangeMatch[1]) * 1_000_000,
    max: parseFloat(rangeMatch[3]) * 1_000_000,
  };

  return null;
};

const extractCategory = (msg) => {
  if (/(iphone|samsung|oppo|xiaomi|vivo|realme|điện thoại|phone)/.test(msg)) return "phone";
  if (/(laptop gaming|laptop|macbook|lenovo|dell|hp|surface|msi)/.test(msg)) return "laptop";
  if (/(airpods|tai nghe|headphone|earbuds|earpods|beats|speaker)/.test(msg)) return "accessory";
  if (/(rog ally|xbox ally|steam deck|máy cầm tay|handheld)/.test(msg)) return "gaming_device";
  if (/(đồng hồ|watch|smartwatch)/.test(msg)) return "watch";
  return null;
};

// ✅ Lấy category từ history gần nhất
const extractCategoryFromHistory = (history) => {
  const reversed = [...history].reverse();
  for (const h of reversed) {
    if (h.role === "user" && h.content) {
      const cat = extractCategory(h.content.toLowerCase());
      if (cat) return cat;
    }
  }
  return null;
};

const extractProductNamesFromHistory = (history) => {
  const reversed = [...history].reverse();
  for (const h of reversed) {
    if (h.role === "assistant" && h.content) {
      const tagMatch = h.content.match(/\[Sản phẩm đã gợi ý: ([^\]]+)\]/);
      if (tagMatch) return tagMatch[1];

      const matches = h.content.match(/\b([A-Z][a-zA-Z0-9][\w\s\-\+\.]*(?:Pro|Max|Plus|Ultra|5G|4G|GB|TB|inch|Gen)?)\b/g);
      if (matches) return [...new Set(matches.filter(m => m.length > 3))].slice(0, 5).join(" ");
    }
  }
  return "";
};

const detectFollowUp = (msg) => {
  return (
    msg.includes("con đó") || msg.includes("cái đó") ||
    msg.includes("của nó") || msg.includes("sản phẩm đó") ||
    msg.includes("con này") || msg.includes("cái này") ||
    msg.includes("con đầu") || msg.includes("con thứ") ||
    msg.includes("con 1") || msg.includes("con 2") ||
    msg.includes("máy đó") || msg.includes("điện thoại đó") ||
    msg.includes("laptop đó") || msg.includes("tai nghe đó") ||
    msg.includes("2 con này") || msg.includes("3 con này") ||
    msg.includes("2 cái này") || msg.includes("3 cái này") ||
    /^(có màu|màu gì|màu sắc|giá bao|ram bao|bộ nhớ|màn hình|chip gì|cấu hình|mô tả|bảo hành con|pin|camera|thiết kế|chất liệu|nó có|con đó có|cái đó có)/.test(msg)
  );
};

// ✅ Detect hỏi màu sắc
const extractColorFromMsg = (msg) => {
  const colorMap = {
    "đen": "đen", "black": "đen",
    "trắng": "trắng", "white": "trắng",
    "xám": "xám", "gray": "xám", "grey": "xám",
    "xanh": "xanh", "blue": "xanh", "green": "xanh",
    "đỏ": "đỏ", "red": "đỏ",
    "vàng": "vàng", "gold": "vàng",
    "hồng": "hồng", "pink": "hồng",
    "tím": "tím", "purple": "tím",
    "bạc": "bạc", "silver": "bạc",
    "cam": "cam", "orange": "cam",
    "titan": "titan", "titanium": "titan",
  };
  for (const [key, val] of Object.entries(colorMap)) {
    if (msg.includes(key)) return val;
  }
  return null;
};

export const chatWithAI = async (req, res) => {
  try {
    ({ message, history = [], userName = "", userEmail = "" } = req.body);

    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    const userMsg = message.toLowerCase().trim();
    // =====================
// 🔥 TRA ĐƠN HÀNG THEO ID
// =====================
const orderIdMatch = userMsg.match(/dh\d+/i);

if (orderIdMatch) {
  try {
    const orderId = orderIdMatch[0].toUpperCase();

    const snapshot = await db
      .collection("Orders") // 🔥 đúng với Firebase của bạn
      .where("orderId", "==", orderId)
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    if (orders.length === 0) {
      return res.json({
        reply: `Không tìm thấy đơn hàng ${orderId}`,
        products: []
      });
    }

    const order = orders[0];
const items = order.items || [];

let reply = `Đơn ${order.orderId || orderId} của bạn hiện đang ${order.status || "đang xử lý"}.\n`;

items.forEach(item => {
  reply += `- ${item.name || "Sản phẩm"} (${item.price?.toLocaleString()}đ)\n`;
});

if (order.total) {
  reply += `Tổng: ${order.total.toLocaleString()}đ\n`;
}

if (order.address) {
  reply += `Địa chỉ: ${order.address}\n`;
}

return res.json({
  reply: reply.trim(),
  products: items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image
  }))
    });

  } catch (err) {
    console.error("ORDER ID ERROR:", err);
    return res.status(500).json({ error: "Lỗi tra cứu đơn hàng theo mã" });
  }
}
    // =====================
// 1. TRA ĐƠN HÀNG THEO THÔNG TIN KHÁCH HÀNG
// =====================
const isOrderQuery =
  userMsg.includes("đơn hàng") ||
  userMsg.includes("order") ||
  userMsg.includes("giao hàng") ||
  userMsg.includes("trạng thái đơn");

if (isOrderQuery) {
  try {
    const snapshot = await db
      .collection("Orders")
      .where("email", "==", userEmail)
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    if (orders.length === 0) {
      return res.json({
        reply: "Hiện tại bạn chưa có đơn hàng nào.",
        products: []
      });
    }

    const orderPrompt = `
    Đây là dữ liệu đơn hàng:
    ${JSON.stringify(orders)}

    Trả lời tự nhiên, ngắn gọn, thân thiện bằng tiếng Việt.
    `;

    const orderReply = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [{ role: "user", content: orderPrompt }]
    });

    return res.json({
      reply: orderReply.choices[0].message.content,
      products: []
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    return res.status(500).json({ error: "Lỗi tra cứu đơn hàng" });
  }
}

    // =====================
    // 2. INTENT
    // =====================
    const isCompare =
      userMsg.includes("so sánh") || userMsg.includes("khác nhau") ||
      userMsg.includes("cái nào ngon") || userMsg.includes("cái nào tốt") ||
      userMsg.includes("con nào ngon") || userMsg.includes("con nào tốt") ||
      userMsg.includes("2 con") || userMsg.includes("3 con") ||
      userMsg.includes("2 cái") || userMsg.includes("3 cái");

    const hasSpecificProduct =
      userMsg.includes("iphone") || userMsg.includes("samsung") ||
      userMsg.includes("oppo") || userMsg.includes("xiaomi") ||
      userMsg.includes("macbook") || userMsg.includes("laptop") ||
      userMsg.includes("airpods") || userMsg.includes("lenovo") ||
      userMsg.includes("dell") || userMsg.includes("hp") ||
      userMsg.includes("msi") || userMsg.includes("beats");

    // ✅ "dưới/tầm X tr" không kèm category → followup của câu hỏi trước
    const isPriceOnlyMsg = /^(dưới|tầm|khoảng)\s*\d+/.test(userMsg) && !extractCategory(userMsg);

    const isFollowUp = detectFollowUp(userMsg) ||
      (isCompare && !hasSpecificProduct) ||
      isPriceOnlyMsg;

    const topK = isCompare ? 20 : 10;
    const priceRange = extractPriceRange(userMsg);
    let categoryHint = extractCategory(userMsg);

    // ✅ Nếu là followup price → lấy category từ history
    if (isPriceOnlyMsg && !categoryHint) {
      categoryHint = extractCategoryFromHistory(history);
    }

    const colorHint = extractColorFromMsg(userMsg);

    // =====================
    // 3. VECTOR SEARCH
    // =====================
    const store = await buildVectorStore();
    const historyProductNames = isFollowUp && !isPriceOnlyMsg
      ? extractProductNamesFromHistory(history)
      : "";
    const searchQuery = historyProductNames ? `${userMsg} ${historyProductNames}` : userMsg;

    const docs = await store.similaritySearch(searchQuery, topK);

    let productsContext = docs.map((d) => ({
      id: d.metadata.id,
      name: d.metadata.name,
      price: d.metadata.price,
      priceTier: d.metadata.priceTier,
      category: d.metadata.category,
      brand: d.metadata.brand,
      ram: d.metadata.ram,
      storage: d.metadata.storage,
      color: d.metadata.color,
      size: d.metadata.size,
      chip: d.metadata.chip,
      material: d.metadata.material,
      description: d.metadata.description,
      image: d.metadata.image,
    }));

    // =====================
    // 4. PRE-FILTER
    // =====================
    if (categoryHint && !isFollowUp) {
      const filtered = productsContext.filter((p) => p.category === categoryHint);
      if (filtered.length >= 2) productsContext = filtered;
    }

    if (colorHint) {
  // Filter màu + ưu tiên đúng category nếu có
  const colorFiltered = productsContext.filter((p) => {
    const colorMatch = p.color?.toLowerCase().includes(colorHint);
    // Nếu có categoryHint thì phải khớp cả category
    if (categoryHint) return colorMatch && p.category === categoryHint;
    return colorMatch;
  });

  if (colorFiltered.length >= 1) {
    productsContext = colorFiltered;
  } else {
    // Search thêm với category hint
    const searchStr = categoryHint
      ? `${categoryHint} màu ${colorHint}`
      : `điện thoại màu ${colorHint}`;

    const colorDocs = await store.similaritySearch(searchStr, 20);
    const colorProducts = colorDocs
      .map((d) => ({
        id: d.metadata.id,
        name: d.metadata.name,
        price: d.metadata.price,
        priceTier: d.metadata.priceTier,
        category: d.metadata.category,
        brand: d.metadata.brand,
        ram: d.metadata.ram,
        storage: d.metadata.storage,
        color: d.metadata.color,
        size: d.metadata.size,
        chip: d.metadata.chip,
        material: d.metadata.material,
        description: d.metadata.description,
        image: d.metadata.image,
      }))
      .filter((p) => {
        const colorMatch = p.color?.toLowerCase().includes(colorHint);
        if (categoryHint) return colorMatch && p.category === categoryHint;
        return colorMatch;
      });

    if (colorProducts.length >= 1) {
      productsContext = colorProducts;
    } else {
      // Không có màu đó → để AI nói thật, giữ context category
      if (categoryHint) {
        productsContext = productsContext.filter((p) => p.category === categoryHint);
      }
    }
  }
}

    if (priceRange) {
      const { min, max } = priceRange;
      const filtered = productsContext.filter((p) => p.price >= min && p.price <= max);
      if (filtered.length >= 1) productsContext = filtered;
    }

    // FOLLOWUP inject SP từ history
    if (isFollowUp && historyProductNames) {
      const historyNames = historyProductNames.toLowerCase().split(",").map(s => s.trim());
      const allDocs = await store.similaritySearch(historyProductNames, 10);
      const historyProducts = allDocs
        .map((d) => ({
          id: d.metadata.id,
          name: d.metadata.name,
          price: d.metadata.price,
          priceTier: d.metadata.priceTier,
          category: d.metadata.category,
          brand: d.metadata.brand,
          ram: d.metadata.ram,
          storage: d.metadata.storage,
          color: d.metadata.color,
          size: d.metadata.size,
          chip: d.metadata.chip,
          material: d.metadata.material,
          description: d.metadata.description,
          image: d.metadata.image,
        }))
        .filter((p) =>
          historyNames.some((n) => p.name.toLowerCase().includes(n.substring(0, 10)))
        );

      const existingIds = new Set(productsContext.map((p) => p.id));
      const newFromHistory = historyProducts.filter((p) => !existingIds.has(p.id));
      productsContext = [...newFromHistory, ...productsContext].slice(0, 15);
    }

    // =====================
    // 5. SYSTEM PROMPT
    // =====================
    const systemPrompt = `
Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của shop công nghệ BerryGold.

THÔNG TIN KHÁCH HÀNG:
- Tên khách: ${userName || "Khách"}
- Xưng hô: gọi khách là "${userName ? `anh/chị ${userName}` : "bạn"}"
- Nếu biết tên → dùng tên trong câu trả lời cho thân thiện

THÔNG TIN SHOP:
- Bảo hành: 12 tháng chính hãng tại BerryGold
- Đổi trả: 30 ngày nếu lỗi nhà sản xuất
- Hotline: 0909.090.909
- Trả góp: BerryGold không hỗ trợ trả góp
- Ship: BerryGold giao hàng toàn quốc, phí và thời gian tùy khu vực, gọi hotline để biết chi tiết

FORMAT REPLY:
- Viết đoạn văn tự nhiên, KHÔNG đánh số 1. 2. 3.
- KHÔNG dùng gạch đầu dòng - hay •
- KHÔNG dùng **bold**, *italic*, #heading
- KHÔNG liệt kê URL hay markdown ảnh
- Tối đa 4 câu cho câu hỏi thông thường, 6 câu cho so sánh
- Thân thiện như nhân viên thật
- KHÔNG kết thúc bằng "Nếu bạn cần thêm thông tin..." hay "hãy cho mình biết nhé"

QUY TẮC DỮ LIỆU:
- CHỈ dùng thông số có trong PRODUCTS bên dưới, KHÔNG bịa
- KHÔNG tự tạo ID
- KHÔNG hướng khách ra ngoài BerryGold
- KHÔNG nhắc "Apple / Samsung / nhà sản xuất support"
- Hỏi màu → CHỈ chọn SP có field color khớp, nếu không có thì nói thật và gợi ý màu có sẵn
- Hỏi "điện thoại màu X" → CHỈ tìm trong category phone, KHÔNG lấy laptop hay accessory
- Hỏi "laptop màu X" → CHỈ tìm trong category laptop
- Nếu không có màu đó → nói thật và gợi ý màu có sẵn

XỬ LÝ CONTEXT:
- Luôn đọc LỊCH SỬ trước khi trả lời
- Tag "[Sản phẩm đã gợi ý: X, Y]" = SP đã show — nguồn chính xác nhất
- "con đó / cái đó / nó" → SP CUỐI CÙNG trong lịch sử
- "con đầu / con thứ 2" → đếm đúng thứ tự trong tag
- "cái nào ngon / so sánh" không nhắc tên → so sánh SP trong tag gần nhất
- "ngon không / tốt không" → nhận xét SP đang nhắc
- Câu hỏi specs ngắn → trả lời về SP trong tag gần nhất
- "dưới X tr" sau khi đã hỏi loại SP → lọc đúng loại SP đó theo giá

SO SÁNH:
- Nêu khác biệt chính: giá, RAM, chip, camera, use case
- Kết luận rõ cái nào phù hợp ai, ngắn gọn

OUTPUT JSON DUY NHẤT:
{
  "reply": string,
  "selectedIds": string[],
  "confidence": number
}
`;

    // =====================
    // 6. CALL AI
    // =====================
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        {
          role: "user",
          content: `USER: ${userMsg}\n\nPRODUCTS:\n${JSON.stringify(productsContext, null, 2)}`,
        },
      ],
    });

    // =====================
    // 7. PARSE
    // =====================
    let aiResponse;
    const rawContent = completion.choices[0].message.content
      .replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      aiResponse = JSON.parse(rawContent);
    } catch (err) {
      return res.json({ reply: "Xin lỗi, mình chưa hiểu. Bạn hỏi lại được không?", products: [] });
    }

    // =====================
    // 8. VALIDATION
    // =====================
    const validIds = new Set(productsContext.map((p) => p.id));
    const safeIds = (aiResponse.selectedIds || []).filter((id) => validIds.has(id));
    const selectedProducts = productsContext.filter((p) => safeIds.includes(p.id));

    return res.json({
      reply: aiResponse.reply || "Mình gợi ý một số sản phẩm phù hợp!",
      products: selectedProducts,
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
