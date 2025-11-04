
import React from 'react';
import type { BallColor } from '../types';
import { BALL_COLORS } from '../types';

interface StartScreenProps {
  onStart: () => void;
  selectedColor: BallColor;
  onColorSelect: (color: BallColor) => void;
}

const colorMap: Record<BallColor, string> = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  pink: 'bg-pink-500',
};

const StartScreen: React.FC<StartScreenProps> = ({ onStart, selectedColor, onColorSelect }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white z-20 p-8 text-center">
      <h1 className="text-6xl font-bold text-yellow-300" style={{ textShadow: '2px 2px #000' }}>
        Ball Flaps
      </h1>
      <p className="mt-4 mb-8 text-lg">Choose your ball color:</p>
      <div className="flex space-x-4 mb-12">
        {BALL_COLORS.map(color => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={`w-12 h-12 rounded-full transition-transform transform hover:scale-110 ${colorMap[color]} ${selectedColor === color ? 'ring-4 ring-white' : ''}`}
            aria-label={`Select ${color} ball`}
          />
        ))}
      </div>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-2xl shadow-lg hover:bg-green-600 transition-colors transform hover:scale-105"
      >
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;
