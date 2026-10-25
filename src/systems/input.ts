export const keys: Record<string, boolean> = {};

export function setupInput(onAction: (action: string) => void) {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyC') onAction('switch');
    if (e.code === 'KeyE') onAction('exit');
    if (e.code === 'KeyF') onAction('enter');
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
}
