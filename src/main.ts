import { vec3 } from "wgpu-matrix";
import { Camera } from "./Camera";
import { captureKeyboard, isKeyDown } from "./InputHandler";
import Renderer from "./rendering/Renderer";

async function run() {
  const renderer = await Renderer.createRenderer();
  const camera = new Camera();

  camera.position = [8, 2, -2];
  captureKeyboard(document.body);

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

    if (isKeyDown("q")) {
      camera.rotateY(1);
    }

    if (isKeyDown("e")) {
      camera.rotateY(-1);
    }

    if (isKeyDown("z")) {
      camera.rotateX(-1);
    }

    if (isKeyDown("x")) {
      camera.rotateX(1);
    }

    renderer.render(camera);

    requestAnimationFrame(frame);
  }

  frame();
}

run();
