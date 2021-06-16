import chai, { expect } from 'chai';
import express, { Express, Request, Response } from 'express';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import PageReader, { MetaData } from '../src';
import ChaiHttp = require('chai-http');

/* Tests */
chai.use(ChaiHttp);

describe('index.ts', (): void => {
    let exp: Express;
    let httpServer: http.Server;
    let outServer: http.Server;

    before(async (): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const outServerDefault: any = require('../test/server');
        outServer = outServerDefault.default;

        exp = express();
        const port: number = 3001;

        exp.set('port', port);

        httpServer = http.createServer(exp);

        exp.get('/expect-success', async (req: Request, res: Response): Promise<void> => {
            const metaData: MetaData = await PageReader.getMetaData({
                ...req,
                protocol: 'http',
                headers: {
                    ...req.headers,
                    host: 'localhost:3000'
                },
                originalUrl: '/with-meta'
            } as Request);

            res.json(metaData);
            res.end();
        });

        exp.get('/expect-fail', async (req: Request, res: Response): Promise<void> => {
            const metaData: MetaData = await PageReader.getMetaData({
                ...req,
                protocol: 'http',
                headers: {
                    ...req.headers,
                    host: 'localhost:3000'
                },
                originalUrl: '/without-meta'
            } as Request);

            res.json(metaData);
            res.end();
        });

        exp.get('/expect-notfound', async (req: Request, res: Response): Promise<void> => {
            const metaData: MetaData = await PageReader.getMetaData({
                ...req,
                protocol: 'http',
                headers: {
                    ...req.headers,
                    host: 'localhost:4000'
                },
                originalUrl: '/without-meta'
            } as Request);

            res.json(metaData);
            res.end();
        });

        return new Promise<void>((
            resolve: () => void
        ): void => {
            httpServer.listen(port, (): void => {
                resolve();
            });
        });
    });

    after(async (): Promise<void> => new Promise<void>((
        resolve: () => void
    ): void => {
        outServer.close((): void => {
            httpServer.close((): void => {
                resolve();
            });
        });
    }));

    it('1. getMetaData', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).get('/expect-success');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.exist;
        expect(res.body).to.have.property('pageTitle').not.empty;
        expect(res.body).to.have.property('description').not.empty;
        expect(res.body).to.have.property('author').not.empty;
        expect(res.body).to.have.property('keywords').not.empty;
        expect(res.body).to.have.property('ogImage').not.empty;
        expect(res.body).to.have.property('ogMetas').not.empty;
        expect(res.body).to.have.property('twitterMetas').not.empty;
    });

    it('2. getMetaData', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).get('/expect-fail');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.exist;
        expect(res.body).to.have.property('pageTitle').not.empty;
        expect(res.body).to.not.have.property('description');
        expect(res.body).to.not.have.property('author');
        expect(res.body).to.not.have.property('keywords');
        expect(res.body).to.not.have.property('ogImage');
        expect(res.body).to.have.property('ogMetas').empty;
        expect(res.body).to.have.property('twitterMetas').empty;
    });

    it('2. getMetaData', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).get('/expect-notfound');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.exist;
        expect(res.body).to.be.deep.eq({});
    });

    it('3. getMetaData', async (): Promise<void> => {
        let readError: any;

        try {
            await PageReader.getMetaData(undefined);
        }
        catch (err) {
            readError = err;
        }

        expect(readError).to.exist;
        expect(readError.message).to.be.eq('Invalid request to get data.');
    });
});
