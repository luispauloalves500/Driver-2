export const keys: Record<string, boolean> = {};

export function setupInput(onSwitchCar: () => void) {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyC') onSwitchCar();
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
}
