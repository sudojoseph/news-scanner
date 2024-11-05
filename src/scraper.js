import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

puppeteer.use(AdblockerPlugin());

export const getPageData = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    const links = await page.evaluate(() => {
        const anchorTags = document.querySelectorAll('a');
        return Array.from(anchorTags).map(anchor => ({
            href: anchor.href,
            innerText: anchor.innerText.trim()
        }));
    });

    await browser.close();
    return links;
};
