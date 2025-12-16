import {
  BufferGeometry,
  Float32BufferAttribute,
  OrthographicCamera,
} from "three";

/**
 * Fullscreen triangle covering NDC [-1,1] range
 *
 * Single triangle extended beyond bounds to cover entire screen
 */
export function createQuadGeometry() {
  const quadGeo = new BufferGeometry();
  const vertices = new Float32Array([
    -1,
    -1,
    0, // bottom left
    3,
    -1,
    0, // extended right, bottom
    -1,
    3,
    0, // extended left, top
  ]);
  const uvs = new Float32Array([
    0,
    0, // bottom left
    2,
    0, // extended right, bottom
    0,
    2, // extended left, top
  ]);
  quadGeo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  quadGeo.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  return quadGeo;
}

export const quadGeometry = createQuadGeometry();

export function createQuadCamera() {
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 2);
  camera.position.set(0, 0, 1);
  return camera;
}

export const quadCamera = createQuadCamera();
