// Exemplo de uso do perfil "Perito"
const exemploPerito = {
  pjeUrl:
    "https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1",
  cpf: "12345678901", // CPF do servidor que receberá o perfil
  perfil: "Perito", // Novo perfil adicionado para dar acesso de peritos aos OJs
  orgaos: [
    "1ª Vara do Trabalho de São Paulo",
    "2ª Vara do Trabalho de São Paulo",
    "3ª Vara do Trabalho de São Paulo",
  ],
};

console.log("=".repeat(60));
console.log("EXEMPLO: CONFIGURAÇÃO PARA PERFIL DE PERITO");
console.log("=".repeat(60));
console.log("");
console.log("Este exemplo mostra como configurar um servidor");
console.log("para receber perfil de PERITO em múltiplos OJs.");
console.log("");
console.log("Dados da configuração:");
console.log(JSON.stringify(exemploPerito, null, 2));
console.log("");
console.log("IMPORTANTE:");
console.log("- O CPF deve ser de um servidor válido no sistema");
console.log('- O perfil "Perito" permite acesso específico para peritos');
console.log("- Os OJs devem existir no sistema PJE");
console.log("- O servidor deve estar logado no PJE antes de executar");
console.log("");
console.log("Para executar via API:");
console.log("POST http://localhost:3000/api/start-automation");
console.log("Body: dados acima em JSON");
console.log("");
console.log("=".repeat(60));
