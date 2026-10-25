export class EngineAudio {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private tireNoise: AudioBufferSourceNode | null = null;
  private tireGain: GainNode | null = null;
  private master: GainNode | null = null;
  started = false;

  async start() {
    if (this.started) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineGain.connect(this.master);

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 80;
    this.engineOsc.connect(this.engineGain);
    this.engineOsc.start();

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    this.tireGain = this.ctx.createGain();
    this.tireGain.gain.value = 0;
    this.tireGain.connect(this.master);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.7;
    filter.connect(this.tireGain);

    this.tireNoise = this.ctx.createBufferSource();
    this.tireNoise.buffer = noiseBuffer;
    this.tireNoise.loop = true;
    this.tireNoise.connect(filter);
    this.tireNoise.start();

    this.started = true;
  }

  update(speedKmh: number, throttle: number, handbrake: boolean, steering: number) {
    if (!this.ctx || !this.engineOsc || !this.engineGain || !this.tireGain) return;

    const rpm = 60 + speedKmh * 1.8 + throttle * 80;
    this.engineOsc.frequency.setTargetAtTime(rpm, this.ctx.currentTime, 0.08);

    const engVol = Math.min(0.6, 0.08 + throttle * 0.4 + speedKmh * 0.004);
    this.engineGain.gain.setTargetAtTime(engVol, this.ctx.currentTime, 0.05);

    const skid = (handbrake || Math.abs(steering) > 0.25) && speedKmh > 15;
    const tireVol = skid ? Math.min(0.45, 0.1 + speedKmh * 0.008) : 0;
    this.tireGain.gain.setTargetAtTime(tireVol, this.ctx.currentTime, 0.06);
  }

  stop() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.started = false;
    }
  }
}
