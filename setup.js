/**
 * Setup Manager for RehabApp
 * Auto-installs missing dependencies and checks for required system components on postinstall
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class SetupManager {
  constructor() {
    this.platform = os.platform(); // 'win32', 'darwin', 'linux'
    this.isElectron = process.env.ELECTRON_MANAGED === 'true' || process.type === 'browser';
    this.logFile = path.join(__dirname, 'setup.log');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    // Append to setup.log
    fs.appendFileSync(this.logFile, logMessage + '\n', { encoding: 'utf8' });
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const errMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(errMessage);
    fs.appendFileSync(this.logFile, errMessage + '\n', { encoding: 'utf8' });
  }

  /**
   * Check if a command exists in PATH
   */
  commandExists(command) {
    try {
      const checkCmd = this.platform === 'win32' 
        ? `where ${command}` 
        : `which ${command}`;
      execSync(checkCmd, { stdio: 'pipe' });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if Node.js is installed
   */
  checkNode() {
    this.log('Checking Node.js...');
    if (this.commandExists('node')) {
      try {
        const version = execSync('node --version', { encoding: 'utf8' }).trim();
        this.log(`✓ Node.js found: ${version}`);
        return true;
      } catch (e) {
        this.error(`Node.js detection failed: ${e.message}`);
        return false;
      }
    }
    this.error('✗ Node.js not found in PATH');
    return false;
  }

  /**
   * Check if npm is installed
   */
  checkNpm() {
    this.log('Checking npm...');
    if (this.commandExists('npm')) {
      try {
        const version = execSync('npm --version', { encoding: 'utf8' }).trim();
        this.log(`✓ npm found: ${version}`);
        return true;
      } catch (e) {
        this.error(`npm detection failed: ${e.message}`);
        return false;
      }
    }
    this.error('✗ npm not found in PATH');
    return false;
  }

  /**
   * Check if Python is installed (needed for native module builds)
   */
  checkPython() {
    this.log('Checking Python (required for native modules)...');
    const pythonCmds = ['python3', 'python'];
    for (const cmd of pythonCmds) {
      if (this.commandExists(cmd)) {
        try {
          const version = execSync(`${cmd} --version`, { encoding: 'utf8' }).trim();
          this.log(`✓ Python found: ${version}`);
          return true;
        } catch (e) {
          // continue to next
        }
      }
    }
    this.error('✗ Python not found (needed for better-sqlite3 native build)');
    return false;
  }

  /**
   * Check if build tools are available (Windows: Visual Studio Build Tools, gcc on Unix)
   */
  checkBuildTools() {
    this.log('Checking build tools...');
    if (this.platform === 'win32') {
      // Windows: check for Visual Studio Build Tools or node-gyp setup
      try {
        execSync('npm config get msvs_version', { stdio: 'pipe', encoding: 'utf8' });
        this.log('✓ Visual Studio Build Tools detected');
        return true;
      } catch (e) {
        this.error('✗ Visual Studio Build Tools not found (needed for native modules on Windows)');
        return false;
      }
    } else {
      // Unix-like: check for gcc/clang
      if (this.commandExists('gcc') || this.commandExists('clang')) {
        this.log('✓ C++ compiler found');
        return true;
      }
      this.error('✗ C++ compiler not found (gcc/clang)');
      return false;
    }
  }

  /**
   * Check if node_modules exists and has key dependencies
   */
  checkNodeModules() {
    this.log('Checking node_modules...');
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      // Check for critical modules (express, socket.io required; better-sqlite3 optional)
      const criticalModules = ['express', 'socket.io'];
      const optionalModules = ['better-sqlite3']; // Optional for now, logging only
      
      let allCriticalFound = true;
      for (const mod of criticalModules) {
        const modPath = path.join(nodeModulesPath, mod);
        if (fs.existsSync(modPath)) {
          this.log(`✓ Module found: ${mod}`);
        } else {
          this.error(`✗ Critical module missing: ${mod}`);
          allCriticalFound = false;
        }
      }
      
      // Check optional modules (warn only)
      for (const mod of optionalModules) {
        const modPath = path.join(nodeModulesPath, mod);
        if (fs.existsSync(modPath)) {
          this.log(`✓ Optional module found: ${mod}`);
        } else {
          this.log(`⚠ Optional module missing: ${mod} (SQLite features will be unavailable; JSON persistence will work)`);
        }
      }
      
      return allCriticalFound;
    }
    this.error('✗ node_modules directory not found');
    return false;
  }

  /**
   * Attempt npm install if dependencies are missing
   */
  runNpmInstall() {
    try {
      this.log('Running npm install...');
      execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
      this.log('✓ npm install completed');
      return true;
    } catch (e) {
      this.error(`npm install failed: ${e.message}`);
      return false;
    }
  }

  /**
   * Main setup routine
   */
  run() {
    this.log('=== RehabApp Setup Manager Started ===');
    this.log(`Platform: ${this.platform}`);
    this.log(`Working dir: ${__dirname}`);

    // Check prerequisites
    const checks = {
      'Node.js': () => this.checkNode(),
      'npm': () => this.checkNpm(),
      'Python': () => this.checkPython(),
      'Build Tools': () => this.checkBuildTools(),
      'node_modules': () => this.checkNodeModules(),
    };

    const results = {};
    for (const [name, check] of Object.entries(checks)) {
      try {
        results[name] = check();
      } catch (e) {
        this.error(`Check failed for ${name}: ${e.message}`);
        results[name] = false;
      }
    }

    // Summary
    this.log('=== Setup Check Summary ===');
    const criticalChecksPassed = results['Node.js'] && results['npm'] && results['node_modules'];
    
    if (criticalChecksPassed) {
      this.log('✓ All critical checks passed! System is ready.');
    } else {
      this.log('⚠ Some critical checks failed. System may experience issues.');
      const failedChecks = Object.entries(results).filter(([_, passed]) => !passed).map(([name]) => name);
      this.log(`Failed checks: ${failedChecks.join(', ')}`);

      // If node_modules failed, try npm install
      if (!results['node_modules']) {
        this.log('Attempting npm install to fix missing modules...');
        if (this.runNpmInstall()) {
          this.log('✓ Dependencies installed successfully');
        } else {
          this.log('⚠ Failed to install dependencies via npm install (check npm logs)');
          this.log('   You may need to manually run: npm install');
        }
      }
    }

    this.log('=== Setup Manager Completed ===\n');
  }
}

// Run setup only if not being imported as a module
if (require.main === module) {
  const manager = new SetupManager();
  manager.run();
}

module.exports = SetupManager;
