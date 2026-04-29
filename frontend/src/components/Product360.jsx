import { useRef, useState } from "react";

export default function Product360({ src = "/videos/product360.mp4" }) {
  const videoRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);

  // ===== MOUSE =====
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !videoRef.current) return;

    const currentX = e.clientX;
    const deltaX = currentX - lastX;

    const video = videoRef.current;

    const speed = 0.01; // chỉnh độ nhạy

    video.currentTime += deltaX * speed;

    // Giới hạn thời gian
    if (video.currentTime < 0) video.currentTime = 0;
    if (video.currentTime > video.duration)
      video.currentTime = video.duration;

    setLastX(currentX);
  };

  // ===== TOUCH (MOBILE) =====
  const [lastTouchX, setLastTouchX] = useState(0);

  const handleTouchStart = (e) => {
    setLastTouchX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!videoRef.current) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - lastTouchX;

    videoRef.current.currentTime += deltaX * 0.01;

    // Giới hạn
    if (videoRef.current.currentTime < 0)
      videoRef.current.currentTime = 0;
    if (videoRef.current.currentTime > videoRef.current.duration)
      videoRef.current.currentTime = videoRef.current.duration;

    setLastTouchX(currentX);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        width: "100%",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        preload="auto"
        muted
        playsInline
        style={{
          width: "100%",
          borderRadius: "12px",
          pointerEvents: "none", // 🔥 bắt buộc để drag hoạt động
        }}
      />
    </div>
  );
}