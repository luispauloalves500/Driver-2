export interface GamepadState {
  connected: boolean;
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  lb: boolean;
  rb: boolean;
  lt: number;
  rt: number;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
  start: boolean;
  select: boolean;
}

const deadzone = 0.15;

function applyDeadzone(v: number): number {
  return Math.abs(v) < deadzone ? 0 : v;
}

export function readGamepad(): GamepadState {
  const pads = navigator.getGamepads();
  const pad = pads[0] ?? pads.find(p => p) ?? null;

  if (!pad) {
    return {
      connected: false,
      leftX: 0, leftY: 0, rightX: 0, rightY: 0,
      a: false, b: false, x: false, y: false,
      lb: false, rb: false, lt: 0, rt: 0,
      dpadUp: false, dpadDown: false, dpadLeft: false, dpadRight: false,
      start: false, select: false,
    };
  }

  const b = pad.buttons;
  const a = pad.axes;

  return {
    connected: true,
    leftX: applyDeadzone(a[0] ?? 0),
    leftY: applyDeadzone(a[1] ?? 0),
    rightX: applyDeadzone(a[2] ?? 0),
    rightY: applyDeadzone(a[3] ?? 0),
    a: b[0]?.pressed ?? false,
    b: b[1]?.pressed ?? false,
    x: b[2]?.pressed ?? false,
    y: b[3]?.pressed ?? false,
    lb: b[4]?.pressed ?? false,
    rb: b[5]?.pressed ?? false,
    lt: b[6]?.value ?? 0,
    rt: b[7]?.value ?? 0,
    dpadUp: b[12]?.pressed ?? false,
    dpadDown: b[13]?.pressed ?? false,
    dpadLeft: b[14]?.pressed ?? false,
    dpadRight: b[15]?.pressed ?? false,
    start: b[9]?.pressed ?? false,
    select: b[8]?.pressed ?? false,
  };
}
