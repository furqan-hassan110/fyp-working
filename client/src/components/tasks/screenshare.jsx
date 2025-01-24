import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";

const ScreenShare = ({ onComplete }) => {
  const videoRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    let intervalId;

    if (isSharing) {
      intervalId = setInterval(() => {
        takeScreenshot();
      }, 5000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isSharing]);

  const handleConfirmScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsSharing(true);

      // Notify parent when sharing starts
      if (onComplete) onComplete();

      // Stop the stream when the user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error("Error sharing the screen:", error);
    }
  };

  const stopScreenShare = () => {
    if (videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsSharing(false);
  };

  const takeScreenshot = async () => {
    if (videoRef.current) {
      const canvas = await html2canvas(videoRef.current, {
        allowTaint: true,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      downloadImage(imgData);
      console.log("Screenshot of video taken");
    }
  };

  const downloadImage = (imgData) => {
    const link = document.createElement("a");
    link.href = imgData;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <button onClick={handleConfirmScreenShare}>Start Screen Sharing</button>
    </div>
  );
};

export default ScreenShare;
