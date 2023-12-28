import { Landmark, NormalizedLandmark } from '@mediapipe/tasks-vision';

export const videoWidth = '640px';
export const videoHeight = '480px';

export const coordToList = (coord: any) => {
  return [coord.x, coord.y, coord.z];
};

// Calculate the angle between three points in 3d space
export function calculate3DAngle(
  p1: Landmark,
  p2: Landmark,
  p3: Landmark
): number {
  // Create vectors
  const a = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
  const b = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

  // Calculate dot product
  const dotProduct = a.x * b.x + a.y * b.y + a.z * b.z;

  // Calculate magnitudes (lengths) of vectors
  const magA = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
  const magB = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);

  // Calculate angle (in radians)
  const angleInRadians = Math.acos(dotProduct / (magA * magB));

  // Convert angle to degrees
  const angleInDegrees = (angleInRadians * 180) / Math.PI;

  return 180 - angleInDegrees;
}

export function calculateAngle(a: number[], b: number[], c: number[]): number {
  const radians: number =
    Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle: number = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

export function calculateSlope(
  a: [number, number],
  b: [number, number]
): number {
  // Handle the case where the points are vertically aligned to avoid division by zero
  if (a[0] === b[0]) {
    return a[1] > b[1] ? -90 : 90;
  }
  const angleRadians: number = Math.atan((b[1] - a[1]) / (b[0] - a[0]));
  const angleDegrees: number = (angleRadians * 180.0) / Math.PI;
  return angleDegrees;
}

export function calculateDistance(
  a: [number, number],
  b: [number, number]
): number {
  const distance: number = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return distance;
}
