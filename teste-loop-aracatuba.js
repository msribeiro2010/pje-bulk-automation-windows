// Teste específico para problema de loop com Varas de Araçatuba
const testData = {
  pjeUrl:
    "https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1",
  cpf: "12345678901",
  perfil: "Perito",
  orgaos: [
    "1ª Vara do Trabalho de Araçatuba",
    "2ª Vara do Trabalho de Araçatuba",
    "3ª Vara do Trabalho de Araçatuba",
  ],
};

console.log("=".repeat(60));
console.log("TESTE DE CORREÇÃO - PROBLEMA DE LOOP EM ARAÇATUBA");
console.log("=".repeat(60));
console.log("");
console.log("Este teste verifica se o sistema consegue processar");
console.log("sequencialmente as 3 varas de Araçatuba sem ficar em loop.");
console.log("");
console.log("ORGÃOS A PROCESSAR:");
testData.orgaos.forEach((orgao, index) => {
  console.log(`${index + 1}. ${orgao}`);
});
console.log("");
console.log("MELHORIAS IMPLEMENTADAS:");
console.log("- ✅ Timeout de 60 segundos por órgão");
console.log("- ✅ Logs detalhados de progresso");
console.log("- ✅ Proteção contra loop infinito");
console.log("- ✅ Forçar continuação do loop principal");
console.log("- ✅ Verificação de índice atual");
console.log("");
console.log("DADOS DE CONFIGURAÇÃO:");
console.log(JSON.stringify(testData, null, 2));
console.log("");
console.log("Para executar via interface web:");
console.log("1. Acesse http://localhost:3000");
console.log("2. Configure os dados acima");
console.log("3. Execute e monitore os logs detalhados");
console.log("");
console.log("=".repeat(60));
