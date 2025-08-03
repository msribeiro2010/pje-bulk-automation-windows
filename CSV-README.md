# 📋 Importação de Órgãos Julgadores via CSV

## 🎯 Solução para Cadastrar 329 OJs

Este sistema permite importar e cadastrar centenas de órgãos julgadores de forma automatizada a partir de arquivos CSV.

## 🚀 Instalação Rápida

```bash
# Instalar dependências
npm install

# Ver exemplos de uso
npm run csv-help
```

## 📁 Preparar seu Arquivo CSV

### Formato Aceito:

```csv
Orgao Julgador,Codigo,Regiao
"1ª Vara do Trabalho de São Paulo",001,SP
"2ª Vara do Trabalho de São Paulo",002,SP
"3ª Vara do Trabalho de São Paulo",003,SP
```

### Separadores Suportados:
- `,` (vírgula)
- `;` (ponto e vírgula) 
- `\t` (tab)

## 🔥 Execução Direta (Método Recomendado)

```bash
# Para seus 329 OJs
npm run csv-run seu-arquivo-329-ojs.csv -- \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica"
```

## 🔍 Comandos Úteis

### 1. Visualizar Preview

```bash
# Ver estrutura do CSV
npm run csv-preview seu-arquivo.csv

# Ver mais linhas
npm run csv-preview seu-arquivo.csv -- --lines 20

# Especificar coluna dos OJs (se não for a primeira)
npm run csv-preview seu-arquivo.csv -- --column 1
```

### 2. Criar Configuração

```bash
npm run csv-config seu-arquivo.csv -- \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica"
```

### 3. Ver Ajuda e Exemplos

```bash
npm run csv-help
```

## ⚡ Recursos de Performance

### ✅ Otimizações Implementadas:

- **Verificação em Lote**: Identifica OJs já cadastrados antes de processar
- **Cache Inteligente**: Evita verificações redundantes
- **Processamento Seletivo**: Processa apenas OJs não cadastrados
- **Timeouts Otimizados**: Velocidade balanceada com estabilidade

### 📊 Para 329 OJs:

- **Tempo Estimado**: 15-30 minutos (dependendo de quantos já existem)
- **Verificação Inicial**: ~2-3 minutos para identificar OJs existentes
- **Processamento**: ~3-5 segundos por OJ novo

## 🛡️ Proteção Contra Erros

### ✅ Recursos de Segurança:

- **Continuidade**: Erros não interrompem o processo
- **Recuperação Automática**: Fecha modais de erro automaticamente
- **Relatório Detalhado**: Registra sucessos, erros e OJs já existentes
- **Backup de Estado**: Mantém progresso mesmo com falhas

## 📋 Exemplo Prático Completo

### Cenário: 329 OJs do TRT15

```bash
# 1. Verificar estrutura do arquivo
npm run csv-preview ojs-trt15.csv

# Saída esperada:
# 📋 PREVIEW DO CSV: ojs-trt15.csv
# 📊 Total de linhas: 330 (329 OJs + cabeçalho)
# 📍 Coluna selecionada: 0 (Orgao Julgador)
# 
# 🔍 CABEÇALHO:
# Orgao Julgador | Codigo | Regiao
# 
# 📄 PRIMEIRAS 10 LINHAS:
# 1. 1ª Vara do Trabalho de São Paulo
# 2. 2ª Vara do Trabalho de São Paulo
# ...

# 2. Executar automação
npm run csv-run ojs-trt15.csv -- \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica"

# Saída esperada:
# 🚀 EXECUTANDO AUTOMAÇÃO DIRETAMENTE DO CSV
# 📋 Importando órgãos de: ojs-trt15.csv
# ✅ 329 órgãos importados com sucesso
# 🔍 Verificando órgãos já cadastrados...
# ⚡ 45 órgãos já cadastrados (pularemos estes)
# 🎯 284 órgãos para processar
# 
# 🤖 Iniciando automação...
# [Progresso em tempo real]
# 
# 🎉 RELATÓRIO FINAL:
# ✅ Adicionados: 280
# ⚠️ Já Incluídos: 45
# ❌ Erros: 4
# 📊 Total Processado: 329
```

## 🔧 Opções Avançadas

### Arquivo sem Cabeçalho

```bash
npm run csv-run arquivo-sem-cabecalho.csv -- \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica" \
  --no-header
```

### OJs em Coluna Diferente

```bash
# Se OJs estão na 3ª coluna (índice 2)
npm run csv-run arquivo.csv -- \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica" \
  --column 2
```

### Arquivo de Configuração Personalizado

```bash
npm run csv-config arquivo.csv -- \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica" \
  --output "config-personalizada.json"

# Depois executar:
ts-node src/automation.ts config-personalizada.json
```

## 📊 Monitoramento

### Logs em Tempo Real:

- ✅ **Verde**: OJ adicionado com sucesso
- ⚠️ **Amarelo**: OJ já existia (pulado)
- ❌ **Vermelho**: Erro ao adicionar OJ
- 🔄 **Azul**: Processando...

### Relatório Final:

```
🎉 AUTOMAÇÃO CONCLUÍDA!

📊 ESTATÍSTICAS:
✅ Sucessos: 280/329 (85.1%)
⚠️ Já Incluídos: 45/329 (13.7%)
❌ Erros: 4/329 (1.2%)

⏱️ TEMPO TOTAL: 18m 32s
📁 Relatório salvo em: relatorio-2024-01-15-14-30.json
```

## 🆘 Solução de Problemas

### Erro: "Coluna não encontrada"

```bash
# Verificar estrutura do CSV
npm run csv-preview seu-arquivo.csv

# Especificar coluna correta
npm run csv-run seu-arquivo.csv -- --column 1
```

### Erro: "Arquivo não encontrado"

```bash
# Usar caminho absoluto
npm run csv-run "/caminho/completo/para/arquivo.csv"
```

### Erro: "Separador não reconhecido"

```bash
# O sistema detecta automaticamente:
# - Vírgula (,)
# - Ponto e vírgula (;)
# - Tab (\t)

# Se necessário, converta seu arquivo para um destes formatos
```

---

## 💡 Dicas de Performance

1. **Execute em horários de menor tráfego** no PJE
2. **Mantenha conexão estável** durante o processo
3. **Use modo headless** para melhor performance (padrão em produção)
4. **Monitore logs** para identificar padrões de erro
5. **Faça backup** do arquivo CSV antes de executar

---

🎯 **Resultado**: Com este sistema, você conseguirá cadastrar seus 329 OJs de forma automatizada, rápida e segura!