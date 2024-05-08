import { createNoise2D } from "simplex-noise";
import Renderer from "../rendering/Renderer";
import { ChunkSize } from "../utils/ChunkBuilder";
import Chunk from "./Chunk";

export const NUM_CHUNKS = 16;
export const NUM_CHUNKS_HEIGHT = 4;

export default class World {
  chunks: Chunk[];

  constructor() {
    this.chunks = new Array<Chunk>(NUM_CHUNKS * NUM_CHUNKS * NUM_CHUNKS);

    for (let x = 0; x < NUM_CHUNKS; x++) {
      for (let y = 0; y < NUM_CHUNKS_HEIGHT; y++) {
        for (let z = 0; z < NUM_CHUNKS; z++) {
          this.chunks[y * NUM_CHUNKS * NUM_CHUNKS + z * NUM_CHUNKS + x] =
            new Chunk([x, y, z]);
        }
      }
    }
  }

  getChunk(x: number, y: number, z: number) {
    return this.chunks[y * NUM_CHUNKS * NUM_CHUNKS + z * NUM_CHUNKS + x];
  }

  getBlock(x: number, y: number, z: number) {
    if (x < 0 || y < 0 || z < 0) return 0;
    if (
      x >= ChunkSize * NUM_CHUNKS ||
      y >= ChunkSize * NUM_CHUNKS_HEIGHT ||
      z >= ChunkSize * NUM_CHUNKS
    )
      return 0;
    const chunkPos: [number, number, number] = [
      Math.floor(x / ChunkSize),
      Math.floor(y / ChunkSize),
      Math.floor(z / ChunkSize),
    ];
    return (
      this.getChunk(...chunkPos)?.getBlock(
        x % ChunkSize,
        y % ChunkSize,
        z % ChunkSize
      ) ?? 0
    );
  }

  setBlock(x: number, y: number, z: number, block: number) {
    if (x < 0 || y < 0 || z < 0) return;
    if (
      x >= ChunkSize * NUM_CHUNKS ||
      y >= ChunkSize * NUM_CHUNKS_HEIGHT ||
      z >= ChunkSize * NUM_CHUNKS
    )
      return;
    const chunkPos: [number, number, number] = [
      Math.floor(x / ChunkSize),
      Math.floor(y / ChunkSize),
      Math.floor(z / ChunkSize),
    ];
    return this.getChunk(...chunkPos)?.setBlock(
      x % ChunkSize,
      y % ChunkSize,
      z % ChunkSize,
      block
    );
  }

  populateBlocks() {
    const noise2D = createNoise2D();
    for (let z = 0; z < ChunkSize * NUM_CHUNKS; z++) {
      for (let x = 0; x < ChunkSize * NUM_CHUNKS; x++) {
        const height = Math.floor(
          50 + noise2D(x / (ChunkSize * 3), z / (ChunkSize * 3)) * 20
        );
        for (let y = 0; y < height; y++) {
          const block = y <= height - 4 ? 3 : y == height - 1 ? 1 : 2;
          this.setBlock(x, y, z, block);
        }
      }
    }
  }

  buildChunks(renderer: Renderer) {
    for (let x = 0; x < NUM_CHUNKS; x++) {
      for (let y = 0; y < NUM_CHUNKS_HEIGHT; y++) {
        for (let z = 0; z < NUM_CHUNKS; z++) {
          renderer.addChunk(this.getChunk(x, y, z), this);
        }
      }
    }
  }
}
