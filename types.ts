export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  tree: [number, number, number];
  scatter: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color?: string;
}

export const CONSTANTS = {
  FOLIAGE_COUNT: 12000,
  ORNAMENT_COUNT: 400,
  GIFT_COUNT: 50,
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5,
  TRANSITION_SPEED: 2.5, // Lerp speed
};