import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Node from "./PathNode";
import { strike } from "./strike";
import tresHoldFragmentShader from "./shaders/treshold/fragment.glsl";
import blurFragmentShader from "./shaders/blur/fragment.glsl";
import finalFragmentShader from "./shaders/final/fragment.glsl";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

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

const renderTargetOriginal = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height
);
const renderTargetBright = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height
);
const renderTargetBloom = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height
);

// Setup threshold shader
const thresholdShader = {
  uniforms: {
    tDiffuse: { type: "t", value: renderTargetOriginal.texture },
    threshold: { type: "f", value: 0.9 },
  },
  fragmentShader: tresHoldFragmentShader,
};

// Setup blur shader
const blurShader = {
  uniforms: {
    tDiffuse: { type: "t", value: null },
    resolution: {
      type: "v2",
      value: new THREE.Vector2(1.0 / sizes.width, 1.0 / sizes.height),
    },
  },
  fragmentShader: blurFragmentShader,
};

// Combine the original scene and the bloom texture
const finalShader = {
  uniforms: {
    tDiffuse: { type: "t", value: renderTargetOriginal.texture },
    tBloom: { type: "t", value: renderTargetBloom.texture },
  },
  fragmentShader: finalFragmentShader,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderTargetOriginal.setSize(sizes.innerWidth, sizes.innerHeight);
  renderTargetBright.setSize(sizes.innerWidth, sizes.innerHeight);
  renderTargetBloom.setSize(sizes.innerWidth, sizes.innerHeight);

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
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let current = [];

const clearStrike = () => {
  for (let node of current) {
    scene.remove(node);
  }
  current = [];
};

const quadGeometry = new THREE.BufferGeometry(2, 2);
const quadMaterial = new THREE.ShaderMaterial({
  fragmentShader: finalShader.fragmentShader,
  uniforms: finalShader.uniforms,
  // vertexShader: "<your-vertex-shader-here>",
}); // Use a basic material
const fullScreenQuad = new THREE.Mesh(quadGeometry, quadMaterial);
const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Assuming `renderTargetOriginal` is your render target
let debugMaterial = new THREE.MeshBasicMaterial({
  map: renderTargetBright.texture,
});

let debugGeometry = new THREE.PlaneBufferGeometry(2, 2); // Adjust size as needed

let debugMesh = new THREE.Mesh(debugGeometry, debugMaterial);

// Add the mesh to your scene
scene.add(debugMesh);

function render() {
  // 1. Render original scene into renderTargetOriginal
  renderer.setRenderTarget(renderTargetOriginal);
  renderer.clear();
  renderer.render(fullScreenQuad, orthographicCamera);

  // 2. Render bright areas into renderTargetBright
  thresholdShader.uniforms.tDiffuse.value = renderTargetOriginal.texture;
  fullScreenQuad.material = thresholdShader;
  renderer.setRenderTarget(renderTargetBright);
  renderer.clear();
  renderer.render(fullScreenQuad, orthographicCamera);

  // 3. Render bloom by blurring the bright areas and store in renderTargetBloom
  blurShader.uniforms.tDiffuse.value = renderTargetBright.texture;
  fullScreenQuad.material = blurShader;
  renderer.setRenderTarget(renderTargetBloom);
  renderer.clear();
  renderer.render(fullScreenQuad, orthographicCamera);

  // 4. Combine the original scene and the bloom
  finalShader.uniforms.tDiffuse.value = renderTargetOriginal.texture;
  finalShader.uniforms.tBloom.value = renderTargetBloom.texture;
  fullScreenQuad.material = finalShader;
  renderer.setRenderTarget(null); // Render to screen
  renderer.clear();
  renderer.render(fullScreenQuad, orthographicCamera);

  renderer.render(scene, camera);
}

for (let i = 0; i < 10; i++) {
  strike(nodes, startNode, current, scene);
}

const clock = new THREE.Clock();
let elapsedTime = 0;
let elapsedTime2 = 0;

const tick = () => {
  // const delta = clock.getDelta();

  // elapsedTime += delta;
  // elapsedTime2 += delta;

  // if (elapsedTime >= 12) {
  //   elapsedTime = 0;
  //   for (let i = 0; i < 10; i++) {
  //     strike(nodes, startNode, current, scene)
  //   }
  //   soundStrike.play();
  // }

  // if (elapsedTime2 >= 4.4) {
  //   elapsedTime2 = 0;
  //   clearStrike();
  // }

  controls.update();

  render();

  window.requestAnimationFrame(tick);
};

tick();
