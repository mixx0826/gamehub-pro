import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveScore } from '../../utils/storage';
import Leaderboard from '../../components/Leaderboard';

function SnakeGame() {
  // Game dimensions and settings
  const canvasWidth = 600;
  const canvasHeight = 400;
  const gridSize = 20;
  const initialSnakeLength = 3;
  const initialSpeed = 150; // milliseconds
  const speedIncrement = 2; // How much faster after eating (lower is faster)
  
  // Game state
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem('gameHub_username') || '');
  const [submitted, setSubmitted] = useState(false);
  
  // References
  const canvasRef = useRef(null);
  const snakeRef = useRef([]);
  const foodRef = useRef(null);
  const directionRef = useRef('RIGHT');
  const gameLoopRef = useRef(null);
  const speedRef = useRef(initialSpeed);
  
  // Initialize the game
  const initializeGame = useCallback(() => {
    // Set initial snake position (middle of the canvas)
    const initialX = Math.floor(canvasWidth / (2 * gridSize)) * gridSize;
    const initialY = Math.floor(canvasHeight / (2 * gridSize)) * gridSize;
    
    const initialSnake = [];
    for (let i = 0; i < initialSnakeLength; i++) {
      initialSnake.push({ 
        x: initialX - (i * gridSize), 
        y: initialY 
      });
    }
    
    snakeRef.current = initialSnake;
    directionRef.current = 'RIGHT';
    speedRef.current = initialSpeed;
    generateFood();
    
    setGameOver(false);
    setScore(0);
    setSubmitted(false);
  }, []);
  
  // Generate food at random position (not on snake)
  const generateFood = () => {
    const maxX = (canvasWidth / gridSize) - 1;
    const maxY = (canvasHeight / gridSize) - 1;
    
    let newFood;
    let foodOnSnake;
    
    do {
      foodOnSnake = false;
      newFood = {
        x: Math.floor(Math.random() * maxX) * gridSize,
        y: Math.floor(Math.random() * maxY) * gridSize
      };
      
      // Check if food is on snake
      for (const segment of snakeRef.current) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
          foodOnSnake = true;
          break;
        }
      }
    } while (foodOnSnake);
    
    foodRef.current = newFood;
  };
  
  // Game loop
  const gameLoop = useCallback(() => {
    if (gameOver || paused) return;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background grid
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
    
    // Draw food
    const food = foodRef.current;
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Move snake
    const snake = [...snakeRef.current];
    const head = { ...snake[0] };
    
    switch (directionRef.current) {
      case 'UP':
        head.y -= gridSize;
        break;
      case 'DOWN':
        head.y += gridSize;
        break;
      case 'LEFT':
        head.x -= gridSize;
        break;
      case 'RIGHT':
        head.x += gridSize;
        break;
      default:
        break;
    }
    
    // Check for collisions with walls
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= canvasWidth ||
      head.y >= canvasHeight
    ) {
      setGameOver(true);
      return;
    }
    
    // Check for collisions with self
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        setGameOver(true);
        return;
      }
    }
    
    // Check for food collision
    const ateFood = head.x === food.x && head.y === food.y;
    
    // Update snake
    snake.unshift(head);
    
    if (ateFood) {
      setScore(prevScore => prevScore + 10);
      generateFood();
      // Increase speed
      speedRef.current = Math.max(50, speedRef.current - speedIncrement);
    } else {
      snake.pop();
    }
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
      // Snake head
      if (i === 0) {
        ctx.fillStyle = '#228B22'; // Dark green for head
        ctx.fillRect(snake[i].x, snake[i].y, gridSize, gridSize);
        
        // Eyes
        ctx.fillStyle = 'white';
        
        const eyeSize = gridSize / 5;
        const eyeOffset = gridSize / 3;
        
        // Position eyes based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        switch (directionRef.current) {
          case 'UP':
            leftEyeX = snake[i].x + eyeOffset;
            leftEyeY = snake[i].y + eyeOffset;
            rightEyeX = snake[i].x + gridSize - eyeOffset - eyeSize;
            rightEyeY = snake[i].y + eyeOffset;
            break;
          case 'DOWN':
            leftEyeX = snake[i].x + eyeOffset;
            leftEyeY = snake[i].y + gridSize - eyeOffset - eyeSize;
            rightEyeX = snake[i].x + gridSize - eyeOffset - eyeSize;
            rightEyeY = snake[i].y + gridSize - eyeOffset - eyeSize;
            break;
          case 'LEFT':
            leftEyeX = snake[i].x + eyeOffset;
            leftEyeY = snake[i].y + eyeOffset;
            rightEyeX = snake[i].x + eyeOffset;
            rightEyeY = snake[i].y + gridSize - eyeOffset - eyeSize;
            break;
          case 'RIGHT':
            leftEyeX = snake[i].x + gridSize - eyeOffset - eyeSize;
            leftEyeY = snake[i].y + eyeOffset;
            rightEyeX = snake[i].x + gridSize - eyeOffset - eyeSize;
            rightEyeY = snake[i].y + gridSize - eyeOffset - eyeSize;
            break;
          default:
            break;
        }
        
        ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
        ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
      } 
      // Snake body
      else {
        // Gradient effect from light green to dark green
        const colorValue = Math.max(40, 200 - (i * 4));
        ctx.fillStyle = `rgb(0, ${colorValue}, 0)`;
        ctx.fillRect(snake[i].x, snake[i].y, gridSize, gridSize);
      }
    }
    
    snakeRef.current = snake;
    
    // Schedule next frame
    gameLoopRef.current = setTimeout(gameLoop, speedRef.current);
  }, [gameOver, paused]);
  
  // Handle keyboard controls
  const handleKeyDown = useCallback((e) => {
    // Prevent arrow keys from scrolling the page
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
    
    if (gameOver) {
      if (e.keyCode === 32) { // Space bar to restart
        initializeGame();
      }
      return;
    }
    
    // Space bar to pause/resume
    if (e.keyCode === 32) {
      setPaused(prev => !prev);
      return;
    }
    
    if (paused) return;
    
    const currentDirection = directionRef.current;
    
    switch (e.keyCode) {
      case 38: // Up arrow
        if (currentDirection !== 'DOWN') directionRef.current = 'UP';
        break;
      case 40: // Down arrow
        if (currentDirection !== 'UP') directionRef.current = 'DOWN';
        break;
      case 37: // Left arrow
        if (currentDirection !== 'RIGHT') directionRef.current = 'LEFT';
        break;
      case 39: // Right arrow
        if (currentDirection !== 'LEFT') directionRef.current = 'RIGHT';
        break;
      default:
        break;
    }
  }, [gameOver, paused, initializeGame]);
  
  // Add touch controls for mobile
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  
  const handleTouchMove = useCallback((e) => {
    if (!touchStartX.current || !touchStartY.current || gameOver || paused) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    
    const currentDirection = directionRef.current;
    
    // Determine swipe direction by which difference is larger
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 10) { // Left swipe
        if (currentDirection !== 'RIGHT') directionRef.current = 'LEFT';
      } else if (diffX < -10) { // Right swipe
        if (currentDirection !== 'LEFT') directionRef.current = 'RIGHT';
      }
    } else {
      // Vertical swipe
      if (diffY > 10) { // Up swipe
        if (currentDirection !== 'DOWN') directionRef.current = 'UP';
      } else if (diffY < -10) { // Down swipe
        if (currentDirection !== 'UP') directionRef.current = 'DOWN';
      }
    }
    
    // Reset touch start position
    touchStartX.current = touchEndX;
    touchStartY.current = touchEndY;
  }, [gameOver, paused]);
  
  // Handle score submission
  const handleSubmitScore = () => {
    if (!username.trim() || submitted) return;
    
    saveScore('snake-master', {
      username: username.trim(),
      score: score,
      date: new Date().toISOString()
    });
    
    localStorage.setItem('gameHub_username', username.trim());
    setSubmitted(true);
    setShowLeaderboard(true);
  };
  
  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [initializeGame, handleKeyDown]);
  
  // Start/stop game loop based on game state
  useEffect(() => {
    if (!gameOver && !paused) {
      gameLoop();
    } else if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
    
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [gameLoop, gameOver, paused]);
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full max-w-[600px] flex justify-between items-center">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="flex space-x-4">
          <button
            onClick={() => setPaused(p => !p)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={gameOver}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
          </button>
        </div>
      </div>
      
      {showLeaderboard ? (
        <div className="w-full max-w-[600px] mb-4">
          <Leaderboard gameId="snake-master" gameTitle="Snake Master" />
        </div>
      ) : (
        <>
          <div className="relative">
            <canvas 
              ref={canvasRef} 
              width={canvasWidth} 
              height={canvasHeight} 
              className="border border-gray-300 rounded-lg shadow-md"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            />
            
            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white rounded-lg">
                <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
                <p className="text-xl mb-6">Your score: {score}</p>
                
                {!submitted ? (
                  <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full">
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 mb-4 text-black rounded"
                      maxLength={20}
                    />
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSubmitScore}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex-1"
                      >
                        Submit Score
                      </button>
                      <button
                        onClick={initializeGame}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex-1"
                      >
                        Play Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={initializeGame}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded text-lg"
                  >
                    Play Again
                  </button>
                )}
              </div>
            )}
            
            {paused && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white rounded-lg">
                <div className="text-2xl font-bold">Paused</div>
              </div>
            )}
          </div>
          
          <div className="mt-6 max-w-[600px] bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use arrow keys to control the snake</li>
              <li>On mobile, swipe in the direction you want to go</li>
              <li>Collect the red food to grow and gain points</li>
              <li>Avoid hitting the walls or yourself</li>
              <li>Press spacebar to pause/resume the game</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default SnakeGame;