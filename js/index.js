import Enemy from "./classes/Enemy.js";
import Player from "./classes/Player.js";
import Particle from "./classes/Particle.js";
import Projectile from "./classes/Projectile.js";
import PowerUp from "./classes/PowerUp.js";
import BackgroundParticle from "./classes/BackgroundParticle.js";
import audio from "./audio.js";

const scoreEl = document.getElementById("scoreEl");
const modalEl = document.getElementById("modalEl");
const endScoreEl = document.getElementById("endScoreEl");
const buttonEl = document.getElementById("buttonEl");
const startButton = document.getElementById("startButton");
const startModalEl = document.getElementById("startModalEl");
const body = document.getElementById("body");
export const canvas = document.querySelector("canvas");
export const c = canvas.getContext("2d"); //returns a drawing context on the canvas

//game dimensions
//when using window we don't need to declare window
canvas.width = innerWidth; //window.innerWidth
canvas.height = innerHeight; //window.innerHeight

//coords for middle of canvas
const x = canvas.width / 2;
const y = canvas.height / 2;

export let player = new Player(x, y, 30, "white");
player.draw();

let projectiles = [];
let enemies = [];
let particles = [];
let powerUps = [];
let backgroundParticles = [];
let intervalId;
let spawnPowerUpsId;
let score = 0;
let frames = 0;
let game = {
  active: false,
};

function init() {
  player = new Player(x, y, 30, "white");

  projectiles = [];
  enemies = [];
  particles = [];
  powerUps = [];
  score = 0;
  scoreEl.innerHTML = 0;
  frames = 0;
  game = {
    active: true,
  };

  const spacing = 30;
  backgroundParticles = [];
  for (let x = 0; x < canvas.width + spacing; x += spacing) {
    for (let y = 0; y < canvas.height + spacing; y += spacing)
      backgroundParticles.push(
        new BackgroundParticle({
          position: {
            x,
            y,
          },
          radius: 2.5,
        })
      );
  }
}

/**
 * will spawn our enemies every second
 */
function spawnEnemies() {
  intervalId = setInterval(() => {
    //Here we set a random max and min using Math.random * (max - min) + min
    const radius = Math.random() * (30 - 8) + 8; //store radius above x, y as we need it for enemy x and y positions

    //need these outside of our if to use later and let to change
    let x;
    let y;

    //how we spawn enemies on our canvas x and y in random positions
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(
      //y is always first in atan2
      canvas.height / 2 - y, //compare to our projectiles we reverse the expression
      canvas.width / 2 - x
    );

    //these coords will return the hypotenuse - which we will use to angle our projectiles with our mouse coords when we click
    const velocity = {
      x: Math.cos(angle), //cos === x
      y: Math.sin(angle), //sin === y
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

function spawnPowerUps() {
  spawnPowerUpsId = setInterval(() => {
    powerUps.push(
      new PowerUp({
        position: { x: -30, y: Math.random() * canvas.height },
        velocity: { x: Math.random() + 2, y: 0 },
        imageSrc: "./img/lightningBolt.png",
      })
    );
  }, 15000);
}

/**
 *
 * @param {object} position takes x and y coords of where projectile collision with enemy
 * @param {object} score
 *
 * function creates a label element, through this element we style some of the properties and posiiton to have mini score labels that show when we hit an enemy.
 */
function createScoreLabel({ position, score }) {
  const scoreLabel = document.createElement("label");
  scoreLabel.innerHTML = score;
  scoreLabel.style.color = "white";
  scoreLabel.style.position = "absolute";
  scoreLabel.style.left = position.x + "px";
  scoreLabel.style.top = position.y + "px";
  scoreLabel.style.userSelect = "none"; //makes user not able to select labels
  scoreLabel.style.left = document.body.appendChild(scoreLabel);

  //gsap here reduces the opacity to 0, translates on the y axis -30 to make a move up effect, we have a duration of 0.75 for that to occur and onComplete will remove our element we created in this function after gsap completes all those steps.
  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => {
      scoreLabel.parentNode.removeChild(scoreLabel);
    },
  });
}

let animationId; //will be used to end game
function animate() {
  animationId = requestAnimationFrame(animate);

  backgroundParticles.forEach((bgParticle) => {
    bgParticle.draw();

    const dist = Math.hypot(
      player.x - bgParticle.position.x,
      player.y - bgParticle.position.y
    );

    if (dist < 150) {
      bgParticle.alpha = 0;
      if (dist > 100) {
        bgParticle.alpha = 0.5;
      }
    } else if (dist > 100 && bgParticle.alpha < 0.1) {
      bgParticle.alpha += 0.01;
    } else if (dist > 100 && bgParticle.alpha > 0.1) {
      bgParticle.alpha -= 0.01;
    }
  });
  //fillStyle here with rgba opacity 0.1 makes our game have that lighttrail effect on the projectiles and enemies
  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  frames++;

  player.update();

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];

    if (powerUp.position.x > canvas.width) {
      powerUps.splice(i, 1);
    } else {
      powerUp.update();
    }

    const dist = Math.hypot(
      player.x - powerUp.position.x,
      player.y - powerUp.position.y
    );

    //gain power up
    if (dist < powerUp.image.height / 2 + player.radius) {
      audio.powerUp.play();
      powerUps.splice(i, 1);
      player.powerUp = "MachineGun";
      player.color = "yellow";
      setTimeout(() => {
        player.powerUp = null;
        player.color = "white";
      }, 5000);
    }
  }

  //machine gun animation / implementation
  if (player.powerUp === "MachineGun") {
    const angle = Math.atan2(
      mouse.position.y - player.y,
      mouse.position.x - player.x
    );
    const velocity = {
      x: Math.cos(angle) * 5, //cos === x
      y: Math.sin(angle) * 5, //sin === y
    };

    //slow down rate of fire for power up
    if (frames % 2 === 0) {
      projectiles.push(
        new Projectile(player.x, player.y, 5, "yellow", velocity)
      );
    }
    if (frames % 5 === 0) {
      audio.shoot.play();
    }
  }

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index];
    //if will remove particles from game
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];

    projectile.update();

    //if statement will remove projectiles from game that reach canvas width and height
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1);
    }
  }

  //how to loop from the back of our arrays, we loop through the back to counter the flashing that occurs when projectiles and enemies are removed. Before we looped from the back we used forEach as below and setTimeouts around our splices
  //enemies.forEach((enemy, enemyIndex) below is a refactor of this
  for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
    const enemy = enemies[enemyIndex];
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    //project hits player end game
    if (dist - enemy.radius - player.radius < 1) {
      audio.death.play();
      game.active = false;
      cancelAnimationFrame(animationId); //cancels animation on frame when collision was detected
      clearInterval(intervalId); //stops enemies from spawning when we loose
      clearInterval(spawnPowerUpsId); //will remove powerups
      modalEl.style.display = "block";
      gsap.fromTo(
        modalEl,
        {
          scale: 0.8,
          opacity: 0,
        },
        { scale: 1, opacity: 1, ease: "expo" }
      );
      endScoreEl.innerHTML = score;
    }

    for (
      let projectileIndex = projectiles.length - 1;
      projectileIndex >= 0;
      projectileIndex--
    ) {
      const projectile = projectiles[projectileIndex];

      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //remove enemy and projectile
      if (dist - enemy.radius - projectile.radius < 1) {
        //creating our particle explosion
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * Math.random() * 4,
                y: (Math.random() - 0.5) * Math.random() * 4,
              }
            )
          );
        }

        //this if block will reduce enemy size
        if (enemy.radius - 10 > 5) {
          audio.damageTaken.play();
          scoreEl.innerHTML = score += 50;
          //we use gsap here to make our transition smooth when enemy decreases
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          createScoreLabel({
            position: {
              x: projectile.x,
              y: projectile.y,
            },
            score: 50,
          });
          // setTimeout(() => {
          projectiles.splice(projectileIndex, 1);
          // }, 0);
          //remove enemy if they are too small
        } else {
          scoreEl.innerHTML = score += 150;

          //placing our splice into a setTimeout will remove flash when removing projectile and enemy from canvas
          // setTimeout(() => {
          createScoreLabel({
            position: {
              x: projectile.x,
              y: projectile.y,
            },
            score: 150,
          });
          backgroundParticles.forEach((bgParticle) => {
            gsap.set(bgParticle, {
              color: "white",
              alpha: 1,
            });
            gsap.to(bgParticle, {
              color: enemy.color,
              alpha: 0.1,
            });
            bgParticle.color = enemy.color;
          });
          audio.explode.play();
          enemies.splice(enemyIndex, 1);
          projectiles.splice(projectileIndex, 1);
          // }, 0);
        }
      }
    }
  }
}

//window.addEventListener
addEventListener("click", (e) => {
  if (!audio.background.playing()) {
    audio.background.play();
  }
  if (game.active) {
    //1. get the angle
    //2. put in atan2 === angle needed for hypotenuse
    //3. get x and y velocities, sin(angle) === y, cos(angle) === x.
    //4. cos(x) and sin(y) === hypotenuse

    //Math.atan2 will return y and x radians used for our cos and sin methods
    const angle = Math.atan2(
      //y is always first in atan2
      e.clientY - player.y,
      e.clientX - player.x
    );

    //these coords will return the hypotenuse - which we will use to angle our projectiles with our mouse coords when we click
    const velocity = {
      x: Math.cos(angle) * 4.5, //cos === x
      y: Math.sin(angle) * 4.5, //sin === y
    };

    projectiles.push(new Projectile(player.x, player.y, 5, "white", velocity));
    audio.shoot.play();
  }
});

buttonEl.addEventListener("click", () => {
  init();
  audio.select.play();
  animate();
  spawnEnemies();
  spawnPowerUps();
  gsap.to(modalEl, {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: "expo.in",
    onComplete: () => {
      modalEl.style.display = "none";
    },
  });
});

//global mouse var
const mouse = {
  position: {
    x: 0,
    y: 0,
  },
};

//getting coords for our global mouse var
addEventListener("mousemove", (e) => {
  mouse.position.x = e.clientX;
  mouse.position.y = e.clientY;
});

startButton.addEventListener("click", () => {
  init();
  audio.select.play();
  animate();
  spawnEnemies();
  spawnPowerUps();
  body.style.backgroundColor = "white";
  // startModalEl.style.display = "none";
  gsap.to(startModalEl, {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: "expo.in",
    onComplete: () => {
      startModalEl.style.display = "none";
    },
  });
});

//Player movement
addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "d":
      player.velocity.x += 1;
      break;
    case "a":
      player.velocity.x -= 1;
      break;
    case "w":
      player.velocity.y -= 1;
      break;
    case "s":
      player.velocity.y += 1;
      break;
  }
});
