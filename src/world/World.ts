import Renderer from "../rendering/Renderer";
import { ChunkSize } from "../utils/ChunkBuilder";
import Chunk from "./Chunk";

export const NUM_CHUNKS = 8;

export default class World {
  chunks: Chunk[];

  constructor() {
    this.chunks = new Array<Chunk>(NUM_CHUNKS * NUM_CHUNKS * NUM_CHUNKS);

    for (let x = 0; x < NUM_CHUNKS; x++) {
      for (let y = 0; y < NUM_CHUNKS; y++) {
        for (let z = 0; z < NUM_CHUNKS; z++) {
          this.chunks[z * NUM_CHUNKS * NUM_CHUNKS + y * NUM_CHUNKS + x] =
            new Chunk([x, y, z]);
        }
      }
    }
  }

  getChunk(x: number, y: number, z: number) {
    return this.chunks[z * NUM_CHUNKS * NUM_CHUNKS + y * NUM_CHUNKS + x];
  }

  getBlock(x: number, y: number, z: number) {
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
    for (let z = 0; z < ChunkSize * NUM_CHUNKS; z++) {
      for (let x = 0; x < ChunkSize * NUM_CHUNKS; x++) {
        for (let y = 0; y < 1; y++) {
          this.setBlock(x, y, z, 1);
        }
      }
    }
  }

  buildChunks(renderer: Renderer) {
    for (let x = 0; x < NUM_CHUNKS; x++) {
      for (let y = 0; y < NUM_CHUNKS; y++) {
        for (let z = 0; z < NUM_CHUNKS; z++) {
          renderer.addChunk(this.getChunk(x, y, z), this);
        }
      }
    }
  }
}
