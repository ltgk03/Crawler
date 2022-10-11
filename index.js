const cheerio = require('cheerio');
const exceljs = require('exceljs');
const axios = require('axios');

const url = "https://jprp.vn/index.php/JPRP/issue/archive";
var db = [];

async function scrapeData(db) {
  try {
    const { data } = await axios.get(url);
    const document = cheerio.load(data);
    
    const listItems = document(".media-body a");
    const allLinks = [];
    listItems.each((idx, el) => {
      const link = document(el).attr("href");
      allLinks.push(link);
    });
    allLinks.forEach((link) => { 
      scrapeDataFromChaper(link);  
    });  
  } catch (err) {
   console.error(err);
  }
}

async function scrapeDataFromChaper(url) {
    try {
      const { data } = await axios.get(url);
      const document = cheerio.load(data);
     
      const listItems = document(".media-body a").filter(function() {
        return (document(this).text().trim() != 'PDF' && document(this).text().trim() != 'PDF (English)');
      });
      const allLinks = [];
      listItems.each((idx, el) => {
        let link;
        
        link = document(el).attr("href");
        
        allLinks.push(link);
      });
      allLinks.forEach((link) => { 
          scrapeDataFromReport(link);  
      });
      
    } catch (err) {
     console.error(err);
    }
  }

  async function scrapeDataFromReport(url) {
    try {
      
      // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(url);
    
    const document = cheerio.load(data);
    const info = { 
        newsName : document(".article-details header h2").text().trim(),
        authors : document("#authorString").text().trim(),
        Date : document(".date-published").text().trim().slice(document(".date-published").text().trim().lastIndexOf('\t') + 1),
        newsNumber : document(".title").text().trim()
    } 
    console.log(info);
    
  } catch (err) {
        console.error(err);
    }
  }
// Invoke the above function
scrapeData(db);



