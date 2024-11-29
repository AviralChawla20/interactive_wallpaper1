let bubbles = [];
let pointer;
let bubbleImage;
let fingerImage;
let bubbleBurstSound;
let handPose;
let video;
let hands = [];
let score = 0;
let gameState = "menu";
let lastHandTime;

function preload() {
  bubbleImage = loadImage("bubble.png");
  fingerImage = loadImage("finger.png");
  bubbleBurstSound = loadSound("bubble_burst.mp3"); // Add your bubble burst sound file here
}

function setup() {
  createCanvas(500, 500);

  // Initialize pointer for hand tracking
  pointer = new Bubble();
  pointer.length = 50;

  // Initialize video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Initialize handPose model
  handPose = ml5.handPose(video, modelLoaded);
}

function modelLoaded() {
  console.log("HandPose model loaded");

  // Start hand pose detection
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  if (results.length > 0) {
    hands = results;
    lastHandTime = millis(); // Update last hand movement time

    // Get index finger position
    let indexFinger = hands[0].keypoints[8];

    // Invert the x position to make the pointer move in the opposite direction
    pointer.x = width - indexFinger.x;
    pointer.y = indexFinger.y;
  }
}


function draw() {
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "play") {
    playGame();
  } else if (gameState === "gameover") {
    drawGameOver();
  }
}

function drawMenu() {
  background(102, 178, 255);
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  text("Bubble Burst Game", width / 2, height / 2 - 50);
  textSize(20);
  text("Press ENTER to start", width / 2, height / 2 + 20);

  if (keyIsPressed && keyCode === ENTER) {
    startGame();
  }
}

function startGame() {
  gameState = "play";
  score = 0;
  bubbles = [];
  lastHandTime = millis();
}

function playGame() {
  background(102, 178, 255);

  // Draw and animate bubbles
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].create();
    bubbles[i].move();

    // Check for collisions with the pointer
    if (bubbles[i].collide(pointer)) {
      bubbles.splice(i, 1);
      score++;
      bubbleBurstSound.play(); // Play sound on burst
    }
  }

  // Add new bubbles periodically
  if (frameCount % 120 === 0) {
    bubbles.push(new Bubble());
  }

  // Draw pointer
  pointer.create2();

  // Draw score
  drawScore();

  // Check for inactivity
  if (millis() - lastHandTime > 5000) {
    gameState = "gameover";
  }
}

function drawScore() {
  textSize(18);
  fill(255);
  text("Score: " + score, 10, 20);
}

function drawGameOver() {
  background(102, 178, 255);
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  text("Game Over!", width / 2, height / 2 - 50);
  textSize(20);
  text("Final Score: " + score, width / 2, height / 2);
  text("Press ENTER to restart", width / 2, height / 2 + 50);

  if (keyIsPressed && keyCode === ENTER) {
    startGame();
  }
}

class Bubble {
  constructor() {
    this.x = random(-200, -50);
    this.y = random(height);
    this.length = random(40, 80);
    this.speed = random(1, 3); // Slow bubbles
  }

  create() {
    image(bubbleImage, this.x, this.y, this.length, this.length);
  }

  create2() {
    if (pointer.x && pointer.y) {
      image(fingerImage, pointer.x - 25, pointer.y - 25, 50, 50);
    }
  }

  move() {
    this.x += this.speed;

    // Reset bubble if it goes off-screen
    if (this.x > width) {
      this.x = random(-200, -50);
      this.y = random(height);
    }
  }

  collide(b) {
    return dist(this.x, this.y, b.x, b.y) < (this.length + b.length) / 2;
  }
}