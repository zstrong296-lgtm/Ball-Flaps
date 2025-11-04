
import React, { useState, useCallback, useEffect } from 'react';
import { GameStatus, BallColor } from './types';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

// For PWA installation
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle);
  const [ballColor, setBallColor] = useState<BallColor>('yellow');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('ballFlapsHighScore') || '0', 10);
  });

  // PWA Install state
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) {
      return;
    }
    // Show the install prompt
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then(() => {
      setInstallPromptEvent(null);
    });
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000); // Reset after 2 seconds
      }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy link.');
      });
    } else {
        // Fallback for older browsers
        alert('Clipboard API not available. Please copy the URL from the address bar.');
    }
  };

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
      <div className="mt-4 text-center text-slate-400 flex flex-col items-center space-y-2">
        <p>High Score: {highScore}</p>
        <p className="text-sm">Click or Press Space to Flap</p>
        <div className="flex items-center space-x-2">
            {installPromptEvent && (
            <button
                onClick={handleInstallClick}
                className="px-4 py-2 mt-2 bg-slate-600 text-white font-bold rounded-lg text-sm shadow-md hover:bg-slate-700 transition-colors"
                aria-label="Install Ball Flaps App"
            >
                Install App
            </button>
            )}
            <button
                onClick={handleShareClick}
                className={`px-4 py-2 mt-2 font-bold rounded-lg text-sm shadow-md transition-colors ${
                isLinkCopied 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-slate-600 text-white hover:bg-slate-700'
                }`}
                aria-label="Share Game Link"
                disabled={isLinkCopied}
            >
                {isLinkCopied ? 'Link Copied!' : 'Share Game'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;
