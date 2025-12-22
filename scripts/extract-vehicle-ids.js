// Extract base vehicle IDs from XML templates at build time
const fs = require('fs');
const path = require('path');

const templates = [
  { file: 'Mega_super.xml', output: 'mega-super-ids.json' },
  { file: 'SC_WO_IHR.xml', output: 'sc-wo-ihr-ids.json' },
  { file: 'SWC_15inch.xml', output: 'swc-15inch-ids.json' },
  { file: 'VC0.xml', output: 'vc0-ids.json' },
  { file: 'VC1.xml', output: 'vc1-ids.json' },
  { file: 'VC2.xml', output: 'vc2-ids.json' },
  { file: 'VC3.xml', output: 'vc3-ids.json' },
  { file: 'CC1.xml', output: 'cc1-ids.json' },
  { file: 'CC2.xml', output: 'cc2-ids.json' },
  { file: 'CC3.xml', output: 'cc3-ids.json' },
  { file: 'CC4.xml', output: 'cc4-ids.json' },
  { file: 'CC5.xml', output: 'cc5-ids.json' },
];

const acesDir = path.join(__dirname, '../src/templates/aces');
const outputDir = path.join(__dirname, '../src/templates/aces/data');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

templates.forEach(({ file, output }) => {
  const filePath = path.join(acesDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  const xmlContent = fs.readFileSync(filePath, 'utf-8');
  
  // Extract all BaseVehicle IDs
  const regex = /<BaseVehicle id="(\d+)"/g;
  const ids = [];
  let match;
  
  while ((match = regex.exec(xmlContent)) !== null) {
    ids.push(match[1]);
  }
  
  // Write to JSON file
  const outputPath = path.join(outputDir, output);
  fs.writeFileSync(outputPath, JSON.stringify(ids, null, 2));
  
  console.log(`✓ Extracted ${ids.length} base vehicle IDs from ${file} to ${output}`);
});

console.log('\nDone! Base vehicle IDs extracted.');
