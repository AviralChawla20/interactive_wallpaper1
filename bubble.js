// Game Constants
const CANVAS_SIZE = 500;
const BUBBLE_INTERVAL = 120;
const HAND_INACTIVITY_THRESHOLD = 5000;

// Game Variables
let bubbles = [];
let pointer;
let bubbleImage, fingerImage, bubbleBurstSound;
let handPose, video;
let hands = [];
let score = 0;
let gameState = "menu";
let lastHandTime;

// Preload Assets
function preload() {
  bubbleImage = loadImage("bubble.png");
  fingerImage = loadImage("finger.png");
  bubbleBurstSound = loadSound("bubble_burst.mp3");
}

// Setup function
function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  pointer = new Pointer();
  handPose = ml5.handPose(video, modelLoaded);
}

// Model Loaded
function modelLoaded() {
  console.log("HandPose model loaded");
  handPose.on("predict", gotHands);
}

// Hands Detection
function gotHands(results) {
  if (results.length > 0) {
    hands = results;
    lastHandTime = millis();
    let indexFinger = hands[0].keypoints[8];
    pointer.updatePosition(indexFinger.x, indexFinger.y);
  }
}

// Draw function
function draw() {
  if (gameState === "menu") {
    Menu.display();
  } else if (gameState === "play") {
    Game.play();
  } else if (gameState === "gameover") {
    GameOver.display();
  }
}

// Menu Class
class Menu {
  static display() {
    background(102, 178, 255);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text("Bubble Burst Game", width / 2, height / 2 - 50);
    textSize(20);
    text("Press ENTER to start", width / 2, height / 2 + 20);

    if (keyIsPressed && keyCode === ENTER) {
      Game.start();
    }
  }
}

// Game Class
class Game {
  static start() {
    gameState = "play";
    score = 0;
    bubbles = [];
    lastHandTime = millis();
  }

  static play() {
    background(102, 178, 255);

    // Add and manage bubbles
    if (frameCount % BUBBLE_INTERVAL === 0) {
      bubbles.push(new Bubble());
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
      bubbles[i].move();
      bubbles[i].create();
      if (bubbles[i].collide(pointer)) {
        bubbles.splice(i, 1);
        score++;
        bubbleBurstSound.play();
      }
    }

    pointer.create();
    this.displayScore();
    this.checkInactivity();
  }

  static displayScore() {
    textSize(18);
    fill(255);
    text("Score: " + score, 10, 20);
  }

  static checkInactivity() {
    if (millis() - lastHandTime > HAND_INACTIVITY_THRESHOLD) {
      gameState = "gameover";
    }
  }
}

// Game Over Class
class GameOver {
  static display() {
    background(102, 178, 255);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text("Game Over!", width / 2, height / 2 - 50);
    textSize(20);
    text("Final Score: " + score, width / 2, height / 2);
    text("Press ENTER to restart", width / 2, height / 2 + 50);

    if (keyIsPressed && keyCode === ENTER) {
      Game.start();
    }
  }
}

// Bubble Class
class Bubble {
  constructor() {
    this.x = random(-200, -50);
    this.y = random(height);
    this.length = random(40, 80);
    this.speed = random(1, 3);
  }

  create() {
    image(bubbleImage, this.x, this.y, this.length, this.length);
  }

  move() {
    this.x += this.speed;
    if (this.x > width) {
      this.x = random(-200, -50);
      this.y = random(height);
    }
  }

  collide(b) {
    return dist(this.x, this.y, b.x, b.y) < (this.length + b.length) / 2;
  }
}

// Pointer Class
class Pointer {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.length = 50;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  create() {
    if (this.x && this.y) {
      image(fingerImage, this.x - 25, this.y - 25, 50, 50);
    }
  }
}
