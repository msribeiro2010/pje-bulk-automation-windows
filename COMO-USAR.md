# PJE Bulk Automation - Como Usar

## 🚀 Inicialização Rápida

### Opção 1: Atalho da Área de Trabalho (Recomendado)

1. **Clique duplo** no atalho "PJE Bulk Automation" na área de trabalho
2. Aguarde a aplicação inicializar automaticamente

### Opção 2: Executar Manualmente

1. Abra o arquivo `iniciar-pje-bulk.bat` na pasta do projeto
2. Aguarde a aplicação inicializar

## 📋 Processo de Uso

### 1. Preparação

- ✅ Chrome será iniciado automaticamente em modo debug
- ✅ Servidor web será iniciado na porta 3000
- ✅ Interface web será aberta automaticamente

### 2. Login no PJE

1. **Faça login no PJE** na aba do Chrome que se abriu
2. Navegue até a página de pessoa física do PJE
3. Mantenha a aba aberta e logada

### 3. Configurar Automação

1. **Acesse a interface web**: http://localhost:3000
2. **Preencha os campos**:
   - **URL do PJE**: URL completa da página pessoa física
   - **CPF do Servidor**: CPF que receberá os perfis
   - **Perfil**: Escolha o perfil na lista
   - **Órgãos Julgadores**: Digite um órgão por linha

### 4. Executar

1. **Clique em "Iniciar Automação"**
2. Acompanhe o progresso na interface web
3. Aguarde a conclusão

## ⚠️ Importantes

### Antes de Usar

- ✅ Certifique-se de que está logado no PJE
- ✅ Verifique se o CPF é válido
- ✅ Confirme os órgãos julgadores

### Durante o Uso

- 🚫 **NÃO feche** a janela do terminal/prompt
- 🚫 **NÃO feche** a aba do Chrome em debug
- ✅ Use a interface web para controlar a automação

### Parar a Aplicação

- **Feche a janela do terminal/prompt**, ou
- **Pressione Ctrl+C** na janela do terminal

## 🔧 Troubleshooting

### Problemas Comuns

**Chrome não abre:**

- Verifique se o Google Chrome está instalado
- Feche todas as instâncias do Chrome e tente novamente

**Erro "Node.js não encontrado":**

- Instale o Node.js de https://nodejs.org/
- Reinicie o computador após a instalação

**Erro de conexão:**

- Verifique se está logado no PJE
- Confirme se a URL do PJE está correta

**Interface web não carrega:**

- Verifique se a porta 3000 não está em uso
- Tente acessar manualmente: http://localhost:3000

## 📞 Suporte

Para problemas técnicos:

1. Verifique os logs na janela do terminal
2. Certifique-se de que todos os pré-requisitos estão instalados
3. Reinicie a aplicação

---

**Versão:** 1.0.0 Windows  
**Data:** Agosto 2025
