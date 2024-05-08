import Renderer from "../Renderer";
import chunkShader from "../../res/shaders/chunkShader.wgsl?raw";

import { Vec2, Vec3, mat4, vec3 } from "wgpu-matrix";
import { CHUNK_SIZE } from "../../world/Chunk";

export type ChunkMeshData = {
  vertices: {
    position: Vec3;
    uv: Vec2;
    texIndex: number;
  }[];
};

export type ChunkMesh = {
  buffer: GPUBuffer;
  numVertex: number;
};

export default class ChunkPass {
  renderer: Renderer;

  shaderModule: GPUShaderModule;
  pipeline: GPURenderPipeline;

  bufferLayout: GPUVertexBufferLayout = {
    arrayStride: 4 * 3 + 2 * 4 + 4,
    attributes: [
      { shaderLocation: 0, offset: 0, format: "float32x3" },
      { shaderLocation: 1, offset: 4 * 3, format: "float32x2" },
      { shaderLocation: 2, offset: 4 * 3 + 2 * 4, format: "float32" },
    ],
  };

  chunksToDraw: { mesh: ChunkMesh }[] = [];

  constructor(renderer: Renderer) {
    this.renderer = renderer;

    const { device, canvasFormat } = renderer;
    this.shaderModule = device.createShaderModule({
      label: "Chunk Shader",
      code: chunkShader,
    });

    this.pipeline = device.createRenderPipeline({
      label: "Chunk Pass pipeline",
      layout: "auto",
      vertex: {
        entryPoint: "vs",
        module: this.shaderModule,
        buffers: [this.bufferLayout],
      },
      fragment: {
        entryPoint: "fs",
        module: this.shaderModule,
        targets: [{ format: canvasFormat }],
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
      primitive: {
        cullMode: "back",
        frontFace: "ccw",
      },
    });
  }

  renderPass(encoder: GPUCommandEncoder) {
    const { context, depthTexture, device, globalData, textures } =
      this.renderer;
    const { atlas } = textures;

    const renderPassDescriptor: GPURenderPassDescriptor = {
      label: "our basic canvas renderPass",
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: [0, 1, 0, 1],
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    };

    const bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: globalData } },
        { binding: 1, resource: atlas.sampler },
        {
          binding: 2,
          resource: atlas.texture.createView({ dimension: "2d-array" }),
        },
      ],
    });

    const pass = encoder.beginRenderPass(renderPassDescriptor);

    pass.setPipeline(this.pipeline);

    pass.setBindGroup(0, bindGroup);

    this.chunksToDraw.forEach(({ mesh }) => {
      pass.setVertexBuffer(0, mesh.buffer);
      pass.draw(mesh.numVertex);
    });
    pass.end();
  }

  public generateChunk(chunk: ChunkMeshData): ChunkMesh {
    const stride = 3 + 2 + 1;

    const size = chunk.vertices.length * stride;
    const bufferData = new Float32Array(size);
    for (let i = 0; i < chunk.vertices.length; i++) {
      const { position, uv, texIndex } = chunk.vertices[i];
      bufferData.set(position, i * stride);
      bufferData.set(uv, i * stride + 3);
      bufferData.set([texIndex], i * stride + 5);
    }

    const buffer = this.renderer.device.createBuffer({
      label: "Chunk buffer",
      size: bufferData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.renderer.device.queue.writeBuffer(buffer, 0, bufferData);

    return { buffer, numVertex: chunk.vertices.length };
  }
}
