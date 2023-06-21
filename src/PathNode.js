import * as THREE from "three";

export default class Node {
  constructor(index, x, y, z) {
    this.index = index;
    this.vertex = new THREE.Vector3(x, y, z);
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = null;
  }

  addNeighbors(geometry) {
    let positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length / 3; i++) {
      if (
        i !== this.index &&
        this.vertex.distanceToSquared(
          new THREE.Vector3(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2]
          )
        ) <= 0.02
      ) {
        this.neighbors.push(i);
      }
    }
  }
}
