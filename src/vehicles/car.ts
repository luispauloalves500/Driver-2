import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import type { CarPreset } from './presets';

export interface ActiveCar {
  preset: CarPreset;
  body: RAPIER.RigidBody;
  vehicle: RAPIER.DynamicRayCastVehicleController;
  mesh: THREE.Group;
  wheels: THREE.Mesh[];
}

export function createCar(
  world: RAPIER.World,
  scene: THREE.Scene,
  preset: CarPreset,
  spawn: THREE.Vector3
): ActiveCar {
  const half = preset.chassis;
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(spawn.x, spawn.y, spawn.z)
      .setCanSleep(false)
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(half.x, half.y, half.z)
      .setDensity(preset.massDensity)
      .setFriction(0.35)
      .setRestitution(0.05),
    body
  );

  const vehicle = world.createVehicleController(body);
  const radius = 0.32;
  const rest = 0.36;
  const positions = [
    { x: -half.x * 0.85, y: -half.y * 0.6, z: -half.z * 0.75 },
    { x:  half.x * 0.85, y: -half.y * 0.6, z: -half.z * 0.75 },
    { x: -half.x * 0.85, y: -half.y * 0.6, z:  half.z * 0.75 },
    { x:  half.x * 0.85, y: -half.y * 0.6, z:  half.z * 0.75 },
  ];

  const suspDir = { x: 0, y: -1, z: 0 };
  const axle = { x: -1, y: 0, z: 0 };
  positions.forEach(p => vehicle.addWheel(p, suspDir, axle, rest, radius));

  for (let i = 0; i < 4; i++) {
    vehicle.setWheelSuspensionStiffness(i, preset.stiffness);
    vehicle.setWheelSuspensionCompression(i, preset.compression);
    vehicle.setWheelSuspensionRelaxation(i, preset.relaxation);
    vehicle.setWheelMaxSuspensionTravel(i, 0.26);
    vehicle.setWheelMaxSuspensionForce(i, 8500);
    vehicle.setWheelFrictionSlip(i, preset.grip);
    vehicle.setWheelSideFrictionStiffness(i, 1.0);
  }

  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: preset.color, roughness: 0.35, metalness: 0.55 });
  const chassisMesh = new THREE.Mesh(
    new THREE.BoxGeometry(half.x * 2, half.y * 1.4, half.z * 2),
    bodyMat
  );
  chassisMesh.position.y = -half.y * 0.15;
  chassisMesh.castShadow = true;
  group.add(chassisMesh);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(half.x * 1.6, half.y * 0.9, half.z * 1.1),
    bodyMat
  );
  cabin.position.set(0, half.y * 0.55, -half.z * 0.05);
  cabin.castShadow = true;
  group.add(cabin);

  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(half.x * 1.7, half.y * 0.25, half.z * 0.55),
    bodyMat
  );
  hood.position.set(0, -half.y * 0.05, -half.z * 0.65);
  group.add(hood);

  const glass = new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.45 });
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(half.x * 1.4, half.y * 0.7), glass);
  windshield.position.set(0, half.y * 0.55, -half.z * 0.58);
  windshield.rotation.x = -0.35;
  group.add(windshield);

  const rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(half.x * 1.3, half.y * 0.55), glass);
  rearWindow.position.set(0, half.y * 0.5, half.z * 0.48);
  rearWindow.rotation.x = 0.25;
  group.add(rearWindow);

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffaa, emissiveIntensity: 0.6 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff0000, emissiveIntensity: 0.4 });
  for (const side of [-1, 1]) {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), lightMat);
    head.position.set(side * half.x * 0.7, -half.y * 0.1, -half.z * 0.98);
    group.add(head);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.06), tailMat);
    tail.position.set(side * half.x * 0.65, -half.y * 0.05, half.z * 0.98);
    group.add(tail);
  }

  const wheels: THREE.Mesh[] = [];
  const wGeo = new THREE.CylinderGeometry(radius, radius, 0.22, 16);
  wGeo.rotateZ(Math.PI / 2);
  const wMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 });
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Mesh(wGeo, wMat);
    w.castShadow = true;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, 0.24, 12), rimMat);
    rim.rotateZ(Math.PI / 2);
    w.add(rim);
    group.add(w);
    wheels.push(w);
  }

  scene.add(group);
  return { preset, body, vehicle, mesh: group, wheels };
}

export function syncCar(car: ActiveCar) {
  const t = car.body.translation();
  const r = car.body.rotation();
  car.mesh.position.set(t.x, t.y, t.z);
  car.mesh.quaternion.set(r.x, r.y, r.z, r.w);

  for (let i = 0; i < 4; i++) {
    const conn = car.vehicle.wheelChassisConnectionPointCs(i);
    const susp = car.vehicle.wheelSuspensionLength(i) ?? 0;
    const steer = car.vehicle.wheelSteering(i) ?? 0;
    const rot = car.vehicle.wheelRotation(i) ?? 0;
    const w = car.wheels[i];
    w.position.set(conn?.x ?? 0, (conn?.y ?? 0) - susp, conn?.z ?? 0);
    const qs = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), steer);
    const qr = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(-1, 0, 0), rot);
    w.quaternion.copy(qs).multiply(qr);
  }
}
