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

    this.alpha = 1;
  }

  draw() {
    c.drawImage(this.image, 100, 100);
  }
}
