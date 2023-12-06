import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DrawingUtils,
  FilesetResolver,
  FaceLandmarker,
} from '@mediapipe/tasks-vision';
import React from 'react';

const videoHeight = '360px';
const videoWidth = '480px';

const FaceLandmarkDetection = () => {
  const [isEnableWebcamButton, setIsEnableWebcamButton] = React.useState(false);
  const [faceBlendshapes, setFaceBlendshapes] = React.useState<any[]>([]);

  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasCtxRef = React.useRef<CanvasRenderingContext2D>(null);
  const drawingUtilsRef = React.useRef<DrawingUtils>(null);
  const faceLandmarkerRef = React.useRef<FaceLandmarker>();
  const lastVideoTimeRef = React.useRef<number>(0);
  const webcamRunningRef = React.useRef<boolean>(false);
  const windowRequestAnimationFrameRef = React.useRef<number>(0);

  React.useEffect(() => {
    // Before we can use FaceLandmarker class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment to
    // get everything needed to run.
    const createFaceLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'js/@mediapipe/tasks-vision/wasm'
      );
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          outputFaceBlendshapes: true,
          numFaces: 1,
        }
      );
    };
    createFaceLandmarker();

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
      faceLandmarkerRef.current &&
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
        const results = faceLandmarkerRef.current.detectForVideo(
          webcamRef.current,
          startTimeMs
        );
        canvasCtxRef.current.save();
        canvasCtxRef.current.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        if (results.faceLandmarks) {
          for (const landmarks of results.faceLandmarks) {
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_TESSELATION,
              { color: '#C0C0C070', lineWidth: 1 }
            );
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
              { color: '#FF3030' }
            );
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
              { color: '#FF3030' }
            );
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
              { color: '#30FF30' }
            );
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
              { color: '#30FF30' }
            );
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
              { color: '#E0E0E0' }
            );
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_LIPS,
              { color: '#E0E0E0' }
            );
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
              { color: '#FF3030' }
            );
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
              { color: '#30FF30' }
            );
          }
        }
        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
          setFaceBlendshapes(
            (results.faceBlendshapes[0].categories || []).map((shape) => ({
              index: shape.index,
              name: shape.displayName || shape.categoryName,
              value: parseFloat((shape.score * 100) as any).toFixed(4),
            }))
          );
        } else {
          setFaceBlendshapes([]);
        }
        canvasCtxRef.current.restore();
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunningRef.current) {
      windowRequestAnimationFrameRef.current =
        window.requestAnimationFrame(predictWebcam);
    }
  };

  const enableWebcam = async () => {
    if (!faceLandmarkerRef.current) {
      console.log('Wait! faceLandmarker not loaded yet.');
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
        {faceBlendshapes && faceBlendshapes.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {faceBlendshapes.map((shape, index) => (
              <div key={shape.index} className="flex gap-2">
                <div className="w-52">
                  {shape.index}. {shape.name}
                </div>
                <Progress value={shape.value} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceLandmarkDetection;
