import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import { Link } from "react-router-dom";

const cleanReply = (text) => {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const quickReplies = [
  { label: "📱 Điện thoại", value: "Tư vấn điện thoại cho tôi" },
  { label: "💻 Laptop", value: "Tư vấn laptop cho tôi" },
  { label: "🎧 Tai nghe", value: "Tai nghe nào ngon" },
  { label: "📦 Đơn hàng", value: "Kiểm tra đơn hàng của tôi" },
  { label: "🛡️ Bảo hành", value: "Chính sách bảo hành như thế nào" },
];

function ChatBot({ userName = "", userEmail = "" }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef();

  const getGreeting = () => {
    return userName
      ? `👋 Xin chào ${userName}! Em có thể giúp gì cho anh/chị hôm nay?`
      : `👋 Xin chào! Bạn cần tư vấn gì ạ?`;
  };

  useEffect(() => {
    if (!open) return;

    setMessages((prev) => {
      if (prev.some((m) => m.welcome)) return prev;
      return [{ text: getGreeting(), sender: "ai", welcome: true }];
    });
  }, [open, userName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resetChat = () => {
    setMessages([{ text: getGreeting(), sender: "ai", welcome: true }]);
  };

  const handleQuickReply = (value) => {
    setMessage(value);
    setTimeout(() => sendMessageWithText(value), 100);
  };

  const sendMessageWithText = async (text) => {
    const userMessage = text || message;
    if (!userMessage.trim()) return;
    setMessage("");

    const history = [];
    const filtered = messages.filter((m) => !m.welcome && m.type !== "loading");

    for (let i = 0; i < filtered.length; i++) {
      const msg = filtered[i];
      if (msg.text) {
        if (msg.sender === "ai") {
          let content = cleanReply(msg.text);
          const nextMsg = filtered[i + 1];
          if (nextMsg?.products?.length > 0) {
            const productNames = nextMsg.products.map((p) => p.name).join(", ");
            content += `\n[Sản phẩm đã gợi ý: ${productNames}]`;
            i++;
          }
          history.push({ role: "assistant", content });
        } else {
          history.push({ role: "user", content: msg.text });
        }
      } else if (msg.products?.length > 0) {
        const productNames = msg.products.map((p) => p.name).join(", ");
        history.push({
          role: "assistant",
          content: `[Sản phẩm đã gợi ý: ${productNames}]`,
        });
      }
    }

    const recentHistory = history.slice(-10);

    setMessages((prev) => [
      ...prev,
      { text: userMessage, sender: "user" },
      { type: "loading", sender: "ai" },
    ]);

    try {
      console.log("SEND:", { userName, userEmail }); // debug

      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: recentHistory,
          userName,
          userEmail,
        }),
      });

      // ✅ FIX LỖI QUAN TRỌNG
      if (!res.ok) {
        throw new Error("API error");
      }

      const data = await res.json();

      setMessages((prev) => {
        const filteredPrev = prev.filter((m) => m.type !== "loading");

       const newProducts = data.products || [];
        const aiMessage = {
          text: cleanReply(data.reply || "Không có phản hồi"),
          sender: "ai",
        };

        const productMsg =
          newProducts.length > 0
            ? { sender: "ai", products: newProducts }
            : null;

        return [
          ...filteredPrev,
          aiMessage,
          ...(productMsg ? [productMsg] : []),
        ];
      });
    } catch (err) {
      console.error("FE ERROR:", err);

      setMessages((prev) => {
        const f = prev.filter((m) => m.type !== "loading");
        return [
          ...f,
          {
            text: "❌ Không kết nối được server hoặc server lỗi",
            sender: "ai",
          },
        ];
      });
    }
  };

  const sendMessage = () => sendMessageWithText(message);
  const showQuickReplies = messages.filter((m) => !m.welcome).length === 0;

  return (
    <>
      <div className="chat-icon" onClick={() => setOpen(!open)}>💬</div>

      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <span>chăm sóc & hỗ trợ khách hàng</span>
            <button className="chat-reset-btn" onClick={resetChat}>
              🔄
            </button>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.type === "loading" && (
                  <div className="chat-message ai loading">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                )}

                {msg.text && (
                  <div className={`chat-message ${msg.sender}`}>
                    {cleanReply(msg.text).split("\n").map((line, idx) =>
                      line.trim() ? <p key={idx}>{line}</p> : null
                    )}
                  </div>
                )}

                {msg.products?.map((p) => (
                  <div className="chat-product-card" key={p.id}>
                    <img src={p.image} alt={p.name} />
                    <h4>{p.name}</h4>
                    <p>{p.price?.toLocaleString()}đ</p>
                    <Link to={`/product/${p.id}`}>Xem sản phẩm</Link>
                  </div>
                ))}
              </div>
            ))}

            {showQuickReplies && (
              <div className="quick-replies">
                {quickReplies.map((q) => (
                  <button
                    key={q.label}
                    className="quick-reply-btn"
                    onClick={() => handleQuickReply(q.value)}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="chat-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hỏi sản phẩm..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;