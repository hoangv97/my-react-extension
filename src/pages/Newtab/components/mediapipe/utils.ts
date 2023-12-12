export const videoWidth = '640px';
export const videoHeight = '480px';

export const coordToList = (coord: any) => {
  return [coord.x, coord.y, coord.z];
}

export function calculateAngle(a: number[], b: number[], c: number[]): number {
  const radians: number = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle: number = Math.abs(radians * 180.0 / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

export function calculateSlope(a: [number, number], b: [number, number]): number {
  // Handle the case where the points are vertically aligned to avoid division by zero
  if (a[0] === b[0]) {
    return a[1] > b[1] ? -90 : 90;
  }
  const angleRadians: number = Math.atan((b[1] - a[1]) / (b[0] - a[0]));
  const angleDegrees: number = angleRadians * 180.0 / Math.PI;
  return angleDegrees;
}

export function calculateDistance(a: [number, number], b: [number, number]): number {
  const distance: number = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return distance;
}

