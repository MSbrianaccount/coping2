RehabApp - LAN Hosting & PWA

This file explains how to serve RehabApp on a local network (LAN) and enable PWA/installable features.

1) Install dependencies required for serving (once):

```powershell
npm install express minimist --save
```

2) Start the static server (host listens on all interfaces by default):

```powershell
npm run serve
# or specify host/port
npm run serve-host -- --host 192.168.1.10 --port 3000
```

3) From another device on the same Wi‑Fi, open: `http://<host-ip>:3000/index_react.html`

4) PWA: On supported mobile browsers you can "Add to Home screen". A service worker and `manifest.webmanifest` are included.

5) Electron packaging: Use the existing `npm run build` (electron-builder) to produce platform installers. Ensure `build` config in `package.json` is adjusted for your needs.

Notes:
- The server serves the project directory; ensure the host machine firewall allows incoming connections on the chosen port.
- This is for local network use only.
