import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import type { ActiveCar } from '../vehicles/car';

export interface Bullet {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

export class ShootingSystem {
  bullets: Bullet[] = [];
  cooldown = 0;
  fireRate = 0.18;

  constructor(private scene: THREE.Scene) {}

  tryShoot(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    now: number
  ): boolean {
    if (this.cooldown > 0) return false;
    this.cooldown = this.fireRate;

    const geo = new THREE.SphereGeometry(0.08, 6, 6);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffaa00 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    this.scene.add(mesh);

    this.bullets.push({
      mesh,
      velocity: direction.clone().normalize().multiplyScalar(45),
      life: 1.8,
    });
    return true;
  }

  update(
    dt: number,
    world: RAPIER.World,
    cars: ActiveCar[],
    playerPos: THREE.Vector3 | null,
    onCarHit: (car: ActiveCar) => void,
    onPlayerHit: (damage: number) => void
  ) {
    this.cooldown = Math.max(0, this.cooldown - dt);

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.life -= dt;
      b.mesh.position.addScaledVector(b.velocity, dt);

      let hit = false;

      if (playerPos) {
        const dx = b.mesh.position.x - playerPos.x;
        const dz = b.mesh.position.z - playerPos.z;
        const dy = b.mesh.position.y - playerPos.y;
        if (Math.hypot(dx, dz) < 0.7 && Math.abs(dy) < 1.5) {
          onPlayerHit(12);
          hit = true;
        }
      }

      if (!hit) {
        for (const car of cars) {
          const ct = car.body.translation();
          const dx = b.mesh.position.x - ct.x;
          const dz = b.mesh.position.z - ct.z;
          const dy = b.mesh.position.y - ct.y;
          if (Math.hypot(dx, dz) < 1.4 && Math.abs(dy) < 1.2) {
            onCarHit(car);
            hit = true;
            break;
          }
        }
      }

      if (b.life <= 0 || hit || b.mesh.position.y < 0) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }
  }
}
