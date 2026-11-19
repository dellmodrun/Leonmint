from playwright.sync_api import sync_playwright
import json
import time

MINT = '11111111111111111111111111111111'
URL = 'http://127.0.0.1:4176/'

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
    for route in ('', 'coins/'):
        page = browser.new_page()
        requests = [0]
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def mock_ca(request):
            requests[0] += 1
            mint = MINT if requests[0] > 1 else None
            request.fulfill(status=200, content_type='application/json', body=json.dumps([{'mint': mint}]))

        page.route('**/rest/v1/leonmint_ca?**', mock_ca)
        started = time.monotonic()
        page.goto(URL + route, wait_until='domcontentloaded')
        page.wait_for_function("document.documentElement.dataset.leonmintCa === 'live'", timeout=15000)
        page.get_by_text(MINT, exact=False).first.wait_for(timeout=5000)
        elapsed = time.monotonic() - started
        print(f'{route or "home"}: {requests[0]} CA reads, visible after {elapsed:.2f}s, errors={errors[:2]}')
        assert requests[0] >= 2
        assert elapsed < 8
        assert not errors
        page.close()
    browser.close()
