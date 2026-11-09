const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
const outputFile = path.join(__dirname, '..', 'src', 'utils', 'soundData.ts');

const soundFiles = [
  { id: 'chime', file: 'default_chime.wav', mime: 'audio/wav' },
  { id: 'cat_meow', file: 'cat_meow.mp3', mime: 'audio/mp3' },
  { id: 'dog_bark', file: 'dog_bark.mp3', mime: 'audio/mp3' },
  { id: 'cat_purr', file: 'cat_purr.mp3', mime: 'audio/mp3' },
  { id: 'puppy_whine', file: 'puppy_whine.mp3', mime: 'audio/mp3' },
  { id: 'marimba', file: 'marimba.wav', mime: 'audio/wav' },
];

let output = `// Auto-generated audio data URIs and asset references
// Actual high-fidelity audio recordings for PetCare notifications

export const SOUND_DATA_URIS: Record<string, string> = {\n`;

for (const { id, file, mime } of soundFiles) {
  const filePath = path.join(soundsDir, file);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    const base64 = data.toString('base64');
    output += `  '${id}': 'data:${mime};base64,${base64}',\n`;
    console.log(`Encoded ${id} (${file}, ${data.length} bytes, ${mime})`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
}

output += `};\n\n`;

output += `export const SOUND_ASSET_REQUIRES: Record<string, number> = {\n`;
output += `  'chime': require('../../assets/sounds/default_chime.wav'),\n`;
output += `  'cat_meow': require('../../assets/sounds/cat_meow.mp3'),\n`;
output += `  'dog_bark': require('../../assets/sounds/dog_bark.mp3'),\n`;
output += `  'cat_purr': require('../../assets/sounds/cat_purr.mp3'),\n`;
output += `  'puppy_whine': require('../../assets/sounds/puppy_whine.mp3'),\n`;
output += `  'marimba': require('../../assets/sounds/marimba.wav'),\n`;
output += `};\n`;

fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Generated ${outputFile} successfully!`);
