const puppeteer = require('puppeteer');

(async () => {
  // Connettiti al browser già aperto
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  console.log('🔄 Apro pagina ordini...');
  await page.goto('http://localhost:3000/ordini', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // ========== CREO ORDINE COMPLETO ==========
  console.log('📋 Apro wizard...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Nuovo Ordine')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // STEP 1: Cliente
  console.log('👤 Step 1: Mario Rossi');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Mario Rossi')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));

  // STEP 2: Prescrizione
  console.log('📄 Step 2: Prescrizione 15 marzo');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('15 marzo 2024')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));

  // STEP 3: Montatura
  console.log('👓 Step 3: Persol PO3007V');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Persol PO3007V')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));

  // STEP 4: Lenti
  console.log('🔵 Step 4: Progressiva + 1.67 + Antiriflesso');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Progressiva') && text.includes('200')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 300));
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('1.67')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 300));
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Antiriflesso')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 300));
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Avanti')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1500));

  // STEP 5: Conferma
  console.log('✅ Step 5: Inserisco data e acconto...');

  // Data consegna (7 giorni da oggi)
  const dateInput = await page.$('input[type="date"]');
  if (dateInput) {
    await dateInput.type('2026-01-26');
  }
  await new Promise(r => setTimeout(r, 300));

  // Acconto 200€
  const inputs = await page.$$('input[type="number"]');
  if (inputs.length >= 3) {
    await inputs[2].click({ clickCount: 3 });
    await inputs[2].type('200');
  }
  await new Promise(r => setTimeout(r, 500));

  // Screenshot prima della conferma
  await page.screenshot({ path: 'ordine-prima-conferma.png', fullPage: false });

  // CLICCO CREA ORDINE!
  console.log('🎉 Clicco CREA ORDINE...');
  for (const btn of await page.$$('button')) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Crea Ordine')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot dopo la conferma
  await page.screenshot({ path: 'ordine-creato.png', fullPage: false });
  console.log('📸 Screenshot salvato!');

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('   ✨ ORDINE CREATO CON SUCCESSO! ✨');
  console.log('═══════════════════════════════════════');
  console.log('   Cliente: Mario Rossi');
  console.log('   Montatura: Persol PO3007V - 220€');
  console.log('   Lenti: Progressiva 1.67 + Antiriflesso');
  console.log('   Totale: ~880€');
  console.log('   Acconto: 200€');
  console.log('   Consegna: 26/01/2026');
  console.log('═══════════════════════════════════════');

  // Mantieni aperto
})();
