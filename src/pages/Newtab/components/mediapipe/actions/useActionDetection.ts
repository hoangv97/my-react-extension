import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import {
  MutableRefObject,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Body } from './body';

export const useActionDetection = (
  webcamRef: RefObject<HTMLVideoElement>,
  body: MutableRefObject<Body>
) => {
  const [isEnableWebcamButton, setIsEnableWebcamButton] = useState(false);
  const [isBodyVisible, setIsBodyVisible] = useState(false);

  const poseLandmarkerRef = useRef<PoseLandmarker>();
  const lastVideoTimeRef = useRef<number>(0);
  const webcamRunningRef = useRef<boolean>(false);
  const windowRequestAnimationFrameRef = useRef<number>(0);

  useEffect(() => {
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
      webcamRef.current &&
      poseLandmarkerRef.current &&
      body &&
      body.current
    ) {
      let startTimeMs = performance.now();
      if (lastVideoTimeRef.current !== webcamRef.current.currentTime) {
        lastVideoTimeRef.current = webcamRef.current.currentTime;
        poseLandmarkerRef.current.detectForVideo(
          webcamRef.current,
          startTimeMs,
          (result) => {
            // console.log('landmarks', result.landmarks);

            if (
              result.landmarks.length > 0 &&
              result.worldLandmarks.length > 0
            ) {
              setIsBodyVisible(true);
              body.current.updateLandmarks(
                result.landmarks[0],
                result.worldLandmarks[0],
                startTimeMs
              );
            } else {
              setIsBodyVisible(false);
              body.current.updateLandmarks(null, null, startTimeMs);
            }
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
      console.warn('Wait! poseLandmaker not loaded yet.');
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
      }
    });
  };

  return {
    isEnableWebcamButton,
    isBodyVisible,
    enableWebcam,
  };
};
