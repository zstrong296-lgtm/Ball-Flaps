
export enum GameStatus {
  Idle,
  Playing,
  GameOver,
}

export type BallColor = 'red' | 'green' | 'blue' | 'yellow' | 'pink';

export const BALL_COLORS: BallColor[] = ['red', 'green', 'blue', 'yellow', 'pink'];

export interface BallState {
  x: number;
  y: number;
  radius: number;
  velocityY: number;
}

export interface ObstacleState {
  x: number;
  width: number;
  gapY: number;
  gapHeight: number;
  scored: boolean;
}

export interface ShooterState {
  y: number;
  height: number;
  direction: 'up' | 'down';
  width: number;
  x: number;
}

export interface BulletState {
  x: number;
  y: number;
  width: number;
  height: number;
}
