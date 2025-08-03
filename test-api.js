// Teste simples para verificar se a API está funcionando
const testData = {
  pjeUrl: "https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1",
  cpf: "12345678901",
  perfil: "Servidor",
  orgaos: ["Teste Orgao 1", "Teste Orgao 2"]
};

console.log('Dados de teste:', JSON.stringify(testData, null, 2));
console.log('Validações:');
console.log('- CPF:', testData.cpf ? '✅' : '❌');
console.log('- Perfil:', testData.perfil ? '✅' : '❌');
console.log('- Órgãos:', Array.isArray(testData.orgaos) && testData.orgaos.length > 0 ? '✅' : '❌');
console.log('- URL PJE:', testData.pjeUrl ? '✅' : '❌');

// Simular a validação que acontece na API
if (!testData.cpf || !testData.perfil || !testData.orgaos || !Array.isArray(testData.orgaos) || !testData.pjeUrl) {
  console.log('❌ ERRO: Dados inválidos - CPF, perfil, órgãos e URL do PJE são obrigatórios');
} else {
  console.log('✅ Dados válidos para processamento');
}

// Verificar se os órgãos não estão vazios
const orgaosValidos = testData.orgaos.filter(o => o && o.trim());
console.log('Órgãos válidos após filtro:', orgaosValidos);

if (orgaosValidos.length === 0) {
  console.log('❌ PROBLEMA ENCONTRADO: Todos os órgãos estão vazios após filtro!');
  console.log('Isso explicaria por que "nada foi incluído"');
} else {
  console.log('✅ Órgãos válidos encontrados:', orgaosValidos.length);
}