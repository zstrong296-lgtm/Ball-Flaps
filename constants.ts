// Game dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;

// Ball physics
export const GRAVITY = 0.5; // Adjusted for a classic Flappy Bird feel
export const JUMP_STRENGTH = -8; // Adjusted for new gravity
export const BALL_RADIUS = 15;
export const BALL_HITBOX_RADIUS = 12; // Smaller hitbox for more forgiving gameplay

// Obstacles
export const OBSTACLE_WIDTH = 80;
export const OBSTACLE_GAP_HEIGHT_MIN = 200; // Increased gap for better playability
export const OBSTACLE_GAP_HEIGHT_MAX = 240; // Increased gap for better playability
export const OBSTACLE_SPACING = 300; // Horizontal distance between obstacles
export const SCROLL_SPEED = 2.5;

// Shooter (for score > 999)
export const CHALLENGE_SCORE = 999;
export const SHOOTER_WIDTH = 20;
export const SHOOTER_HEIGHT = 50;
export const SHOOTER_SPEED = 1.5;
export const BULLET_WIDTH = 20;
export const BULLET_HEIGHT = 5;
export const BULLET_SPEED = 4;
export const FIRE_RATE = 120; // in frames (60fps = 2 seconds)
