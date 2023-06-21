import * as THREE from "three";
import aStar from "./algortihm";
import testVertexShader from "./shaders/test/vertex.glsl";
import testFragmentShader from "./shaders/test/fragment.glsl";

const pathTubeMaterial = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x0A50FF) },
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uAmplitude: { value: new THREE.Vector2(1, 1) },
  },
});

export const strike = (nodes, startNode, current, scene) => {
  let endNode = nodes[Math.floor(Math.random() * nodes.length)];
  let path = aStar(startNode, endNode, nodes);

  if (path.length > 0) {
    const pathTubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        path.map(
          (node) =>
            new THREE.Vector3(node.vertex.x, node.vertex.y, node.vertex.z)
        )
      ),
      path.length,
      0.01,
      8,
      false
    );
    const pathTube = new THREE.Mesh(pathTubeGeometry, pathTubeMaterial);
    current.push(pathTube);
    scene.add(pathTube);
  }
};
