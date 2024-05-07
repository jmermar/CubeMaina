import { Vec2, vec2 } from "wgpu-matrix";

const keyMaps: { [key: string]: boolean } = {};
let mouseDelta = vec2.create(0, 0);
export function captureKeyboard(element: HTMLElement) {
  element.onkeydown = (key) => {
    keyMaps[key.key] = true;

    if (key.key === "Escape") {
      document.exitPointerLock();
    }
  };

  element.onkeyup = (key) => {
    keyMaps[key.key] = false;
  };
}

export function captureMouse(element: HTMLElement) {
  element.onclick = () => {
    element.requestPointerLock();
    element.onmousemove = (mouseEvent) => {
      mouseDelta = [mouseEvent.movementX, mouseEvent.movementY];
    };
  };
}

export function isKeyDown(key: string) {
  return keyMaps[key];
}

export function getMouseDelta(): Vec2 {
  return [...mouseDelta];
}

export function updateInput() {
  mouseDelta = [0, 0];
}
