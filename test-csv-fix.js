// Test the CSV loading fix
const fs = require('fs');

// Simulate the fixCharacterEncoding function
function fixCharacterEncoding(text) {
  let fixedText = text;
  
  const corruptionMappings = [
    { pattern: /T¿mmer/g, replacement: 'Tømmer' },
    { pattern: /æ¿/g, replacement: 'æå' },
    { pattern: /¿ø/g, replacement: 'åø' },
    { pattern: /¿/g, replacement: 'ø' },
    { pattern: /¾/g, replacement: 'å' },
    { pattern: /¿/g, replacement: 'æ' },
  ];
  
  for (const mapping of corruptionMappings) {
    fixedText = fixedText.replace(mapping.pattern, mapping.replacement);
  }
  
  return fixedText;
}

// Test with the actual CSV content
const csvContent = fs.readFileSync('public/data/csv/customers.csv', 'utf8');
console.log('Original CSV content:');
console.log(csvContent);

console.log('\nAfter character fixing:');
const fixedContent = fixCharacterEncoding(csvContent);
console.log(fixedContent);

// Test specific line
const lines = fixedContent.split('\n');
const johanLine = lines.find(line => line.includes('Johan'));
console.log('\nJohan line after fixing:', johanLine);
