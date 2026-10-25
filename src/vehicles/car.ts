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
  const chassisMesh = new THREE.Mesh(
    new THREE.BoxGeometry(half.x * 2, half.y * 2, half.z * 2),
    new THREE.MeshStandardMaterial({ color: preset.color, roughness: 0.4, metalness: 0.5 })
  );
  chassisMesh.castShadow = true;
  group.add(chassisMesh);

  const wheels: THREE.Mesh[] = [];
  const wGeo = new THREE.CylinderGeometry(radius, radius, 0.2, 14);
  wGeo.rotateZ(Math.PI / 2);
  const wMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Mesh(wGeo, wMat);
    w.castShadow = true;
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
