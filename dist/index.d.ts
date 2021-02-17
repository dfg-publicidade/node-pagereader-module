import { Request } from 'express';
import MetaData from './interfaces/metaData';
declare class PageReader {
    static getMetaData(req: Request): Promise<MetaData>;
}
export default PageReader;
export { MetaData };
