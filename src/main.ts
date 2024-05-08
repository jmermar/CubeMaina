import { vec3 } from "wgpu-matrix";
import { Camera } from "./Camera";
import {
  captureKeyboard,
  captureMouse,
  getMouseDelta,
  isKeyDown,
  updateInput,
} from "./InputHandler";
import Renderer from "./rendering/Renderer";
import World from "./world/World";

async function run() {
  const renderer = await Renderer.createRenderer();
  const camera = new Camera();
  const world = new World();
  world.populateBlocks();
  world.buildChunks(renderer);

  camera.position = [16, 8, 16];
  captureKeyboard(document.body);
  captureMouse(document.body);

  function frame() {
    const delta = 1;
    if (isKeyDown("w")) {
      camera.position = vec3.mulScalar(
        vec3.add(camera.position, camera.forward),
        delta
      );
    }

    if (isKeyDown("s")) {
      camera.position = vec3.mulScalar(
        vec3.sub(camera.position, camera.forward),
        delta
      );
    }

    if (isKeyDown("a")) {
      camera.position = vec3.mulScalar(
        vec3.add(camera.position, vec3.cross([0, 1, 0], camera.forward)),
        delta
      );
    }

    if (isKeyDown("d")) {
      camera.position = vec3.mulScalar(
        vec3.sub(camera.position, vec3.cross([0, 1, 0], camera.forward)),
        delta
      );
    }

    camera.rotateX(-getMouseDelta()[1] / 10);
    camera.rotateY(-getMouseDelta()[0] / 10);

    renderer.render(camera);

    requestAnimationFrame(frame);
    updateInput();
  }

  frame();
}

run();
