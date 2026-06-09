const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Error')) {
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
  
  const content = await page.content();
  if (content.includes('client-side exception')) {
    console.log('ERROR IS IN THE DOM! React crashed completely.');
  }
  
  await browser.close();
})();
