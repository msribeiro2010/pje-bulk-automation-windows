#!/usr/bin/env ts-node

import { Command } from 'commander';
import { importOrgaosFromCSV, createConfigFromCSV, previewCSV } from './csv-importer';
import path from 'path';
import fs from 'fs';

const program = new Command();

program
  .name('csv-cli')
  .description('CLI para importar órgãos julgadores de arquivos CSV')
  .version('1.0.0');

// Comando para preview do CSV
program
  .command('preview')
  .description('Visualizar preview de um arquivo CSV')
  .argument('<csv-file>', 'Caminho para o arquivo CSV')
  .option('-c, --column <number>', 'Índice da coluna dos OJs (padrão: 0)', '0')
  .option('--no-header', 'Arquivo não possui cabeçalho')
  .option('-l, --lines <number>', 'Número de linhas para preview (padrão: 10)', '10')
  .action((csvFile, options) => {
    try {
      const columnIndex = parseInt(options.column);
      const previewLines = parseInt(options.lines);
      const hasHeader = options.header !== false;
      
      previewCSV(csvFile, columnIndex, hasHeader, previewLines);
    } catch (error) {
      console.error('❌ Erro:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Comando para criar configuração a partir do CSV
program
  .command('create-config')
  .description('Criar arquivo de configuração JSON a partir de CSV')
  .argument('<csv-file>', 'Caminho para o arquivo CSV')
  .requiredOption('--cpf <cpf>', 'CPF do servidor')
  .requiredOption('--perfil <perfil>', 'Perfil a ser usado (ex: Magistrado, Servidor, Perito)')
  .requiredOption('--url <url>', 'URL do PJE')
  .option('-c, --column <number>', 'Índice da coluna dos OJs (padrão: 0)', '0')
  .option('--no-header', 'Arquivo não possui cabeçalho')
  .option('-o, --output <path>', 'Caminho de saída do arquivo de configuração')
  .action((csvFile, options) => {
    try {
      const columnIndex = parseInt(options.column);
      const hasHeader = options.header !== false;
      
      const configPath = createConfigFromCSV(
        csvFile,
        options.cpf,
        options.perfil,
        options.url,
        options.output,
        columnIndex,
        hasHeader
      );
      
      console.log(`\n🎉 Configuração criada com sucesso!`);
      console.log(`📁 Arquivo: ${configPath}`);
      
    } catch (error) {
      console.error('❌ Erro:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Comando para executar automação diretamente do CSV
program
  .command('run')
  .description('Executar automação diretamente de um arquivo CSV')
  .argument('<csv-file>', 'Caminho para o arquivo CSV')
  .requiredOption('--cpf <cpf>', 'CPF do servidor')
  .requiredOption('--perfil <perfil>', 'Perfil a ser usado (ex: Magistrado, Servidor, Perito)')
  .requiredOption('--url <url>', 'URL do PJE')
  .option('-c, --column <number>', 'Índice da coluna dos OJs (padrão: 0)', '0')
  .option('--no-header', 'Arquivo não possui cabeçalho')
  .action(async (csvFile, options) => {
    try {
      const columnIndex = parseInt(options.column);
      const hasHeader = options.header !== false;
      
      console.log('🚀 EXECUTANDO AUTOMAÇÃO DIRETAMENTE DO CSV\n');
      
      // Criar configuração temporária
      const tempConfigPath = createConfigFromCSV(
        csvFile,
        options.cpf,
        options.perfil,
        options.url,
        undefined,
        columnIndex,
        hasHeader
      );
      
      console.log('\n🤖 Iniciando automação...');
      
      // Executar automação
      const { spawn } = require('child_process');
      const automationProcess = spawn('ts-node', ['src/automation.ts', tempConfigPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      automationProcess.on('close', (code: number) => {
        // Limpar arquivo temporário
        try {
          fs.unlinkSync(tempConfigPath);
          console.log('🧹 Arquivo temporário removido');
        } catch (cleanupError) {
          console.log('⚠️ Não foi possível remover arquivo temporário:', tempConfigPath);
        }
        
        if (code === 0) {
          console.log('\n🎉 Automação concluída com sucesso!');
        } else {
          console.log(`\n❌ Automação finalizada com código: ${code}`);
          process.exit(code);
        }
      });
      
    } catch (error) {
      console.error('❌ Erro:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Comando para importar apenas os OJs (sem executar automação)
program
  .command('import')
  .description('Importar órgãos julgadores de um arquivo CSV')
  .argument('<csv-file>', 'Caminho para o arquivo CSV')
  .option('-c, --column <number>', 'Índice da coluna dos OJs (padrão: 0)', '0')
  .option('--no-header', 'Arquivo não possui cabeçalho')
  .action((csvFile, options) => {
    try {
      const columnIndex = parseInt(options.column);
      const hasHeader = options.header !== false;
      
      const result = importOrgaosFromCSV(csvFile, columnIndex, hasHeader);
      
      console.log('\n📋 ÓRGÃOS IMPORTADOS:');
      result.orgaos.forEach((orgao, index) => {
        console.log(`${index + 1}. ${orgao}`);
      });
      
    } catch (error) {
      console.error('❌ Erro:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Comando de ajuda com exemplos
program
  .command('examples')
  .description('Mostrar exemplos de uso')
  .action(() => {
    console.log(`
📚 EXEMPLOS DE USO:
`);
    
    console.log('1️⃣ Visualizar preview de um arquivo CSV:');
    console.log('   npx ts-node src/csv-cli.ts preview meus-ojs.csv\n');
    
    console.log('2️⃣ Criar configuração a partir de CSV:');
    console.log('   npx ts-node src/csv-cli.ts create-config meus-ojs.csv \\');
    console.log('     --cpf "123.456.789-00" \\');
    console.log('     --perfil "Magistrado" \\');
    console.log('     --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica"\n');
    
    console.log('3️⃣ Executar automação diretamente do CSV:');
    console.log('   npx ts-node src/csv-cli.ts run meus-ojs.csv \\');
    console.log('     --cpf "123.456.789-00" \\');
    console.log('     --perfil "Magistrado" \\');
    console.log('     --url "https://pje.trt15.jus.br/pjekz/pessoa-fisica"\n');
    
    console.log('4️⃣ Especificar coluna diferente (ex: coluna 2):');
    console.log('   npx ts-node src/csv-cli.ts preview meus-ojs.csv --column 1\n');
    
    console.log('5️⃣ Arquivo sem cabeçalho:');
    console.log('   npx ts-node src/csv-cli.ts preview meus-ojs.csv --no-header\n');
    
    console.log('📋 FORMATO DO CSV:');
    console.log('   - Separadores suportados: vírgula (,), ponto e vírgula (;), tab');
    console.log('   - Primeira linha pode ser cabeçalho (padrão: sim)');
    console.log('   - Coluna padrão dos OJs: 0 (primeira coluna)');
    console.log('   - Exemplo:');
    console.log('     Orgao Julgador,Codigo');
    console.log('     "1ª Vara do Trabalho de São Paulo",001');
    console.log('     "2ª Vara do Trabalho de São Paulo",002\n');
  });

program.parse();