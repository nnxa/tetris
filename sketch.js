const PANEL_WIDTH = 200;
const PANEL_HEIGHT = 300;

const CELLSIZE = 11;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 40;
const VISIBLE_GRID_HEIGHT = 20;

const BOARD_X =  PANEL_WIDTH / 2 - CELLSIZE * GRID_WIDTH / 2;
const BOARD_Y = PANEL_HEIGHT / 2 - CELLSIZE * VISIBLE_GRID_HEIGHT / 2;
const INVISIBLE_GRID_HEIGHT = GRID_HEIGHT - VISIBLE_GRID_HEIGHT;

let grid = [];

let tetriminoX;
let tetriminoY;
let tetriminoRot;
let currentTetronimo;

let timeToDrop = 1;

let lines = 0;

let scaleFactor;

let softDrop = false;

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
                     1,0,0]], color: [255, 0, 0]}];

let myFont;
 function preload() {
   myFont = loadFont('fonts/press-start-2p/PressStart2P.ttf');
 }




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
background(0,0,0);



  scale(scaleFactor);

  translate(windowWidth/scaleFactor/2 - PANEL_WIDTH/2, windowHeight/scaleFactor/2 - PANEL_HEIGHT/2);


  noStroke();
  fill(0,0,0);
  rect(0,0,PANEL_WIDTH,PANEL_HEIGHT);

stroke(255);
strokeWeight(2);

rect(BOARD_X - 2, BOARD_Y - 2, GRID_WIDTH * CELLSIZE + 3, VISIBLE_GRID_HEIGHT * CELLSIZE + 3);


noStroke();

let level = floor(lines / 10) + 1;

fill(255);
textSize(8);
text('LINES', GRID_WIDTH * CELLSIZE + 5 + BOARD_X, BOARD_Y+8);
text(lines, GRID_WIDTH * CELLSIZE + 5 + BOARD_X, BOARD_Y + 18);

text('LEVEL', GRID_WIDTH * CELLSIZE + 5 + BOARD_X, BOARD_Y+32);
text(level, GRID_WIDTH * CELLSIZE + 5 + BOARD_X, BOARD_Y + 42);

 for(x = 0; x < GRID_WIDTH; x++) {
   for (y = 0; y < VISIBLE_GRID_HEIGHT; y++) {
     t = grid[x][y+INVISIBLE_GRID_HEIGHT];
     if (t != -1) {
        fill(color(TETRIMINO[t].color[0], TETRIMINO[t].color[1], TETRIMINO[t].color[2]));
        rect(x*CELLSIZE+BOARD_X,y*CELLSIZE+BOARD_Y,CELLSIZE-1,CELLSIZE-1);
     }
   }
 }



 let tetriminoSize = TETRIMINO[currentTetronimo].size;

fill(color(TETRIMINO[currentTetronimo].color[0], TETRIMINO[currentTetronimo].color[1], TETRIMINO[currentTetronimo].color[2]));

let i = 0;
for (x = 0; x < tetriminoSize; x++) {
  for (y = 0; y < tetriminoSize; y++) {
    if (TETRIMINO[currentTetronimo].shape[tetriminoRot][i] == 1) {
	  if (tetriminoY+(tetriminoSize-y-1) >= VISIBLE_GRID_HEIGHT) {
        rect((tetriminoX+x)*CELLSIZE+BOARD_X,(tetriminoY+(tetriminoSize-y-1)-INVISIBLE_GRID_HEIGHT)*CELLSIZE+BOARD_Y,CELLSIZE-1,CELLSIZE-1);
      }
    }
    i++;
  }
}

if (softDrop) {
  timeToDrop -= 20;
} else {
  timeToDrop--;
}

while (timeToDrop <= 0) {

  moveDown();

  timeToDrop += 60  * pow((0.8 - ((level - 1) * 0.007)),(level-1)); //,
}


}

function moveDown() {

  if (!clashDetect(currentTetronimo, tetriminoX, tetriminoY+1, tetriminoRot)) {
    tetriminoY++;
  } else {

 let tetriminoSize = TETRIMINO[currentTetronimo].size;

    let i = 0;
    for (x = 0; x < tetriminoSize; x++) {
      for (y = 0; y < tetriminoSize; y++) {
        if (TETRIMINO[currentTetronimo].shape[tetriminoRot][i] == 1) {
          grid[x+tetriminoX][(tetriminoSize-y-1)+tetriminoY] = currentTetronimo;
        }
        i++;
      }
    }


    for (y = GRID_HEIGHT - 1; y >= 0; y--) {

      let lineComplete = true;

      for (x = 0; x < GRID_WIDTH; x++) {
        if (grid[x][y] == -1) {
          lineComplete = false;
        }
      }

      if (lineComplete) {
        for (y2 = y; y2 > 0; y2--) {
          for (x = 0; x < GRID_WIDTH; x++) {
            grid[x][y2]=grid[x][y2-1];
          }
        }

        for (x = 0; x < GRID_WIDTH; x++) {
          grid[x][0] = -1;
        }
        y++;
        lines++;

      }
    }

    generateTetrimino();

  }

}
function generateTetrimino() {

  tetriminoX = 4;
  tetriminoY = 17;
  tetriminoRot = 0;
  currentTetronimo = floor(random(7));


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

let touchStartX;
let touchStartY;

let dragStart;
let touchStart;

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
      rotateClockwise();

    }
  }

  return false;

}


function rotateClockwise() {
  if (!clashDetect(currentTetronimo, tetriminoX, tetriminoY, (tetriminoRot+1)%4)) {
    tetriminoRot = (tetriminoRot+1)%4;
  } else if (!clashDetect(currentTetronimo, tetriminoX-1 , tetriminoY, (tetriminoRot+1)%4)) {
    tetriminoX--;
    tetriminoRot = (tetriminoRot+1)%4;
  } else if (!clashDetect(currentTetronimo, tetriminoX+1 , tetriminoY, (tetriminoRot+1)%4)) {
    tetriminoX++;
    tetriminoRot = (tetriminoRot+1)%4;
  } else if (!clashDetect(currentTetronimo, tetriminoX , tetriminoY-1, (tetriminoRot+1)%4)) {
    tetriminoY--;
    tetriminoRot = (tetriminoRot+1)%4;
  }
}

function moveLeft() {
  if (!clashDetect(currentTetronimo, tetriminoX-1, tetriminoY, tetriminoRot)) {
    tetriminoX--;
  }
}

function moveRight() {
  if (!clashDetect(currentTetronimo, tetriminoX+1, tetriminoY, tetriminoRot)) {
    tetriminoX++;
  }
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
