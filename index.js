
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';
import { getPageData } from './src/scraper.js';
import { News } from './src/model.js';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

// bot.sendMessage('-4500276754','hoi')

app.get('/health', (req, res) => {
    res.send('Server is up and running');
});

function sendReminderForServiceExpiring() {
    console.log('Reminder for expiring service sent!') 
  }

  const newSsiteArray = [
    'https://www.ynetnews.com',
    'https://www.jpost.com',
    'https://www.i24news.tv/en'
  ]

  const prepTelegramMessage = (linkArray) => {
    return linkArray.map(link => link.innerText + '\n' + link.href + '\n').join('');
  };

  cron.schedule('*/15 * * * *', async () => { 
    newSsiteArray.map(async url => {
      try {
        const links = await getPageData(url);
        compareAndReturnUpdates(url, links);  
      } catch (error) {
        console.log(`❌ Error - not able to update for ${url}: ${error.message}`);
      }
    });
  });

  
  const PORT = process.env.PORT || 5000;
  
  const connectToDatabase = async () => {
    console.log('trying to connect')
    try {
      await mongoose.connect(process.env.MONGO_DB_URL);
      const db = mongoose.connection;
      db.on('error', (error) => console.error('❌ Error connecting to database:', error));
      db.once('open', () => console.log('Connected to DB 📦'));
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  };
  
  connectToDatabase();
  
  const setInitialValuesForWebsite = async (url) => {
    // connectToDatabase();
    
    const links = await getPageData(url);
    News.create({ name: url, links });
  };
  
  function findNewLinks(array1, array2) {
    const hrefsInArray1 = new Set(array1.map(link => link.href));
    
    const newLinks = array2.filter(link => !hrefsInArray1.has(link.href));
    return newLinks;
  }
  
//   function findNewLinks(array1, array2) {
//     const hrefsInArray1 = new Set(array1.map(link => link.href));

//     const newLinks = array2.filter(link => !hrefsInArray1.has(link.href));

//     return newLinks;
// }

  const compareAndReturnUpdates = async (name, newLinks) => {
    const savedNewsObject = await News.findOne({name: name});
    if (!savedNewsObject) {
      return;
    }
    const newNewsItems = findNewLinks(savedNewsObject.links, newLinks);
    if (newNewsItems.length) {
      const telegramText = prepTelegramMessage(newNewsItems);
      bot.sendMessage('-4500276754',telegramText)
      savedNewsObject.links.push(...newNewsItems);
      savedNewsObject.save();
    }
  }

//   compareAndReturnUpdates('https://www.ynetnews.com');

// newSsiteArray.map(url => setInitialValuesForWebsite(url)
// )
    // setInitialValuesForWebsite('https://www.i24news.tv/en');
    // setInitialValuesForWebsite('https://www.ynetnews.com');
    // setInitialValuesForWebsite('https://www.jpost.com');
    // setInitialValuesForWebsite('https://www.telegraaf.nl');
    // setInitialValuesForWebsite('https://www.nos.nl');




app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});