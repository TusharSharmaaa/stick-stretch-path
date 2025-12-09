let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;
let growOsc: OscillatorNode | null = null;
let growGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicOsc: OscillatorNode | null = null;
let musicInterval: number | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.2; // Master volume
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const startGrowSound = () => {
  if (!audioCtx || !gainNode) return;
  if (growOsc) return; // Already playing

  growOsc = audioCtx.createOscillator();
  growGain = audioCtx.createGain();

  growOsc.type = 'triangle';
  growOsc.frequency.setValueAtTime(200, audioCtx.currentTime);
  // Pitch ramp up
  growOsc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 2);

  growOsc.connect(growGain);
  growGain.connect(gainNode);

  growGain.gain.setValueAtTime(0, audioCtx.currentTime);
  growGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);

  growOsc.start();
};

export const stopGrowSound = () => {
  if (growOsc && growGain && audioCtx) {
    const now = audioCtx.currentTime;
    growGain.gain.cancelScheduledValues(now);
    growGain.gain.setValueAtTime(growGain.gain.value, now);
    growGain.gain.linearRampToValueAtTime(0, now + 0.05);
    growOsc.stop(now + 0.05);
    growOsc = null;
    growGain = null;
  }
};

export const playStickHit = () => {
  if (!audioCtx || !gainNode) return;
  // Snappy click
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  osc.connect(env);
  env.connect(gainNode);
  
  env.gain.setValueAtTime(0.3, audioCtx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

export const playSuccess = () => {
  if (!audioCtx || !gainNode) return;
  // Nice synth chord
  const freqs = [440, 554, 659]; // A major
  const now = audioCtx.currentTime;
  
  freqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = f;
    
    osc.connect(env);
    env.connect(gainNode!);
    
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.1, now + 0.05 + (i * 0.02));
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  });
};

export const playFail = () => {
  if (!audioCtx || !gainNode) return;
  // Glitch noise
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - (i/bufferSize));
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const env = audioCtx.createGain();
  
  noise.connect(env);
  env.connect(gainNode);
  
  const now = audioCtx.currentTime;
  env.gain.setValueAtTime(0.4, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  
  noise.start(now);
  noise.stop(now + 0.3);
};

export const playCoin = () => {
  if (!audioCtx || !gainNode) return;
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(1800, audioCtx.currentTime + 0.1);
  
  osc.connect(env);
  env.connect(gainNode);
  
  env.gain.setValueAtTime(0.1, audioCtx.currentTime);
  env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

export const startBackgroundMusic = (enabled: boolean) => {
  if (!audioCtx || !gainNode) return;
  
  if (musicOsc) {
    stopBackgroundMusic();
  }
  
  if (!enabled) return;
  
  musicGain = audioCtx.createGain();
  musicGain.connect(gainNode);
  musicGain.gain.value = 0.05; // Very quiet background
  
  let noteIndex = 0;
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major scale
  
  const playNote = () => {
    if (!audioCtx || !musicGain) return;
    
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = notes[noteIndex % notes.length];
    
    osc.connect(env);
    env.connect(musicGain);
    
    env.gain.setValueAtTime(0, audioCtx.currentTime);
    env.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
    env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.5);
    
    noteIndex++;
  };
  
  // Play a note every 2 seconds
  musicInterval = window.setInterval(playNote, 2000);
};

export const stopBackgroundMusic = () => {
  if (musicInterval !== null) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  musicGain = null;
  musicOsc = null;
};

// Cleanup function for app unmount - ensures no memory leaks
export const cleanupAudio = () => {
  stopBackgroundMusic();
  stopGrowSound();
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close().catch(console.error);
    audioCtx = null;
    gainNode = null;
  }
};

export const setSoundEnabled = (enabled: boolean) => {
  if (gainNode) {
    gainNode.gain.value = enabled ? 0.2 : 0;
  }
};