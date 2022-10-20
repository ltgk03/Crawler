const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const url = "https://tapchiyhocvietnam.vn/index.php/vmj/issue/archive";
var count = 0;
function validateURL(urlString) {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
}
function resetFile() {
    fs.writeFileSync('cache.json', "", (err) => {
        console.error(err);
    });
}
async function crawlSeries(url, resetFile) {
    try {
        resetFile();
        const { data } = await axios.get(url);
        const document = cheerio.load(data);
        const listItems = document(".media-body .title");
        const allLinks = [];
        listItems.each((idx, el) => {
          const link = document(el).attr("href");
          allLinks.push(link);
        });
        allLinks.forEach((link) => { 
          crawlPapers(link);  
        });  
      } catch (err) {
       console.error(err);
    }
}

async function crawlPapers(url) {
    try {
        const { data } = await axios.get(url);
        const document = cheerio.load(data);
        const listItems = document(".media-body");
        const allLinks = [];
        listItems.each((idx, el) => {
          let link;
          link = document(el).find('a').attr("href");
          allLinks.push(link);
        });
        allLinks.forEach((link) => { 
           crawlInfo(link);  
        }); 
      } catch (err) {
       console.error(err);
      }
};
async function crawlInfo(url) {
    try {
        const { data } = await axios.get(url);
        const document = cheerio.load(data);
        let authors = [];
        document('meta[name="citation_author"]').each((idx, el) => {
            authors.push(document(el).prop('content'));
        });
        authors.join(', ');
        const info = {
            'id' : ++count,
            'title' : document('meta[name="citation_title"]').prop('content'),
            'authors' : authors.join(', '),
            'date' : document('meta[name="citation_date"]').prop('content'),
            'series' : `Tập ${document('meta[name="citation_volume"]').prop('content')} S. ${document('meta[name="citation_issue"]').prop('content')}`
        }
        fs.appendFileSync('cache.json', await JSON.stringify(info) + '\n', (err) => {
            console.log(err);
        });
    } catch (err) {
          console.error(err);
    }   
};

crawlSeries(url, resetFile);

