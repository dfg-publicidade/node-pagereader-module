import appDebugger from 'debug';
import puppeteer, { Browser, Page } from 'puppeteer';
import MetaData from './interfaces/metaData';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:page-reader');

class PageReader {
    public static async getMetaData(url: string): Promise<MetaData> {
        if (!url) {
            return Promise.reject(new Error('Invalid request to get data.'));
        }

        const browser: Browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page: Page = await browser.newPage();

        let pageTitle: string;
        let description: string;
        let author: string;
        let keywords: string;
        let ogMetas: any[];
        let ogImage: string;
        let twitterMetas: any[];

        try {
            debug(`Searching for: ${url}`);

            await page.goto(url);

            debug('Page found. Reading...');

            await page.waitForSelector('head>title');

            debug('Reading content...');

            pageTitle = await page.title();

            try {
                /* istanbul ignore next */
                description = await page.$eval('head>meta[name="description"]', (meta: any): any => meta.content);
            }
            catch (err: any) {
                debug(err.message);
            }

            try {
                /* istanbul ignore next */
                author = await page.$eval('head>meta[name="author"]', (meta: any): any => meta.content);
            }
            catch (err: any) {
                debug(err.message);
            }

            try {
                /* istanbul ignore next */
                keywords = await page.$eval('head>meta[name="keywords"]', (meta: any): any => meta.content);
            }
            catch (err: any) {
                debug(err.message);
            }

            /* istanbul ignore next */
            ogMetas = await page.$$eval('head>meta[property^="og:"]', (metas: any): any => metas.map((meta: any): any => ({
                name: meta.getAttribute('property'),
                value: meta.content
            })));

            for (const meta of ogMetas) {
                if (meta.name === 'og:image') {
                    ogImage = meta.value;
                }
            }

            /* istanbul ignore next */
            twitterMetas = await page.$$eval('head>meta[property^="twitter:"]', (metas: any): any => metas.map((meta: any): any => ({
                name: meta.getAttribute('property'),
                value: meta.content
            })));
        }
        catch (err: any) {
            debug(err.message);
        }

        page.close();
        browser.close();

        return Promise.resolve({
            pageTitle, description, author, keywords, ogImage, ogMetas, twitterMetas
        });
    }
}

export default PageReader;
export { MetaData };
