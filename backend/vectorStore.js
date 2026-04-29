import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { db } from "./firebaseAdmin.js";
import dotenv from "dotenv";
dotenv.config();

let vectorStore = null;

export const buildVectorStore = async (forceReload = false) => {
  if (vectorStore && !forceReload) return vectorStore;

  console.log("🔄 Loading products...");
  const snapshot = await db.collection("Products").get();

  const docs = snapshot.docs
    .map((doc) => {
      const p = doc.data();
      const name = (p.name || "").toLowerCase();
      const raw = `${p.name} ${p.category || ""} ${p.description || ""}`.toLowerCase();

      let category = "other";
      if (/(iphone|samsung|oppo|xiaomi|vivo|realme|phone|điện thoại)/.test(raw)) category = "phone";
      else if (/(macbook|laptop|asus|lenovo|dell|hp|pc|surface|msi)/.test(raw)) category = "laptop";
      else if (/(airpods|headphone|tai nghe|earbuds|audio|bluetooth|speaker|earpods|beats)/.test(raw)) category = "accessory";
      else if (/(rog|gaming|game|xbox ally|steam deck)/.test(raw)) category = "gaming_device";
      else if (/(watch|đồng hồ|smartwatch)/.test(raw)) category = "watch";

      let brand = "other";
      if (/(iphone|apple|macbook|airpods|earpods|beats)/.test(name)) brand = "apple";
      else if (/samsung/.test(name)) brand = "samsung";
      else if (/oppo/.test(name)) brand = "oppo";
      else if (/xiaomi/.test(name)) brand = "xiaomi";
      else if (/asus/.test(name)) brand = "asus";
      else if (/lenovo/.test(name)) brand = "lenovo";
      else if (/dell/.test(name)) brand = "dell";
      else if (/hp/.test(name)) brand = "hp";
      else if (/msi/.test(name)) brand = "msi";

      const price = Number(p.price) || 0;

      let priceTier = "unknown";
      if (price > 0 && price <= 2_000_000) priceTier = "duoi_2_trieu";
      else if (price <= 5_000_000) priceTier = "2_den_5_trieu";
      else if (price <= 10_000_000) priceTier = "5_den_10_trieu";
      else if (price <= 20_000_000) priceTier = "10_den_20_trieu";
      else if (price <= 30_000_000) priceTier = "20_den_30_trieu";
      else if (price > 30_000_000) priceTier = "tren_30_trieu";

      const description = (p.description || "").slice(0, 500);

      const keywordBoost = [
        p.name, category, brand,
        p.ram, p.storage, p.color,
        p.size, p.chip, p.material,
        description,
      ].filter(Boolean).join(" ").toLowerCase();

      const pageContent = `
Product: ${p.name}
Category: ${category}
Brand: ${brand}
Price: ${price}
PriceTier: ${priceTier}
Specs: RAM ${p.ram || "?"} | Storage ${p.storage || "?"} | Color ${p.color || "?"} | Screen ${p.size || "?"} | Chip ${p.chip || "?"} | Material ${p.material || "?"}
Description: ${description}
Use case: ${
  category === "phone" ? "chụp ảnh, gaming mobile, mạng xã hội, dùng hàng ngày" :
  category === "laptop" ? "học tập, làm việc, lập trình, văn phòng, đồ họa, gaming" :
  category === "gaming_device" ? "chơi game, cầm tay, portable gaming" :
  category === "watch" ? "sức khỏe, thể thao, smartwatch, thông báo" :
  "nghe nhạc, giải trí, chống ồn, không dây, bluetooth"
}
Keywords: ${keywordBoost}
      `.trim();

      return new Document({
        pageContent,
        metadata: {
          id: doc.id,
          name: p.name || "",
          price,
          priceTier,
          image: p.image || "",
          category,
          brand,
          ram: p.ram || "",
          storage: p.storage || "",
          color: p.color || "",
          size: p.size || "",
          chip: p.chip || "",
          material: p.material || "",
          description,
          keywordBoost,
        },
      });
    })
    .filter((d) => d.metadata.price > 0 && d.metadata.name && d.metadata.name.length > 3);

  vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY, model: "text-embedding-3-small" })
  );

  console.log(`✅ READY: ${docs.length} products indexed`);
  return vectorStore;
};