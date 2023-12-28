import { Landmark, NormalizedLandmark } from '@mediapipe/tasks-vision';
import {
  calculate3DAngle,
  calculateAngle,
  calculateSlope,
  coordToList,
} from '../../utils';
import {
  AnglesProps,
  PoseLandmarkerProps,
  angleList,
  landmarkMap,
} from '../const';
import { Arms } from './arms';
import { Legs } from './legs';

interface BodyStateProps {
  [key: string]: any;
}

interface BodyStateEventProps {
  type: string;
  timestamp: number;
  data: any;
}

export class Body {
  isVisible: boolean = false;
  rawLandmarks: NormalizedLandmark[] = [];
  landmarks: PoseLandmarkerProps = {};
  worldLandmarks: PoseLandmarkerProps = {};
  angles: AnglesProps = {};
  arms: Arms;
  legs: Legs;
  state: BodyStateProps = {};
  eventHandler?: (event: BodyStateEventProps) => void;

  constructor(eventHandler?: (event: BodyStateEventProps) => void) {
    this.arms = new Arms();
    this.legs = new Legs();
    this.eventHandler = eventHandler;
  }

  setEventHandler(eventHandler: (event: BodyStateEventProps) => void) {
    this.eventHandler = eventHandler;
  }

  getEventData() {
    return {
      landmarks: this.landmarks,
      worldLandmarks: this.worldLandmarks,
      angles: this.angles,
    };
  }

  getState(key: string) {
    return (
      this.state[key] || {
        value: false,
        lastActiveTimestamp: 0,
      }
    );
  }

  setState(key: string, value: boolean, timestamp: number) {
    const currentState = this.getState(key);
    this.state[key] = {
      ...currentState,
      value,
      lastActiveTimestamp: value ? timestamp : currentState.lastActiveTimestamp,
    };
  }

  detectAction = (
    key: string,
    condition: boolean,
    timestamp: number,
    lastActiveTsDiff: number = 0
  ) => {
    if (condition) {
      const currentState = this.getState(key);
      if (
        !currentState.value &&
        timestamp - currentState.lastActiveTimestamp > lastActiveTsDiff
      ) {
        this.setState(key, true, timestamp);
        this.eventHandler &&
          this.eventHandler({
            type: key,
            timestamp,
            data: this.getEventData(),
          });
      }
    } else {
      this.setState(key, false, timestamp);
    }
  };

  updateLandmarks(
    landmarks: NormalizedLandmark[] | null,
    worldLandmarks: Landmark[] | null,
    timestamp: number
  ) {
    if (!landmarks || !worldLandmarks) {
      this.isVisible = false;
      console.log('landmarks is null');
      return;
    }
    this.isVisible = true;
    this.rawLandmarks = landmarks;
    this.landmarks = Object.keys(landmarkMap).reduce(
      (acc: any, key: string) => {
        acc[key] = landmarks[landmarkMap[key]];
        return acc;
      },
      {}
    );
    this.worldLandmarks = Object.keys(landmarkMap).reduce(
      (acc: any, key: string) => {
        acc[key] = worldLandmarks[landmarkMap[key]];
        return acc;
      },
      {}
    );

    this.angles = angleList.reduce((acc: any, angle: any) => {
      if (angle.type === 'slope') {
        const [a, b] = angle.landmarks.map((landmarkName: string) =>
          coordToList(landmarks[landmarkMap[landmarkName]])
        );
        acc[angle.name] = calculateSlope(a, b);
      } else {
        const [a, b, c] = angle.landmarks.map(
          (landmarkName: string) => worldLandmarks[landmarkMap[landmarkName]]
        );
        acc[angle.name] = calculate3DAngle(a, b, c);
      }
      return acc;
    }, {});

    // this.arms.updateLandmarks(this.poseLandmarks, this.angles, timestamp);
    // this.legs.updateLandmarks(this.poseLandmarks, this.angles, timestamp);

    this.detectAction(
      'leftJab',
      this.angles.leftElbow > 105 &&
        this.angles.leftShoulder > 55 &&
        this.angles.leftShoulder < 90,
      timestamp,
      1000
    );
  }
}
