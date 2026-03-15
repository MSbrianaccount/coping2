# RehabApp Mobile Build Guide - Android

This guide explains how to build and run RehabApp on Android devices.

## Prerequisites

Before you start, ensure you have:

1. **Android Development Environment**
   - Android Studio (latest version) - [Download](https://developer.android.com/studio)
   - Android SDK (API level 24 or higher)
   - Android NDK
   - Java Development Kit (JDK 11 or higher)

2. **Node.js & npm**
   - Node.js v16+ - [Download](https://nodejs.org/)
   - npm (comes with Node.js)

3. **Capacitor CLI**
   ```bash
   npm install -g @capacitor/cli@5
   ```

## Installation & Setup

### 1. Install Project Dependencies

```bash
cd c:\Users\HP\Desktop\RehabApp
npm install
```

### 2. Install Additional Mobile Packages

The Capacitor and mobile plugin packages are already in `package.json`. To install them:

```bash
npm install
```

### 3. Initialize Capacitor Android Project

```bash
npx cap add android
```

This creates an `android/` folder with the native Android project.

## Development Setup

### Option A: Web Development (Recommended First)

Test the mobile UI in your web browser before building for Android:

```bash
npm run mobile:serve
```

Then visit: `http://localhost:3000/`

• Use Chrome DevTools to simulate mobile:
  - Press `F12` to open DevTools
  - Press `Ctrl+Shift+M` to toggle device mode
  - Select iPhone or Android device from the dropdown

### Option B: Android Emulator

1. **Open Android Studio**
   - Go to Tools → Device Manager
   - Create a virtual device (Pixel 4 or higher recommended)
   - Start the emulator

2. **Sync Files to Android Project**

```bash
npm run mobile:sync
```

This copies your web files to the Android app.

3. **Open Android Studio with the Project**

```bash
# On Windows (from the RehabApp folder)
start android
```

4. **Build and Run**

In Android Studio:
- Click "Run" button (green play icon)
- Select your emulator or connected device
- Wait for build and installation to complete

## Building for Distribution

### Create Release Build

```bash
# Sync latest code
npm run mobile:sync

# Build release APK
npx cap build android --release
```

The APK will be generated at: `android/app/release/app-release.apk`

### Digital Signing (Required for Google Play)

1. Create a keystore (if you don't have one):

```bash
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias rehabapp
```

2. Configure signing in `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file('release.keystore')
        storePassword 'your_store_password'
        keyAlias 'rehabapp'
        keyPassword 'your_key_password'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

3. Build signed APK:

```bash
cd android
./gradlew assembleRelease
```

## Installing on Physical Android Device

### Option 1: USB Connection

1. Enable Developer Mode on your Android device:
   - Settings → About Phone
   - Tap "Build Number" 7 times
   - Enable "USB Debugging"

2. Connect device via USB cable

3. In Android Studio:
   - Select your device from device dropdown
   - Click "Run" button

### Option 2: Generate APK and Share

```bash
npm run mobile:sync
npx cap build android
```

Transfer the APK file to your Android device and install it.

## Troubleshooting

### Issue: Port 3000 Already in Use

Change the port in `mobile-server.js`:

```bash
PORT=3001 npm run mobile:serve
```

Or kill existing process:

```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use lsof on Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Issue: Socket.IO Connection Fails on Device

Make sure your Android device can reach your development machine:

1. Find your computer's IP:
   ```powershell
   ipconfig
   ```
   Look for IPv4 Address (e.g., 192.168.1.x)

2. Update socket connection in app code to:
   ```javascript
   const socket = io('http://192.168.1.x:3001');
   ```

### Issue: CORS Errors

The server already has CORS enabled. If errors persist:

1. Check `mobile-server.js` has CORS configuration
2. Verify Socket.IO is running on correct port
3. Check Android firewall settings

### Issue: Gradle Build Fails

```bash
cd android
./gradlew clean
./gradlew build
```

### Issue: Service Worker Not Loading

Service Worker requires HTTPS in production. For development:
- App runs in secure context on mobile
- Web version uses HTTP locally

## Project Structure

```
RehabApp/
├── android/                    # Native Android project (Capacitor)
│   ├── app/src/
│   └── gradle files
├── index_react.html           # Main app HTML
├── style_react.css            # All CSS (responsive)
├── src/                       # React components & logic
├── mobile-server.js           # Web server for mobile
├── capacitor.config.json      # Capacitor configuration
├── manifest.webmanifest       # PWA manifest
├── service-worker.js          # Service worker for offline
└── package.json              # Dependencies
```

## Mobile Features Enabled

✅ **Responsive Design** - Works on all mobile sizes
✅ **Touch Optimized** - 44px minimum tap targets
✅ **Safe Area Support** - Notches and margins
✅ **Dark Mode Support** - System theme preference
✅ **PWA Features** - Install as app, offline support
✅ **Socket.IO** - Real-time updates
✅ **Camera Access** - Via Capacitor plugin (if needed)
✅ **Geolocation** - Via Capacitor plugin (if needed)

## Testing Checklist

- [ ] Login works on mobile
- [ ] Navigation responsive
- [ ] Forms fill correctly on touch
- [ ] All buttons are 44px+ height
- [ ] No horizontal scrolling
- [ ] Text is readable
- [ ] Images scale properly
- [ ] Socket.IO connects
- [ ] Works in portrait and landscape

## Performance Tips

1. **Minimize Bundle Size**
   ```bash
   npm audit
   npm prune --production
   ```

2. **Enable Compression** in mobile-server.js
   ```javascript
   app.use(compression());
   ```

3. **Cache Static Assets** via Service Worker

4. **Optimize Images** - Use WebP format when possible

## Next Steps

- [ ] Test on physical Android device
- [ ] Publish to Google Play Store
- [ ] Submit to app store marketing data
- [ ] Monitor app analytics
- [ ] Gather user feedback

## Support & Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Development Guide](https://developer.android.com/guide)
- [Angular/React Mobile Best Practices](https://web.dev/mobile-web-specialist/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## Quick Commands Reference

```bash
# Development
npm run mobile:serve          # Start web server
npm run mobile:sync          # Sync code to Android
npm run mobile:build         # Build Android APK

# From Android directory
cd android
./gradlew assembleDebug      # Build debug APK
./gradlew assembleRelease    # Build release APK
./gradlew installDebug       # Install on connected device
```

---

**Need Help?** Check the troubleshooting section or refer to the official Capacitor docs.
