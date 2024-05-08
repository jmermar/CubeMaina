import { Vec2, Vec3, vec3 } from "wgpu-matrix";
import { ChunkMeshData } from "../rendering/passes/ChunkPass";
import Chunk from "../world/Chunk";
import World from "../world/World";
import { blocks } from "../data/BlockData";

export const ChunkSize = 32;

export type ChunkData = {
  blocks: Uint32Array;
};

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

export function buildChunkMeshData(chunk: Chunk, world: World): ChunkMeshData {
  const ret: ChunkMeshData = {
    vertices: [],
  };

  for (let z = 0; z < ChunkSize; z++) {
    for (let y = 0; y < ChunkSize; y++) {
      for (let x = 0; x < ChunkSize; x++) {
        const [wx, wy, wz] = [
          x + chunk.position[0] * ChunkSize,
          y + chunk.position[1] * ChunkSize,
          z + chunk.position[2] * ChunkSize,
        ];
        const chunkId = world.getBlock(wx, wy, wz);
        if (chunkId == 0) continue;
        const { textures } = blocks[chunkId - 1];

        function buildIfVisible(
          adjacent: number[],
          args: [Vec3, Vec3, Vec3, number]
        ) {
          return world.getBlock(adjacent[0], adjacent[1], adjacent[2]) == 0
            ? buildFace(...args)
            : [];
        }

        if (chunkId > 0) {
          const texId = chunkId;
          ret.vertices = [
            ...ret.vertices,
            //Top
            ...buildIfVisible(
              [wx, wy + 1, wz],
              [[wx, wy + 1, wz], [1, 0, 0], [0, 0, 1], textures[0]]
            ),
            //Bottom
            ...buildIfVisible(
              [wx, wy - 1, wz],
              [[wx + 1, wy, wz], [-1, 0, 0], [0, 0, 1], textures[1]]
            ),
            //Front
            ...buildIfVisible(
              [wx, wy, wz - 1],
              [[wx + 1, wy + 1, wz], [-1, 0, 0], [0, -1, 0], textures[2]]
            ),
            //Back
            ...buildIfVisible(
              [wx, wy, wz + 1],
              [[wx, wy + 1, wz + 1], [1, 0, 0], [0, -1, 0], textures[3]]
            ),
            //Left
            ...buildIfVisible(
              [wx - 1, wy, wz],
              [[wx, wy + 1, wz], [0, 0, 1], [0, -1, 0], textures[4]]
            ),
            //Right
            ...buildIfVisible(
              [wx + 1, wy, wz],
              [[wx + 1, wy + 1, wz + 1], [0, 0, -1], [0, -1, 0], textures[5]]
            ),
          ];
        }
      }
    }
  }

  return ret;
}
