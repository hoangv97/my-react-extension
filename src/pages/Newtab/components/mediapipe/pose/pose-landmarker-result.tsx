import {
  NormalizedLandmark,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import React, { useCallback, useEffect } from 'react';
import { useMotionDetection } from './useMotionDetection';

interface PoseLandmarkerResultContainerProps {
  result: PoseLandmarkerResult;
}

const PoseLandmarkerResultContainer = ({
  result,
}: PoseLandmarkerResultContainerProps) => {
  const handleMotionDetected = useCallback((event: any) => {
    console.log('motion detected', event);
  }, []);

  const { setResult, poseLandmarks, angles } =
    useMotionDetection(handleMotionDetected);

  useEffect(() => {
    if (result) {
      setResult(result);
    }
  }, [result]);

  const renderLandmarkCoord = (landmark: NormalizedLandmark, key: string) => {
    return (
      <div className="flex gap-2" key={key}>
        <div>{key}: </div>
        <div className="flex gap-1">
          X: <div className="w-[130px]">{landmark.x}</div>
          Y: <div className="w-[130px]">{landmark.y}</div>
          Z: <div className="w-[130px]">{landmark.z}</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex gap-5">
        <div>
          <div>Landmarks</div>
          <div>
            {poseLandmarks?.map((landmark, index) => (
              <div key={index}>
                {Object.keys(landmark).map((key) =>
                  renderLandmarkCoord(landmark[key], key)
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div>Angles</div>
          <div>
            {angles?.map((angle, index) => (
              <div key={index}>
                {Object.keys(angle).map((key) => (
                  <div key={key}>
                    {key}: {angle[key]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseLandmarkerResultContainer;
