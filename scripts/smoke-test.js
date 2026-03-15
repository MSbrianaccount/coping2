const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Minimal in-memory localStorage shim
const storage = {};
const localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const ctx = {
  console,
  localStorage,
  window: { electronAPI: {} },
  confirm: () => true,
  alert: () => {},
  Date,
  // fallback crypto
  crypto: { randomUUID: () => 'uuid-' + Date.now() }
};

function runScriptRel(relPath) {
  const p = path.join(__dirname, '..', relPath);
  let code = fs.readFileSync(p, 'utf8');
  // Wrap in IIFE to return local bindings (DB / PasswordAuth)
  const wrapped = `(function(){\n${code}\n return { DB: (typeof DB !== 'undefined' ? DB : null), PasswordAuth: (typeof PasswordAuth !== 'undefined' ? PasswordAuth : null) }; })()`;
  return vm.runInNewContext(wrapped, ctx, { filename: p });
}

try {
  // Load DatabaseManager first, then PasswordAuth and capture returned bindings
  const resDb = runScriptRel('src/utils/databaseManager.js') || {};
  const resAuth = runScriptRel('src/auth/passwordAuthManager.js') || {};

  const DB = resDb.DB || resAuth.DB || ctx.DB;
  const PasswordAuth = resAuth.PasswordAuth || resDb.PasswordAuth || ctx.PasswordAuth;

  if (!DB || !PasswordAuth) {
    console.error('DB or PasswordAuth not available in test context');
    process.exit(2);
  }

  console.log('Initial DB:', Object.keys(JSON.parse(localStorage.getItem('rehab_app') || '{}')));

  // Authenticate as admin
  const adm = PasswordAuth.authenticate('admin123');
  if (!adm.success) {
    console.error('Admin authenticate failed:', adm);
    process.exit(3);
  }

  // Add staff
  const addStaffRes = PasswordAuth.addStaffMember('smoke1', 'smoke123', 'doctor', 'Smoke Tester');
  console.log('Add staff:', addStaffRes);

  // Login as new staff
  const staffLogin = PasswordAuth.authenticate('smoke123', 'doctor');
  console.log('Staff login:', staffLogin);

  // Add patient
  const patient = DB.addPatient({ firstName: 'Test', lastName: 'Patient', phone: '555-000', diagnosis: 'smoke-test' });
  console.log('Added patient id:', patient && patient.id);

  // Archive then readmit
  const archived = DB.dismissPatient(patient.id, 'test-discharge');
  console.log('Archived:', archived, 'status now:', DB.getPatientById(patient.id).status);
  const readmitted = DB.readmitPatient(patient.id);
  console.log('Readmitted:', readmitted, 'status now:', DB.getPatientById(patient.id).status);

  // Appointment
  const appt = DB.addAppointment({ patientId: patient.id, doctorId: 'smoke1', date: new Date().toISOString().split('T')[0], time: '10:00' });
  console.log('Appointment created:', appt && appt.id);

  // Audit
  const audit = DB.addAudit({ type: 'smoke-test', username: 'smoke1', details: { ok: true } });
  console.log('Audit written:', audit && audit.id);

  console.log('\nSmoke test completed successfully');
  process.exit(0);
} catch (err) {
  console.error('Smoke test failed:', err);
  process.exit(1);
}
