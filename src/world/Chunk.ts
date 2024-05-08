import { Vec3 } from "wgpu-matrix";

export const CHUNK_SIZE = 32;

export default class Chunk {
  data = new Uint32Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);
  position: Vec3;

  constructor(position: Vec3) {
    this.position = [...position];
  }

  getBlock(x: number, y: number, z: number) {
    return this.data[y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x];
  }

  setBlock(x: number, y: number, z: number, block: number) {
    this.data[y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x] = block;
  }
}
