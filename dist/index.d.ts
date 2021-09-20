import MetaData from './interfaces/metaData';
declare class PageReader {
    static getMetaData(url: string): Promise<MetaData>;
}
export default PageReader;
export { MetaData };
