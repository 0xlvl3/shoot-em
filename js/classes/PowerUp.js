import { c } from "/js/index.js";

//const powerUp = new PowerUp({x: 100, y: 100, velocity : {x: 0, y: 0}})

export default class PowerUp {
  //we declare object class syntax here - will go through and refactor my code similar to this later - also when using object syntax the order of our declarations doesn't matter
  //position will have default values of 0 and 0
  constructor({ position = { x: 0, y: 0 }, velocity, imageSrc }) {
    this.position = position;
    this.velocity = velocity;

    this.image = new Image();
    this.image.src = imageSrc;

    //this will help us fade our powerup
    this.alpha = 1;
    //using gsap we fade our alpha
    gsap.to(this, {
      alpha: 0.02, //will effect the opacity of our image
      duration: 0.3, //duration that it will take to fade our specified alpha
      repeat: -1, //repeat loop
      yoyo: true, //yoyo will make it go back from our alpha we specified in gsap to our true alpha
      ease: "linear",
    });

    this.radians = 0;
  }

  draw() {
    //c.save and c.restore as require for us to use the globalAlpha
    c.save();
    c.globalAlpha = this.alpha;
    //how we rotate an image
    c.translate(
      this.position.x + this.image.width / 2,
      this.position.y + this.image.height / 2
    );
    c.rotate(this.radians);
    c.translate(
      -this.position.x - this.image.width / 2,
      -this.position.y - this.image.height / 2
    );
    ///////////////////////////////////////
    c.drawImage(this.image, this.position.x, this.position.y);
    c.restore();
  }

  update() {
    this.draw();
    this.radians += 0.01;
    this.position.x += this.velocity.x;
  }
}
