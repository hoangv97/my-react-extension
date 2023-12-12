import { Button } from '@/components/ui/button';
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import React from 'react';
import PoseLandmarkerResultContainer from './pose-landmarker-result';
import { videoHeight, videoWidth } from '../utils';

const Pose = () => {
  const [isEnableWebcamButton, setIsEnableWebcamButton] = React.useState(false);
  const [poseLandmarkerResult, setPoseLandmarkerResult] =
    React.useState<PoseLandmarkerResult>();

  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasCtxRef = React.useRef<CanvasRenderingContext2D>(null);
  const drawingUtilsRef = React.useRef<DrawingUtils>(null);
  const poseLandmarkerRef = React.useRef<PoseLandmarker>();
  const lastVideoTimeRef = React.useRef<number>(0);
  const webcamRunningRef = React.useRef<boolean>(false);
  const windowRequestAnimationFrameRef = React.useRef<number>(0);

  React.useEffect(() => {
    // Before we can use PoseLandmarker class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment to
    // get everything needed to run.
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'js/@mediapipe/tasks-vision/wasm'
      );
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: `models/mediapipe/pose_landmarker_lite.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          // outputSegmentationMasks: true,
        }
      );
    };
    createPoseLandmarker();

    // enable webcam
    // Check if webcam access is supported.
    const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (hasGetUserMedia()) {
      setIsEnableWebcamButton(true);
    } else {
      console.warn('getUserMedia() is not supported by your browser');
    }

    return () => {
      webcamRunningRef.current = false;
      window.cancelAnimationFrame(windowRequestAnimationFrameRef.current);
    };
  }, []);

  const predictWebcam = async () => {
    if (
      canvasRef.current &&
      webcamRef.current &&
      poseLandmarkerRef.current &&
      canvasCtxRef.current &&
      drawingUtilsRef.current
    ) {
      canvasRef.current.style.height = videoHeight;
      webcamRef.current.style.height = videoHeight;
      canvasRef.current.style.width = videoWidth;
      webcamRef.current.style.width = videoWidth;

      let startTimeMs = performance.now();
      if (lastVideoTimeRef.current !== webcamRef.current.currentTime) {
        lastVideoTimeRef.current = webcamRef.current.currentTime;
        poseLandmarkerRef.current.detectForVideo(
          webcamRef.current,
          startTimeMs,
          (result) => {
            canvasCtxRef.current.save();
            canvasCtxRef.current.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            for (const landmark of result.landmarks) {
              drawingUtilsRef.current.drawLandmarks(landmark, {
                radius: (data) =>
                  DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
              });
              drawingUtilsRef.current.drawConnectors(
                landmark,
                PoseLandmarker.POSE_CONNECTIONS
              );
            }
            setPoseLandmarkerResult(result);
            canvasCtxRef.current.restore();
          }
        );
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunningRef.current) {
      windowRequestAnimationFrameRef.current =
        window.requestAnimationFrame(predictWebcam);
    }
  };

  const enableWebcam = async () => {
    if (!poseLandmarkerRef.current) {
      console.log('Wait! poseLandmaker not loaded yet.');
      return;
    }

    webcamRunningRef.current = true;
    setIsEnableWebcamButton(false);

    // getUserMedia parameters.
    const constraints = {
      video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.addEventListener('loadeddata', predictWebcam);

        canvasCtxRef.current = canvasRef.current?.getContext('2d')!;
        drawingUtilsRef.current = new DrawingUtils(canvasCtxRef.current);
      }
    });
  };

  return (
    <div>
      {isEnableWebcamButton && (
        <Button onClick={enableWebcam} size={'sm'}>
          Enable Webcam
        </Button>
      )}
      <div className="relative">
        <video
          ref={webcamRef}
          className={`w-[${videoWidth}] h-[${videoHeight}] transform rotate-y-180`}
          autoPlay
          playsInline
        ></video>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
        ></canvas>
        {poseLandmarkerResult && (
          <PoseLandmarkerResultContainer result={poseLandmarkerResult} />
        )}
      </div>
    </div>
  );
};

export default Pose;
