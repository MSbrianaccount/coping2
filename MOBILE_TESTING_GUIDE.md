# Mobile Testing Guide - RehabApp

Complete step-by-step guide to test RehabApp mobile features.

## Phase 1: Quick Browser Test (5 minutes)

This is the fastest way to verify mobile features work.

### Step 1: Start the Server

```bash
cd c:\Users\HP\Desktop\RehabApp
npm run mobile:serve
```

You should see:
```
========================================
RehabApp Mobile Web Server
========================================
Web App running at: http://0.0.0.0:3000/
Local IPs: 192.168.1.100
========================================
```

### Step 2: Open in Chrome

1. Open Chrome browser
2. Navigate to: `http://localhost:3000/`
3. You should see the RehabApp login page

### Step 3: Toggle Mobile View

1. Press **F12** (or right-click → Inspect)
2. Press **Ctrl+Shift+M** to toggle device mode
3. You'll now see the app in mobile view

### Step 4: Test Different Devices

In device dropdown (top-left of DevTools):

| Device | Test Purpose |
|--------|--------------|
| iPhone 12 | Standard mobile size (390px) |
| iPhone SE | Compact mobile (375px) |
| Pixel 5 | Android standard (393px) |
| iPad | Tablet layout (810px) |
| Galaxy Z Fold 3 | Foldable device |

### Step 5: Test Responsive Features

**Login Page:**
- [ ] Logo displays clearly
- [ ] Login form is centered
- [ ] Email/password inputs are large (44px+ height)
- [ ] Login button spans full width or is centered
- [ ] No horizontal scrolling

**Navigation Bar:**
- [ ] Logo/brand name visible
- [ ] Menu buttons wrap on small screens
- [ ] User info displays
- [ ] Logout button accessible

**Dashboard:**
- [ ] Widgets stack vertically on mobile
- [ ] All statistics visible
- [ ] Cards are responsive
- [ ] No content cut off

**Tables:**
- [ ] On mobile: Tables convert to card layout
- [ ] Each row shows as a card
- [ ] Columns display as rows within cards
- [ ] Action buttons visible

**Forms:**
- [ ] All input fields full width
- [ ] Labels visible
- [ ] Buttons properly sized
- [ ] No overlapping elements

---

## Phase 2: Advanced Browser Testing (10 minutes)

### Test Dark Mode

1. In DevTools, find the three-dot menu (⋯)
2. Click "Rendering" or "More tools"
3. Look for "Emulate CSS media feature prefers-color-scheme"
4. Toggle to "dark"

✅ **Check:**
- [ ] Background changes to dark
- [ ] Text remains readable
- [ ] Colors adapt ( no white text on white)
- [ ] Buttons visible in dark mode

### Test Network Throttling

1. DevTools → Network tab
2. Find "No throttling" dropdown
3. Select "Slow 3G"

✅ **Check:**
- [ ] App still loads (might be slow)
- [ ] UI remains responsive
- [ ] No error messages
- [ ] Socket.IO connection works

### Test Touch Events

1. DevTools → More tools → Emulate touch events
2. "Enable" checkbox
3. Now clicking simulates touch

✅ **Check:**
- [ ] Click animations work
- [ ] Buttons respond to touch
- [ ] Scrolling works smoothly
- [ ] 44px+ minimum touch targets

### Test Landscape Orientation

1. Rotate your browser window
2. Or in device mode, click the rotate icon
3. App should adapt to landscape

✅ **Check:**
- [ ] Layout adapts to landscape
- [ ] No content is cut off
- [ ] Navigation is accessible
- [ ] Buttons resize appropriately

---

## Phase 3: Physical Device Testing (Optional)

### Test on Android Phone

**Prerequisites:**
- Android phone with USB cable
- Developer mode enabled
- USB Debugging enabled

**Steps:**

1. **Get Your Computer's Local IP:**

   Windows PowerShell:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.100`)

2. **Update Socket.IO Connection:**

   Edit `index_react.html` and find the line:
   ```javascript
   const socket = io('http://127.0.0.1:3001');
   ```

   Change to:
   ```javascript
   const socket = io('http://192.168.1.100:3001');
   ```

3. **Also start the backend server:**

   ```bash
   npm run serve
   ```

4. **In another terminal, start mobile server:**

   ```bash
   npm run mobile:serve
   ```

5. **On your Phone:**
   - Connect to same WiFi as your computer
   - Open Chrome
   - Visit: `http://192.168.1.100:3000/`
   - App should load!

6. **Test on Real Hardware:**
   - [ ] Login works
   - [ ] Buttons respond to touch
   - [ ] Forms fill easily
   - [ ] No zoom in/out needed
   - [ ] Text readable
   - [ ] Images load properly
   - [ ] Real-time updates work

---

## Phase 4: Android Emulator Testing (Optional)

### Setup Emulator

1. **Install Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install following prompts

2. **Create Virtual Device**
   - Open Android Studio
   - Tools → AVD Manager
   - Click "Create Virtual Device"
   - Select "Pixel 4" (recommended)
   - Choose Android 12 (API 31)
   - Click "Create"

3. **Start Emulator**
   - In AVD Manager, click the play icon next to your device
   - Wait for emulator to boot (1-2 minutes)

4. **Install App on Emulator**

   ```bash
   npm run mobile:sync
   npx cap open android
   ```

   In Android Studio:
   - Select your emulator from device dropdown
   - Click "Run" (green play button)
   - App installs automatically

5. **Test in Emulator**
   - [ ] App loads
   - [ ] Login works
   - [ ] Navigate between pages
   - [ ] Touch interactions work
   - [ ] Form submissions work
   - [ ] Data displays correctly

---

## Phase 5: Performance Testing

Use Chrome DevTools Lighthouse:

1. Open DevTools (F12)
2. Click "Lighthouse" tab
3. Select "Mobile"
4. Click "Analyze page load"

✅ **Targets:**

| Metric | Target |
|--------|--------|
| Performance | 80+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 90+ |
| PWA | 90+ |

### What to Look For

**Performance:**
- First Contentful Paint < 3s
- Largest Contentful Paint < 4s
- Cumulative Layout Shift < 0.1

**Accessibility:**
- Color contrast sufficient
- ARIA labels present
- Touch targets 44px+

**Best Practices:**
- No unoptimized images
- HTTPS used
- No console errors

---

## Testing Checklist

### Functionality
- [ ] Login/logout works
- [ ] Can add patients
- [ ] Can add staff
- [ ] Can view reports
- [ ] Can access admin panel
- [ ] Real-time updates work
- [ ] Navigation works smoothly

### Responsiveness
- [ ] Works on 320px width (iPhone SE)
- [ ] Works on 393px width (Pixel 5)
- [ ] Works on 810px width (iPad)
- [ ] Works on 1200px width (desktop)
- [ ] No horizontal scrolling
- [ ] Content not cut off

### Touch & Mobile
- [ ] All buttons 44px+ height
- [ ] Forms easy to fill on mobile
- [ ] No pinch-zoom needed
- [ ] Tap response < 100ms
- [ ] Scrolling smooth

### Design
- [ ] Dark mode works
- [ ] Landscape mode works
- [ ] Colors readable
- [ ] Text is 16px minimum on inputs
- [ ] No console errors

### Performance
- [ ] Page loads < 3 seconds
- [ ] Smooth scrolling
- [ ] No lag on interactions
- [ ] Works with slow network

### Network
- [ ] Works on WiFi
- [ ] Works on 4G
- [ ] Works on slow network (Lighthouse test)
- [ ] Socket.IO reconnects properly

---

## Troubleshooting During Testing

### Problem: Can't reach app from phone

**Solution:**
1. Verify both on same WiFi
2. Use correct IP address
3. Check firewall settings
4. Restart server: `npm run mobile:serve`

### Problem: Very slow loading

**Solution:**
1. Check network (Lighthouse Network tab)
2. Clear browser cache: Ctrl+Shift+Delete
3. Check DevTools Performance tab
4. Restart browser

### Problem: Form doesn't submit

**Solution:**
1. Check browser console (F12 → Console tab)
2. Verify Socket.IO connection
3. Check backend server is running
4. Try refreshing page

### Problem: Buttons don't respond

**Solution:**
1. Verify touch events enabled in DevTools
2. Check if 44px+ height
3. Look for CSS errors (F12 → Elements)
4. Try hard refresh: Ctrl+Shift+R

### Problem: Images not loading

**Solution:**
1. Check DevTools Network tab
2. Verify file paths are correct
3. Check image file exists
4. Try on different device

---

## When Tests Pass ✅

If all tests pass:

1. **Document Results**
   - Take screenshots
   - Note any issues
   - Record device/browser details

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "mobile: Testing complete - all tests pass"
   ```

3. **Next Steps**
   - Proceed with Android build (see MOBILE_BUILD_GUIDE.md)
   - Or deploy to web server
   - Or distribute APK to users

---

## Test Report Template

**Device:** [e.g., Pixel 5]
**OS:** [e.g., Android 12]
**Browser:** [e.g., Chrome 120]
**Date:** March 1, 2026

### Functionality Tests
- [ ] Login ✅/❌
- [ ] Dashboard ✅/❌
- [ ] Patients ✅/❌
- [ ] Staff ✅/❌
- [ ] Finance ✅/❌
- [ ] Reports ✅/❌
- [ ] Admin ✅/❌

### Issues Found
1. [Issue description]
2. [Issue description]

### Performance
- Load time: __ seconds
- Lighthouse Score: __/100

### Notes
[Any observations or improvements]

---

**Next:** Once testing is complete, proceed to [MOBILE_BUILD_GUIDE.md](./MOBILE_BUILD_GUIDE.md) for Android app distribution.
