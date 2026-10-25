export interface CarPreset {
  name: string;
  color: number;
  massDensity: number;
  chassis: { x: number; y: number; z: number };
  engine: number;
  reverse: number;
  grip: number;
  rearGripHandbrake: number;
  stiffness: number;
  compression: number;
  relaxation: number;
  maxSteer: number;
}

export const PRESETS: CarPreset[] = [
  {
    name: 'Sedã',
    color: 0xc41e3a,
    massDensity: 110,
    chassis: { x: 0.9, y: 0.35, z: 1.8 },
    engine: 1700,
    reverse: 800,
    grip: 9.5,
    rearGripHandbrake: 2.8,
    stiffness: 40,
    compression: 4.6,
    relaxation: 7.0,
    maxSteer: 0.42,
  },
  {
    name: 'Muscle',
    color: 0xff6600,
    massDensity: 140,
    chassis: { x: 0.95, y: 0.32, z: 2.0 },
    engine: 2200,
    reverse: 700,
    grip: 7.8,
    rearGripHandbrake: 1.8,
    stiffness: 32,
    compression: 3.8,
    relaxation: 5.8,
    maxSteer: 0.38,
  },
  {
    name: 'Compacto',
    color: 0x22aa55,
    massDensity: 80,
    chassis: { x: 0.75, y: 0.32, z: 1.45 },
    engine: 1400,
    reverse: 750,
    grip: 11.0,
    rearGripHandbrake: 3.5,
    stiffness: 55,
    compression: 5.5,
    relaxation: 8.5,
    maxSteer: 0.5,
  },
  {
    name: 'Polícia',
    color: 0x1144cc,
    massDensity: 120,
    chassis: { x: 0.92, y: 0.36, z: 1.9 },
    engine: 1900,
    reverse: 850,
    grip: 11.5,
    rearGripHandbrake: 3.2,
    stiffness: 48,
    compression: 5.2,
    relaxation: 7.8,
    maxSteer: 0.4,
  },
];
