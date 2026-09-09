const { chromium } = require('/tmp/node_modules/playwright');

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

	// Collect console errors
	page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });
	page.on('pageerror', e => console.log('PAGE ERROR:', e.message));

	await page.goto('http://localhost:5199', { waitUntil: 'networkidle' });
	await page.waitForTimeout(2000);

	const audit = await page.evaluate(() => {
		const results = [];

		// Check body/html colors
		const body = document.body;
		const bs = getComputedStyle(body);
		results.push(`BODY bg: ${bs.backgroundColor}`);

		// Find all elements and check computed styles
		const walk = (el, depth) => {
			if (depth > 4) return;
			const s = getComputedStyle(el);
			const r = el.getBoundingClientRect();
			if (r.width === 0 && r.height === 0) return;
			const visible = s.display !== 'none';
			if (!visible) return;
			const cls = el.className && typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join('.') : '';
			results.push(`${'  '.repeat(depth)}<${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}> ${Math.round(r.width)}x${Math.round(r.height)} @(${Math.round(r.left)},${Math.round(r.top)}) color:${s.color} bg:${s.backgroundColor === 'rgba(0, 0, 0, 0)' ? 'transparent' : s.backgroundColor}`);
			for (const c of el.children) walk(c, depth + 1);
		};
		walk(document.querySelector('main') || body, 0);

		// Text content check
		results.push('--- TEXT CONTENT ---');
		results.push(body.innerText.replace(/\n+/g, ' | '));

		return results.join('\n');
	});
	console.log(audit);
	await browser.close();
})();
