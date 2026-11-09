const fs = require('fs');
const path = require('path');

function createWav(sampleRate, durationSec, sampleFn) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk (Linear PCM, 16-bit, Mono)
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // AudioFormat = 1 (PCM)
  buffer.writeUInt16LE(1, 22); // Channels = 1
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32); // BlockAlign = 2
  buffer.writeUInt16LE(16, 34); // BitsPerSample = 16

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = sampleFn(t, durationSec, i);
    // Soft limiting to avoid any clipping
    s = Math.max(-0.95, Math.min(0.95, s));
    const intSample = Math.floor(s * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

const SR = 44100;
const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');

// -------------------------------------------------------------
// 1. REPLACED & UPGRADED DEFAULT NOTIFICATION SOUND:
// Modern, sparkling, 3-note ascending luxury glass chime:
// E6 (1318.5Hz) -> G#6 (1661.2Hz) -> B6 (1975.5Hz)
// with delicate acoustic strike and warm harmonic resonance
// -------------------------------------------------------------
function modernDefaultChime(t, duration) {
  if (t >= duration) return 0;
  let total = 0;

  // Note 1: E6 (1318.5Hz) at t = 0s
  if (t < 0.6) {
    const env1 = Math.exp(-t * 8.5);
    const strike = Math.sin(2 * Math.PI * 2637 * t) * 0.25 * Math.exp(-t * 40);
    const fund = Math.sin(2 * Math.PI * 1318.51 * t);
    const overtone = Math.sin(2 * Math.PI * 3955.5 * t) * 0.15;
    total += (fund + strike + overtone) * env1 * 0.45;
  }

  // Note 2: G#6 (1661.2Hz) at t = 0.09s
  if (t >= 0.09 && t < 0.75) {
    const t2 = t - 0.09;
    const env2 = Math.exp(-t2 * 7.5);
    const strike2 = Math.sin(2 * Math.PI * 3322.4 * t2) * 0.25 * Math.exp(-t2 * 40);
    const fund2 = Math.sin(2 * Math.PI * 1661.22 * t2);
    const overtone2 = Math.sin(2 * Math.PI * 4983.6 * t2) * 0.18;
    total += (fund2 + strike2 + overtone2) * env2 * 0.55;
  }

  // Note 3: B6 (1975.5Hz) at t = 0.18s (the sparkling peak with long reverb shimmer)
  if (t >= 0.18) {
    const t3 = t - 0.18;
    const env3 = Math.exp(-t3 * 3.8);
    const strike3 = Math.sin(2 * Math.PI * 3951 * t3) * 0.3 * Math.exp(-t3 * 35);
    const fund3 = Math.sin(2 * Math.PI * 1975.53 * t3);
    const shimmer = Math.sin(2 * Math.PI * 5926.5 * t3) * 0.12;
    const warmth = Math.sin(2 * Math.PI * 987.7 * t3) * 0.25 * Math.exp(-t3 * 5.0);
    total += (fund3 + strike3 + shimmer + warmth) * env3 * 0.65;
  }

  return total * 0.9;
}

// -------------------------------------------------------------
// 2. UPGRADED & REALISTIC DOG BARK SOUND:
// Realistic double-bark ("Ruff! ... Ruff!")
// Canine vocal tract modeling:
// - Sharp onset impact (chest thump ~120Hz)
// - Bark pitch starts at 380Hz dropping rapidly to 180Hz
// - Folds raspiness / growl modulation (~55Hz)
// - Formants at F1 ~420Hz, F2 ~1100Hz, F3 ~2400Hz
// -------------------------------------------------------------
function realisticSingleBark(tRel, duration, pitchMult = 1.0) {
  if (tRel < 0 || tRel >= duration) return 0;
  const p = tRel / duration;

  // Natural explosive bark attack (5ms), snappy body decay
  let env = 0;
  if (p < 0.04) {
    env = p / 0.04;
  } else {
    env = Math.pow(1 - (p - 0.04) / 0.96, 2.5);
  }

  // Pitch envelope: drops from 400Hz to 190Hz
  const f0 = (185 + 215 * Math.exp(-p * 12)) * pitchMult;

  // Phase
  const phase = tRel * f0 * 2 * Math.PI;

  // Glottal waveform with subharmonic canine vocal fold roughness
  const roughness = Math.sin(tRel * 55 * 2 * Math.PI) * 0.32;
  const h1 = Math.sin(phase);
  const h2 = Math.sin(phase * 2) * 0.55;
  const h3 = Math.sin(phase * 3) * 0.35;
  const h4 = Math.sin(phase * 4) * 0.2;

  // Chest / throat cavity thump
  const chestThump = Math.sin(tRel * 115 * 2 * Math.PI) * Math.exp(-p * 18) * 0.6;

  // Breath air puff at end of bark
  const breath = (Math.random() * 2 - 1) * 0.08 * (1 - p);

  return (h1 + h2 + h3 + h4 + roughness + chestThump + breath) * env;
}

function fullDogBark(t) {
  // Bark 1: t = 0 to 0.24s
  const b1 = realisticSingleBark(t, 0.24, 1.0);
  // Short pause, then Bark 2: t = 0.28 to 0.50s (slightly higher pitch, authentic dog double-bark!)
  const b2 = realisticSingleBark(t - 0.28, 0.22, 1.08) * 0.92;
  return (b1 + b2) * 0.85;
}

// -------------------------------------------------------------
// 3. PUPPY WHINING SOUND:
// Sweet, tender, puppy whimper ("whiine... yip")
// -------------------------------------------------------------
function singlePuppyWhine(tRel, duration) {
  if (tRel < 0 || tRel >= duration) return 0;
  const p = tRel / duration;
  const env = Math.pow(Math.sin(p * Math.PI), 1.3);

  // Pitch curve: 920Hz rising to 1180Hz, soft glide to 800Hz
  let f0 = 920;
  if (p < 0.4) {
    f0 = 920 + 260 * Math.sin((p / 0.4) * (Math.PI / 2));
  } else {
    f0 = 1180 - 380 * Math.sin(((p - 0.4) / 0.6) * (Math.PI / 2));
  }
  // 6Hz tender vibrato
  f0 += Math.sin(tRel * 6 * 2 * Math.PI) * 22;

  const phase = tRel * f0 * 2 * Math.PI;
  const h1 = Math.sin(phase) * 0.75;
  const h2 = Math.sin(phase * 2) * 0.28;
  const h3 = Math.sin(phase * 3) * 0.1;

  return (h1 + h2 + h3) * env;
}

function fullPuppyWhine(t) {
  const w1 = singlePuppyWhine(t, 0.52);
  const w2 = singlePuppyWhine(t - 0.62, 0.48) * 0.8;
  return (w1 + w2) * 0.75;
}

// -------------------------------------------------------------
// 4. BRIGHT MARIMBA:
// Warm acoustic wooden chime
// -------------------------------------------------------------
function brightMarimba(t, duration) {
  if (t >= duration) return 0;
  let val = 0;
  const env1 = Math.exp(-t * 8.0);
  val += Math.sin(2 * Math.PI * 587.33 * t) * 0.6 * env1;
  if (t >= 0.12) {
    const t2 = t - 0.12;
    const env2 = Math.exp(-t2 * 6.5);
    val += Math.sin(2 * Math.PI * 880 * t2) * 0.55 * env2;
  }
  return val * 0.85;
}

// Generate the updated WAV files
fs.writeFileSync(path.join(soundsDir, 'default_chime.wav'), createWav(SR, 1.2, modernDefaultChime));
fs.writeFileSync(path.join(soundsDir, 'dog_bark.wav'), createWav(SR, 0.55, fullDogBark));
fs.writeFileSync(path.join(soundsDir, 'puppy_whine.wav'), createWav(SR, 1.15, fullPuppyWhine));
fs.writeFileSync(path.join(soundsDir, 'marimba.wav'), createWav(SR, 0.7, brightMarimba));

console.log('Successfully generated upgraded pet sounds & new modern default chime!');
