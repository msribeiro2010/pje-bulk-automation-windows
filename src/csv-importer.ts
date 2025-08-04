import fs from 'fs';
import path from 'path';

interface CSVImportResult {
  orgaos: string[];
  totalLinhas: number;
  linhasValidas: number;
  linhasIgnoradas: number;
}

/**
 * Importa órgãos julgadores de um arquivo CSV
 * @param csvFilePath Caminho para o arquivo CSV
 * @param columnIndex Índice da coluna que contém os OJs (padrão: 0)
 * @param hasHeader Se o arquivo tem cabeçalho (padrão: true)
 * @returns Resultado da importação com lista de órgãos
 */
export function importOrgaosFromCSV(
  csvFilePath: string, 
  columnIndex: number = 0, 
  hasHeader: boolean = true
): CSVImportResult {
  console.log(`📂 Importando OJs do arquivo: ${csvFilePath}`);
  
  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`Arquivo CSV não encontrado: ${csvFilePath}`);
  }
  
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
  
  console.log(`📊 Total de linhas no arquivo: ${lines.length}`);
  
  let startIndex = hasHeader ? 1 : 0;
  const orgaos: string[] = [];
  let linhasIgnoradas = 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Suporte para diferentes separadores (vírgula, ponto e vírgula, tab)
    let columns: string[];
    if (line.includes(';')) {
      columns = line.split(';');
    } else if (line.includes('\t')) {
      columns = line.split('\t');
    } else {
      columns = line.split(',');
    }
    
    // Limpar aspas e espaços
    columns = columns.map(col => col.trim().replace(/^"|"$/g, ''));
    
    if (columnIndex < columns.length) {
      const orgao = columns[columnIndex].trim();
      
      if (orgao && orgao.length > 0) {
        orgaos.push(orgao);
        console.log(`✓ Linha ${i + 1}: ${orgao}`);
      } else {
        linhasIgnoradas++;
        console.log(`⚠️ Linha ${i + 1}: vazia ou inválida`);
      }
    } else {
      linhasIgnoradas++;
      console.log(`⚠️ Linha ${i + 1}: coluna ${columnIndex} não encontrada`);
    }
  }
  
  const result: CSVImportResult = {
    orgaos,
    totalLinhas: lines.length,
    linhasValidas: orgaos.length,
    linhasIgnoradas
  };
  
  console.log(`\n📊 RESULTADO DA IMPORTAÇÃO:`);
  console.log(`📋 Total de linhas: ${result.totalLinhas}`);
  console.log(`✅ Linhas válidas: ${result.linhasValidas}`);
  console.log(`⚠️ Linhas ignoradas: ${result.linhasIgnoradas}`);
  console.log(`🏛️ Órgãos importados: ${result.orgaos.length}`);
  
  return result;
}

/**
 * Cria um arquivo de configuração JSON a partir de um CSV
 * @param csvFilePath Caminho para o arquivo CSV
 * @param cpf CPF do servidor
 * @param perfil Perfil a ser usado
 * @param pjeUrl URL do PJE
 * @param outputPath Caminho de saída (opcional)
 * @param columnIndex Índice da coluna dos OJs (padrão: 0)
 * @param hasHeader Se tem cabeçalho (padrão: true)
 * @returns Caminho do arquivo de configuração criado
 */
export function createConfigFromCSV(
  csvFilePath: string,
  cpf: string,
  perfil: string,
  pjeUrl: string,
  outputPath?: string,
  columnIndex: number = 0,
  hasHeader: boolean = true
): string {
  const importResult = importOrgaosFromCSV(csvFilePath, columnIndex, hasHeader);
  
  const config = {
    cpf,
    perfil,
    pjeUrl,
    orgaos: importResult.orgaos
  };
  
  const configPath = outputPath || path.join(
    path.dirname(csvFilePath), 
    `config-${path.basename(csvFilePath, '.csv')}-${Date.now()}.json`
  );
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(`\n💾 Arquivo de configuração criado: ${configPath}`);
  console.log(`🚀 Para executar a automação, use:`);
  console.log(`   npm run automation "${configPath}"`);
  
  return configPath;
}

/**
 * Valida um arquivo CSV e mostra preview dos dados
 * @param csvFilePath Caminho para o arquivo CSV
 * @param columnIndex Índice da coluna dos OJs (padrão: 0)
 * @param hasHeader Se tem cabeçalho (padrão: true)
 * @param previewLines Número de linhas para preview (padrão: 10)
 */
export function previewCSV(
  csvFilePath: string,
  columnIndex: number = 0,
  hasHeader: boolean = true,
  previewLines: number = 10
): void {
  console.log(`🔍 PREVIEW DO ARQUIVO CSV: ${csvFilePath}`);
  
  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`Arquivo CSV não encontrado: ${csvFilePath}`);
  }
  
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
  
  console.log(`📊 Total de linhas: ${lines.length}`);
  
  if (hasHeader && lines.length > 0) {
    console.log(`\n📋 CABEÇALHO:`);
    const headerLine = lines[0];
    let headerColumns: string[];
    
    if (headerLine.includes(';')) {
      headerColumns = headerLine.split(';');
    } else if (headerLine.includes('\t')) {
      headerColumns = headerLine.split('\t');
    } else {
      headerColumns = headerLine.split(',');
    }
    
    headerColumns.forEach((col, index) => {
      const marker = index === columnIndex ? ' ← SELECIONADA' : '';
      console.log(`   ${index}: ${col.trim().replace(/^"|"$/g, '')}${marker}`);
    });
  }
  
  console.log(`\n📋 PREVIEW DOS DADOS (${Math.min(previewLines, lines.length - (hasHeader ? 1 : 0))} linhas):`);
  
  const startIndex = hasHeader ? 1 : 0;
  const endIndex = Math.min(startIndex + previewLines, lines.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i];
    let columns: string[];
    
    if (line.includes(';')) {
      columns = line.split(';');
    } else if (line.includes('\t')) {
      columns = line.split('\t');
    } else {
      columns = line.split(',');
    }
    
    columns = columns.map(col => col.trim().replace(/^"|"$/g, ''));
    
    if (columnIndex < columns.length) {
      const orgao = columns[columnIndex];
      console.log(`   ${i + 1}: ${orgao}`);
    } else {
      console.log(`   ${i + 1}: ⚠️ Coluna ${columnIndex} não encontrada`);
    }
  }
  
  if (lines.length > endIndex) {
    console.log(`   ... e mais ${lines.length - endIndex} linhas`);
  }
}