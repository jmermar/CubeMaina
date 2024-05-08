import { mat4, vec3 } from "wgpu-matrix";

import blocks from "../res/textures/blocks.png";
import ChunkPass from "./passes/ChunkPass";
import { Camera } from "../Camera";
import { loadImage } from "../utils/ImageLoader";
import Chunk from "../world/Chunk";
import { buildChunkMeshData } from "../utils/ChunkBuilder";
import World from "../world/World";

export type Texture = {
  texture: GPUTexture;
  sampler: GPUSampler;
};

export default class Renderer {
  adapter: GPUAdapter;
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  canvasFormat: GPUTextureFormat;

  globalDataSize: number;
  globalData: GPUBuffer;

  chunkPass: ChunkPass;

  depthTexture: GPUTexture;

  textures: { [name: string]: Texture } = {};

  private resize(newW: number, newH: number, canvas: HTMLCanvasElement) {
    const width = newW;
    const height = newH;
    canvas.width = Math.max(
      1,
      Math.min(width, this.device.limits.maxTextureDimension2D)
    );
    canvas.height = Math.max(
      1,
      Math.min(height, this.device.limits.maxTextureDimension2D)
    );

    if (this.depthTexture) {
      this.depthTexture.destroy();
      this.depthTexture = this.device.createTexture({
        size: { width: canvas.width, height: canvas.height },
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
    }
  }

  private constructor(adapter: GPUAdapter, device: GPUDevice) {
    this.adapter = adapter;
    this.device = device;

    const canvas = document.querySelector("canvas");
    if (!canvas) {
      throw new Error("Cannot find a canvas");
    }
    this.canvas = canvas;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const canvas = entry.target as HTMLCanvasElement;
        this.resize(
          entry.contentBoxSize[0].inlineSize,
          entry.contentBoxSize[0].blockSize,
          canvas
        );
      }
    });
    observer.observe(canvas);

    const context = this.canvas.getContext("webgpu");
    if (!context) {
      throw new Error("Cannot create WebGPU Context");
    }

    this.context = context;

    this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    context?.configure({
      device,
      format: this.canvasFormat,
    });

    //Init globalData
    this.globalDataSize =
      4 * 4 * 4 + // vp matrix
      4 * 4 * 4 + // v matrix
      4 * 4 * 4; // p matrix

    this.globalData = device.createBuffer({
      size: this.globalDataSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.chunkPass = new ChunkPass(this);

    this.depthTexture = this.device.createTexture({
      size: { width: canvas.width, height: canvas.height },
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  setGlobalData(camera: Camera) {
    const { position, forward } = camera;
    const projMatrix = mat4.perspective(
      (90 * Math.PI) / 180,
      this.canvas.width / this.canvas.height,
      0.1,
      10000
    );
    const viewMatrix = mat4.lookAt(
      position,
      vec3.add(position, forward),
      [0, 1, 0]
    );

    const data = new Float32Array(this.globalDataSize / 4);

    data.set(mat4.mul(projMatrix, viewMatrix), 0);
    data.set(viewMatrix, 4 * 4);
    data.set(projMatrix, 4 * 4 * 2);

    this.device.queue.writeBuffer(this.globalData, 0, data);
  }

  render(camera: Camera) {
    this.setGlobalData(camera);

    const encoder = this.device.createCommandEncoder({ label: "our encoder" });

    this.chunkPass.renderPass(encoder);

    const commandBuffer = encoder.finish();
    this.device.queue.submit([commandBuffer]);
  }

  static async createRenderer(): Promise<Renderer> {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();

    if (!adapter) {
      throw new Error("Cannot get adapter");
    }

    if (!device) {
      throw new Error("Cannot init webgpu device");
    }

    const renderer = new Renderer(adapter, device);
    await renderer.loadTextures();

    return renderer;
  }

  private async loadTextures() {
    this.textures["atlas"] = await this.generateTextureAtlas();
  }

  private async generateTextureAtlas(): Promise<Texture> {
    const bitmap = await loadImage(blocks);

    const numTexs = Math.floor(bitmap.height / 16);

    const texture = this.device.createTexture({
      label: "Texture atlas",
      format: "rgba8unorm",
      size: [16, 16, numTexs],
      dimension: "2d",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    for (let i = 0; i < numTexs; i++) {
      this.device.queue.copyExternalImageToTexture(
        { source: bitmap, flipY: true, origin: { x: 0, y: i * 16 } },
        { texture, origin: [0, 0, i] },
        { width: bitmap.width, height: 16 }
      );
    }

    return { texture, sampler: this.device.createSampler() };
  }

  public addChunk(chunk: Chunk, world: World) {
    const data = buildChunkMeshData(chunk, world);
    if (data.vertices.length == 0) return;
    const mesh = this.chunkPass.generateChunk(data);
    this.chunkPass.chunksToDraw.push({ mesh });
  }
}
