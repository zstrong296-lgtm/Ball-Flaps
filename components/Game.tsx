import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { BallColor, BallState, ObstacleState, ShooterState, BulletState } from '../types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  JUMP_STRENGTH,
  BALL_RADIUS,
  BALL_HITBOX_RADIUS,
  OBSTACLE_WIDTH,
  OBSTACLE_GAP_HEIGHT_MIN,
  OBSTACLE_GAP_HEIGHT_MAX,
  SCROLL_SPEED,
  OBSTACLE_SPACING,
  CHALLENGE_SCORE,
  SHOOTER_WIDTH,
  SHOOTER_HEIGHT,
  SHOOTER_SPEED,
  BULLET_HEIGHT,
  BULLET_WIDTH,
  BULLET_SPEED,
  FIRE_RATE
} from '../constants';
import { audioService } from '../services/audioService';

interface GameProps {
  ballColor: BallColor;
  onGameOver: (score: number) => void;
  setScore: (score: number) => void;
  isPaused: boolean;
}

const colorMap: Record<BallColor, string> = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  pink: 'bg-pink-500',
};

const Game: React.FC<GameProps> = ({ ballColor, onGameOver, setScore, isPaused }) => {
  const gameLoopRef = useRef<number>(0);
  
  const ballRef = useRef<HTMLDivElement>(null);
  const obstaclesRef = useRef<HTMLDivElement[]>([]);
  const shooterRef = useRef<HTMLDivElement>(null);
  const bulletsRef = useRef<HTMLDivElement[]>([]);

  // State for rendering structural changes
  const [renderedObstacles, setRenderedObstacles] = useState<ObstacleState[]>([]);
  const [renderedShooter, setRenderedShooter] = useState<ShooterState | null>(null);
  const [renderedBullets, setRenderedBullets] = useState<BulletState[]>([]);

  const gameState = useRef({
    ball: { x: GAME_WIDTH / 4, y: GAME_HEIGHT / 2, radius: BALL_RADIUS, velocityY: 0 } as BallState,
    obstacles: [] as ObstacleState[],
    shooter: null as ShooterState | null,
    bullets: [] as BulletState[],
    frameCount: 0,
    score: 0,
  });

  const resetGameState = useCallback(() => {
    const initialGapHeight = OBSTACLE_GAP_HEIGHT_MIN + Math.random() * (OBSTACLE_GAP_HEIGHT_MAX - OBSTACLE_GAP_HEIGHT_MIN);
    const initialState = {
      ball: {
        x: GAME_WIDTH / 4,
        y: GAME_HEIGHT / 2,
        radius: BALL_RADIUS,
        velocityY: 0,
      },
      obstacles: [{
          x: GAME_WIDTH,
          width: OBSTACLE_WIDTH,
          gapY: Math.random() * (GAME_HEIGHT - initialGapHeight - 100) + 50,
          gapHeight: initialGapHeight,
          scored: false,
      }],
      shooter: null,
      bullets: [],
      frameCount: 0,
      score: 0,
    };
    gameState.current = initialState;
    setRenderedObstacles(initialState.obstacles);
    setRenderedShooter(initialState.shooter);
    setRenderedBullets(initialState.bullets);
    setScore(0);
  }, [setScore]);
  
  // Initialize game state on mount
  useEffect(() => {
    resetGameState();
  }, [resetGameState]);

  // Handle restart: when isPaused goes from true to false
  const prevIsPausedRef = useRef(isPaused);
  useEffect(() => {
      if (prevIsPausedRef.current && !isPaused) {
          resetGameState();
      }
      prevIsPausedRef.current = isPaused;
  }, [isPaused, resetGameState]);

  const flap = useCallback(() => {
    if (isPaused) return;
    gameState.current.ball.velocityY = JUMP_STRENGTH;
    audioService.playFlapSound();
  }, [isPaused]);

  useEffect(() => {
    const handleInput = (e: Event) => {
      e.preventDefault();
      if (e instanceof KeyboardEvent && e.code !== 'Space') return;
      flap();
    };

    window.addEventListener('keydown', handleInput);
    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', handleInput);

    return () => {
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('mousedown', handleInput);
      window.removeEventListener('touchstart', handleInput);
    };
  }, [flap]);
  
  useEffect(() => {
    const gameLoop = () => {
      if (isPaused) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
  
      const state = gameState.current;
      let obstacleStructureChanged = false;
      let bulletStructureChanged = false;
      let shooterStateChanged = false;
      state.frameCount++;
  
      // Update Ball
      state.ball.velocityY += GRAVITY;
      state.ball.y += state.ball.velocityY;
  
      // Update Obstacles
      state.obstacles.forEach(o => o.x -= SCROLL_SPEED);
      if (state.obstacles.length > 0 && state.obstacles[0].x < -OBSTACLE_WIDTH) {
        state.obstacles.shift();
        obstacleStructureChanged = true;
      }
      const lastObstacle = state.obstacles[state.obstacles.length - 1];
      if (lastObstacle && lastObstacle.x < GAME_WIDTH - OBSTACLE_SPACING) {
          const newGapHeight = OBSTACLE_GAP_HEIGHT_MIN + Math.random() * (OBSTACLE_GAP_HEIGHT_MAX - OBSTACLE_GAP_HEIGHT_MIN);
          state.obstacles.push({
              x: lastObstacle.x + OBSTACLE_SPACING,
              width: OBSTACLE_WIDTH,
              gapY: Math.random() * (GAME_HEIGHT - newGapHeight - 150) + 75,
              gapHeight: newGapHeight,
              scored: false,
          });
          obstacleStructureChanged = true;
      }
  
      // Update Shooter and Bullets
      const originalBulletCount = state.bullets.length;
      if (state.score >= CHALLENGE_SCORE) {
          if (!state.shooter) {
              state.shooter = { x: 0, y: GAME_HEIGHT / 2, width: SHOOTER_WIDTH, height: SHOOTER_HEIGHT, direction: 'down' };
              shooterStateChanged = true;
          }
          if (state.shooter) {
              if (state.shooter.y >= GAME_HEIGHT - SHOOTER_HEIGHT || state.shooter.y <= 0) {
                  state.shooter.direction = state.shooter.direction === 'down' ? 'up' : 'down';
              }
              state.shooter.y += state.shooter.direction === 'down' ? SHOOTER_SPEED : -SHOOTER_SPEED;
  
              if (state.frameCount % FIRE_RATE === 0) {
                  state.bullets.push({ x: SHOOTER_WIDTH, y: state.shooter.y + SHOOTER_HEIGHT / 2 - BULLET_HEIGHT / 2, width: BULLET_WIDTH, height: BULLET_HEIGHT });
              }
          }
      }
      state.bullets.forEach(b => b.x += BULLET_SPEED);
      state.bullets = state.bullets.filter(b => b.x < GAME_WIDTH);
      if (originalBulletCount !== state.bullets.length || (state.frameCount % FIRE_RATE === 0 && state.shooter)) {
          bulletStructureChanged = true;
      }
  
      // Collision Detection
      // -- Ground and ceiling
      if (state.ball.y > GAME_HEIGHT - BALL_HITBOX_RADIUS || state.ball.y < BALL_HITBOX_RADIUS) {
        audioService.playCrashSound();
        onGameOver(state.score);
        return;
      }
      // -- Obstacles
      for (const obstacle of state.obstacles) {
        if (
          state.ball.x + BALL_HITBOX_RADIUS > obstacle.x &&
          state.ball.x - BALL_HITBOX_RADIUS < obstacle.x + obstacle.width
        ) {
          if (
            state.ball.y - BALL_HITBOX_RADIUS < obstacle.gapY ||
            state.ball.y + BALL_HITBOX_RADIUS > obstacle.gapY + obstacle.gapHeight
          ) {
            audioService.playCrashSound();
            onGameOver(state.score);
            return;
          }
        }
      }
      // -- Bullets
       for (const bullet of state.bullets) {
          if (
              state.ball.x + BALL_HITBOX_RADIUS > bullet.x &&
              state.ball.x - BALL_HITBOX_RADIUS < bullet.x + bullet.width &&
              state.ball.y + BALL_HITBOX_RADIUS > bullet.y &&
              state.ball.y - BALL_HITBOX_RADIUS < bullet.y + bullet.height
          ) {
              audioService.playCrashSound();
              onGameOver(state.score);
              return;
          }
      }
  
      // Score
      const nextObstacle = state.obstacles.find(o => !o.scored && o.x + o.width < state.ball.x);
      if (nextObstacle) {
        nextObstacle.scored = true;
        state.score++;
        setScore(state.score);
        audioService.playScoreSound();
      }
      
      // Update DOM elements for position
      if(ballRef.current) ballRef.current.style.transform = `translate(${state.ball.x - state.ball.radius}px, ${state.ball.y - state.ball.radius}px)`;
      state.obstacles.forEach((o, i) => {
          if (obstaclesRef.current[i*2]) obstaclesRef.current[i*2].style.transform = `translateX(${o.x}px)`;
          if (obstaclesRef.current[i*2+1]) obstaclesRef.current[i*2+1].style.transform = `translateX(${o.x}px)`;
      });
      if (state.shooter && shooterRef.current) shooterRef.current.style.transform = `translateY(${state.shooter.y}px)`;
      state.bullets.forEach((b, i) => {
          if (bulletsRef.current[i]) bulletsRef.current[i].style.transform = `translate(${b.x}px, ${b.y}px)`;
      });
  
      // Trigger re-render if the number of elements changed
      if (obstacleStructureChanged) setRenderedObstacles([...state.obstacles]);
      if (bulletStructureChanged) setRenderedBullets([...state.bullets]);
      if (shooterStateChanged) setRenderedShooter(state.shooter);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPaused, onGameOver, setScore]);

  obstaclesRef.current = [];
  bulletsRef.current = [];

  return (
    <div className="w-full h-full" >
        {/* Score Display */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl font-bold text-white z-10" style={{ textShadow: '2px 2px 4px #000' }}>
            {gameState.current.score}
        </div>
        {/* Ball */}
        <div
            ref={ballRef}
            className={`absolute rounded-full ${colorMap[ballColor]}`}
            style={{ width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 }}
        />
        {/* Obstacles */}
        {renderedObstacles.map((o, i) => (
            <React.Fragment key={i}>
                <div
                    ref={el => { if(el) obstaclesRef.current[i*2] = el; }}
                    className="absolute bg-black border-2 border-gray-600"
                    style={{
                        left: 0,
                        top: 0,
                        width: o.width,
                        height: o.gapY,
                    }}
                />
                <div
                    ref={el => { if(el) obstaclesRef.current[i*2+1] = el; }}
                    className="absolute bg-black border-2 border-gray-600"
                    style={{
                        left: 0,
                        top: o.gapY + o.gapHeight,
                        width: o.width,
                        height: GAME_HEIGHT - (o.gapY + o.gapHeight),
                    }}
                />
            </React.Fragment>
        ))}
        {/* Shooter */}
        {renderedShooter && (
            <div
              ref={shooterRef}
              className="absolute"
              style={{
                left: renderedShooter.x,
                top: 0,
                width: renderedShooter.width,
                height: renderedShooter.height,
              }}
            >
              <div 
                className="absolute bg-gray-500 border border-gray-900"
                style={{
                  width: SHOOTER_WIDTH,
                  height: SHOOTER_WIDTH,
                  top: 0,
                  left: 0,
                }}
              />
              <div 
                className="absolute bg-gray-700 border-x border-b border-gray-900"
                style={{
                  width: SHOOTER_WIDTH,
                  height: SHOOTER_HEIGHT - SHOOTER_WIDTH,
                  top: SHOOTER_WIDTH,
                  left: 0,
                }}
              />
            </div>
        )}
        {/* Bullets */}
        {renderedBullets.map((b, i) => (
             <div
                key={i}
                ref={el => { if(el) bulletsRef.current[i] = el; }}
                className="absolute bg-red-600 rounded"
                style={{
                  left: 0,
                  top: 0,
                  width: b.width,
                  height: b.height,
                }}
            />
        ))}
    </div>
  );
};

export default Game;
