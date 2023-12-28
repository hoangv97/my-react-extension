import React, { useEffect, useRef } from 'react';
import { useActionDetection } from './useActionDetection';
import { videoHeight, videoWidth } from '../utils';
import { Button } from '@/components/ui/button';
import { Body } from './body';

export default function Actions() {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const body = useRef<Body>(
    new Body((e) => {
      console.log(e);
    })
  );
  const { isEnableWebcamButton, isBodyVisible, enableWebcam, disableWebcam } =
    useActionDetection(webcamRef, body);

  useEffect(() => {
    return () => {
      disableWebcam();
    };
  }, []);

  return (
    <div>
      {isEnableWebcamButton && (
        <Button onClick={enableWebcam} size={'sm'}>
          Enable Webcam
        </Button>
      )}
      {!isEnableWebcamButton && !isBodyVisible && <div>Body not visible</div>}
      {!isEnableWebcamButton && isBodyVisible && (
        <Button
          size="sm"
          className="my-2"
          onClick={() => {
            console.log(body.current);
          }}
        >
          Log body
        </Button>
      )}
      <div className="relative">
        <video
          ref={webcamRef}
          className={`w-[${videoWidth}] h-[${videoHeight}] transform rotate-y-180`}
          autoPlay
          playsInline
        ></video>
      </div>
    </div>
  );
}
