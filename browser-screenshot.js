const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/ordini', { waitUntil: 'networkidle0' });

  // Aspetta che la pagina sia caricata
  await page.waitForSelector('button');

  // Screenshot
  await page.screenshot({ path: 'ordini-page.png', fullPage: true });

  console.log('Screenshot salvato: ordini-page.png');

  // Clicca su "Nuovo Ordine"
  const nuovoOrdineBtn = await page.$('button:has-text("Nuovo Ordine")');
  if (nuovoOrdineBtn) {
    await nuovoOrdineBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'wizard-step1.png', fullPage: true });
    console.log('Screenshot wizard: wizard-step1.png');
  }

  // Mantieni il browser aperto
  // await browser.close();
})();
