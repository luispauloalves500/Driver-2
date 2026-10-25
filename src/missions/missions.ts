import * as THREE from 'three';

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: THREE.Vector3;
  radius: number;
  completed: boolean;
}

export const MISSIONS: Mission[] = [
  {
    id: 'reach-platform',
    title: 'Chegue à plataforma',
    description: 'Dirija até a plataforma elevada no final da pista.',
    target: new THREE.Vector3(0, 2, 70),
    radius: 6,
    completed: false,
  },
  {
    id: 'pass-ramp',
    title: 'Pule a rampa',
    description: 'Passe pela rampa principal com velocidade.',
    target: new THREE.Vector3(0, 2, 28),
    radius: 5,
    completed: false,
  },
  {
    id: 'steal-car',
    title: 'Roube um carro',
    description: 'Desça do seu carro e entre em outro veículo.',
    target: new THREE.Vector3(0, 0, 0),
    radius: 999,
    completed: false,
  },
];

export function checkMissions(
  position: THREE.Vector3,
  onFoot: boolean,
  hasStolen: boolean
): Mission | null {
  for (const m of MISSIONS) {
    if (m.completed) continue;

    if (m.id === 'steal-car') {
      if (hasStolen) {
        m.completed = true;
        return m;
      }
      continue;
    }

    const dist = position.distanceTo(m.target);
    if (dist < m.radius) {
      m.completed = true;
      return m;
    }
  }
  return null;
}

export function getCurrentMission(): Mission | null {
  return MISSIONS.find(m => !m.completed) ?? null;
}
