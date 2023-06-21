import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Node from "./PathNode";
import { strike } from "./strike";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { soundStrike } from "./sound";
const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

let geometry = new THREE.IcosahedronBufferGeometry(1, 12);

const listener = new THREE.AudioListener();

let material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
  visible: false,
});

let nodes = [];
for (let i = 0; i < geometry.attributes.position.count; i++) {
  let x = geometry.attributes.position.array[i * 3];
  let y = geometry.attributes.position.array[i * 3 + 1];
  let z = geometry.attributes.position.array[i * 3 + 2];
  nodes[i] = new Node(i, x, y, z);
}

for (let node of nodes) {
  node.addNeighbors(geometry);
}

let icosahedron = new THREE.Mesh(geometry, material);
scene.add(icosahedron);

let startGeometry = new THREE.SphereGeometry(0.1, 0.1, 0.1);
let startMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

// Pick random start and end nodes
let startNode = nodes[Math.floor(Math.random() * nodes.length)];
let cubeStart = new THREE.Mesh(startGeometry, startMaterial);
cubeStart.position.set(
  startNode.vertex.x,
  startNode.vertex.y,
  startNode.vertex.z
);
scene.add(cubeStart);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
console.log(sizes);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.add(listener);
camera.position.set(0, 0, 2);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass();
composer.addPass(bloomPass);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

let current = [];

const clearStrike = () => {
  for (let node of current) {
    scene.remove(node);
  }
  current = [];
};

// for (let i = 0; i < 250; i++) {
//   strike(nodes, startNode, current, scene);
// }

const clock = new THREE.Clock();
let elapsedTime = 0;
let elapsedTime2 = 0;

const tick = () => {
  controls.update();

  const delta = clock.getDelta();

  elapsedTime += delta;
  elapsedTime2 += delta;

  // if (elapsedTime >= 12) {
  //   elapsedTime = 0;
  //   for (let i = 0; i < 10; i++) {
  //     strike(nodes, startNode, current, scene);
  //   }
  //   soundStrike.play();
  // }

  // if (elapsedTime2 >= 4.4) {
  //   elapsedTime2 = 0;
  //   clearStrike();
  // }

  composer.render();

  window.requestAnimationFrame(tick);
};

tick();
