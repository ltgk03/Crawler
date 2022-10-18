const cheerio = require('cheerio');
const axios = require('axios');
const URL = require('url').URL;

const url = "https://jprp.vn/index.php/JPRP/issue/archive";
var count = 0;
var info2 = [];
function validateURL(urlString) {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
}
async function crawlSeries(url) {
    try {
        const { data } = await axios.get(url);
        const document = cheerio.load(data);
        const listItems = document(".issue-summary .media-body .title");
        const allSeries = [];
        for (const el of listItems) {
           allSeries.push(document(el).attr("href"));
        }
        var next = document(".pager li .next").attr("href");
        if (validateURL(next)) {
            await crawlSeries(next);
        } 
        for (let i = 0; i < allSeries.length; i++) {
            info2 = info2.concat(await crawlPapers(allSeries[i]));
        } 
        return info2;   
    } catch (err) {
        console.error(err);
    }
}

async function crawlPapers(arg) {
    try {
        let info1 = [];
        const {data} = await axios.get(arg);
        const document1 = cheerio.load(data);
        const listItems1 = document1(".article-summary .media-body a:not([class])");
        const allPapers = [];
        for (const el of listItems1) {
            allPapers.push(document1(el).attr("href"));
        }
        for (let j = 0; j < allPapers.length; j++) {
            info1.push(await crawlInfo(allPapers[j]));    
        } 
        console.log(info1);
        return info1;
    } catch (err) {
        console.error(err);
    }    
};
         

async function crawlInfo(arg) {
    try {
        const {data} = await axios.get(arg);
        const document2 = cheerio.load(data);
        count++;
        const info = {
            id: count,
            name: document2(".article-details header h2").text().trim(),
            authors: document2("#authorString").text().trim(),
            publishedDate: document2(".date-published").clone().children().remove().end().text().trim(),
            title: document2(".title").text().trim() 
        }
        return info; 
    } catch (err) {
        console.error(err);
    }    
};

(async function main() {
    const result = await crawlSeries(url);
    console.log(result);
})();

