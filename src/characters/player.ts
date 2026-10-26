import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export class Player {
  mesh: THREE.Group;
  body: RAPIER.RigidBody;
  onFoot = false;
  speed = 6;
  health = 100;
  maxHealth = 100;
  isDead = false;

  constructor(world: RAPIER.World, scene: THREE.Scene, spawn: THREE.Vector3) {
    const group = new THREE.Group();
    const bodyMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 0.9, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x2244aa })
    );
    bodyMesh.position.y = 0.9;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffcc99 })
    );
    head.position.y = 1.7;
    group.add(head);

    scene.add(group);
    this.mesh = group;

    this.body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(spawn.x, spawn.y, spawn.z)
        .setLinearDamping(4)
        .setAngularDamping(2)
        .lockRotations()
        .setCanSleep(false)
    );
    world.createCollider(
      RAPIER.ColliderDesc.capsule(0.45, 0.35).setDensity(50).setFriction(0.6),
      this.body
    );
  }

  setOnFoot(value: boolean) {
    this.onFoot = value;
    this.mesh.visible = value;
    if (value) {
      this.body.setEnabled(true);
    } else {
      this.body.setEnabled(false);
      this.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  }

  sync() {
    const t = this.body.translation();
    this.mesh.position.set(t.x, t.y - 0.9, t.z);
    const r = this.body.rotation();
    this.mesh.quaternion.set(r.x, r.y, r.z, r.w);
  }

  move(dirX: number, dirZ: number) {
    if (!this.onFoot || this.isDead) return;
    const vel = this.body.linvel();
    this.body.setLinvel(
      { x: dirX * this.speed, y: vel.y, z: dirZ * this.speed },
      true
    );
    if (dirX !== 0 || dirZ !== 0) {
      const angle = Math.atan2(dirX, dirZ);
      this.body.setRotation({ x: 0, y: Math.sin(angle / 2), z: 0, w: Math.cos(angle / 2) }, true);
    }
  }

  takeDamage(amount: number) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isDead = true;
      this.health = 0;
    }
  }

  heal(amount: number) {
    if (this.isDead) return;
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  respawn(pos: THREE.Vector3) {
    this.health = this.maxHealth;
    this.isDead = false;
    this.body.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true);
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  }
}
