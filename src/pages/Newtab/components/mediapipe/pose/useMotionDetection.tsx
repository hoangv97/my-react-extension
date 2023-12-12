import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { useState, useEffect, useRef } from 'react';
import { detect } from './worker';

export const useMotionDetection = (onMotionDetected: (event: any) => void) => {
  const [result, setResult] = useState<PoseLandmarkerResult>();
  const [poseLandmarks, setPoseLandmarks] = useState<any[]>();
  const [angles, setAngles] = useState<any[]>();

  const motionDetector = useRef<Worker>(
    new Worker(new URL('./worker.ts', import.meta.url))
  );

  // useEffect(() => {
  //   motionDetector.current.addEventListener('message', (event) => {
  //     const { poseLandmarks, angles, timestamp, events } = event.data;
  //     setPoseLandmarks(poseLandmarks);
  //     setAngles(angles);
  //     onMotionDetected(events);
  //   });

  //   // Clean up
  //   return () => {
  //     motionDetector.current.terminate();
  //   };
  // }, []);

  useEffect(() => {
    if (result) {
      const timestamp = new Date().getTime();
      // motionDetector.current.postMessage({
      //   timestamp,
      //   result,
      // });
      const detected = detect(result, timestamp);
      setPoseLandmarks(detected.poseLandmarks);
      setAngles(detected.angles);
      onMotionDetected(detected.events);
    }
  }, [result]);

  return {
    result,
    setResult,
    poseLandmarks,
    angles,
  };
};
