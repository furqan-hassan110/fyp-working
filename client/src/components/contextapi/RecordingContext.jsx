import React, { createContext, useContext, useState } from 'react';

const ScreenRecordingContext = createContext();

export const ScreenRecordingProvider = ({ children }) => {
  const [stream, setStream] = useState(null);

  const startRecording = async () => {
    if (!stream) {
      try {
        const newStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setStream(newStream);
        console.log('Screen recording started.');
      } catch (err) {
        console.error('Error starting screen recording:', err);
      }
    }
  };

  const stopRecording = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      console.log('Screen recording stopped.');
    }
  };

  const attachStreamToVideo = (videoRef) => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
      };
    }
  };

  return (
    <ScreenRecordingContext.Provider
      value={{ stream, startRecording, stopRecording, attachStreamToVideo }}
    >
      {children}
    </ScreenRecordingContext.Provider>
  );
};

export const useScreenRecording = () => useContext(ScreenRecordingContext);
