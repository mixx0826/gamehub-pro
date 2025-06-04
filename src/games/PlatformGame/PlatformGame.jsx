import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveScore } from '../../utils/storage';
import Leaderboard from '../../components/Leaderboard';

function PlatformGame() {
  // Canvas dimensions and game settings
  const canvasWidth = 800;
  const canvasHeight = 400;
  const gravity = 0.5;
  const friction = 0.8;
  const playerSize = 40;
  const jumpStrength = 12;
  const moveSpeed = 5;
  const platformHeight = 15;
  const platformMinWidth = 60;
  const platformMaxWidth = 150;
  const minPlatformSpace = 40;
  const maxPlatformSpace = 200;
  
  // Game state
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem('gameHub_username') || '');
  const [submitted, setSubmitted] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // References
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const playerRef = useRef({
    x: 50,
    y: 200,
    width: playerSize,
    height: playerSize,
    velocityX: 0,
    velocityY: 0,
    isOnGround: false
  });
  const platformsRef = useRef([]);
  const obstaclesRef = useRef([]);
  const coinsRef = useRef([]);
  const keysRef = useRef({
    left: false,
    right: false,
    up: false
  });
  const backgroundRef = useRef({
    x: 0,
    speed: 2
  });
  const cameraSpeedRef = useRef(2);
  const gameSpeedRef = useRef(1);
  const distanceTraveledRef = useRef(0);
  
  // Initialize the game
  const initializeGame = useCallback(() => {
    // Reset player position
    playerRef.current = {
      x: 50,
      y: 200,
      width: playerSize,
      height: playerSize,
      velocityX: 0,
      velocityY: 0,
      isOnGround: false
    };
    
    // Create initial platforms
    createInitialPlatforms();
    
    // Reset game state
    coinsRef.current = [];
    obstaclesRef.current = [];
    backgroundRef.current = { x: 0, speed: 2 };
    cameraSpeedRef.current = 2;
    gameSpeedRef.current = 1;
    distanceTraveledRef.current = 0;
    
    setGameOver(false);
    setScore(0);
    setSubmitted(false);
    setGameStarted(false);
  }, []);
  
  // Create initial platforms
  const createInitialPlatforms = () => {
    const platforms = [];
    
    // Starting platform
    platforms.push({
      x: 0,
      y: 300,
      width: 200,
      height: platformHeight
    });
    
    // Generate more platforms
    let lastPlatformX = 200;
    
    for (let i = 0; i < 10; i++) {
      const width = Math.random() * (platformMaxWidth - platformMinWidth) + platformMinWidth;
      const gap = Math.random() * (maxPlatformSpace - minPlatformSpace) + minPlatformSpace;
      const x = lastPlatformX + gap;
      const y = 300 - (Math.random() * 100 - 50);
      
      platforms.push({
        x,
        y,
        width,
        height: platformHeight
      });
      
      lastPlatformX = x + width;
      
      // Randomly add coins above platforms
      if (Math.random() > 0.5) {
        coinsRef.current.push({
          x: x + width / 2,
          y: y - 30,
          width: 20,
          height: 20,
          collected: false
        });
      }
    }
    
    platformsRef.current = platforms;
  };
  
  // Add new platform as player progresses
  const addNewPlatform = () => {
    const lastPlatform = platformsRef.current[platformsRef.current.length - 1];
    
    const width = Math.random() * (platformMaxWidth - platformMinWidth) + platformMinWidth;
    const gap = Math.random() * (maxPlatformSpace - minPlatformSpace) + minPlatformSpace * gameSpeedRef.current;
    const x = lastPlatform.x + lastPlatform.width + gap;
    const y = 300 - (Math.random() * 100 - 50);
    
    const newPlatform = {
      x,
      y,
      width,
      height: platformHeight
    };
    
    platformsRef.current.push(newPlatform);
    
    // Randomly add coins above platforms
    if (Math.random() > 0.6) {
      coinsRef.current.push({
        x: x + width / 2,
        y: y - 30,
        width: 20,
        height: 20,
        collected: false
      });
    }
    
    // Randomly add obstacles on platforms
    if (Math.random() > 0.8 && width > 80) {
      obstaclesRef.current.push({
        x: x + width / 2,
        y: y - 20,
        width: 20,
        height: 20
      });
    }
  };
  
  // Game loop
  const gameLoop = useCallback(() => {
    if (gameOver || paused || !gameStarted) {
      return;
    }
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Update game speed based on distance
    const newGameSpeed = 1 + Math.floor(distanceTraveledRef.current / 1000) * 0.1;
    if (newGameSpeed > gameSpeedRef.current) {
      gameSpeedRef.current = newGameSpeed;
      cameraSpeedRef.current = 2 + newGameSpeed;
    }
    
    // Draw background (simple gradient)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, "#87CEEB"); // Sky blue
    gradient.addColorStop(1, "#E0F7FA"); // Light sky blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw distant mountains in background
    drawMountains(ctx);
    
    // Update player physics
    updatePlayer();
    
    // Move camera (scroll everything to the left)
    moveCamera();
    
    // Draw platforms
    drawPlatforms(ctx);
    
    // Draw coins
    drawCoins(ctx);
    
    // Draw obstacles
    drawObstacles(ctx);
    
    // Draw player
    drawPlayer(ctx);
    
    // Check for platform removal
    checkPlatformRemoval();
    
    // Increase score based on distance
    distanceTraveledRef.current += cameraSpeedRef.current;
    setScore(Math.floor(distanceTraveledRef.current / 10));
    
    // Schedule next frame
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, paused, gameStarted]);
  
  // Draw background mountains
  const drawMountains = (ctx) => {
    ctx.fillStyle = "#9e9e9e";
    
    // First mountain layer
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    
    const mountainOffset = (backgroundRef.current.x * 0.2) % 800;
    
    for (let i = 0; i < canvasWidth + 200; i += 200) {
      ctx.lineTo(i - mountainOffset, canvasHeight - 100 - Math.sin(i / 200) * 50);
    }
    
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fill();
    
    // Second mountain layer
    ctx.fillStyle = "#757575";
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    
    const mountainOffset2 = (backgroundRef.current.x * 0.5) % 400;
    
    for (let i = 0; i < canvasWidth + 100; i += 100) {
      ctx.lineTo(i - mountainOffset2, canvasHeight - 70 - Math.sin(i / 100) * 30);
    }
    
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fill();
  };
  
  // Update player physics
  const updatePlayer = () => {
    const player = playerRef.current;
    
    // Apply left/right movement
    if (keysRef.current.left) {
      player.velocityX = -moveSpeed;
    } else if (keysRef.current.right) {
      player.velocityX = moveSpeed;
    } else {
      player.velocityX *= friction;
    }
    
    // Apply gravity
    player.velocityY += gravity;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player in bounds (left edge)
    if (player.x < 0) {
      player.x = 0;
      player.velocityX = 0;
    }
    
    // Prevent player from going too far right
    if (player.x > canvasWidth * 0.7) {
      player.x = canvasWidth * 0.7;
    }
    
    // Check if player fell off the bottom
    if (player.y > canvasHeight) {
      setGameOver(true);
      return;
    }
    
    // Check platform collisions
    player.isOnGround = false;
    for (const platform of platformsRef.current) {
      if (
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height > platform.y &&
        player.y + player.height < platform.y + platform.height + 10 &&
        player.velocityY > 0
      ) {
        player.isOnGround = true;
        player.velocityY = 0;
        player.y = platform.y - player.height;
        break;
      }
    }
    
    // Jump if on ground and up key is pressed
    if (player.isOnGround && keysRef.current.up) {
      player.velocityY = -jumpStrength;
      player.isOnGround = false;
      setIsJumping(true);
    } else if (player.isOnGround) {
      setIsJumping(false);
    }
    
    // Check coin collisions
    for (const coin of coinsRef.current) {
      if (
        !coin.collected &&
        player.x + player.width > coin.x - coin.width/2 &&
        player.x < coin.x + coin.width/2 &&
        player.y + player.height > coin.y - coin.height/2 &&
        player.y < coin.y + coin.height/2
      ) {
        coin.collected = true;
        setScore(prevScore => prevScore + 50);
      }
    }
    
    // Check obstacle collisions
    for (const obstacle of obstaclesRef.current) {
      if (
        player.x + player.width > obstacle.x - obstacle.width/2 &&
        player.x < obstacle.x + obstacle.width/2 &&
        player.y + player.height > obstacle.y - obstacle.height/2 &&
        player.y < obstacle.y + obstacle.height/2
      ) {
        setGameOver(true);
        return;
      }
    }
  };
  
  // Move camera (scroll everything to the left)
  const moveCamera = () => {
    backgroundRef.current.x += backgroundRef.current.speed;
    
    // Move platforms, coins, and obstacles
    for (const platform of platformsRef.current) {
      platform.x -= cameraSpeedRef.current;
    }
    
    for (const coin of coinsRef.current) {
      coin.x -= cameraSpeedRef.current;
    }
    
    for (const obstacle of obstaclesRef.current) {
      obstacle.x -= cameraSpeedRef.current;
    }
    
    // Add new platform when last one is sufficiently on screen
    const lastPlatform = platformsRef.current[platformsRef.current.length - 1];
    if (lastPlatform.x + lastPlatform.width < canvasWidth * 1.5) {
      addNewPlatform();
    }
  };
  
  // Draw platforms
  const drawPlatforms = (ctx) => {
    for (const platform of platformsRef.current) {
      ctx.fillStyle = "#4CAF50";
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Draw grass on top
      ctx.fillStyle = "#81C784";
      ctx.fillRect(platform.x, platform.y - 2, platform.width, 2);
    }
  };
  
  // Draw coins
  const drawCoins = (ctx) => {
    for (const coin of coinsRef.current) {
      if (!coin.collected) {
        // Gold color
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner highlight
        ctx.fillStyle = "#FFF9C4";
        ctx.beginPath();
        ctx.arc(coin.x - 3, coin.y - 3, coin.width / 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  
  // Draw obstacles
  const drawObstacles = (ctx) => {
    for (const obstacle of obstaclesRef.current) {
      // Red spikes
      ctx.fillStyle = "#F44336";
      
      // Draw a spike shape
      ctx.beginPath();
      ctx.moveTo(obstacle.x - obstacle.width / 2, obstacle.y + obstacle.height / 2);
      ctx.lineTo(obstacle.x, obstacle.y - obstacle.height / 2);
      ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
      ctx.closePath();
      ctx.fill();
    }
  };
  
  // Draw player character
  const drawPlayer = (ctx) => {
    const player = playerRef.current;
    
    // Player body (motorcycle)
    ctx.fillStyle = "#3F51B5";
    ctx.fillRect(player.x, player.y + player.height - 15, player.width, 15);
    
    // Wheels
    ctx.fillStyle = "#212121";
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + player.height - 5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + player.width - 10, player.y + player.height - 5, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Rider
    ctx.fillStyle = "#FF5722";
    ctx.fillRect(player.x + 15, player.y + 5, 15, 20);
    
    // Helmet
    ctx.fillStyle = "#212121";
    ctx.fillRect(player.x + 15, player.y - 5, 15, 15);
    
    // Draw smoke particles when moving
    if (Math.abs(player.velocityX) > 0.5) {
      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
      ctx.beginPath();
      ctx.arc(player.x + 5, player.y + player.height - 5, 5 * Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Jump animation
    if (isJumping) {
      // Tilt motorcycle up
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.rotate(-Math.PI / 16);
      ctx.translate(-(player.x + player.width / 2), -(player.y + player.height / 2));
      ctx.fillStyle = "#3F51B5";
      ctx.fillRect(player.x, player.y + player.height - 15, player.width, 15);
      ctx.restore();
    }
  };
  
  // Remove platforms that are off screen
  const checkPlatformRemoval = () => {
    platformsRef.current = platformsRef.current.filter(platform => platform.x + platform.width > -50);
    coinsRef.current = coinsRef.current.filter(coin => coin.x > -50);
    obstaclesRef.current = obstaclesRef.current.filter(obstacle => obstacle.x > -50);
  };
  
  // Handle keyboard controls
  const handleKeyDown = useCallback((e) => {
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
    
    if (gameOver) {
      if (e.keyCode === 32) { // Space bar to restart
        initializeGame();
      }
      return;
    }
    
    if (!gameStarted && e.keyCode === 32) {
      setGameStarted(true);
      return;
    }
    
    // Space bar to pause/resume
    if (e.keyCode === 32 && gameStarted) {
      setPaused(prev => !prev);
      return;
    }
    
    switch (e.keyCode) {
      case 37: // Left arrow
        keysRef.current.left = true;
        break;
      case 38: // Up arrow
      case 87: // W key
        keysRef.current.up = true;
        break;
      case 39: // Right arrow
        keysRef.current.right = true;
        break;
      default:
        break;
    }
  }, [gameOver, gameStarted, initializeGame]);
  
  const handleKeyUp = useCallback((e) => {
    switch (e.keyCode) {
      case 37: // Left arrow
        keysRef.current.left = false;
        break;
      case 38: // Up arrow
      case 87: // W key
        keysRef.current.up = false;
        break;
      case 39: // Right arrow
        keysRef.current.right = false;
        break;
      default:
        break;
    }
  }, []);
  
  // Add touch controls for mobile
  const handleTouchStart = useCallback((e) => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    
    if (gameOver) {
      return;
    }
    
    const touch = e.touches[0];
    const x = touch.clientX;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    
    if (canvasX < canvasWidth / 3) {
      keysRef.current.left = true;
    } else if (canvasX > (canvasWidth * 2) / 3) {
      keysRef.current.right = true;
    } else {
      keysRef.current.up = true;
    }
  }, [gameStarted, gameOver]);
  
  const handleTouchEnd = useCallback(() => {
    keysRef.current.left = false;
    keysRef.current.right = false;
    keysRef.current.up = false;
  }, []);
  
  // Handle score submission
  const handleSubmitScore = () => {
    if (!username.trim() || submitted) return;
    
    saveScore('moto-racer', {
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
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [initializeGame, handleKeyDown, handleKeyUp]);
  
  // Start/stop game loop based on game state
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      requestRef.current = requestAnimationFrame(gameLoop);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop, gameOver, paused, gameStarted]);
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full max-w-[800px] flex justify-between items-center">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="flex space-x-4">
          {gameStarted && !gameOver && (
            <button
              onClick={() => setPaused(p => !p)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
          )}
          
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
          </button>
        </div>
      </div>
      
      {showLeaderboard ? (
        <div className="w-full max-w-[800px] mb-4">
          <Leaderboard gameId="moto-racer" gameTitle="Moto Racer" />
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
              onTouchEnd={handleTouchEnd}
            />
            
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white rounded-lg">
                <h2 className="text-3xl font-bold mb-4">Moto Racer</h2>
                <p className="text-xl mb-6">Ride your motorcycle as far as possible!</p>
                <button
                  onClick={() => setGameStarted(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg"
                >
                  Start Game
                </button>
              </div>
            )}
            
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
            
            {paused && gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white rounded-lg">
                <div className="text-2xl font-bold">Paused</div>
              </div>
            )}
          </div>
          
          <div className="mt-6 max-w-[800px] bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use left/right arrow keys to move</li>
              <li>Press up arrow or W key to jump</li>
              <li>On mobile, tap left/right sides of screen to move, middle to jump</li>
              <li>Collect coins for extra points</li>
              <li>Avoid red spikes</li>
              <li>Press spacebar to pause/resume the game</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default PlatformGame;