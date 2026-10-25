import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import type { ActiveCar } from '../vehicles/car';

export interface TrafficAgent {
  car: ActiveCar;
  waypoints: THREE.Vector3[];
  currentWp: number;
  desiredSpeed: number;
  aggression: number;
}

export function createTrafficAgent(
  car: ActiveCar,
  waypoints: THREE.Vector3[],
  desiredSpeed = 12,
  aggression = 0.7
): TrafficAgent {
  return {
    car,
    waypoints,
    currentWp: 0,
    desiredSpeed,
    aggression,
  };
}

export function updateTraffic(agent: TrafficAgent, dt: number) {
  const { car, waypoints } = agent;
  if (waypoints.length === 0) return;

  const pos = car.body.translation();
  const target = waypoints[agent.currentWp];
  const toTarget = new THREE.Vector3(target.x - pos.x, 0, target.z - pos.z);
  const dist = toTarget.length();

  // Next waypoint
  if (dist < 4.5) {
    agent.currentWp = (agent.currentWp + 1) % waypoints.length;
  }

  // Desired direction
  toTarget.normalize();

  // Current forward
  const rot = car.body.rotation();
  const q = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);

  // Steering angle (simplified)
  const cross = forward.x * toTarget.z - forward.z * toTarget.x;
  const dot = forward.dot(toTarget);
  let steer = Math.atan2(cross, dot) * agent.aggression;
  steer = THREE.MathUtils.clamp(steer, -0.45, 0.45);

  // Speed control
  const speed = Math.abs(car.vehicle.currentVehicleSpeed());
  let engine = 0;
  if (speed < agent.desiredSpeed * 0.9) {
    engine = car.preset.engine * 0.55;
  } else if (speed > agent.desiredSpeed * 1.15) {
    engine = -car.preset.reverse * 0.3;
  }

  // Apply controls
  const v = car.vehicle;
  v.setWheelSteering(0, steer);
  v.setWheelSteering(1, steer);
  v.setWheelEngineForce(0, engine);
  v.setWheelEngineForce(1, engine);

  // Light braking when turning hard
  const brake = Math.abs(steer) > 0.3 ? 15 : 0;
  for (let i = 0; i < 4; i++) v.setWheelBrake(i, brake);

  // Keep grip normal
  v.setWheelFrictionSlip(2, car.preset.grip);
  v.setWheelFrictionSlip(3, car.preset.grip);
}

// Simple loop path around the track
export const TRACK_WAYPOINTS = [
  new THREE.Vector3(0, 0, -20),
  new THREE.Vector3(0, 0, 10),
  new THREE.Vector3(0, 0, 35),
  new THREE.Vector3(8, 0, 55),
  new THREE.Vector3(18, 0, 65),
  new THREE.Vector3(25, 0, 50),
  new THREE.Vector3(15, 0, 30),
  new THREE.Vector3(5, 0, 10),
  new THREE.Vector3(-5, 0, -10),
  new THREE.Vector3(0, 0, -25),
];
