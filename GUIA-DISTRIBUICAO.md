# 🚀 GUIA DE DISTRIBUIÇÃO - PJE BULK AUTOMATION

## 📦 OPÇÕES PARA LEVAR PARA OUTRA MÁQUINA:

### 🎯 **OPÇÃO 1: INSTALADOR AUTOMÁTICO (RECOMENDADO)**

✅ **Mais fácil para o usuário final**

**Como preparar:**

1. Execute: `.\criar-pacote-distributivel.ps1`
2. Comprima a pasta gerada em ZIP
3. Envie o ZIP para a outra máquina

**Como instalar na máquina destino:**

1. Extraia o ZIP
2. Clique com botão direito em `instalar-pje-bulk.bat`
3. Escolha "Executar como administrador"
4. Aguarde instalação automática
5. Use o atalho criado na área de trabalho

---

### 🎯 **OPÇÃO 2: INSTALADOR POWERSHELL**

✅ **Mais controle sobre instalação**

**Como usar:**

1. Copie `instalador-portatil.ps1` para a máquina destino
2. Execute como administrador
3. Escolha diretório de instalação (padrão: C:\PJE-Bulk-Automation)

---

### 🎯 **OPÇÃO 3: EXECUTÁVEL STANDALONE**

✅ **Não precisa instalar Node.js**

**Como preparar:**

1. Execute: `.\criar-executavel.ps1`
2. Copie pasta `standalone` para a máquina destino
3. Execute `iniciar.bat`

---

### 🎯 **OPÇÃO 4: CÓPIA MANUAL**

✅ **Para quando tudo mais falha**

**Pré-requisitos na máquina destino:**

- Node.js: https://nodejs.org/
- Google Chrome: https://www.google.com/chrome/

**Passos:**

1. Copie toda a pasta do projeto
2. Abra PowerShell como administrador
3. Execute: `npm install`
4. Execute: `npm run build`
5. Execute: `.\criar-atalho.ps1`

---

## 🔧 **CONFIGURAÇÕES QUE FUNCIONAM EM QUALQUER MÁQUINA:**

### ✅ **Scripts Portáveis Criados:**

- `instalar-pje-bulk.bat` - Instalador automático
- `instalador-portatil.ps1` - Instalador PowerShell
- `criar-pacote-distributivel.ps1` - Gera pacote ZIP
- `criar-executavel.ps1` - Gera executável standalone

### ✅ **Funcionalidades Portáveis:**

- ✅ Detecção automática de Chrome
- ✅ Instalação automática de dependências
- ✅ Caminhos relativos (sem hardcode)
- ✅ Criação automática de atalhos
- ✅ Verificação de privilégios de administrador

---

## 📋 **INSTRUÇÕES PARA DISTRIBUIÇÃO:**

### **Para Usuário Técnico:**

```
1. Execute: .\criar-pacote-distributivel.ps1
2. Comprima a pasta gerada
3. Envie para destino
4. Instrua: "Execute instalar-pje-bulk.bat como administrador"
```

### **Para Usuário Final:**

```
1. Baixe o arquivo ZIP
2. Extraia em qualquer pasta
3. Clique com botão direito em "instalar-pje-bulk.bat"
4. Escolha "Executar como administrador"
5. Aguarde instalação automática
6. Use o atalho da área de trabalho
```

---

## ⚠️ **REQUISITOS MÍNIMOS:**

- Windows 10/11
- Conexão com internet (para primeira instalação)
- Permissões de administrador
- 2GB RAM livres
- 500MB espaço em disco

---

## 🆘 **SOLUÇÃO DE PROBLEMAS:**

### **Erro: "Execution Policy"**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Erro: "Node.js não encontrado"**

- Execute o instalador automático
- Ou instale manualmente: https://nodejs.org/

### **Erro: "Chrome não encontrado"**

- Execute o instalador automático
- Ou instale manualmente: https://www.google.com/chrome/

### **Erro: "Sem permissões"**

- Execute sempre como administrador
- Clique com botão direito → "Executar como administrador"

---

## 📞 **SUPORTE:**

Em caso de problemas:

1. Execute o instalador automático primeiro
2. Envie prints dos erros específicos
3. Verifique logs em: C:\PJE-Bulk-Automation\logs\
