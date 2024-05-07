import { Vec3, quat, vec3 } from "wgpu-matrix";

export class Camera {
  position: Vec3 = [0, 0, 0];
  forward: Vec3 = [0, 0, 1];

  rotateY(degrees: number) {
    const radians = (degrees * Math.PI) / 180;

    const rotation = quat.rotateY(quat.identity(), radians);

    this.forward = vec3.normalize(vec3.transformQuat(this.forward, rotation));
  }

  rotateX(degrees: number) {
    const radians = (degrees * Math.PI) / 180;

    const vector = vec3.mulScalar(
      vec3.cross(this.forward, vec3.create(0, 1, 0)),
      Math.sin(radians)
    );

    const rotation = quat.create(...vector, Math.cos(radians));

    this.forward = vec3.normalize(vec3.transformQuat(this.forward, rotation));
  }
}
