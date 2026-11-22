// Makes this computer trust the local development certificate authority (CA) created by
// vite-plugin-mkcert, so https://localhost:5173 shows a normal lock icon instead of "Not secure".
//
// Usage:  npm run trust-cert      (run `npm run dev` once first so the CA exists)
//
// On Windows a security dialog asks you to confirm installing the certificate: click "Yes".
// To stop trusting it later:  npm run trust-cert -- --uninstall
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const caDir = path.join(os.homedir(), '.vite-plugin-mkcert');
const mkcert = path.join(caDir, process.platform === 'win32' ? 'mkcert.exe' : 'mkcert');
const rootCa = path.join(caDir, 'rootCA.pem');

if (!fs.existsSync(mkcert) || !fs.existsSync(rootCa)) {
  console.error('The development certificate has not been created yet.');
  console.error('Run "npm run dev" once (it creates it), stop it, then run "npm run trust-cert" again.');
  process.exit(1);
}

const uninstall = process.argv.includes('--uninstall');
const result = spawnSync(mkcert, [uninstall ? '-uninstall' : '-install'], {
  stdio: 'inherit',
  env: { ...process.env, CAROOT: caDir },
});

if (result.status === 0) {
  console.log(uninstall
    ? '\nThe development CA is no longer trusted by this computer.'
    : '\nDone. Restart your browser, then open https://localhost:5173');
  if (!uninstall) {
    console.log(`To use the app on a phone, install this CA file on the phone: ${rootCa}`);
    console.log('(or open https://<this-PC-IP>:5173/dev-ca.crt on the phone; see README)');
  }
}
process.exit(result.status ?? 1);
