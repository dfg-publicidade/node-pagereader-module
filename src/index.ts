import appDebugger from 'debug';
import { Request } from 'express';
import puppeteer, { Browser, Page } from 'puppeteer';
import MetaData from './interfaces/metaData';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:page-reader');

class PageReader {
    public static async getMetaData(req: Request): Promise<MetaData> {
        const browser: Browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page: Page = await browser.newPage();

        const url: string = `${req.protocol}://${req.headers.host}${req.originalUrl}`;

        debug(`Searching for: ${url}`);

        await page.goto(url);

        debug('Page found. Reading...');

        await page.waitForSelector('head > title');

        debug('Reading content...');

        const pageTitle: string = await page.title();

        let description: string;
        try {
            description = await page.$eval('head > meta[name="description"]', (meta: any): any => meta.content);
        }
        catch (err: any) {
            debug('Meta description not found');
        }

        let author: string;
        try {
            author = await page.$eval('head > meta[name="author"]', (meta: any): any => meta.content);
        }
        catch (err: any) {
            debug('Meta author not found');
        }

        let keywords: string;
        try {
            keywords = await page.$eval('head > meta[name="keywords"]', (meta: any): any => meta.content);
        }
        catch (err: any) {
            debug('Meta keywords not found');
        }

        let ogMetas: any[] = [];
        try {
            ogMetas = await page.$$eval('head > meta[property^="og:"]', (metas: any): any => metas.map((meta: any): any => ({
                name: meta.getAttribute('property'),
                value: meta.content
            })));
        }
        catch (err: any) {
            debug('Meta og not found');
        }

        let ogImage: string;
        for (const meta of ogMetas) {
            if (meta.name === 'og:image') {
                ogImage = meta.value;
            }
        }

        let twitterMetas: any[] = [];
        try {
            twitterMetas = await page.$$eval('head > meta[property^="twitter:"]', (metas: any): any => metas.map((meta: any): any => ({
                name: meta.getAttribute('property'),
                value: meta.content
            })));
        }
        catch (err: any) {
            debug('Meta twitter not found');
        }

        browser.close();

        return Promise.resolve({
            pageTitle, description, author, keywords, ogImage, ogMetas, twitterMetas
        });
    }
}

export default PageReader;
export { MetaData };
