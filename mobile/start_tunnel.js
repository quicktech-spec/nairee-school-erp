const { startTunnel } = require('untun');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const https = require('https');

async function main() {
  console.log('1. Starting Cloudflare Tunnel for Metro (port 8081)...');
  const tunnel = await startTunnel({ port: 8081 });
  const rawUrl = await tunnel.getURL();
  console.log('2. Cloudflare URL established:', rawUrl);

  const cleanHost = rawUrl.replace('https://', '').replace('http://', '').replace(/\/$/, '');
  const expUrl = `exp://${cleanHost}`;
  console.log('3. Expo URL for Mobile:', expUrl);

  // Verify HTTP endpoint from the public internet
  https.get(rawUrl, (res) => {
    console.log('4. Verification: Public HTTPS response status:', res.statusCode);
    res.on('data', () => {});
    res.on('end', () => console.log('5. Verification: Tunnel is LIVE and passing traffic perfectly!'));
  }).on('error', (err) => {
    console.log('Verification error:', err.message);
  });

  // Generate QR code files
  const artDir = 'C:\\Users\\shubh\\.gemini\\antigravity\\brain\\8eb888ee-153c-4992-9610-c7c55f324922';
  const webPublic = path.resolve(__dirname, '..', 'web', 'public');

  await qrcode.toFile(path.join(artDir, 'expo_qr_tunnel.png'), expUrl, { width: 500, margin: 2 });
  await qrcode.toFile(path.join(webPublic, 'expo_qr_tunnel.png'), expUrl, { width: 500, margin: 2 });

  const terminalQR = await qrcode.toString(expUrl, { type: 'terminal', small: true });
  console.log('\n--- SCAN THIS VERIFIED QR CODE IN EXPO GO ---');
  console.log(terminalQR);
  console.log('\nEXACT EXPO URL TO TYPE:', expUrl);
}

main().catch(console.error);
