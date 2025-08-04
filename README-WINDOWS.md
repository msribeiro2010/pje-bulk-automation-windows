# PJE Bulk KZ - Versão Windows

> 🚀 **Automação para inclusão em massa de perfis de servidores em órgãos julgadores no PJE**

## 🎯 Início Rápido

### 1. Pré-requisitos
- ✅ **Node.js** (versão 16+) - [Download](https://nodejs.org/)
- ✅ **Google Chrome** - [Download](https://www.google.com/chrome/)

### 2. Instalação
```cmd
# 1. Abra o Prompt de Comando na pasta do projeto
# 2. Instale as dependências
npm install

# 3. Compile o projeto
npm run build
```

### 3. Execução
```cmd
# Execute o script principal
start-pje-bulk.bat
```

## 🔧 Como Usar

### Método Recomendado: Interface Web

1. **Execute o launcher**
   - Clique duas vezes em `start-pje-bulk.bat`
   - Aguarde a interface abrir no navegador

2. **Inicie o Chrome em modo debug**
   - Clique duas vezes em `start-chrome-debug.bat`
   - Deixe a janela aberta

3. **Configure na interface web**
   - Acesse `http://localhost:3000`
   - Preencha os dados:
     - URL do PJE
     - CPF do servidor
     - Perfil desejado
     - Lista de órgãos (um por linha)

4. **Execute a automação**
   - Clique em "Iniciar Automação"
   - Acompanhe o progresso na tela

## 📋 Exemplo de Configuração

### URL do PJE:
```
https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1
```

### CPF:
```
530.361.406-97 -> 12345678901
```

### Órgãos (um por linha):
```
Vara do Trabalho de Orlândia
1ª VT de Ribeirão Preto
2ª Vara do Trabalho de Franca
EXE1 - Ribeirão Preto
```

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|----------|
| `start-pje-bulk.bat` | Inicia a aplicação completa |
| `start-chrome-debug.bat` | Inicia Chrome em modo debug |
| `start-firefox-debug.bat` | Inicia Firefox em modo debug |
| `test-production.bat` | Testa build de produção |

## 📊 Relatórios

Os resultados são salvos em:
- `data/outputs/relatorio.csv` - Relatório em CSV
- `data/outputs/relatorio.json` - Relatório detalhado
- `data/outputs/ok_*.png` - Screenshots de sucessos
- `data/outputs/err_*.png` - Screenshots de erros

## 🚨 Solução de Problemas

### Chrome não conecta
```cmd
# Finalizar Chrome e tentar novamente
taskkill /f /im chrome.exe
start-chrome-debug.bat
```

### Erro "Node.js não encontrado"
- Instale o Node.js: https://nodejs.org/
- Reinicie o Prompt de Comando

### Erro de permissão
- Execute como Administrador
- Verifique configurações do antivírus

### Interface não abre
- Verifique se a porta 3000 está livre
- Acesse manualmente: http://localhost:3000

## 🔒 Segurança

- ✅ Execução local (sem envio de dados externos)
- ✅ Conexão segura com PJE
- ✅ Screenshots para auditoria
- ✅ Logs detalhados de todas as operações

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no terminal
2. Confirme se o Chrome está em modo debug
3. Teste com dados de exemplo
4. Verifique se está logado no PJE

---

**💡 Dica**: Mantenha sempre as janelas do terminal abertas durante o uso da automação.

**⚠️ Importante**: Faça login manual no PJE antes de iniciar a automação.