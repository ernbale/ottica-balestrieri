const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/ordini', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Clicca su "Nuovo Ordine" - cerco il pulsante con il testo
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Nuovo Ordine')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'wizard-step1.png', fullPage: false });
  console.log('Screenshot Step 1 (Cliente) salvato');

  // Clicco su Mario Rossi
  const clientItems = await page.$$('button');
  for (const item of clientItems) {
    const text = await item.evaluate(el => el.textContent);
    if (text && text.includes('Mario Rossi')) {
      await item.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'wizard-step1-selected.png', fullPage: false });
  console.log('Screenshot Step 1 con cliente selezionato');

  // Clicco Avanti
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'wizard-step2.png', fullPage: false });
  console.log('Screenshot Step 2 (Prescrizione) salvato');

  // Clicco sulla prima prescrizione
  const prescButtons = await page.$$('button');
  for (const btn of prescButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('15 marzo 2024')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Avanti a Step 3
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'wizard-step3.png', fullPage: false });
  console.log('Screenshot Step 3 (Montatura) salvato');

  // Seleziono una montatura
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Ray-Ban RB5154')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Avanti a Step 4
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'wizard-step4.png', fullPage: false });
  console.log('Screenshot Step 4 (Lenti) salvato');

  console.log('Tutti gli screenshot salvati!');
  // Mantieni browser aperto
})();
