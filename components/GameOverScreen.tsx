
import React from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white z-20 p-8 text-center">
      <h2 className="text-5xl font-bold text-red-500" style={{ textShadow: '2px 2px #000' }}>
        Game Over
      </h2>
      <div className="my-8 text-2xl bg-slate-700 p-6 rounded-lg shadow-inner">
        <p>Score: <span className="font-bold text-yellow-300">{score}</span></p>
        <p className="mt-2">High Score: <span className="font-bold text-green-400">{highScore}</span></p>
      </div>
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg text-2xl shadow-lg hover:bg-blue-600 transition-colors transform hover:scale-105"
      >
        Restart
      </button>
    </div>
  );
};

export default GameOverScreen;
