const fs = require('fs');
const path = require('path');

function generateWoodClackWav(filename, { baseFreq = 340, duration = 0.075, sampleRate = 44100 } = {}) {
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Envelope: quick attack (2ms), exponential decay
    const attack = Math.min(1, t / 0.002);
    const decay = Math.exp(-t * 65);
    const env = attack * decay;

    // Wood impact body: resonant harmonics characteristic of maple/beech tabletop meeples
    const f1 = baseFreq;
    const f2 = baseFreq * 2.2;
    const f3 = baseFreq * 3.9;
    
    // Initial sharp transient snap
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 300);

    const tone = (
      Math.sin(2 * Math.PI * f1 * t) * 0.6 +
      Math.sin(2 * Math.PI * f2 * t) * 0.25 +
      Math.sin(2 * Math.PI * f3 * t) * 0.15 +
      noise * 0.35
    ) * env;

    // Clamp and convert to 16-bit integer (-32768 to 32767)
    const clamped = Math.max(-1, Math.min(1, tone * 0.8));
    const sample = Math.floor(clamped < 0 ? clamped * 32768 : clamped * 32767);
    buffer.writeInt16LE(sample, offset);
    offset += 2;
  }

  const outDir = path.dirname(filename);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(filename, buffer);
  console.log(`Generated: ${filename} (${buffer.length} bytes)`);
}

generateWoodClackWav(path.join(__dirname, '../public/sounds/wood-clack.wav'), { baseFreq: 340, duration: 0.075 });
generateWoodClackWav(path.join(__dirname, '../public/sounds/wood-dice.wav'), { baseFreq: 420, duration: 0.06 });
