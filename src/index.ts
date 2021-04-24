import appDebugger from 'debug';
import { Request } from 'express';
import puppeteer, { Browser, Page } from 'puppeteer';
import MetaData from './interfaces/metaData';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:page-reader');

class PageReader {
    public static async getMetaData(req: Request): Promise<MetaData> {
        if (!req || !req.protocol || !req.headers.host) {
            return Promise.reject(new Error('Invalid request to get data.'))
        }

        const browser: Browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page: Page = await browser.newPage();

        const url: string = `${req.protocol}://${req.headers.host}${req.originalUrl}`;

        debug(`Searching for: ${url}`);

        await page.goto(url);

        debug('Page found. Reading...');

        await page.waitForSelector('head>title');

        debug('Reading content...');

        const pageTitle: string = await page.title();

        let description: string;
        try {
            /* istanbul ignore next */
            description = await page.$eval('head>meta[name="description"]', (meta: any): any => meta.content);
        }
        catch (err: any) {
            debug(err.message);
        }

        let author: string;
        try {
            /* istanbul ignore next */
            author = await page.$eval('head>meta[name="author"]', (meta: any): any => meta.content);
        }
        catch (err: any) {
            debug(err.message);
        }

        let keywords: string;
        try {
            /* istanbul ignore next */
            keywords = await page.$eval('head>meta[name="keywords"]', (meta: any): any => meta.content);
        }
        catch (err: any) {
            debug(err.message);
        }

        /* istanbul ignore next */
        const ogMetas: any[] = await page.$$eval('head>meta[property^="og:"]', (metas: any): any => metas.map((meta: any): any => ({
            name: meta.getAttribute('property'),
            value: meta.content
        })));

        let ogImage: string;
        for (const meta of ogMetas) {
            if (meta.name === 'og:image') {
                ogImage = meta.value;
            }
        }

        /* istanbul ignore next */
        const twitterMetas: any[] = await page.$$eval('head>meta[property^="twitter:"]', (metas: any): any => metas.map((meta: any): any => ({
            name: meta.getAttribute('property'),
            value: meta.content
        })));

        browser.close();

        return Promise.resolve({
            pageTitle, description, author, keywords, ogImage, ogMetas, twitterMetas
        });
    }
}

export default PageReader;
export { MetaData };
