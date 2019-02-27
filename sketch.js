// TETRIS CLONE IN P5.JS
//
// TODO LIST:
//
//  Detect when game is over
//


const PANEL_WIDTH = 200;
const PANEL_HEIGHT = 300;

const CELLSIZE = 11;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 40;
const VISIBLE_GRID_HEIGHT = 20;

const BOARD_X =  PANEL_WIDTH / 2 - CELLSIZE * GRID_WIDTH / 2;
const BOARD_Y = PANEL_HEIGHT / 2 - CELLSIZE * VISIBLE_GRID_HEIGHT / 2;
const INVISIBLE_GRID_HEIGHT = GRID_HEIGHT - VISIBLE_GRID_HEIGHT;

const ANIMATION_SPEED = 3;

// array containing the state of the playing area
// an empty cell is represented by -1
// otherwise corresponds to the colour of the block
let grid = [];

// variables for the state of the current falling tetrimino
let tetriminoX;
let tetriminoY;
let tetriminoRot;
let currentTetrimino;
let timeToDrop = 1;
let nextTetrimino = -1;

// player score
let lines = 0;
let level = 1;

// scale factor required to fullscreen the playing area
let scaleFactor;

// controls state
let softDrop = false;

// input state
let touchStartX;
let touchStartY;
let dragStart;
let touchStart;

// font
let myFont;

let animationFrame;

// game states
const STATE_FALLING = 1; // Tetrimino is falling
const STATE_LOCK_ON = 2; // Tetrimino is touching the ground but hasn't locked in place
const STATE_LINE_CLEAR_ANIMATION = 3;
const STATE_GAME_OVER_ANIMATION = 4;
const STATE_GAME_OVER_PLAY_AGAIN = 5;

let state = STATE_FALLING;

const TETRIMINO = [
  {size: 3, shape: [[0,1,1,
                   0,1,1,
                   0,0,0],
                  [0,1,1,
                   0,1,1,
                   0,0,0],
                  [0,1,1,
                   0,1,1,
                   0,0,0],
                  [0,1,1,
                   0,1,1,
                   0,0,0]], color: [255, 255, 0]},
   {size: 4, shape: [[0,0,0,0,
                      1,1,1,1,
                      0,0,0,0,
                      0,0,0,0],
                     [0,0,1,0,
                      0,0,1,0,
                      0,0,1,0,
                      0,0,1,0,],
                     [0,0,0,0,
                      0,0,0,0,
                      1,1,1,1,
                      0,0,0,0],
                     [0,1,0,0,
                      0,1,0,0,
                      0,1,0,0,
                      0,1,0,0]], color: [127, 127, 255]},
    {size: 3, shape: [[0,1,0,
                       1,1,1,
                       0,0,0],
                      [0,1,0,
                       0,1,1,
                       0,1,0],
                      [0,0,0,
                       1,1,1,
                       0,1,0],
                      [0,1,0,
                       1,1,0,
                       0,1,0]], color: [255, 0, 255]},
   {size: 3, shape: [[0,0,1,
                      1,1,1,
                      0,0,0],
                     [0,1,0,
                      0,1,0,
                      0,1,1],
                     [0,0,0,
                      1,1,1,
                      1,0,0],
                     [1,1,0,
                      0,1,0,
                      0,1,0]], color: [255, 165, 0]},
    {size: 3, shape: [[1,0,0,
                       1,1,1,
                       0,0,0],
                      [0,1,1,
                       0,1,0,
                       0,1,0],
                      [0,0,0,
                       1,1,1,
                       0,0,1],
                      [0,1,0,
                       0,1,0,
                       1,1,0]], color: [0,0,255]},
   {size: 3, shape: [[0,1,1,
                      1,1,0,
                      0,0,0],
                     [0,1,0,
                      0,1,1,
                      0,0,1],
                     [0,0,0,
                      0,1,1,
                      1,1,0],
                     [1,0,0,
                      1,1,0,
                      0,1,0]], color: [0, 255, 0]},
  {size: 3, shape: [[1,1,0,
                     0,1,1,
                     0,0,0],
                    [0,0,1,
                     0,1,1,
                     0,1,0],
                    [0,0,0,
                     1,1,0,
                     0,1,1],
                    [0,1,0,
                     1,1,0,
                     1,0,0]], color: [255, 0, 0]},
                  {color: [255,255,255]} ];

 function preload() {
   myFont = loadFont('fonts/press-start-2p/PressStart2P.ttf');
 }

let displayGrid = true;

function setup() {

scaleFactor = min(windowHeight/PANEL_HEIGHT,windowWidth/PANEL_WIDTH)*1.0;

  textFont(myFont);

  let canvas = createCanvas(windowWidth, windowHeight);

  for(x = 0; x < GRID_WIDTH; x++) {
    grid[x] = [];
    for (y = 0; y < GRID_HEIGHT; y++) {
      grid[x][y] = -1;
    }
  }

generateTetrimino();

}

function draw() {

  // border colour
  background(127,127,127);

  // full screen & centre
  scale(scaleFactor);
  translate(windowWidth/scaleFactor/2 - PANEL_WIDTH/2, windowHeight/scaleFactor/2 - PANEL_HEIGHT/2);

  // background area
  noStroke();
  fill(0,0,0);
  rect(0,0,PANEL_WIDTH,PANEL_HEIGHT);

  // grid border
  stroke(255);
  strokeWeight(2);
  rect(BOARD_X - 2, BOARD_Y - 2, GRID_WIDTH * CELLSIZE + 3, VISIBLE_GRID_HEIGHT * CELLSIZE + 3);

  noStroke();

  level = floor(lines / 10) + 1;

  // display HUD
  fill(255);
  textSize(8);
  text('LINES', GRID_WIDTH * CELLSIZE + 4 + BOARD_X, BOARD_Y+8);
  text(lines, GRID_WIDTH * CELLSIZE + 5 + BOARD_X, BOARD_Y + 18);
  text('LEVEL', GRID_WIDTH * CELLSIZE + 4 + BOARD_X, BOARD_Y+32);
  text(level, GRID_WIDTH * CELLSIZE + 5 + BOARD_X, BOARD_Y + 42);

  text('NEXT', 6, BOARD_Y+8);
  // draw grid

  if (state != STATE_GAME_OVER_PLAY_AGAIN) {
    for(x = 0; x < GRID_WIDTH; x++) {
      for (y = 0; y < VISIBLE_GRID_HEIGHT; y++) {
        t = grid[x][y+INVISIBLE_GRID_HEIGHT];
        if (t != -1) {
          fill(color(TETRIMINO[t].color[0], TETRIMINO[t].color[1], TETRIMINO[t].color[2]));
          rect(x*CELLSIZE+BOARD_X,y*CELLSIZE+BOARD_Y,CELLSIZE-1,CELLSIZE-1);
        }
      }
    }
  } else {
     fill(255);
     textSize(12);
     text('GAME OVER', PANEL_WIDTH / 2 - 12 * 4.5, BOARD_Y + 40);


     textSize(8);

     text('PLAY AGAIN', PANEL_WIDTH / 2 - 40, BOARD_Y + 80);
  }


  // draw current falling tetrimino
  let tetriminoSize = TETRIMINO[currentTetrimino].size;

  fill(color(TETRIMINO[currentTetrimino].color[0], TETRIMINO[currentTetrimino].color[1], TETRIMINO[currentTetrimino].color[2]));

  if (state == STATE_FALLING || state == STATE_LOCK_ON) {
    let i = 0;
    for (x = 0; x < tetriminoSize; x++) {
      for (y = 0; y < tetriminoSize; y++) {
        if (TETRIMINO[currentTetrimino].shape[tetriminoRot][i] == 1) {
        if (tetriminoY+(tetriminoSize-y-1) >= VISIBLE_GRID_HEIGHT) {
            rect((tetriminoX+x)*CELLSIZE+BOARD_X,(tetriminoY+(tetriminoSize-y-1)-INVISIBLE_GRID_HEIGHT)*CELLSIZE+BOARD_Y,CELLSIZE-1,CELLSIZE-1);
          }
        }
        i++;
      }
    }
  }

  // draw next tetrimino
  if (state != STATE_GAME_OVER_ANIMATION && state != STATE_GAME_OVER_PLAY_AGAIN) {
    let nextTetriminoSize = TETRIMINO[nextTetrimino].size;
    let nextTetriminoXpos;
    let nextTetriminoYpos

    if (nextTetriminoSize == 3) {
      nextTetriminoXpos = 10;
      nextTetriminoYpos = 35
    } else {
      nextTetriminoXpos = 5;
      nextTetriminoYpos = 45;
    }

    fill(color(TETRIMINO[nextTetrimino].color[0], TETRIMINO[nextTetrimino].color[1], TETRIMINO[nextTetrimino].color[2]));

    let i = 0;
    for (x = 0; x < nextTetriminoSize ; x++) {
      for (y = 0; y < nextTetriminoSize ; y++) {
        if (TETRIMINO[nextTetrimino].shape[0][i] == 1) {

            rect(nextTetriminoXpos+x*CELLSIZE,nextTetriminoYpos-y*CELLSIZE+BOARD_Y,CELLSIZE-1,CELLSIZE-1);

        }
        i++;
      }

    }
  }




  switch (state) {
    case STATE_FALLING:
      // decrease timer for when falling tetrimino next moves down a cell
      if (softDrop) {
        timeToDrop -= 20;
      } else {
        timeToDrop--;
      }

      // if timer hits 0 move tetrimino down one
      while (timeToDrop <= 0) {
        timeToDrop += dropTime();
        moveDown();
      }
      break;

    case STATE_LOCK_ON:
      timeToDrop--;

      if (timeToDrop <= 0) {
        lockDown();
      }

      break;

    case STATE_LINE_CLEAR_ANIMATION:


      timeToDrop--;
      if (timeToDrop <= 0) {
        if (animationFrame == 10) {
            removeClearedLines();
            generateTetrimino();
            switchState(STATE_FALLING);
        } else {
          linesComplete.forEach(function (y) {
            if (animationFrame % 2 == 0) {
              grid[4 - animationFrame / 2][y] = -1;
              grid[5 + animationFrame / 2][y] = -1;
            }
            //grid[animationFrame][y] = -1;
          });
          animationFrame++;
          timeToDrop = ANIMATION_SPEED;
        }
      }
      break;

    case STATE_GAME_OVER_ANIMATION:
      timeToDrop--;
      if (timeToDrop <= 0) {

        if (animationFrame <= 20) {
          for(x = 0; x < 10; x++) {
            grid[x][39-animationFrame] = 7;
          }
        } else if (animationFrame <= 40) {
          for (x = 0; x < 10; x++) {
            grid[x][60-animationFrame] = -1;
          }
        } else {

          switchState(STATE_GAME_OVER_PLAY_AGAIN);

        }
        timeToDrop = 3;
        animationFrame++;
      }

  }


}


function dropTime() {
  return 60  * pow((0.8 - ((level - 1) * 0.007)),(level-1));
}

function moveDown() {

  if (!clashDetect(currentTetrimino, tetriminoX, tetriminoY+1, tetriminoRot)) {
    tetriminoY++;
  }

  checkForLockOn();
}

function checkForLockOn() {

  let clash = clashDetect(currentTetrimino, tetriminoX, tetriminoY+1, tetriminoRot);

  if (state == STATE_FALLING && clash) {
    switchState(STATE_LOCK_ON);
  } else if (state == STATE_LOCK_ON && !clash) {
    switchState(STATE_FALLING);
  }


}

function switchState(newState) {


  switch(newState) {
    case STATE_FALLING:
      timeToDrop = dropTime();
      break;
    case STATE_LOCK_ON:
      timeToDrop = 30;
      lockOnMovements = 0;
      break;
    case STATE_LINE_CLEAR_ANIMATION:
      animationFrame = 0;
      timeToDrop = 0;
    case STATE_GAME_OVER_ANIMATION:
      animationFrame = 0;
      timeToDrop = 0;
  }

  state = newState;

}

let linesComplete = [];

function lockDown() {

  // tetrimino has touched down

  let tetriminoSize = TETRIMINO[currentTetrimino].size;

  // paint tetrimino onto the grid
  let i = 0;
  for (x = 0; x < tetriminoSize; x++) {
    for (y = 0; y < tetriminoSize; y++) {
      if (TETRIMINO[currentTetrimino].shape[tetriminoRot][i] == 1) {
        grid[x+tetriminoX][(tetriminoSize-y-1)+tetriminoY] = currentTetrimino;
      }
      i++;
    }
  }

  linesComplete = [];
  for (y = GRID_HEIGHT - 1; y >= 0; y--) {

    // check to see if line is full...
    let lineComplete = true;
    for (x = 0; x < GRID_WIDTH; x++) {
      if (grid[x][y] == -1) {
        lineComplete = false;
        break;
      }
    }

    if (lineComplete) linesComplete.push(y);

  }

  if (linesComplete.length > 0) {
    switchState(STATE_LINE_CLEAR_ANIMATION);
  } else {
    generateTetrimino();
    if (state != STATE_GAME_OVER_ANIMATION) { switchState(STATE_FALLING); }
  }

}

function removeClearedLines() {

  let yOffs = 0;

  linesComplete.forEach(function(y) {
    for (y2 = y; y2 > 0; y2--) {
      for (x = 0; x < GRID_WIDTH; x++) {
        grid[x][y2+yOffs]=grid[x][y2-1+yOffs];
      }
    }

    // ensure top row remains blank
    for (x = 0; x < GRID_WIDTH; x++) {
      grid[x][0] = -1;
    }

    // loop needs to check the same row again now it contains
    // the row above
    yOffs++;

    // increase player's score
    lines++;
  });


}


function generateTetrimino() {

  tetriminoX = 4;
  tetriminoY = 17;
  tetriminoRot = 0;
  if (nextTetrimino == -1) {
    currentTetrimino = floor(random(7));
  } else {
    currentTetrimino = nextTetrimino;
  }
  nextTetrimino = floor(random(7));

  if (clashDetect(currentTetrimino, tetriminoX, tetriminoY, tetriminoRot)) {
    switchState(STATE_GAME_OVER_ANIMATION);
  }

}

function clashDetect(tetrimino, tetriminoX, tetriminoY, tetriminoRot) {
  let tetriminoSize = TETRIMINO[tetrimino].size;

  let i = 0;
  for (x = 0; x < tetriminoSize; x++) {
    for (y = 0; y < tetriminoSize; y++) {
      if (TETRIMINO[tetrimino].shape[tetriminoRot][i] == 1) {

      // Check if tetrimino is out of bounds
      if ((tetriminoSize-y-1)+tetriminoY >= GRID_HEIGHT) return true;
      if (x+tetriminoX < 0) return true;
      if (x+tetriminoX >= GRID_WIDTH) return true;

      // Check if tetrimino clashes with existing block in grid
      if (grid[x+tetriminoX][(tetriminoSize-y-1)+tetriminoY] != -1) return true;

      }
      i++;
    }
  }

  // No clashes detected
  return false;
}

function startSoftDrop() {
  softDrop = true;
}

function endSoftDrop() {
  softDrop = false;
}

function keyPressed() {

  if (keyCode == UP_ARROW) rotateClockwise();
  if (keyCode == LEFT_ARROW) moveLeft();
  if (keyCode == RIGHT_ARROW) moveRight();
  if (keyCode == DOWN_ARROW) startSoftDrop();

}

function keyReleased() {

  if (keyCode == DOWN_ARROW) endSoftDrop();

}

function touchStarted() {

  touchStartX = mouseX / scaleFactor-windowWidth/scaleFactor/2 + PANEL_WIDTH/2;
  touchStartY = mouseY / scaleFactor-windowHeight/scaleFactor/2 + PANEL_HEIGHT/2;

  touchStart = true;
  dragStart = false;

  return false;
}

function touchMoved() {

  if (touchStart) {

    let mousePanelX = mouseX / scaleFactor-windowWidth/scaleFactor/2 + PANEL_WIDTH/2;
    let mousePanelY = mouseY / scaleFactor-windowHeight/scaleFactor/2 + PANEL_HEIGHT/2;

    // Once the player has dragged at least half a block, count that as
    // a drag and not a tap.
    if ( (mousePanelX - touchStartX >= CELLSIZE/2)  ||
         (mousePanelX - touchStartX <= -CELLSIZE/2) ||
         (mousePanelY - touchStartY >= CELLSIZE/2)  ) {
           dragStart = true;
         }

    // Move one block to the right for every block the player drags right
    while (mousePanelX - touchStartX >= CELLSIZE) {
      touchStartY = mousePanelY; // prevents downward movement due to drift
      touchStartX += CELLSIZE;
      moveRight();
    }

    // Move one block to the left for every block the player drags left
    while (mousePanelX - touchStartX <= -CELLSIZE) {
      touchStartY = mousePanelY; // prevents downward movement due to drift
      touchStartX -= CELLSIZE;
      moveLeft();
    }

    // Move one block down for every HALF block the player drags down
    while (mousePanelY - touchStartY >= CELLSIZE / 2) {
      touchStartY += CELLSIZE;
      touchStartX = mousePanelX; // prevents sideways movement due to drift
      moveDown();
    }

  }

  return false;

}

function touchEnded() {
  if (touchStart) {
    touchStart = false;

    if (!dragStart) {
      // tap detected
      rotateClockwise();
    }

  }

  return false;
}


function rotateClockwise() {
  if (!clashDetect(currentTetrimino, tetriminoX, tetriminoY, (tetriminoRot+1)%4)) {
    tetriminoRot = (tetriminoRot+1)%4;
    checkLockOnMove();
  } else if (!clashDetect(currentTetrimino, tetriminoX-1 , tetriminoY, (tetriminoRot+1)%4)) {
    // If there's not room to rotate, see if we can shift to the left one then rotate
    tetriminoX--;
    tetriminoRot = (tetriminoRot+1)%4;
    checkLockOnMove();
  } else if (!clashDetect(currentTetrimino, tetriminoX+1 , tetriminoY, (tetriminoRot+1)%4)) {
    // otherwise, see if we can shift to the right one then rotate
    tetriminoX++;
    tetriminoRot = (tetriminoRot+1)%4;
    checkLockOnMove();
  } else if (!clashDetect(currentTetrimino, tetriminoX , tetriminoY-1, (tetriminoRot+1)%4)) {
    // otherwise, see if we can shift up one then rotate
    tetriminoY--;
    tetriminoRot = (tetriminoRot+1)%4;
    checkLockOnMove();
    // real tetris has a bunch more complicated rules to allow shift+rotate...
  }
}

function moveLeft() {
  if (!clashDetect(currentTetrimino, tetriminoX-1, tetriminoY, tetriminoRot)) {
    tetriminoX--;
    checkLockOnMove();
  }
}

function moveRight() {
  if (!clashDetect(currentTetrimino, tetriminoX+1, tetriminoY, tetriminoRot)) {
    tetriminoX++;
    checkLockOnMove();
  }
}

//
function checkLockOnMove() {
  if (state == STATE_LOCK_ON) {
    lockOnMovements++;
    if (lockOnMovements < 15) {
      timeToDrop = 30;
    } else {
      timeToDrop = 0;
    }
  }
  checkForLockOn();
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  scaleFactor = min(windowHeight/PANEL_HEIGHT,windowWidth/PANEL_WIDTH)*1.0;
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling
 * the page.
 */
document.ontouchmove = function(event) {
    event.preventDefault();
};
