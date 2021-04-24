import express, { Express, Request, Response } from 'express';
import fs from 'fs-extra';
import http from 'http';
import ChaiHttp = require('chai-http');

let exp: Express;
let httpServer: http.Server;

exp = express();
const port: number = 3000;

exp.set('port', port);

httpServer = http.createServer(exp);

exp.get('/with-meta', async (req: Request, res: Response): Promise<void> => {
    res.header({
        'Content-Type': 'text/html'
    });
    res.write(fs.readFileSync(__dirname + '/with-meta.html', 'utf-8'));
    res.end();
});

exp.get('/without-meta', async (req: Request, res: Response): Promise<void> => {
    res.header({
        'Content-Type': 'text/html'
    });
    res.write(fs.readFileSync(__dirname + '/without-meta.html', 'utf-8'));
    res.end();
});

httpServer.on('listening', (): void => {
    const addr: any = httpServer.address();
    console.log(`Ouvindo ${addr.port}`);
});

httpServer.listen(port);

export default httpServer;