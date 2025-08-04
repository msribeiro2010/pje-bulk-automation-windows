# Configuração Rápida - Windows

## ⚡ Setup em 5 Minutos

### 1. Instalar Node.js

```
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (recomendada)
3. Execute o instalador
4. Reinicie o Prompt de Comando
```

### 2. Preparar o Projeto

```cmd
# Abra o Prompt de Comando na pasta do projeto
cd C:\caminho\para\pje-bulk-automation-windows

# Instale as dependências
npm install

# Compile o projeto
npm run build
```

### 3. Executar

```cmd
# Método 1: Clique duplo no arquivo
start-pje-bulk.bat

# Método 2: Via linha de comando
start start-pje-bulk.bat
```

## 🔧 Configuração do Chrome

### Automática (Recomendada)

```cmd
# Execute o script
start-chrome-debug.bat
```

### Manual

```cmd
# Feche todas as instâncias do Chrome
taskkill /f /im chrome.exe

# Inicie com debugging
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=%TEMP%\chrome-debug
```

## 📝 Arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```env
PJE_URL=https://pje.trt15.jus.br/pjekz/pessoa-fisica
   - CPF (sem pontos/traços): `12345678901`
PERFIL=Servidor
BROWSER_TYPE=chrome
LOGIN_WAIT_TIME=60
```

## 🚀 Uso Básico

1. **Execute**: `start-pje-bulk.bat`
2. **Chrome Debug**: `start-chrome-debug.bat`
3. **Acesse**: http://localhost:3000
4. **Configure** os dados na interface
5. **Execute** a automação

## ❗ Problemas Comuns

### Node.js não encontrado

```cmd
# Verificar instalação
node --version
npm --version

# Se não funcionar, reinstale o Node.js
```

### Chrome não conecta

```cmd
# Finalizar Chrome
taskkill /f /im chrome.exe

# Executar novamente
start-chrome-debug.bat
```

### Porta 3000 ocupada

```cmd
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Finalizar processo (substitua PID)
taskkill /f /pid [PID]
```

### Antivírus bloqueando

- Adicione exceção para a pasta do projeto
- Adicione exceção para Node.js
- Adicione exceção para Chrome com debugging

## 📊 Estrutura de Pastas

```
pje-bulk-automation-windows/
├── 📁 src/                    # Código fonte
├── 📁 public/                 # Interface web
├── 📁 data/                   # Dados e relatórios
├── 📁 dist/                   # Código compilado
├── 📄 start-pje-bulk.bat      # Script principal
├── 📄 start-chrome-debug.bat  # Chrome debug
├── 📄 package.json            # Configurações
└── 📄 .env                    # Variáveis de ambiente
```

## ✅ Checklist de Verificação

- [ ] Node.js instalado e funcionando
- [ ] Google Chrome instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto compilado (`npm run build`)
- [ ] Arquivo .env criado e configurado
- [ ] Firewall/antivírus configurado
- [ ] Scripts .bat executáveis

## 🎯 Próximos Passos

1. ✅ **Teste básico**: Execute `start-pje-bulk.bat`
2. ✅ **Teste Chrome**: Execute `start-chrome-debug.bat`
3. ✅ **Teste interface**: Acesse http://localhost:3000
4. ✅ **Teste automação**: Use dados de exemplo
5. ✅ **Configuração final**: Ajuste o .env com seus dados

---

**💡 Dica**: Mantenha este arquivo como referência rápida para configuração.
