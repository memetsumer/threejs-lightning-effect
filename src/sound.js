import * as THREE from "three";

const listener = new THREE.AudioListener();

// create a global audio source
export const soundRain = new THREE.Audio(listener);
export const soundStrike = new THREE.Audio(listener);
export const audioLoader = new THREE.AudioLoader();
audioLoader.load("/strike.mp3", function (buffer) {
  soundStrike.setBuffer(buffer);
  soundStrike.setVolume(0.9);
});
audioLoader.load("/rain.mp3", function (buffer) {
  soundRain.setBuffer(buffer);
  soundRain.setVolume(0.1);
  soundRain.setLoop(true);
  soundRain.play();
});
