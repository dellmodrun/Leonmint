"""HTTPS helper for the CA updater on Windows."""
import json
import sys
import urllib.error
import urllib.request

request_data = json.load(sys.stdin)
payload = request_data.get('body')
body = json.dumps(payload).encode('utf-8') if payload is not None else None
request = urllib.request.Request(
    request_data['url'], data=body,
    headers=request_data.get('headers', {}),
    method=request_data.get('method', 'GET'),
)
try:
    with urllib.request.urlopen(request, timeout=15) as response:
        content = response.read()
        result = {'status': response.status, 'data': json.loads(content) if content else None}
except urllib.error.HTTPError as error:
    result = {'status': error.code, 'data': None}
except Exception as error:
    result = {'status': 0, 'error': type(error).__name__}
json.dump(result, sys.stdout)
