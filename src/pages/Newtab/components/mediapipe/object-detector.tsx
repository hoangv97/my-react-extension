import { Button } from '@/components/ui/button';
import {
  ObjectDetectorResult,
  FilesetResolver,
  ObjectDetector,
} from '@mediapipe/tasks-vision';
import React from 'react';
import { videoHeight, videoWidth } from './utils';

const ObjectDetectorContainer = () => {
  const [isEnableWebcamButton, setIsEnableWebcamButton] = React.useState(false);

  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const liveViewRef = React.useRef<HTMLDivElement>(null);
  const objectDetectorRef = React.useRef<ObjectDetector>();
  const lastVideoTimeRef = React.useRef<number>(0);
  const webcamRunningRef = React.useRef<boolean>(false);
  const windowRequestAnimationFrameRef = React.useRef<number>(0);
  const childrenRef = React.useRef<any[]>([]);

  React.useEffect(() => {
    // Before we can use ObjectDetector class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment to
    // get everything needed to run.
    const initializeObjectDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'js/@mediapipe/tasks-vision/wasm'
      );
      objectDetectorRef.current = await ObjectDetector.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: `models/mediapipe/efficientdet_lite0.tflite`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          scoreThreshold: 0.5,
        }
      );
    };
    initializeObjectDetector();

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

  const displayVideoDetections = (result: ObjectDetectorResult) => {
    if (!liveViewRef.current || !webcamRef.current) {
      return;
    }
    // Remove any highlighting from previous frame.
    for (let child of childrenRef.current) {
      liveViewRef.current.removeChild(child);
    }
    childrenRef.current.splice(0);
    // Iterate through predictions and draw them to the live view
    for (let detection of result.detections) {
      if (!detection.boundingBox || detection.categories.length === 0) {
        continue;
      }
      const p = document.createElement('p');
      p.innerText =
        detection.categories[0].categoryName +
        ' (' +
        Math.round(parseFloat(detection.categories[0].score as any) * 100) +
        '%)';
      p.style =
        'left: ' +
        (webcamRef.current.offsetWidth -
          detection.boundingBox.width -
          detection.boundingBox.originX) +
        'px;' +
        'top: ' +
        detection.boundingBox.originY +
        'px; ' +
        'width: ' +
        (detection.boundingBox.width - 10) +
        'px; background: rgba(0, 255, 0, 0.25); border: 1px dashed #fff; z-index: 1; position: absolute;';

      const highlighter = document.createElement('div');
      highlighter.setAttribute('class', 'highlighter');
      highlighter.style =
        'left: ' +
        (webcamRef.current.offsetWidth -
          detection.boundingBox.width -
          detection.boundingBox.originX) +
        'px;' +
        'top: ' +
        detection.boundingBox.originY +
        'px;' +
        'width: ' +
        (detection.boundingBox.width - 10) +
        'px;' +
        'height: ' +
        detection.boundingBox.height +
        'px;';

      liveViewRef.current.appendChild(highlighter);
      liveViewRef.current.appendChild(p);

      // Store drawn objects in memory so they are queued to delete at next call.
      childrenRef.current.push(highlighter);
      childrenRef.current.push(p);
    }
  };

  const predictWebcam = async () => {
    if (webcamRef.current && objectDetectorRef.current && liveViewRef.current) {
      webcamRef.current.style.height = videoHeight;
      webcamRef.current.style.width = videoWidth;

      let startTimeMs = performance.now();
      if (lastVideoTimeRef.current !== webcamRef.current.currentTime) {
        lastVideoTimeRef.current = webcamRef.current.currentTime;
        const results = objectDetectorRef.current.detectForVideo(
          webcamRef.current,
          startTimeMs
        );
        displayVideoDetections(results);
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunningRef.current) {
      windowRequestAnimationFrameRef.current =
        window.requestAnimationFrame(predictWebcam);
    }
  };

  const enableWebcam = async () => {
    if (!objectDetectorRef.current) {
      console.log('Wait! objectDetector not loaded yet.');
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

  return (
    <div>
      {isEnableWebcamButton && (
        <Button onClick={enableWebcam} size={'sm'}>
          Enable Webcam
        </Button>
      )}
      <div ref={liveViewRef} className="relative">
        <video
          ref={webcamRef}
          className={`w-[${videoWidth}] h-[${videoHeight}] transform rotate-y-180`}
          autoPlay
          playsInline
        ></video>
      </div>
    </div>
  );
};

export default ObjectDetectorContainer;
