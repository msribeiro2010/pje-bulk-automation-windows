# 🛡️ Diretrizes de Segurança - PJE Bulk Automation

## ⚠️ IMPORTANTE - DADOS SENSÍVEIS

### 🚨 Nunca incluir nos arquivos do projeto:
- CPFs reais (de pessoas físicas)
- Senhas ou credenciais
- Tokens de API
- URLs específicas de produção
- Informações pessoais de usuários

### ✅ Dados seguros para documentação:
- CPF de exemplo: `12345678901` (CPF fictício)
- URLs genéricas: `https://pje.exemplo.jus.br/`
- Nomes fictícios: `João da Silva`

## 🔐 Configuração de Ambiente

### Arquivo .env
O arquivo `.env` deve conter apenas exemplos fictícios:
```env
# EXEMPLO - Use dados fictícios
PJE_URL=https://pje.exemplo.jus.br/pjekz/pessoa-fisica
CPF_EXAMPLE=12345678901
NOME_EXAMPLE=João da Silva
FUNCAO_EXAMPLE=Servidor
```

### Arquivo .env.local (não versionado)
Para uso pessoal, crie um arquivo `.env.local` com seus dados reais:
```env
# DADOS REAIS - NÃO COMMITAR
PJE_URL=https://pje.trt15.jus.br/pjekz/pessoa-fisica
CPF_REAL=12345678901
NOME_REAL=Seu Nome Real
FUNCAO_REAL=Sua Função
```

## 📋 Checklist de Segurança

Antes de fazer commit/push:

- [ ] Verificar se não há CPFs reais nos arquivos
- [ ] Confirmar que senhas/tokens foram removidos
- [ ] Checar se URLs específicas foram genericizadas
- [ ] Validar que o .env contém apenas exemplos
- [ ] Confirmar que .env.local está no .gitignore
- [ ] Executar busca por dados sensíveis: `grep -r "530\.361\|255289" .`

## 🔍 Comandos de Verificação

```bash
# Buscar CPFs suspeitos
grep -r "\..*\..*-" . --exclude-dir=node_modules

# Buscar possíveis senhas
grep -ri "password\|senha\|token\|secret" . --exclude-dir=node_modules

# Buscar URLs específicas
grep -r "trt\d\+\.jus\.br" . --exclude-dir=node_modules
```

## 🚨 Em caso de exposição acidental

Se dados sensíveis foram commitados:

1. **Remover imediatamente** dos arquivos
2. **Reescrever histórico** do Git se necessário
3. **Trocar credenciais** expostas
4. **Notificar equipe** de segurança

## 📞 Contato de Segurança

Para reportar vulnerabilidades ou exposição de dados:
- Criar issue privada no repositório
- Contactar mantenedores diretamente
- Seguir práticas de divulgação responsável

---

**Lembre-se**: A segurança é responsabilidade de todos os contribuidores!
