const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  await page.goto('http://localhost:3001/onboarding/manager');
  
  // Set the session storage values that the user would have set
  await page.evaluate(() => {
    sessionStorage.setItem('gaffer_iq_onboarding_manager', JSON.stringify({
      firstName: 'Test',
      lastName: 'Manager',
      reputation: 60,
      attributes: { tactical: 10, motivation: 10, youth: 10, discipline: 10, negotiation: 10 }
    }));
    sessionStorage.setItem('gaffer_iq_onboarding_club_id', 'barcelona');
  });

  // Navigate to squad review
  await page.goto('http://localhost:3001/onboarding/squad-review', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
