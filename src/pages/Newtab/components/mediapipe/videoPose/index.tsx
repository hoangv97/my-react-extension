import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import React, { useEffect, useRef, useState } from 'react';
import { Body } from '../actions/body';

export default function VideoPose() {
  const [video, setVideo] = useState<File | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoTimeRef = useRef<number>(0);
  const body = useRef<Body>(
    new Body((e) => {
      console.log('action', e);
    })
  );
  const windowRequestAnimationFrameRef = useRef<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
    }
  };

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
            // Reference: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          // outputSegmentationMasks: true,
        }
      );
    };
    createPoseLandmarker();
  }, []);

  useEffect(() => {
    window.cancelAnimationFrame(windowRequestAnimationFrameRef.current);
  }, [video]);

  const isPlaying = () => {
    return (
      videoRef.current &&
      videoRef.current.currentTime > 0 &&
      !videoRef.current.paused &&
      !videoRef.current.ended &&
      videoRef.current.readyState > 2
    );
  };

  const predictVideo = () => {
    if (videoRef.current && poseLandmarkerRef.current && body && body.current) {
      let startTimeMs = performance.now();
      if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        poseLandmarkerRef.current.detectForVideo(
          videoRef.current,
          startTimeMs,
          (result) => {
            // console.log('landmarks', result.landmarks);

            if (
              result.landmarks.length > 0 &&
              result.worldLandmarks.length > 0
            ) {
              body.current.updateLandmarks(
                result.landmarks[0],
                result.worldLandmarks[0],
                startTimeMs
              );
            } else {
              body.current.updateLandmarks(null, null, startTimeMs);
            }
          }
        );
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    if (isPlaying()) {
      windowRequestAnimationFrameRef.current =
        window.requestAnimationFrame(predictVideo);
    }
  };

  return (
    <div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="video">Video</Label>
        <Input id="video" type="file" onChange={handleFileChange} />
      </div>
      {!!video && (
        <video
          ref={videoRef}
          src={URL.createObjectURL(video)}
          playsInline
          controls
          onPlay={(e) => {
            predictVideo();
          }}
        ></video>
      )}
    </div>
  );
}
