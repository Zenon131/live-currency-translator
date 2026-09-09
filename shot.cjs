const { chromium } = require('/tmp/node_modules/playwright');

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	await page.goto('http://localhost:5199', { waitUntil: 'networkidle' });
	await page.waitForTimeout(1500);
	await page.screenshot({ path: 'app-current.png' });
	await browser.close();
	console.log('done');
})();
