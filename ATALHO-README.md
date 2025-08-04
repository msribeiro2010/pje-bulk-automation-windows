# 🚀 Atalho PJe Bulk - Guia de Uso

## ✅ Atalhos Criados com Sucesso!

Foram criados **dois tipos de atalho** na sua **área de trabalho** para facilitar o acesso à aplicação PJe Bulk.

## 📱 Como Usar

### 1. **Atalho Principal (Recomendado)**
- Procure pelo ícone **"PJe Bulk Launcher.app"** na sua área de trabalho
- **Duplo clique** no ícone para iniciar a aplicação
- O sistema irá:
  - 🖥️ Abrir o Terminal automaticamente
  - ✅ Iniciar o servidor automaticamente
  - 🌐 Abrir o **Google Chrome** em `http://localhost:3000` (preferido para automação)
  - 🔄 Se Chrome não estiver disponível, usa o navegador padrão
  - 📱 Deixar a aplicação pronta para uso

### 2. **Atalho Alternativo**
- Procure pelo ícone **"PJe Bulk.app"** na sua área de trabalho
- **Duplo clique** no ícone para iniciar a aplicação
- Funciona de forma similar, mas pode precisar de permissões adicionais

### 2. **Alternativas de Acesso**

#### **Script Direto:**
```bash
./start-pje-bulk.sh
```

#### **Manual:**
```bash
npm start
# ou
node_modules/.bin/ts-node src/server.ts
```

## 🎯 Funcionalidades do Atalho

- **🔄 Verificação Automática**: Verifica se o Node.js está instalado
- **📦 Instalação de Dependências**: Instala automaticamente se necessário
- **🛑 Limpeza de Processos**: Para instâncias anteriores do servidor
- **🌐 Abertura Automática**: Abre o navegador automaticamente
- **📋 Logs Detalhados**: Fornece informações sobre o status

## 🔧 Personalização

### **Mover para o Dock:**
1. Arraste o **"PJe Bulk.app"** da área de trabalho para o Dock
2. Agora você pode acessar com um clique no Dock

### **Criar Alias no Terminal:**
```bash
echo 'alias pje="cd /caminho/para/pje-bulk-kz && ./start-pje-bulk.sh"' >> ~/.zshrc
source ~/.zshrc
```

### **Atalho de Teclado (opcional):**
1. Vá em **Preferências do Sistema** > **Teclado** > **Atalhos**
2. Adicione um atalho personalizado para o aplicativo

## 🛠️ Solução de Problemas

### **Se o atalho não funcionar:**
1. Verifique se o Node.js está instalado: `node --version`
2. Execute manualmente: `./start-pje-bulk.sh`
3. Verifique os logs: `tail -f server.log`

### **Para parar o servidor:**
```bash
REM Windows:
taskkill /f /fi "WINDOWTITLE eq PJE Bulk Server*"
REM ou
taskkill /f /im node.exe

REM Unix/macOS:
REM pkill -f 'ts-node src/server.ts'
```

### **Para verificar se está rodando:**
```bash
ps aux | grep 'ts-node src/server.ts'
```

## 📁 Estrutura Criada

```
~/Desktop/
└── PJe Bulk.app/          # Aplicativo macOS
    ├── Contents/
    │   ├── Info.plist       # Configurações do app
    │   ├── MacOS/
    │   │   └── PJe Bulk     # Executável principal
    │   └── Resources/
    │       └── icon.svg     # Ícone personalizado

pje-bulk-kz/
├── start-pje-bulk.sh        # Script de inicialização
├── pje-bulk-icon.svg        # Ícone original
└── ATALHO-README.md         # Este arquivo
```

## 🌐 Navegador Recomendado

**Por que Chrome é preferido para automação:**
- 🤖 **Melhor compatibilidade** com ferramentas de automação
- 🔧 **DevTools avançados** para debugging
- ⚡ **Performance superior** em aplicações web complexas
- 🛡️ **Recursos de segurança** adequados para sistemas jurídicos
- 📱 **Consistência** entre diferentes sistemas operacionais

**Fallback automático:**
- Se Chrome não estiver instalado, usa o navegador padrão
- Funciona com Safari, Firefox ou qualquer navegador

## 🎨 Ícone Personalizado

O atalho inclui um ícone personalizado com:
- ⚖️ Símbolo da justiça (balança)
- 🔵 Fundo azul profissional
- 📝 Texto "PJe BULK"
- 🎯 Design moderno e reconhecível

---

**✅ Pronto!** Agora você pode acessar o PJe Bulk diretamente da área de trabalho com apenas um duplo clique!