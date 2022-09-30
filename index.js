const scoreEl = document.getElementById("scoreEl");
const modalEl = document.getElementById("modalEl");
const endScoreEl = document.getElementById("endScoreEl");
const buttonEl = document.getElementById("buttonEl");
const startButton = document.getElementById("startButton");
const startModalEl = document.getElementById("startModalEl");
const body = document.getElementById("body");
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); //returns a drawing context on the canvas

//game dimensions
//when using window we don't need to declare window
canvas.width = innerWidth; //window.innerWidth
canvas.height = innerHeight; //window.innerHeight

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: 0,
      y: 0,
    };
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();

    const friction = 0.95;
    //friction will slow our player down
    this.velocity.x *= friction;
    this.velocity.y *= friction;

    //collisions both relate to our player not running out of the canvas width and height
    //collision detection for x axis
    if (
      this.x + this.radius + this.velocity.x <= canvas.width &&
      this.x - this.radius + this.velocity.x >= 0
    ) {
      this.x += this.velocity.x;
    } else {
      this.velocity.x = 0;
    }
    //collision detection for y axis
    if (
      this.y + this.radius + this.velocity.y <= canvas.height &&
      this.y - this.radius + this.velocity.y >= 0
    ) {
      this.y += this.velocity.y;
    } else {
      this.velocity.y = 0;
    }
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;

    //used for different types of enemies
    this.type = "Linear";

    if (Math.random() < 0.5) {
      this.type = "Homing";
    }
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();

    if (this.type === "Homing") {
      //using right angles we determine the hypotenus between our player and enemy
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.velocity.x = Math.cos(angle);
      this.velocity.y = Math.sin(angle);
    }

    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;

    this.alpha = 1; //will help with removing particles
  }

  draw() {
    //c.save and c.restore allow us to call c.globalAlpha
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

//coords for middle of canvas
const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 30, "white");
player.draw();

let projectiles = [];
let enemies = [];
let particles = [];
let intervalId;
let score = 0;

function init() {
  player = new Player(x, y, 30, "white");

  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = 0;
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

let animationId; //will be used to end game
function animate() {
  animationId = requestAnimationFrame(animate);

  //fillStyle here with rgba opacity 0.1 makes our game have that lighttrail effect on the projectiles and enemies
  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

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
      cancelAnimationFrame(animationId); //cancels animation on frame when collision was detected
      clearInterval(intervalId); //stops enemies from spawning when we loose
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
          scoreEl.innerHTML = score += 50;
          //we use gsap here to make our transition smooth when enemy decreases
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          // setTimeout(() => {
          projectiles.splice(projectileIndex, 1);
          // }, 0);
          //remove enemy if they are too small
        } else {
          scoreEl.innerHTML = score += 150;

          //placing our splice into a setTimeout will remove flash when removing projectile and enemy from canvas
          // setTimeout(() => {
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
});

buttonEl.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
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

startButton.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
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
      console.log("right");
      player.velocity.x += 1;
      break;
    case "a":
      console.log("left");
      player.velocity.x -= 1;
      break;
    case "w":
      console.log("up");
      player.velocity.y -= 1;
      break;
    case "s":
      console.log("down");
      player.velocity.y += 1;
      break;
  }
});
