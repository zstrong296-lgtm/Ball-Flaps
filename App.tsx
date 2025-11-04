
import React, { useState, useCallback } from 'react';
import { GameStatus, BallColor, BALL_COLORS } from './types';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle);
  const [ballColor, setBallColor] = useState<BallColor>('yellow');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('ballFlapsHighScore') || '0', 10);
  });

  const startGame = useCallback(() => {
    setScore(0);
    setGameStatus(GameStatus.Playing);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setGameStatus(GameStatus.GameOver);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('ballFlapsHighScore', finalScore.toString());
    }
  }, [highScore]);

  const restartGame = useCallback(() => {
    setScore(0);
    setGameStatus(GameStatus.Playing);
  }, []);

  return (
    <div className="bg-slate-800 min-h-screen flex flex-col items-center justify-center font-mono text-white p-4">
      <div 
        className="bg-sky-300 rounded-lg shadow-2xl overflow-hidden relative"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {gameStatus === GameStatus.Idle && (
          <StartScreen 
            onStart={startGame} 
            selectedColor={ballColor}
            onColorSelect={setBallColor}
          />
        )}
        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.GameOver) && (
          <Game 
            ballColor={ballColor}
            onGameOver={handleGameOver}
            setScore={setScore}
            isPaused={gameStatus === GameStatus.GameOver}
          />
        )}
        {gameStatus === GameStatus.GameOver && (
          <GameOverScreen 
            score={score}
            highScore={highScore}
            onRestart={restartGame}
          />
        )}
      </div>
      <div className="mt-4 text-center text-slate-400">
        <p>High Score: {highScore}</p>
        <p className="text-sm">Click or Press Space to Flap</p>
      </div>
    </div>
  );
};

export default App;
