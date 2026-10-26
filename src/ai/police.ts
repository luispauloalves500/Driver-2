import * as THREE from 'three';
import type { ActiveCar } from '../vehicles/car';

export interface PoliceAgent {
  car: ActiveCar;
  state: 'patrol' | 'chase';
  chaseTarget: THREE.Vector3 | null;
  aggression: number;
}

export function createPoliceAgent(car: ActiveCar, aggression = 0.85): PoliceAgent {
  return {
    car,
    state: 'patrol',
    chaseTarget: null,
    aggression,
  };
}

export function updatePolice(
  agent: PoliceAgent,
  playerPos: THREE.Vector3,
  playerSpeed: number,
  wantedLevel: number,
  dt: number
) {
  const { car } = agent;
  const pos = car.body.translation();
  const dist = Math.hypot(pos.x - playerPos.x, pos.z - playerPos.z);

  if (wantedLevel > 0 && dist < 40) {
    agent.state = 'chase';
    agent.chaseTarget = playerPos.clone();
  } else if (dist > 70 || wantedLevel === 0) {
    agent.state = 'patrol';
    agent.chaseTarget = null;
  }

  const v = car.vehicle;
  let steer = 0;
  let engine = 0;

  if (agent.state === 'chase' && agent.chaseTarget) {
    const to = new THREE.Vector3(agent.chaseTarget.x - pos.x, 0, agent.chaseTarget.z - pos.z);
    to.normalize();

    const rot = car.body.rotation();
    const q = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);

    const cross = forward.x * to.z - forward.z * to.x;
    const dot = forward.dot(to);
    steer = Math.atan2(cross, dot) * agent.aggression;
    steer = THREE.MathUtils.clamp(steer, -0.5, 0.5);

    const speed = Math.abs(v.currentVehicleSpeed());
    const desired = 18 + playerSpeed * 0.4;
    if (speed < desired * 0.85) engine = car.preset.engine * 0.7;
    else if (speed > desired * 1.2) engine = -car.preset.reverse * 0.4;
  } else {
    engine = car.preset.engine * 0.25;
    steer = Math.sin(performance.now() * 0.001) * 0.15;
  }

  v.setWheelSteering(0, steer);
  v.setWheelSteering(1, steer);
  v.setWheelEngineForce(0, engine);
  v.setWheelEngineForce(1, engine);

  const brake = Math.abs(steer) > 0.35 ? 20 : 0;
  for (let i = 0; i < 4; i++) v.setWheelBrake(i, brake);

  v.setWheelFrictionSlip(2, car.preset.grip);
  v.setWheelFrictionSlip(3, car.preset.grip);
}
