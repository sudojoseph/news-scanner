import { News } from "./model";

export  const setInitialValuesForWebsite = async (url) => {
    try {
        const links = await getPageData(url);
        News.create({name: url, links})
    } catch {
        console.error('not able to create news document in db')
    }
};



