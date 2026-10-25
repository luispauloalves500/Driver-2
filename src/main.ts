import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { PRESETS } from './vehicles/presets';
import { createCar, syncCar, type ActiveCar } from './vehicles/car';
import { buildTrack } from './track/track';
import { keys, setupInput } from './systems/input';
import { readGamepad } from './systems/gamepad';
import { Player } from './characters/player';
import { checkMissions, getCurrentMission, MISSIONS } from './missions/missions';
import { createTrafficAgent, updateTraffic, TRACK_WAYPOINTS, type TrafficAgent } from './ai/traffic';

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
  createCar(world, scene, PRESETS[1], new THREE.Vector3(6, 2, -8)),
  createCar(world, scene, PRESETS[2], new THREE.Vector3(-7, 2, -5)),
  createCar(world, scene, PRESETS[3], new THREE.Vector3(10, 2, -15)),
  createCar(world, scene, PRESETS[0], new THREE.Vector3(-12, 2, 20)),
  createCar(world, scene, PRESETS[1], new THREE.Vector3(15, 2, 30)),
];

let activeIndex = 0;
let driving = true;
let hasStolen = false;

const trafficAgents: TrafficAgent[] = [];

const player = new Player(world, scene, new THREE.Vector3(2, 2, 2));
player.setOnFoot(false);

for (let i = 2; i < cars.length; i++) {
  const speed = 9 + Math.random() * 6;
  const agent = createTrafficAgent(cars[i], TRACK_WAYPOINTS, speed, 0.55 + Math.random() * 0.3);
  agent.currentWp = Math.floor(Math.random() * TRACK_WAYPOINTS.length);
  trafficAgents.push(agent);
}

setupInput((action) => {
  if (action === 'exit' && driving) exitCar();
  if (action === 'enter' && !driving) enterNearestCar();
});

function exitCar() {
  if (!driving) return;
  const car = cars[activeIndex];
  const t = car.body.translation();
  const r = car.body.rotation();
  const side = new THREE.Vector3(1.8, 0, 0).applyQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
  player.body.setTranslation({ x: t.x + side.x, y: t.y + 0.5, z: t.z + side.z }, true);
  player.setOnFoot(true);
  driving = false;
}

function enterNearestCar() {
  if (driving) return;
  const pt = player.body.translation();
  let best: ActiveCar | null = null;
  let bestDist = 3.2;
  for (const car of cars) {
    const ct = car.body.translation();
    const d = Math.hypot(ct.x - pt.x, ct.z - pt.z);
    if (d < bestDist) { bestDist = d; best = car; }
  }
  if (best) {
    activeIndex = cars.indexOf(best);
    player.setOnFoot(false);
    driving = true;
    if (activeIndex !== 0) hasStolen = true;
  }
}

const hud = document.createElement('div');
hud.style.cssText = `position:absolute;top:12px;left:12px;color:#fff;font:13px/1.45 monospace;background:rgba(0,0,0,0.6);padding:10px 14px;border-radius:6px;pointer-events:none;white-space:pre;z-index:10;`;
document.body.appendChild(hud);

const missionHud = document.createElement('div');
missionHud.style.cssText = `position:absolute;top:12px;right:12px;color:#fff;font:14px/1.4 monospace;background:rgba(0,0,0,0.55);padding:10px 14px;border-radius:6px;pointer-events:none;max-width:280px;`;
document.body.appendChild(missionHud);

const tmp = new THREE.Vector3();
const chaseCar = new THREE.Vector3(0, 3.4, 8);
const chaseFoot = new THREE.Vector3(0, 2.2, 5);
const look = new THREE.Vector3(0, 0.6, -4);

function updateCamera() {
  const targetObj = driving ? cars[activeIndex].mesh : player.mesh;
  targetObj.updateMatrixWorld();
  const offset = driving ? chaseCar : chaseFoot;
  tmp.copy(offset).applyMatrix4(targetObj.matrixWorld);
  camera.position.lerp(tmp, 0.12);
  const lookTarget = new THREE.Vector3().copy(look).applyMatrix4(targetObj.matrixWorld);
  camera.lookAt(lookTarget);
}

function step() {
  const gp = readGamepad();
  if (gp.y && driving) exitCar();
  if (gp.x && !driving) enterNearestCar();

  if (driving) {
    const car = cars[activeIndex];
    const p = car.preset;
    const v = car.vehicle;
    const fwd = keys['KeyW'] || keys['ArrowUp'] || gp.rt > 0.2 || gp.leftY < -0.3;
    const back = keys['KeyS'] || keys['ArrowDown'] || gp.lt > 0.2 || gp.leftY > 0.3;
    const left = keys['KeyA'] || keys['ArrowLeft'] || gp.leftX < -0.2;
    const right = keys['KeyD'] || keys['ArrowRight'] || gp.leftX > 0.2;
    const hb = keys['Space'] || gp.a || gp.rb;
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
  } else {
    let dx = 0, dz = 0;
    if (keys['KeyW'] || keys['ArrowUp']) dz -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dz += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
    dx += gp.leftX;
    dz += gp.leftY;
    const len = Math.hypot(dx, dz);
    if (len > 1) { dx /= len; dz /= len; }
    player.move(dx, dz);
  }

  cars.forEach(c => {
    if (driving && c === cars[activeIndex]) return;
    const agent = trafficAgents.find(a => a.car === c);
    if (agent) updateTraffic(agent, FIXED_DT);
    c.vehicle.updateVehicle(FIXED_DT, RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC);
  });
  world.step();
}

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
  if (!driving) player.sync();
  updateCamera();
  renderer.render(scene, camera);

  const pos = driving
    ? new THREE.Vector3(cars[activeIndex].body.translation().x, 0, cars[activeIndex].body.translation().z)
    : new THREE.Vector3(player.body.translation().x, 0, player.body.translation().z);
  checkMissions(pos, !driving, hasStolen);

  const gp = readGamepad();
  const mode = driving ? `Dirigindo: ${cars[activeIndex].preset.name}` : 'A pé';
  const speed = driving ? Math.abs(cars[activeIndex].vehicle.currentVehicleSpeed()) * 3.6 : 0;
  const contacts = driving ? [0,1,2,3].map(i => cars[activeIndex].vehicle.wheelIsInContact(i) ? '●' : '○').join(' ') : '';
  hud.textContent = `UNDERCOVER WHEELMAN\n${mode}\n` + (driving ? `Velocidade: ${speed.toFixed(0)} km/h\nContato: ${contacts}\n` : '') + `Tráfego IA: ${trafficAgents.length} carros\nGamepad: ${gp.connected ? 'conectado' : 'não'}\nFPS: ${Math.round(1/Math.max(dt,0.001))}\n\nE = sair | F = entrar\nGamepad: Y = sair | X = entrar | A = handbrake`;

  const current = getCurrentMission();
  const done = MISSIONS.filter(m => m.completed).length;
  missionHud.innerHTML = `<b>Missões (${done}/${MISSIONS.length})</b><br>` + (current ? `<br><b>${current.title}</b><br>${current.description}` : '<br>Todas concluídas!');
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
