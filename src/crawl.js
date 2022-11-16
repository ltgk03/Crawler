const cheerio = require('cheerio');
const axios = require('axios');
const url = "https://jprp.vn/index.php/JPRP/issue/archive";
var count = 0;

// function getAllData(URLs) {
//     return Promise.all(URLs.map(fetchData));
// }
// function fetchData(URL) {
//     return axios.get(URL)
//     .then((response) => {return response.data})
//     .catch((err) => {console.error(err)});
// }
async function crawl(url) {
    try {
        const infos = [];
        const { data } = await axios.get(url);
        const mainPage = cheerio.load(data);
        const childPageLinks = mainPage(".media-body .title").map((idx, el) => {
            return mainPage(el).attr("href");
        }).toArray();
        const childPages = await axios.all(childPageLinks.map((link) => {
            return axios.get(link).then((result) => {return cheerio.load(result.data)}).catch((err) => console.error(err));
        }));
        // const childPages = await (await getAllData(childPageLinks)).map(el => cheerio.load(el));
        for (let childPage of childPages) {
            const newspaperLinks = childPage(".media-body").map((idx, el) => {
                return childPage(el).find('a').attr("href");
            }).toArray();
            const newspapers = await axios.all(newspaperLinks.map((link) => {
                return axios.get(link).then((result) => {return cheerio.load(result.data)}).catch((err) => console.error(err));
            }));
            //const newspapers = await (await getAllData(newspaperLinks)).map(el => cheerio.load(el));
            for (let news of newspapers) {
                let authors = [];
                news('meta[name="citation_author"]').each((idx, el) => {
                    authors.push(news(el).prop('content'));
                });
                const info = {
                    'id' : ++count,
                    'title' : news('meta[name="citation_title"]').prop('content'),
                    'authors' : authors.join(', '),
                    'date' : news('meta[name="citation_date"]').prop('content'),
                    'series' : `Tập ${news('meta[name="citation_volume"]').prop('content')} S. ${news('meta[name="citation_issue"]').prop('content')}`
                } 
                infos.push(info);  
             }
        }
        return infos;
    } catch (err) {
        console.error(err);
    }
}

async function run(url) {
    var startTime = performance.now();
    const infos = await crawl(url);
    var endTime = performance.now();
    console.log(endTime - startTime);
    return infos;
}
const isValidUrl = urlString => {
    try { 
        return Boolean(new URL(urlString)); 
    }
    catch(e){ 
        return false; 
    }
}
module.exports = {
    run: run,
    isValidUrl: isValidUrl
}
