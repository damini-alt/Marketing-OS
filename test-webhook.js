async function testWebhook() {
  const url = 'https://studio.pucho.ai/api/v1/webhooks/qVWDqaMYW5kHaoYOxGi2o';
  const data = {
    campaign_name: 'Test Node Campaign',
    campaign_type: 'test',
    budget: 1000,
    test: true
  };
  console.log('Sending to', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}
testWebhook();
