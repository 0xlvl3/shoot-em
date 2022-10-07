// //when player fires
// export const shootAudio =

// //fires when we shrink enemy
// export const damageTakenAudio =
const audio = {
  shoot: new Howl({
    src: "./sounds/Basic_shoot_noise.wav",
    volume: 0.025,
  }),
  damageTaken: new Howl({
    src: "./sounds/Damage_taken.wav",
    volume: 0.05,
  }),
  explode: new Howl({
    src: "./sounds/Explode.wav",
    volume: 0.05,
  }),
  powerUp: new Howl({
    src: "./sounds/Powerup.wav",
    volume: 0.025,
  }),
  death: new Howl({
    src: "./sounds/Death.wav",
    volume: 0.05,
  }),
  select: new Howl({
    src: "./sounds/Select.wav",
    volume: 0.05,
  }),
  background: new Howl({
    src: "./sounds/Hyper.wav",
    volume: 0.1,
    loop: true,
  }),
};

export default audio;
