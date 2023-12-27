import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { AnglesProps, PoseLandmarkerProps } from '../const';

class ArmSide {
  side: 'left' | 'right';
  straight: boolean = false;
  curl: boolean = false;
  up: boolean = false;
  front: boolean = false;
  raised: boolean = false;

  constructor(side: 'left' | 'right') {
    this.side = side;
  }

  update(
    shoulder: NormalizedLandmark,
    elbow: NormalizedLandmark,
    wrist: NormalizedLandmark,
    pinky: NormalizedLandmark,
    index: NormalizedLandmark,
    thumb: NormalizedLandmark,
    shoulderAngle: number,
    elbowAngle: number
  ) {
    this.straight = elbowAngle > 160;
    this.up = shoulderAngle > 45;
    this.front = wrist.z > shoulder.z;
    this.curl = elbowAngle < 45;
    this.raised = wrist.y > shoulder.y;
  }
}

export class Arms {
  left: ArmSide;
  right: ArmSide;

  constructor() {
    this.left = new ArmSide('left');
    this.right = new ArmSide('right');
  }

  updateLandmarks(
    landmarks: PoseLandmarkerProps,
    angles: AnglesProps,
    timestamp: number
  ) {
    this.left.update(
      landmarks.leftShoulder,
      landmarks.leftElbow,
      landmarks.leftWrist,
      landmarks.leftPinky,
      landmarks.leftIndex,
      landmarks.leftThumb,
      angles.leftShoulder,
      angles.leftElbow
    );
    this.right.update(
      landmarks.rightShoulder,
      landmarks.rightElbow,
      landmarks.rightWrist,
      landmarks.rightPinky,
      landmarks.rightIndex,
      landmarks.rightThumb,
      angles.rightShoulder,
      angles.rightElbow
    );
  }
}
