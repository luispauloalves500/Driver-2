import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export function addStaticBox(
  world: RAPIER.World,
  scene: THREE.Scene,
  x: number, y: number, z: number,
  sx: number, sy: number, sz: number,
  color: number
) {
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  world.createCollider(RAPIER.ColliderDesc.cuboid(sx / 2, sy / 2, sz / 2), body);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

export function addRamp(
  world: RAPIER.World,
  scene: THREE.Scene,
  x: number, z: number,
  width: number, length: number, height: number,
  color = 0x888888
) {
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const h = height * t;
    const posZ = z - length / 2 + (i + 0.5) * (length / steps);
    addStaticBox(world, scene, x, h / 2, posZ, width, h + 0.1, length / steps + 0.2, color);
  }
}

export function buildTrack(world: RAPIER.World, scene: THREE.Scene) {
  // Barreiras laterais
  for (let z = -40; z <= 80; z += 8) {
    addStaticBox(world, scene, -14, 0.6, z, 1.2, 1.2, 6, 0xff4444);
    addStaticBox(world, scene, 14, 0.6, z, 1.2, 1.2, 6, 0xff4444);
  }

  // Curva larga
  for (let a = 0; a < Math.PI; a += 0.15) {
    const r = 22;
    const x = Math.cos(a) * r + 20;
    const z = Math.sin(a) * r + 60;
    addStaticBox(world, scene, x, 0.6, z, 1.5, 1.2, 3, 0xff6666);
  }

  // Rampas
  addRamp(world, scene, 0, 20, 10, 18, 2.2, 0xaaaaaa);
  addRamp(world, scene, -6, 45, 8, 14, 1.6, 0x999999);

  // Obstáculos
  addStaticBox(world, scene, 4, 0.7, 8, 1.5, 1.4, 1.5, 0xffaa00);
  addStaticBox(world, scene, -5, 0.7, 32, 1.5, 1.4, 1.5, 0xffaa00);
  addStaticBox(world, scene, 7, 1.0, 55, 2, 2, 2, 0x666666);

  // Plataforma
  addStaticBox(world, scene, 0, 1.5, 70, 12, 0.4, 10, 0x555555);
}
