# PJE Bulk KZ

Automação para inclusão em massa de perfis de servidores em órgãos julgadores no PJE.

## 🚀 Funcionalidades

- ✅ **Interface Web Dinâmica**: Configure tudo pela interface web
- ✅ **URLs Dinâmicas**: Não precisa mais editar arquivos de configuração
- ✅ **CPF Dinâmico**: Altere o CPF diretamente na interface
- ✅ **Perfis Configuráveis**: Escolha o perfil na interface
- ✅ **Órgãos Personalizáveis**: Digite os órgãos desejados
- ✅ **Relatórios Automáticos**: CSV e JSON gerados automaticamente
- ✅ **Screenshots**: Capturas de tela de sucessos e erros

## 🛠️ Configuração Inicial

1. **Instale as dependências:**

   ```bash
   npm install
   ```

2. **Inicie o Chrome em modo debug:**

   ```bash
   npm run chrome-debug
   ```

3. **Inicie o servidor web:**

   ```bash
   npm run server
   ```

4. **Acesse a interface web:**
   ```
   http://localhost:3000
   ```

## 🌐 Como Usar - Interface Web (Recomendado)

1. **Faça login manualmente no PJE** na aba do Chrome que abriu

2. **Acesse a interface web** em `http://localhost:3000`

3. **Preencha os campos:**

   - **URL do PJE**: URL completa da página pessoa física (ex: `https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1`)
   - **CPF do Servidor**: CPF que receberá os perfis
   - **Perfil**: Escolha o perfil na lista
   - **Órgãos Julgadores**: Digite um órgão por linha

4. **Clique em "Iniciar Automação"**

5. **Acompanhe os resultados** na própria interface

## 📋 Exemplo de Uso

### URL do PJE:

```
https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1
```

### CPF:

```
12345678901
```

### Órgãos Julgadores (um por linha):

```
Vara do Trabalho de Orlândia
1ª VT de Ribeirão Preto
2ª Vara do Trabalho de Franca
EXE1 - Ribeirão Preto
```

## 🔧 Métodos Alternativos

### Linha de Comando (Conexão Dinâmica)

```bash
npm run connect-dynamic "https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1" "12345678901" "Servidor" "Vara do Trabalho de Orlândia,1ª VT de Ribeirão Preto"
```

### Método Legado (usando .env)

1. **Configure o arquivo .env:**

   ```bash
   cp .env.example .env
   ```

2. **Execute:**
   ```bash
   npm run connect
   ```

## 📊 Relatórios

Os resultados são salvos automaticamente em:

- `data/outputs/relatorio.csv` - Relatório em CSV
- `data/outputs/relatorio.json` - Relatório detalhado em JSON
- `data/outputs/ok_*.png` - Screenshots de sucessos
- `data/outputs/err_*.png` - Screenshots de erros

## 🏗️ Estrutura do Projeto

```
src/
├── index.ts           # Script principal (legado)
├── automation.ts      # Automação dinâmica
├── connect-dynamic.ts # Conexão dinâmica
├── helpers.ts         # Funções auxiliares
└── server.ts          # Servidor web
public/
└── index.html         # Interface web
data/
└── outputs/           # Relatórios e screenshots
```

## 🔍 Perfis Disponíveis

- Administrador
- Assessor
- Diretor de Central de Atendimento
- Diretor de Secretaria
- Estagiário Conhecimento
- Estagiário de Central de Atendimento
- Secretário de Audiência
- Servidor

## 🚨 Solução de Problemas

### Chrome não conecta

**Windows:**

```cmd
REM Finalizar todos os processos do Chrome
taskkill /f /im chrome.exe
REM Executar novamente o script de debug
start-chrome-debug.bat
```

**Unix/macOS:**

```bash
# Mate todos os processos do Chrome e tente novamente
pkill -f chrome
npm run chrome-debug-unix
```

### Servidor não encontrado

- Verifique se o CPF está correto
- Confirme se está logado no PJE
- Verifique se a URL está correta

### Órgão não encontrado

- Verifique a grafia exata do órgão
- Confirme se o órgão existe no sistema
- Veja os screenshots de erro em `data/outputs/`

## 🆕 Novidades da Versão Dinâmica

- ✅ **Sem necessidade de editar código**: Tudo configurável pela interface
- ✅ **URLs flexíveis**: Funciona com qualquer instância do PJE
- ✅ **CPF dinâmico**: Altere o CPF sem reiniciar
- ✅ **Interface moderna**: Design responsivo e intuitivo
- ✅ **Feedback em tempo real**: Acompanhe o progresso na tela
- ✅ **Validação de dados**: Campos obrigatórios e formatação automática
