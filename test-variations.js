// Teste rápido das variações de nomes
const { execSync } = require('child_process');

// Criar um arquivo TypeScript temporário para testar
const testCode = `
function toTitleCase(str) {
  return str.replace(/\\w\\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function expandAbbreviations(orgaoName) {
  const variations = new Set();
  
  variations.add(orgaoName);
  variations.add(orgaoName.toLowerCase());
  variations.add(orgaoName.toUpperCase());
  variations.add(toTitleCase(orgaoName));
  
  const abbreviations = {
    'VT': 'Vara do Trabalho',
    'VCT': 'Vara Cível do Trabalho', 
    'JT': 'Junta de Trabalho',
    'TRT': 'Tribunal Regional do Trabalho'
  };
  
  for (const [abbrev, full] of Object.entries(abbreviations)) {
    const abbrevVariations = [abbrev, abbrev.toLowerCase(), abbrev.toUpperCase()];
    
    for (const abbrevVar of abbrevVariations) {
      if (orgaoName.includes(abbrevVar)) {
        const expanded = orgaoName.replace(new RegExp(abbrevVar, 'g'), full);
        
        variations.add(expanded);
        variations.add(expanded.toLowerCase());
        variations.add(expanded.toUpperCase());
        variations.add(toTitleCase(expanded));
      }
    }
  }
  
  if (/\\b[A-Z]{2,}\\b/.test(orgaoName)) {
    const titleCaseVersion = orgaoName.replace(/\\b[A-Z]{2,}\\b/g, (match) => 
      match.charAt(0) + match.slice(1).toLowerCase()
    );
    variations.add(titleCaseVersion);
  }
  
  const baseVariations = Array.from(variations);
  for (const variation of baseVariations) {
    const withDe = variation.replace(/(Vara do Trabalho)\\s+([A-ZÁÊÇÕ])/i, '$1 de $2');
    if (withDe !== variation) {
      variations.add(withDe);
      variations.add(withDe.toLowerCase());
      variations.add(withDe.toUpperCase());
      variations.add(toTitleCase(withDe));
    }
    
    const withoutDe = variation.replace(/(Vara do Trabalho)\\s+de\\s+/i, '$1 ');
    if (withoutDe !== variation) {
      variations.add(withoutDe);
      variations.add(withoutDe.toLowerCase());
      variations.add(withoutDe.toUpperCase());
      variations.add(toTitleCase(withoutDe));
    }
  }
  
  return Array.from(variations);
}

const testNames = [
  'Vara do Trabalho CAPÃO BONITO',
  'Vara do Trabalho ITAPETININGA',
  '1ª Vara do Trabalho SOROCABA'
];

for (const name of testNames) {
  console.log('\\n🔍 Testando: ' + name);
  const variations = expandAbbreviations(name);
  console.log('📝 Variações geradas (' + variations.length + '):');
  variations.forEach((v, i) => console.log('  ' + (i + 1) + '. "' + v + '"'));
}
`;

require('fs').writeFileSync('test-temp.ts', testCode);

require('fs').writeFileSync('test-temp.js', testCode);

try {
  const result = execSync('node test-temp.js', { encoding: 'utf8' });
  console.log(result);
} catch (error) {
  console.error('Erro:', error.message);
} finally {
  // Limpar arquivo temporário
  try {
    require('fs').unlinkSync('test-temp.js');
  } catch (e) {}
}