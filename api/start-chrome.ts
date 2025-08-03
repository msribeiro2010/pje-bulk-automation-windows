import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Caminho para o script de inicialização do Chrome
        const scriptPath = path.join(process.cwd(), 'start-chrome-debug.sh');
        
        // Verificar se o script existe
        if (!fs.existsSync(scriptPath)) {
            return res.status(500).json({ 
                success: false, 
                error: 'Script start-chrome-debug.sh não encontrado' 
            });
        }

        // Executar o script
        const child = spawn('bash', [scriptPath], {
            detached: true,
            stdio: 'ignore'
        });

        // Desanexar o processo para que continue rodando
        child.unref();

        // Aguardar um pouco para verificar se o processo iniciou corretamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar se o Chrome está rodando na porta 9222
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch('http://localhost:9222/json/version', {
                timeout: 3000
            });
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    // Resposta JSON válida
                    const data = await response.json();
                    return res.status(200).json({ 
                        success: true, 
                        message: 'Chrome iniciado com sucesso em modo debug',
                        debugUrl: 'http://localhost:9222',
                        version: data
                    });
                } else {
                    // Resposta não é JSON, mas Chrome está rodando
                    return res.status(200).json({ 
                        success: true, 
                        message: 'Chrome iniciado com sucesso em modo debug',
                        debugUrl: 'http://localhost:9222'
                    });
                }
            } else {
                throw new Error('Chrome não respondeu na porta 9222');
            }
        } catch (fetchError) {
            return res.status(500).json({ 
                success: false, 
                error: 'Chrome foi iniciado mas não está respondendo na porta 9222. Aguarde alguns segundos e tente novamente.' 
            });
        }

    } catch (error) {
        console.error('Erro ao iniciar Chrome:', error);
        return res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
        });
    }
}