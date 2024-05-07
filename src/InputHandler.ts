const keyMaps: { [key: string]: boolean } = {};

export function captureKeyboard(element: HTMLElement) {
  element.onkeydown = (key) => {
    keyMaps[key.key] = true;
  };

  element.onkeyup = (key) => {
    keyMaps[key.key] = false;
  };
}

export function isKeyDown(key: string) {
  return keyMaps[key];
}
