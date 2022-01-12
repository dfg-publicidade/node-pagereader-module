import express, { Express, Request, Response } from 'express';
import fs from 'fs/promises';
import http from 'http';

const exp: Express = express();
const port: number = 3000;

exp.set('port', port);

const httpServer: http.Server = http.createServer(exp);

exp.get('/with-meta', async (req: Request, res: Response): Promise<void> => {
    res.header({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'text/html'
    });
    res.write(await fs.readFile(__dirname + '/with-meta.html', 'utf-8'));
    res.end();
});

exp.get('/without-meta', async (req: Request, res: Response): Promise<void> => {
    res.header({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'text/html'
    });
    res.write(await fs.readFile(__dirname + '/without-meta.html', 'utf-8'));
    res.end();
});

httpServer.on('listening', (): void => {
    const addr: any = httpServer.address();
    // eslint-disable-next-line no-console
    console.log(`Ouvindo ${addr.port}`);
});

httpServer.listen(port);

export default httpServer;
