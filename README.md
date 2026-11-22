# QueueLess – Frontend

React + Vite frontend for the QueueLess queue management system.
The backend (Spring Boot) lives in the `QueueManagement-Backend` repository and runs on port **8081**.

## Run on your computer

1. Start the backend first (IntelliJ → run `BackendApplication`, or `mvn spring-boot:run`).
2. In this folder:

   ```bash
   npm install        # first time, or after package.json changes
   npm run dev
   ```

3. Open **https://localhost:5173**

The dev server forwards `/api`, `/ws` (WebSocket) and `/uploads` to the backend
(`VITE_PROXY_TARGET`, default `http://localhost:8081`), so no extra configuration is needed.

### One-time: remove the "Not secure" warning

The dev server uses HTTPS with a certificate from a local certificate authority (mkcert),
created automatically the first time you run `npm run dev`. To make this computer trust it:

```bash
npm run trust-cert
```

Windows asks *"Do you want to install this certificate?"* – click **Yes**, then restart the browser.
(To undo: `npm run trust-cert -- --uninstall`.)

## Run on a phone (same Wi‑Fi)

Camera (QR scanner) and push notifications require HTTPS, which is why the dev server uses it.

1. Phone and computer must be on the **same Wi‑Fi**.
2. Run `npm run dev` and note the **Network** address it prints, e.g. `https://192.168.29.48:5173`.
3. **Install the development certificate on the phone once:**
   - Open `https://<computer-IP>:5173/dev-ca.crt` on the phone. The browser warns about the
     connection the first time – choose *Advanced → Proceed* to download `queueless-dev-ca.crt`.
   - **Android:** Settings → Security (or "Security & privacy") → More security settings →
     Encryption & credentials → **Install a certificate → CA certificate** → pick the downloaded file.
   - **iPhone:** after downloading, open Settings → *Profile Downloaded* → **Install**.
     Then Settings → General → About → **Certificate Trust Settings** → turn on full trust for
     the "mkcert" certificate.
4. Open `https://<computer-IP>:5173` – it now shows a normal lock icon, and the QR scanner can use the camera.

Without installing the certificate the app still works on the phone after accepting the browser
warning, and QR codes can always be scanned with the **upload image / take photo** option in the scanner.

If the computer's IP changes (e.g. after a router restart), the certificate is regenerated
automatically on the next `npm run dev`; the phone does not need the certificate again.

## Configuration

Copy `.env.example` to `.env` and fill in as needed:

| Variable | Purpose |
| --- | --- |
| `VITE_PROXY_TARGET` | Backend URL for the dev proxy (default `http://localhost:8081`) |
| `VITE_DEV_HTTPS` | `false` to run the dev server on plain HTTP |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (pricing pages) |
| `VITE_FIREBASE_*` | Firebase config for push notifications (optional) |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (HTTPS, port 5173) |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint |
| `npm run trust-cert` | Trust the local development certificate on this computer |
