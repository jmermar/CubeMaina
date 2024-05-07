import { Vec2, Vec3, vec3 } from "wgpu-matrix";

export const ChunkSize = 32;

export type ChunkData = {
  blocks: Uint32Array;
};

export type ChunkMeshData = {
  vertices: {
    position: Vec3;
    uv: Vec2;
    texIndex: number;
  }[];
};

function generateChunkArrayData(chunkData: ChunkMeshData): Float32Array {
  const stride = 3 + 2 + 1;

  const size = chunkData.vertices.length * stride;
  const bufferData = new Float32Array(size);
  for (let i = 0; i < chunkData.vertices.length; i++) {
    const { position, uv, texIndex } = chunkData.vertices[i];
    bufferData.set(position, i * stride);
    bufferData.set(uv, i * stride + 3);
    bufferData.set([texIndex], i * stride + 5);
  }

  return bufferData;
}

function getChunkBlock(
  chunk: ChunkData,
  x: number,
  y: number,
  z: number
): number {
  return chunk.blocks[y * ChunkSize * ChunkSize + z * ChunkSize + x];
}

function setChunkBlock(
  chunk: ChunkData,
  x: number,
  y: number,
  z: number,
  val: number
) {
  chunk.blocks[y * ChunkSize * ChunkSize + z * ChunkSize + x] = val;
}

function buildFace(
  pos1: Vec3,
  right: Vec3,
  down: Vec3,
  texIndex: number
): {
  position: Vec3;
  uv: Vec2;
  texIndex: number;
}[] {
  return [
    //Triangle 1
    {
      position: pos1,
      uv: [0, 0],
      texIndex,
    },
    {
      position: vec3.add(vec3.add(pos1, down), right),
      uv: [1, 1],
      texIndex,
    },
    {
      position: vec3.add(pos1, right),
      uv: [1, 0],
      texIndex,
    },

    //Triangle 2

    {
      position: pos1,
      uv: [0, 0],
      texIndex,
    },
    {
      position: vec3.add(pos1, down),
      uv: [0, 1],
      texIndex,
    },
    {
      position: vec3.add(vec3.add(pos1, down), right),
      uv: [1, 1],
      texIndex,
    },
  ];
}

function buildChunkMeshData(chunk: ChunkData): ChunkMeshData {
  if (chunk.blocks?.length != ChunkSize * ChunkSize * ChunkSize) {
    throw new Error("Chunk size invalid");
  }

  const ret: ChunkMeshData = {
    vertices: [],
  };

  for (let z = 0; z < ChunkSize; z++) {
    for (let y = 0; y < ChunkSize; y++) {
      for (let x = 0; x < ChunkSize; x++) {
        const chunkId = getChunkBlock(chunk, x, y, z);

        if (chunkId > 0) {
          const texId = chunkId;
          ret.vertices = [
            ...ret.vertices,
            //Top
            ...buildFace([x, y + 1, z], [1, 0, 0], [0, 0, 1], texId),
            //Bottom
            ...buildFace([x + 1, y, z], [-1, 0, 0], [0, 0, 1], texId + 1),
            //Front
            ...buildFace([x + 1, y + 1, z], [-1, 0, 0], [0, -1, 0], texId + 2),
            //Back
            ...buildFace([x, y + 1, z + 1], [1, 0, 0], [0, -1, 0], texId + 3),
            //Left
            ...buildFace([x, y + 1, z], [0, 0, 1], [0, -1, 0], texId + 4),
            //Right
            ...buildFace(
              [x + 1, y + 1, z + 1],
              [0, 0, -1],
              [0, -1, 0],
              texId + 4
            ),
          ];
        }
      }
    }
  }

  return ret;
}

export function buildChunkVertexArray(chunk: ChunkData) {
  return generateChunkArrayData(buildChunkMeshData(chunk));
}

export function testChunkData(): ChunkData {
  const ret: ChunkData = {
    blocks: new Uint32Array(ChunkSize * ChunkSize * ChunkSize),
  };

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < ChunkSize; x++) {
      for (let z = 0; z < ChunkSize; z++) {
        setChunkBlock(ret, x, y, z, 1);
      }
    }
  }

  return ret;
}
