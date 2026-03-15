# RehabApp Mobile - Quick Start (Testing)

Get RehabApp running on Android in minutes for testing and development.

## 30-Second Setup

```bash
# 1. Install dependencies
npm install

# 2. Start web server
npm run mobile:serve

# 3. Visit in browser
# Open: http://localhost:3000/
# Or your local IP: http://192.168.x.x:3000/
```

**That's it!** The app is now running with full mobile functionality.

## Test on Different Devices

### Computer Browser (Fastest for Testing)

1. Start the server: `npm run mobile:serve`
2. Open Chrome/Edge/Firefox
3. Press **F12** to open DevTools
4. Press **Ctrl+Shift+M** to toggle device mode
5. Select iPhone, Pixel phone, or tablet from dropdown
6. Test the UI and functionality

### Android Emulator

1. Open Android Studio → Device Manager
2. Start an emulator (Pixel 4 recommended)
3. Run: `npm run mobile:sync`
4. In Android Studio: Click Run to install app
5. Navigate the app in emulator

### Physical Android Phone

1. Connect phone via USB
2. Enable USB Debugging (Settings → Developer Options → USB Debugging)
3. Run: `npm run mobile:sync`
4. In Android Studio: Select your phone and click Run
5. App installs and opens automatically

## What Works on Mobile

✅ Login/Authentication
✅ Dashboard (responsive cards)
✅ Patient Management
✅ Staff Management
✅ Finance Tracking
✅ Reports
✅ Admin Panel
✅ Real-time updates (Socket.IO)
✅ Responsive menus
✅ Touch-optimized buttons
✅ Works offline (PWA)

## Common Adjustments

### Connect to Different Backend Server

Edit `index_react.html` and find the Socket.IO connection:

```javascript
// Find this line (around line 2050)
const socket = io('http://127.0.0.1:3001');

// Change to your IP/port:
const socket = io('http://192.168.1.100:3001');
```

### Run on Different Port

```bash
# Instead of default 3000, use 3002
PORT=3002 npm run mobile:serve
```

### Test Dark Mode

1. On your device: Settings → Display → Dark mode
2. Refresh app - it adapts automatically

### Test Landscape Mode

Rotate your phone - layout adjusts automatically

## Troubleshooting

**Can't reach server from phone?**
- Make sure phone is on same WiFi network
- Use your computer's IP address (run `ipconfig` on Windows)
- Example: `http://192.168.1.50:3000/`

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Use different port
PORT=3100 npm run mobile:serve
```

**App not updating?**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Clear browser cache: DevTools → Network → "Disable cache" checkbox
- Restart server: Ctrl+C then re-run `npm run mobile:serve`

**Socket.IO not connecting?**
- Check server is running: `npm run serve` or `npm run start-server`
- Verify IP address in connection string
- Check firewall isn't blocking port 3001

## Browser Testing Tools

### Chrome DevTools
1. Press F12
2. Click device toggle icon (Ctrl+Shift+M)
3. Select devices from dropdown
4. Test different screen sizes
5. Check Performance tab for optimization

### Network Throttling (Simulate Slow Connection)
1. DevTools → Network tab
2. Click throttle dropdown (Default is "No Throttling")
3. Select "Slow 3G" to test mobile network conditions

### Mobile Viewport Sizes

| Device | Size | Notes |
|--------|------|-------|
| iPhone 12 | 390x844 | Portrait |
| iPhone 12 | 844x390 | Landscape |
| Pixel 5 | 393x851 | Portrait |
| Pixel 5 | 851x393 | Landscape |
| iPad | 810x1080 | Portrait |
| iPad | 1080x810 | Landscape |

## Next: Build for Distribution

Once testing is complete:

```bash
# Build Android APK for distribution
npm run mobile:sync
npx cap build android --release
```

See `MOBILE_BUILD_GUIDE.md` for full distribution setup.

## Performance Tips for Mobile

1. **Minimize Data Usage**
   - Check Network tab in DevTools
   - Aim for <5MB initial load

2. **Fast Load Time**
   - Target <3 seconds on slow 3G
   - Use Chrome DevTools Performance tab

3. **Battery Optimization**
   - Avoid excessive animation
   - Use requestAnimationFrame
   - Close unused sockets

4. **Storage**
   - Clear unused data
   - Use localStorage for preferences
   - Cache data locally when possible

## Command Reference

```bash
# Start development server
npm run mobile:serve

# Sync to Android project
npm run mobile:sync

# Build full Android app
npm run mobile:build

# Open Android Studio
start android              # Windows
open android -a Android\ Studio  # Mac
```

---

**Ready to build?** See [MOBILE_BUILD_GUIDE.md](./MOBILE_BUILD_GUIDE.md)
