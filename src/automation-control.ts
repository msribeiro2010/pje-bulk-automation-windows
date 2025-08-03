import fs from 'fs';
import path from 'path';

export interface AutomationControl {
  status: 'running' | 'paused' | 'stopped';
  timestamp: number;
  processId?: string;
}

const CONTROL_FILE = path.join(__dirname, '../data/automation-control.json');

export class AutomationController {
  private processId: string;
  
  constructor(processId: string) {
    this.processId = processId;
    this.initializeControl();
  }
  
  private initializeControl() {
    const control: AutomationControl = {
      status: 'running',
      timestamp: Date.now(),
      processId: this.processId
    };
    
    // Criar diretório se não existir
    const dataDir = path.dirname(CONTROL_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(CONTROL_FILE, JSON.stringify(control, null, 2));
  }
  
  public getStatus(): AutomationControl['status'] {
    try {
      if (!fs.existsSync(CONTROL_FILE)) {
        return 'running';
      }
      
      const control: AutomationControl = JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf-8'));
      return control.status;
    } catch (error) {
      console.warn('Erro ao ler arquivo de controle:', error);
      return 'running';
    }
  }
  
  public async waitIfPaused(): Promise<void> {
    while (this.getStatus() === 'paused') {
      console.log('⏸️ Automação pausada. Aguardando...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  public shouldStop(): boolean {
    return this.getStatus() === 'stopped';
  }
  
  public cleanup() {
    try {
      if (fs.existsSync(CONTROL_FILE)) {
        fs.unlinkSync(CONTROL_FILE);
      }
    } catch (error) {
      console.warn('Erro ao limpar arquivo de controle:', error);
    }
  }
  
  // Métodos estáticos para controle externo
  static pause() {
    try {
      if (fs.existsSync(CONTROL_FILE)) {
        const control: AutomationControl = JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf-8'));
        control.status = 'paused';
        control.timestamp = Date.now();
        fs.writeFileSync(CONTROL_FILE, JSON.stringify(control, null, 2));
        return true;
      }
    } catch (error) {
      console.error('Erro ao pausar automação:', error);
    }
    return false;
  }
  
  static resume() {
    try {
      if (fs.existsSync(CONTROL_FILE)) {
        const control: AutomationControl = JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf-8'));
        control.status = 'running';
        control.timestamp = Date.now();
        fs.writeFileSync(CONTROL_FILE, JSON.stringify(control, null, 2));
        return true;
      }
    } catch (error) {
      console.error('Erro ao retomar automação:', error);
    }
    return false;
  }
  
  static stop() {
    try {
      if (fs.existsSync(CONTROL_FILE)) {
        const control: AutomationControl = JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf-8'));
        control.status = 'stopped';
        control.timestamp = Date.now();
        fs.writeFileSync(CONTROL_FILE, JSON.stringify(control, null, 2));
        return true;
      }
    } catch (error) {
      console.error('Erro ao parar automação:', error);
    }
    return false;
  }
  
  static getStatus(): AutomationControl | null {
    try {
      if (fs.existsSync(CONTROL_FILE)) {
        return JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf-8'));
      }
    } catch (error) {
      console.error('Erro ao obter status:', error);
    }
    return null;
  }
}