# 📋 Como Cadastrar 329 OJs de um Arquivo CSV

Este guia mostra como usar o sistema de importação CSV para cadastrar múltiplos órgãos julgadores de forma automatizada.

## 🚀 Métodos Disponíveis

### Método 1: Execução Direta (Recomendado)

```bash
# Executar automação diretamente do CSV
npx ts-node src/csv-cli.ts run seu-arquivo.csv \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica"
```

### Método 2: Criar Configuração e Executar

```bash
# 1. Criar arquivo de configuração
npx ts-node src/csv-cli.ts create-config seu-arquivo.csv \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica"

# 2. Executar automação com a configuração criada
npx ts-node src/automation.ts data/config-from-csv.json
```

## 📁 Formato do Arquivo CSV

### Exemplo de CSV Válido:

```csv
Orgao Julgador,Codigo,Regiao
"1ª Vara do Trabalho de São Paulo",001,SP
"2ª Vara do Trabalho de São Paulo",002,SP
"3ª Vara do Trabalho de São Paulo",003,SP
"1ª Vara do Trabalho de Campinas",004,SP
```

### Separadores Suportados:
- Vírgula (`,`)
- Ponto e vírgula (`;`)
- Tab (`\t`)

## 🔍 Comandos Úteis

### 1. Visualizar Preview do CSV

```bash
# Ver as primeiras 10 linhas
npx ts-node src/csv-cli.ts preview seu-arquivo.csv

# Ver as primeiras 20 linhas
npx ts-node src/csv-cli.ts preview seu-arquivo.csv --lines 20

# Especificar coluna diferente (ex: coluna 2)
npx ts-node src/csv-cli.ts preview seu-arquivo.csv --column 1
```

### 2. Importar Apenas os OJs (sem executar)

```bash
npx ts-node src/csv-cli.ts import seu-arquivo.csv
```

### 3. Ver Exemplos de Uso

```bash
npx ts-node src/csv-cli.ts examples
```

## ⚙️ Opções Avançadas

### Arquivo sem Cabeçalho

```bash
npx ts-node src/csv-cli.ts run seu-arquivo.csv \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica" \
  --no-header
```

### Especificar Coluna dos OJs

```bash
# Se os OJs estão na 3ª coluna (índice 2)
npx ts-node src/csv-cli.ts run seu-arquivo.csv \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica" \
  --column 2
```

### Especificar Arquivo de Saída

```bash
npx ts-node src/csv-cli.ts create-config seu-arquivo.csv \
  --cpf "123.456.789-00" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica" \
  --output "minha-config-personalizada.json"
```

## 🎯 Exemplo Prático para 329 OJs

Supondo que você tenha um arquivo `329-ojs.csv` com os órgãos julgadores:

```bash
# 1. Primeiro, visualize o arquivo para confirmar o formato
npx ts-node src/csv-cli.ts preview 329-ojs.csv

# 2. Execute a automação diretamente
npx ts-node src/csv-cli.ts run 329-ojs.csv \
  --cpf "SEU-CPF-AQUI" \
  --perfil "Magistrado" \
  --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica"
```

## 📊 O que Acontece Durante a Execução

1. **Importação**: O sistema lê o CSV e extrai os 329 OJs
2. **Verificação em Lote**: Verifica quais OJs já estão cadastrados
3. **Processamento Otimizado**: Processa apenas os OJs não cadastrados
4. **Relatório**: Gera relatório detalhado com:
   - OJs adicionados com sucesso
   - OJs que já existiam ("Já Incluído")
   - OJs com erro
   - Estatísticas finais

## 🛡️ Recursos de Proteção

- **Cache Inteligente**: Evita verificações redundantes
- **Tratamento de Erros**: Continua processamento mesmo com erros
- **Recuperação Automática**: Fecha modais de erro automaticamente
- **Timeouts Otimizados**: Velocidade balanceada com estabilidade

## 📝 Logs e Relatórios

Todos os resultados são salvos em:
- **Console**: Progresso em tempo real
- **Arquivo de Relatório**: Detalhes completos da execução
- **Estatísticas**: Resumo final com contadores

---

💡 **Dica**: Para arquivos muito grandes, o sistema automaticamente otimiza o processo, verificando em lote quais OJs já existem antes de tentar cadastrá-los.