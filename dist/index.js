"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const puppeteer_1 = __importDefault(require("puppeteer"));
/* Module */
const debug = debug_1.default('module:page-reader');
class PageReader {
    static async getMetaData(req) {
        const browser = await puppeteer_1.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        const url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
        debug(`Searching for: ${url}`);
        await page.goto(url);
        debug('Page found. Reading...');
        await page.waitForSelector('head > title');
        debug('Reading content...');
        const pageTitle = await page.title();
        let description;
        try {
            description = await page.$eval('head > meta[name="description"]', (meta) => meta.content);
        }
        catch (err) {
            debug('Meta description not found');
        }
        let author;
        try {
            author = await page.$eval('head > meta[name="author"]', (meta) => meta.content);
        }
        catch (err) {
            debug('Meta author not found');
        }
        let keywords;
        try {
            keywords = await page.$eval('head > meta[name="keywords"]', (meta) => meta.content);
        }
        catch (err) {
            debug('Meta keywords not found');
        }
        let ogMetas = [];
        try {
            ogMetas = await page.$$eval('head > meta[property^="og:"]', (metas) => metas.map((meta) => ({
                name: meta.getAttribute('property'),
                value: meta.content
            })));
        }
        catch (err) {
            debug('Meta og not found');
        }
        let ogImage;
        for (const meta of ogMetas) {
            if (meta.name === 'og:image') {
                ogImage = meta.value;
            }
        }
        let twitterMetas = [];
        try {
            twitterMetas = await page.$$eval('head > meta[property^="twitter:"]', (metas) => metas.map((meta) => ({
                name: meta.getAttribute('property'),
                value: meta.content
            })));
        }
        catch (err) {
            debug('Meta twitter not found');
        }
        browser.close();
        return Promise.resolve({
            pageTitle, description, author, keywords, ogImage, ogMetas, twitterMetas
        });
    }
}
exports.default = PageReader;
