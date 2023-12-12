import { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { calculateAngle, calculateSlope, coordToList } from "../utils";

export const landmarkMap: any = {
  nose: 0,
  leftEyeInner: 1,
  leftEye: 2,
  leftEyeOuter: 3,
  rightEyeInner: 4,
  rightEye: 5,
  rightEyeOuter: 6,
  leftEar: 7,
  rightEar: 8,
  mouthLeft: 9,
  mouthRight: 10,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftPinky: 17,
  rightPinky: 18,
  leftIndex: 19,
  rightIndex: 20,
  leftThumb: 21,
  rightThumb: 22,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFootIndex: 31,
  rightFootIndex: 32,
};

export const angleList: any[] = [
  {
    name: 'leftShoulder',
    landmarks: ['leftElbow', 'leftShoulder', 'leftHip'],
  },
  {
    name: 'rightShoulder',
    landmarks: ['rightElbow', 'rightShoulder', 'rightHip'],
  },
  {
    name: 'leftElbow',
    landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'],
  },
  {
    name: 'rightElbow',
    landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'],
  },
  {
    name: 'leftHip',
    landmarks: ['leftShoulder', 'leftHip', 'leftKnee'],
  },
  {
    name: 'rightHip',
    landmarks: ['rightShoulder', 'rightHip', 'rightKnee'],
  },
  {
    name: 'leftKnee',
    landmarks: ['leftHip', 'leftKnee', 'leftAnkle'],
  },
  {
    name: 'rightKnee',
    landmarks: ['rightHip', 'rightKnee', 'rightAnkle'],
  },
  {
    name: 'leftHipKnee',
    landmarks: ['rightHip', 'leftHip', 'leftKnee'],
  },
  {
    name: 'rightHipKnee',
    landmarks: ['leftHip', 'rightHip', 'rightKnee'],
  },
  {
    name: 'eyesSlope',
    type: 'slope',
    landmarks: ['leftEye', 'rightEye'],
  },
];

const detect = (result: PoseLandmarkerResult, timestamp: number) => {
  // console.log('detecting', timestamp);
  const events: any[] = [];

  const poseLandmarks = result.landmarks.map((landmark) => {
    const result: any = {};
    Object.keys(landmarkMap).forEach((key) => {
      result[key] = landmark[landmarkMap[key]];
    });
    return result;
  })

  const angles = result.landmarks.map((landmark) => {
    const angleResult: any = {};
    angleList.forEach((angle) => {
      if (angle.type === 'slope') {
        const [a, b] = angle.landmarks.map((landmarkName: string) =>
          coordToList(landmark[landmarkMap[landmarkName]])
        );
        angleResult[angle.name] = calculateSlope(a, b);
      } else {
        const [a, b, c] = angle.landmarks.map((landmarkName: string) =>
          coordToList(landmark[landmarkMap[landmarkName]])
        );
        angleResult[angle.name] = calculateAngle(a, b, c);
      }
    });

    if (angleResult.leftShoulder > 160 && angleResult.rightShoulder > 160) {
      events.push({
        type: 'squat',
        timestamp,
      });
    }

    return angleResult;
  })

  return {
    poseLandmarks,
    angles,
    timestamp,
    events,
  };
}

/* eslint-disable no-restricted-globals */
self.onmessage = (e: MessageEvent) => {
  // console.log('Worker received:', e.data);
  const { result, timestamp } = e.data;
  const detected = detect(result, timestamp);
  self.postMessage(detected);
};

export { }