let canvas,ctx;
let heading,x,y,dy,basketX,rightpressed,leftpressed,score,lives,level,basketSpeed,game,username;
document.getElementById('my-canvas').style.display = 'none';

function initGame(){

     canvas = document.getElementById("my-canvas");
     ctx = canvas.getContext("2d");
     heading = document.createElement('h2');
     x = 240;
     y = 0;
     dy = 2;
     basketX = canvas.clientWidth / 2;
     rightpressed = false;
     leftpressed = false;
     score = 1;
     lives = 3;
     level = 1;
     basketSpeed = 7;
     username = '';
    
    document.addEventListener("keydown", keydownhandler, false);
    document.addEventListener("keyup", keyuphandler, false);

    draw();
}

function keydownhandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightpressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftpressed = true;
  }
}

function keyuphandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightpressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftpressed = false;
  }
}

function background() {
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };

  img.src = "images/new.jpg";
}

function egg() {
  const egg = new Image();
  egg.onload = () => {
    ctx.drawImage(egg, x, y);
  };
  egg.src = "images/egg3.png";
}

function basket() {
  const basket = new Image();
  basket.onload = () => {
    ctx.drawImage(basket, basketX, canvas.clientHeight - 240, 240, 240);
  };
  basket.src = "images/basket.png";
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function drawLevel() {
  ctx.font = "48px Arial";
  ctx.fillStyle = "red";
  ctx.fillText(`LEVEL: ${level}`, canvas.width / 2 - 90, 60);
}

function gameOverMessage() {
  document.getElementById('gameovermessage').classList.remove('hidden');
}

function createUser() {
    if(input.value !== ""){
    let input = document.getElementById("input").value;
    let inputSection = document.getElementById("input-section");
 inputSection.remove();
let headingValue = document.createTextNode(input);
heading.append(headingValue);

let body = document.querySelector('body');
body.insertBefore(heading,canvas);
username = input;
    }
}

function draw() {
  background();
  egg();
  basket();
  drawScore();
  drawLives();
  drawLevel();

  if (y > canvas.clientHeight - 150) {
    if (x > basketX && x < basketX + 240) {
      x = Math.random() * (canvas.clientWidth - 120) + 60;
      y = 60;
      score++;
      updateScore(score);
      if (score % 5 == 0) {
        dy = dy + 1;
        basketSpeed = basketSpeed + 2;
        level++;
      }
    } else {
      lives--;
      if (!lives) {
        canvas.remove();
        heading.remove();
        updatelives(lives);
      } else {
        x = 240;
        y = 0;
        basketX = canvas.clientWidth / 2;
      }
    }
  }

  if (rightpressed) {
    basketX = Math.min(basketX + basketSpeed, canvas.clientWidth - 195);
  } else if (leftpressed) {
    basketX = Math.max(basketX - basketSpeed, -40);
  }

  y = y + dy;

  requestAnimationFrame(draw);
}




const socket = io();
let canvasVisible = false;

socket.on("nmessage", (users) => {
  // Update the table with the current list of users and scores
  updateScoreTable(users);
});

// Function to update the score table with the current list of users and scores
function updateScoreTable(users) {
  const tableBody = document.querySelector('#score-table tbody');
  // Clear the existing table content
  tableBody.innerHTML = '';

  // Add each user's username and score to the table
  users.forEach((user) => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${user.username}</td>
          <td>${user.score}</td>
      `;
      tableBody.appendChild(row);
  });
}

function setUsername() {
   const username = document.getElementById('username-input').value;
   if (username.trim() !== '') {
       // Emit the "setUsername" event to the server with the entered username
       socket.emit("setUsername", username);

       // Hide the input section after setting the username
       document.getElementById('input-section').style.display = 'none';
       document.getElementById('score-table').style.display = 'block';
       if (!canvasVisible) {
        canvasVisible = true;
        const canvas = document.getElementById('my-canvas');
        canvas.style.display = 'block';
       initGame();
    }
   }
}

function updateScore(newScore) {
  // Emit the "updateScore" event to the server with the new score
  socket.emit("updateScore", newScore);
}

function updatelives(lives){
socket.emit('updateLives',lives);
}

function playAgain() {
  // Redirect the player back to the home page
  window.location.href = '/';
}

socket.on('gameOver',()=>{
  document.getElementById('game-over-message').style.display = 'block';
})

socket.on("maxClientReached",()=>{
   let body = document.querySelector('body').innerHTML = "<h1>Max clients reached</h1>";
})
