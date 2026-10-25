import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { PRESETS } from './vehicles/presets';
import { createCar, syncCar, type ActiveCar } from './vehicles/car';
import { buildTrack } from './track/track';
import { keys, setupInput } from './systems/input';

await RAPIER.init();

const FIXED_DT = 1 / 60;
let accumulator = 0;

// ---------- Three.js ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6ea8ff);
scene.fog = new THREE.Fog(0x6ea8ff, 80, 280);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(40, 50, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 5;
sun.shadow.camera.far = 180;
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
scene.add(sun);

// ---------- Rapier ----------
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

world.createCollider(
  RAPIER.ColliderDesc.cuboid(150, 0.5, 150)
    .setTranslation(0, -0.5, 0)
    .setFriction(0.85)
);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

buildTrack(world, scene);

// ---------- Cars ----------
const cars: ActiveCar[] = [
  createCar(world, scene, PRESETS[0], new THREE.Vector3(0, 2, 0)),
  createCar(world, scene, PRESETS[1], new THREE.Vector3(4, 2, -6)),
  createCar(world, scene, PRESETS[2], new THREE.Vector3(-4, 2, -6)),
  createCar(world, scene, PRESETS[3], new THREE.Vector3(8, 2, -12)),
];

let activeIndex = 0;
const getActive = () => cars[activeIndex];

setupInput(() => {
  activeIndex = (activeIndex + 1) % cars.length;
});

// ---------- HUD ----------
const hud = document.createElement('div');
hud.style.cssText = `position:absolute;top:12px;left:12px;color:#fff;font:13px/1.45 monospace;background:rgba(0,0,0,0.6);padding:10px 14px;border-radius:6px;pointer-events:none;white-space:pre;z-index:10;`;
document.body.appendChild(hud);

// ---------- Camera ----------
const tmp = new THREE.Vector3();
const chase = new THREE.Vector3(0, 3.4, 8);
const look = new THREE.Vector3(0, 0.6, -5);

function updateCamera() {
  const car = getActive();
  car.mesh.updateMatrixWorld();
  tmp.copy(chase).applyMatrix4(car.mesh.matrixWorld);
  camera.position.lerp(tmp, 0.1);
  const target = new THREE.Vector3().copy(look).applyMatrix4(car.mesh.matrixWorld);
  camera.lookAt(target);
}

// ---------- Physics ----------
function step() {
  const car = getActive();
  const p = car.preset;
  const v = car.vehicle;

  const fwd = keys['KeyW'] || keys['ArrowUp'];
  const back = keys['KeyS'] || keys['ArrowDown'];
  const left = keys['KeyA'] || keys['ArrowLeft'];
  const right = keys['KeyD'] || keys['ArrowRight'];
  const hb = keys['Space'];

  const engine = fwd ? p.engine : back ? -p.reverse : 0;
  const steerTarget = left ? p.maxSteer : right ? -p.maxSteer : 0;
  const steer = THREE.MathUtils.lerp(v.wheelSteering(0) ?? 0, steerTarget, 0.16);

  v.setWheelEngineForce(0, engine);
  v.setWheelEngineForce(1, engine);
  v.setWheelSteering(0, steer);
  v.setWheelSteering(1, steer);

  const brake = (back && !fwd) ? 50 : 0;
  for (let i = 0; i < 4; i++) v.setWheelBrake(i, brake);

  const rearGrip = hb ? p.rearGripHandbrake : p.grip;
  v.setWheelFrictionSlip(2, rearGrip);
  v.setWheelFrictionSlip(3, rearGrip);

  cars.forEach(c => {
    c.vehicle.updateVehicle(FIXED_DT, RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC);
  });
  world.step();
}

// ---------- Loop ----------
let last = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  accumulator += dt;
  while (accumulator >= FIXED_DT) {
    step();
    accumulator -= FIXED_DT;
  }

  cars.forEach(syncCar);
  updateCamera();
  renderer.render(scene, camera);

  const car = getActive();
  const speed = Math.abs(car.vehicle.currentVehicleSpeed()) * 3.6;
  const contacts = [0, 1, 2, 3].map(i => car.vehicle.wheelIsInContact(i) ? '●' : '○').join(' ');
  hud.textContent =
    `UNDERCOVER WHEELMAN\n` +
    `Carro: ${car.preset.name}  [C para trocar]\n` +
    `Velocidade: ${speed.toFixed(0)} km/h\n` +
    `Contato: ${contacts}\n` +
    `Grip traseiro: ${(car.vehicle.wheelFrictionSlip(2) ?? 0).toFixed(1)}\n` +
    `FPS: ${Math.round(1 / Math.max(dt, 0.001))}\n\n` +
    `WASD = dirigir | Espaço = handbrake | C = trocar carro`;
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
