import Renderer from "../Renderer";
import chunkShader from "../../res/shaders/chunkShader.wgsl?raw";
import {
  ChunkData,
  buildChunkVertexArray,
  testChunkData,
} from "../ChunkBuilder";

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

  chunkBuffer: GPUBuffer;

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

    this.chunkBuffer = this.createChunk(testChunkData());
  }

  renderPass(encoder: GPUCommandEncoder) {
    const { context, device, globalData, depthTexture } = this.renderer;

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

    const pass = encoder.beginRenderPass(renderPassDescriptor);

    pass.setPipeline(this.pipeline);

    const bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: globalData } }],
    });

    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, this.chunkBuffer);
    pass.draw(this.chunkBuffer.size / (6 * 4)); // call our vertex shader 3 times
    pass.end();
  }

  private createChunk(data: ChunkData): GPUBuffer {
    const vertexData = buildChunkVertexArray(data);
    const vertexBuffer = this.renderer.device.createBuffer({
      label: "Chunk buffer",
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.renderer.device.queue.writeBuffer(vertexBuffer, 0, vertexData);

    return vertexBuffer;
  }
}
