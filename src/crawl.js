const cheerio = require('cheerio');
const axios = require('axios');
const url = "https://tcnhikhoa.vn/index.php/tcnk/issue/archive";
var count = 0;

function getAllData(URLs) {
    return Promise.all(URLs.map(fetchData));
}
function fetchData(URL) {
    return axios.get(URL)
    .then(function(response) {return cheerio.load(response.data)})
    .catch(function(err) {console.error(err)});
}
async function crawl(url) {
    try {
        const infos = [];
        const { data } = await axios.get(url);
        const mainPage = cheerio.load(data);
        const childPageLinks = mainPage(".media-body .title").map((idx, el) => {
            return mainPage(el).attr("href");
        }).toArray();
        const childPages = await getAllData(childPageLinks).then((res) => {return res});
        for (let childPage of childPages) {
            const newspaperLinks = childPage(".media-body").map((idx, el) => {
                return childPage(el).find('a').attr("href");
            }).toArray();
            const newspapers = await getAllData(newspaperLinks).then((res) => {return res});
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

const isValidUrl = urlString=> {
    try { 
        return Boolean(new URL(urlString)); 
    }
    catch(e){ 
        return false; 
    }
}

run(url);

module.exports = {
    run: run,
    isValidUrl: isValidUrl
}


// async function crawlPapers(url) {
//     try {
//         const infos = []
//         const { data } = await axios.get(url);
//         const document = cheerio.load(data);
//         const allLinks = document(".media-body").map((idx, el)=> {
//             return document(el).find('a').attr("href");
//         }).toArray();
//         for (let link of allLinks) {
//             infos.push(await crawlInfo(link));
//         }
//         // allLinks.forEach((link) => { 
//         //    crawlInfo(link);  
//         // }); 
//         return infos;
//       } catch (err) {
//        console.error(err);
//       }
// };
// async function crawlInfo(url) {
//     try {
//         const { data } = await axios.get(url);
//         const document = cheerio.load(data);
//         let authors = [];
//         document('meta[name="citation_author"]').each((idx, el) => {
//             authors.push(document(el).prop('content'));
//         });
//         authors.join(', ');
//         const info = {
//             'id' : ++count,
//             'title' : document('meta[name="citation_title"]').prop('content'),
//             'authors' : authors.join(', '),
//             'date' : document('meta[name="citation_date"]').prop('content'),
//             'series' : `Tập ${document('meta[name="citation_volume"]').prop('content')} S. ${document('meta[name="citation_issue"]').prop('content')}`
//         }
//         return info;
//         //console.log(info);
//     } catch (err) {
//           console.error(err);
//     }   
// };
// async function run(url) {
//     var startTime = performance.now();
//     const infos = await crawlSeries(url);
//     var endTime = performance.now();
//     console.log(endTime - startTime);
//     console.log(infos);
// }
// run(url);

