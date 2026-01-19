const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  console.log('🔄 Apro pagina ordini...');
  await page.goto('http://localhost:3000/ordini', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // ========== STEP 1: CLIENTE ==========
  console.log('📋 Apro wizard Nuovo Ordine...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Nuovo Ordine')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  console.log('👤 Step 1: Seleziono cliente Mario Rossi...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Mario Rossi')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Avanti
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // ========== STEP 2: PRESCRIZIONE ==========
  console.log('📄 Step 2: Seleziono prescrizione del 15 marzo 2024...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('15 marzo 2024')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Seleziono "Progressiva"
  console.log('   Tipo utilizzo: Progressiva...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Progressiva')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Avanti
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // ========== STEP 3: MONTATURA ==========
  console.log('👓 Step 3: Seleziono montatura Persol PO3007V...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Persol PO3007V')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Avanti
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // ========== STEP 4: LENTI ==========
  console.log('🔵 Step 4: Configuro lenti...');

  // Seleziono Progressiva
  console.log('   Tipo: Progressiva...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Progressiva') && text.includes('200')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 300));

  // Seleziono Organico 1.67
  console.log('   Materiale: Organico 1.67...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('1.67')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 300));

  // Seleziono trattamenti
  console.log('   Trattamenti: Antiriflesso, Blue Control...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Antiriflesso')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 200));

  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Blue Control')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'ordine-step4.png', fullPage: false });

  // Avanti
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  // ========== STEP 5: CONFERMA ==========
  console.log('✅ Step 5: Riepilogo ordine...');

  // Inserisco data consegna
  const dateInput = await page.$('input[type="date"]');
  if (dateInput) {
    await dateInput.type('2026-01-26');
  }
  await new Promise(r => setTimeout(r, 300));

  // Inserisco acconto
  const accontoInputs = await page.$$('input[type="number"]');
  if (accontoInputs.length >= 3) {
    await accontoInputs[2].click({ clickCount: 3 });
    await accontoInputs[2].type('300');
  }
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'ordine-step5-riepilogo.png', fullPage: false });
  console.log('📸 Screenshot riepilogo salvato!');

  // Scroll down per vedere il totale
  await page.evaluate(() => {
    const modal = document.querySelector('[class*="modal"]') || document.querySelector('[role="dialog"]');
    if (modal) modal.scrollTop = modal.scrollHeight;
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'ordine-step5-totale.png', fullPage: false });
  console.log('📸 Screenshot totale salvato!');

  console.log('');
  console.log('✨ ORDINE PRONTO PER LA CONFERMA!');
  console.log('   Cliente: Mario Rossi');
  console.log('   Montatura: Persol PO3007V (220€)');
  console.log('   Lenti: Progressiva 1.67 + Antiriflesso + Blue Control');
  console.log('');
  console.log('🖥️  Browser lasciato aperto - puoi vedere il riepilogo!');
})();
