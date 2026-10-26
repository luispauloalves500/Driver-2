import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { ShootingSystem } from '../systems/shooting';

export interface Enemy {
  mesh: THREE.Group;
  body: RAPIER.RigidBody;
  health: number;
  cooldown: number;
  fireRate: number;
  range: number;
  damage: number;
}

export function createEnemy(
  world: RAPIER.World,
  scene: THREE.Scene,
  pos: THREE.Vector3
): Enemy {
  const group = new THREE.Group();
  const bodyMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 0.9, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xaa2222 })
  );
  bodyMesh.position.y = 0.9;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xcc8866 })
  );
  head.position.y = 1.7;
  group.add(head);

  scene.add(group);

  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(pos.x, pos.y, pos.z)
      .setLinearDamping(5)
      .setAngularDamping(2)
      .lockRotations()
      .setCanSleep(false)
  );
  world.createCollider(
    RAPIER.ColliderDesc.capsule(0.45, 0.35).setDensity(40).setFriction(0.5),
    body
  );

  return {
    mesh: group,
    body,
    health: 40,
    cooldown: 0,
    fireRate: 1.2,
    range: 22,
    damage: 8,
  };
}

export function updateEnemy(
  enemy: Enemy,
  playerPos: THREE.Vector3,
  playerOnFoot: boolean,
  shooting: ShootingSystem,
  dt: number
) {
  if (enemy.health <= 0) {
    enemy.mesh.visible = false;
    enemy.body.setEnabled(false);
    return;
  }

  const pos = enemy.body.translation();
  const dist = Math.hypot(pos.x - playerPos.x, pos.z - playerPos.z);

  if (dist < enemy.range * 1.5) {
    const angle = Math.atan2(playerPos.x - pos.x, playerPos.z - pos.z);
    enemy.body.setRotation({ x: 0, y: Math.sin(angle / 2), z: 0, w: Math.cos(angle / 2) }, true);
  }

  if (dist > 8 && dist < 35) {
    const dirX = (playerPos.x - pos.x) / dist;
    const dirZ = (playerPos.z - pos.z) / dist;
    const vel = enemy.body.linvel();
    enemy.body.setLinvel({ x: dirX * 2.5, y: vel.y, z: dirZ * 2.5 }, true);
  } else {
    const vel = enemy.body.linvel();
    enemy.body.setLinvel({ x: vel.x * 0.9, y: vel.y, z: vel.z * 0.9 }, true);
  }

  enemy.cooldown = Math.max(0, enemy.cooldown - dt);
  if (playerOnFoot && dist < enemy.range && enemy.cooldown <= 0) {
    const origin = new THREE.Vector3(pos.x, pos.y + 1.5, pos.z);
    const dir = new THREE.Vector3(playerPos.x - pos.x, 0.3, playerPos.z - pos.z).normalize();
    shooting.tryShoot(origin, dir, performance.now());
    enemy.cooldown = enemy.fireRate;
  }

  const t = enemy.body.translation();
  enemy.mesh.position.set(t.x, t.y - 0.9, t.z);
  const r = enemy.body.rotation();
  enemy.mesh.quaternion.set(r.x, r.y, r.z, r.w);
}
