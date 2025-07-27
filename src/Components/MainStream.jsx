import React, { useRef, useEffect } from "react";

const MainStream = () => {
  const canvasRef = useRef();
  const frameQueue = useRef([]);
  const isRendering = useRef(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.binaryType = "arraybuffer";

    socket.onmessage = (event) => {
      const blob = new Blob([event.data], { type: "image/jpeg" });
      const img = new Image();

      img.onload = () => {
        frameQueue.current.push(img);
      };

      img.src = URL.createObjectURL(blob);
    };

    // Frame rendering at 15 FPS
    const renderInterval = setInterval(() => {
      if (frameQueue.current.length > 0 && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        const img = frameQueue.current.shift();
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, 1000 / 15);

    return () => {
      socket.close();
      clearInterval(renderInterval);
    };
  }, []);

  return (
    <div>
      <h2>Live RTSP Stream</h2>
      <canvas ref={canvasRef} width={640} height={480} />
    </div>
  );
};

export default MainStream;
