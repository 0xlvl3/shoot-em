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
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
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

//coords for middle of canvas
const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, "blue");
player.draw();

let projectiles = [];
let enemies = [];

/**
 * will spawn our enemies every second
 */
function spawnEnemies() {
  setInterval(() => {
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

    const color = "green";

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

  c.clearRect(0, 0, canvas.width, canvas.height);

  player.draw();

  projectiles.forEach((projectile) => {
    projectile.update();
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    //project hits player end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId); //cancels animation on frame when collision was detected
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //remove enemy and projectile
      if (dist - enemy.radius - projectile.radius < 1) {
        //placing our splice into a setTimeout will remove flash when removing projectile and enemy from canvas
        setTimeout(() => {
          enemies.splice(enemyIndex, 1);
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    });
  });
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
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  //these coords will return the hypotenuse - which we will use to angle our projectiles with our mouse coords when we click
  const velocity = {
    x: Math.cos(angle), //cos === x
    y: Math.sin(angle), //sin === y
  };

  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "red", velocity)
  );
});

animate();
spawnEnemies();
