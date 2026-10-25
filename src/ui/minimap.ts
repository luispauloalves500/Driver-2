import * as THREE from 'three';

export class Minimap {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size = 160;
  scale = 1.8;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.canvas.style.cssText = `
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: ${this.size}px;
      height: ${this.size}px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.6);
      background: rgba(0,0,0,0.45);
      pointer-events: none;
      z-index: 20;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
  }

  update(
    playerPos: THREE.Vector3,
    playerRotY: number,
    cars: { pos: THREE.Vector3; isActive: boolean; isTraffic: boolean }[],
    missionTarget: THREE.Vector3 | null
  ) {
    const ctx = this.ctx;
    const s = this.size;
    const cx = s / 2;
    const cy = s / 2;

    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, s / 2 - 1, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = 'rgba(30, 40, 50, 0.7)';
    ctx.fillRect(0, 0, s, s);

    const toScreen = (wx: number, wz: number) => {
      const dx = (wx - playerPos.x) * this.scale;
      const dz = (wz - playerPos.z) * this.scale;
      const cos = Math.cos(-playerRotY);
      const sin = Math.sin(-playerRotY);
      const rx = dx * cos - dz * sin;
      const rz = dx * sin + dz * cos;
      return { x: cx + rx, y: cy + rz };
    };

    if (missionTarget) {
      const m = toScreen(missionTarget.x, missionTarget.z);
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (const c of cars) {
      if (c.isActive) continue;
      const p = toScreen(c.pos.x, c.pos.z);
      ctx.fillStyle = c.isTraffic ? '#66aaff' : '#aaaaaa';
      ctx.fillRect(p.x - 3, p.y - 2, 6, 4);
    }

    ctx.fillStyle = '#00ff66';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx - 5, cy + 6);
    ctx.lineTo(cx + 5, cy + 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, s / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }
}
