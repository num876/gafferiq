const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Error') || msg.text().includes('Exception')) {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });
  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  await page.goto('http://localhost:3002/onboarding/manager');
  
  await page.evaluate(() => {
    sessionStorage.setItem('gaffer_iq_onboarding_manager', JSON.stringify({
      firstName: 'Test',
      lastName: 'Manager',
      reputation: 60,
      attributes: { tactical: 10, motivation: 10, youth: 10, discipline: 10, negotiation: 10 }
    }));
    sessionStorage.setItem('gaffer_iq_onboarding_club_id', 'barcelona');
  });

  await page.goto('http://localhost:3002/onboarding/squad-review', { waitUntil: 'networkidle0' });
  
  // Wait for the Confirm button
  console.log('Clicking confirm...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Confirm'));
    if (confirmBtn) confirmBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Going to dashboard...');
  await page.goto('http://localhost:3002/game/dashboard', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  if (content.includes('Something went wrong')) {
    console.log('ERROR IS IN THE DOM! React crashed completely.');
  } else {
    console.log('Dashboard loaded without crashing');
  }
  
  await browser.close();
})();
