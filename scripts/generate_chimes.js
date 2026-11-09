const fs = require('fs');
const path = require('path');

function createWavBuffer(sampleRate, durationSec, sampleFn) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2; // 16-bit mono = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(1, 22); // num channels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate (sampleRate * numChannels * bitsPerSample/8)
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = sampleFn(t, durationSec);
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

const sampleRate = 44100;
const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');

// 1. Default Chime (880Hz then 1318.5Hz dual harmonic chime)
const defaultChimeWav = createWavBuffer(sampleRate, 0.9, (t) => {
  let val = 0;
  // Note 1: 880Hz
  if (t < 0.6) {
    const env1 = Math.exp(-t * 6.0);
    val += Math.sin(2 * Math.PI * 880 * t) * 0.45 * env1;
  }
  // Note 2: 1318.51Hz
  if (t >= 0.12) {
    const t2 = t - 0.12;
    const env2 = Math.exp(-t2 * 4.5);
    val += Math.sin(2 * Math.PI * 1318.51 * t2) * 0.55 * env2;
  }
  return val;
});
fs.writeFileSync(path.join(soundsDir, 'default_chime.wav'), defaultChimeWav);

// 2. Crystal Bell (1046.5Hz C6 with sparkling harmonic overtones)
const bellWav = createWavBuffer(sampleRate, 1.2, (t) => {
  const env = Math.exp(-t * 3.5);
  const fund = Math.sin(2 * Math.PI * 1046.5 * t);
  const over1 = Math.sin(2 * Math.PI * 2093.0 * t) * 0.35;
  const over2 = Math.sin(2 * Math.PI * 3139.5 * t) * 0.15;
  return (fund + over1 + over2) * 0.6 * env;
});
fs.writeFileSync(path.join(soundsDir, 'crystal_bell.wav'), bellWav);

// 3. Bright Marimba (587.33Hz D5 + 880Hz A5 wooden strike)
const marimbaWav = createWavBuffer(sampleRate, 0.7, (t) => {
  let val = 0;
  const env1 = Math.exp(-t * 7.5);
  val += Math.sin(2 * Math.PI * 587.33 * t) * 0.6 * env1;
  if (t >= 0.12) {
    const t2 = t - 0.12;
    const env2 = Math.exp(-t2 * 6.5);
    val += Math.sin(2 * Math.PI * 880 * t2) * 0.55 * env2;
  }
  return val;
});
fs.writeFileSync(path.join(soundsDir, 'marimba.wav'), marimbaWav);

console.log('Successfully generated default_chime.wav, crystal_bell.wav, and marimba.wav!');

