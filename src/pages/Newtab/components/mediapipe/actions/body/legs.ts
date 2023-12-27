import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { AnglesProps, PoseLandmarkerProps } from '../const';

class LegSide {
  side: string;
  straight: boolean = false;

  constructor(side: string) {
    this.side = side;
  }

  update(
    hip: NormalizedLandmark,
    knee: NormalizedLandmark,
    ankle: NormalizedLandmark,
    footIndex: NormalizedLandmark,
    hipAngle: number,
    kneeAngle: number,
    hipKneeAngle: number
  ) {
    this.straight = kneeAngle > 160;
  }
}

export class Legs {
  left: LegSide;
  right: LegSide;
  squat: boolean = false;

  constructor() {
    this.left = new LegSide('left');
    this.right = new LegSide('right');
  }

  updateLandmarks(
    landmarks: PoseLandmarkerProps,
    angles: AnglesProps,
    timestamp: number
  ) {
    this.left.update(
      landmarks.leftHip,
      landmarks.leftKnee,
      landmarks.leftAnkle,
      landmarks.leftFootIndex,
      angles.leftHip,
      angles.leftKnee,
      angles.leftHipKnee
    );
    this.right.update(
      landmarks.rightHip,
      landmarks.rightKnee,
      landmarks.rightAnkle,
      landmarks.rightFootIndex,
      angles.rightHip,
      angles.rightKnee,
      angles.rightHipKnee
    );
  }
}
