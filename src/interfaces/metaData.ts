interface MetaData {
    pageTitle: string;
    description: string;
    author: string;
    keywords: string;
    ogImage: string;
    ogMetas: {
        name: string;
        value: string;
    }[];
    twitterMetas: {
        name: string;
        value: string;
    }[];
}

export default MetaData;
