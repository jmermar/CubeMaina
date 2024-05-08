export async function loadImage(src: string) {
  const res = await fetch(src);
  const blob = await res.blob();

  return createImageBitmap(blob, { colorSpaceConversion: "none" });
}
