# RehabApp - Quick Start Guide

## 🎯 What is RehabApp?

RehabApp is a **local rehabilitation management system** for multi-staff coordination in a rehabilitation facility. Each staff member has a different role with specific permissions and features.

## 👥 Available Roles

| Role | Purpose | Features |
|------|---------|----------|
| **Admin** | System administrator | Full access, manage all users, view all data |
| **Doctor** | Medical professional | Admit patients, manage appointments, view own patients |
| **Finance** | Billing department | Manage invoices, track payments, revenue reports |
| **Reception** | Front desk | Check-in patients, schedule appointments |
| **Therapist** | Treatment provider | View assigned patients, track progress |

## 🔑 Default Login Credentials

```
ADMIN ACCOUNT:
Username: admin
Password: admin123

DOCTOR ACCOUNT:
Username: doctor1
Password: doctor123

FINANCE ACCOUNT:
Username: finance1
Password: finance123

RECEPTION ACCOUNT:
Username: reception1
Password: reception123
```

## 🚀 Getting Started

### Step 1: Start the App
```bash
npm start
```

### Step 2: Login
1. A login page appears
2. Select your **role** from dropdown
3. Enter **username** and **password**
4. Click "Login"

### Step 3: Navigate
- The main app opens
- Click **"Menu"** button (top-right) to see available options
- Each role sees different menu options
- Click any option to navigate

## 📋 Key Features by Role

### As an Admin
- ✅ View all patients in the system
- ✅ View all staff members
- ✅ Access financial reports
- ✅ Manage system settings
- ✅ View full dashboard with all metrics

### As a Doctor
- ✅ Admit new patients with diagnosis and treatment plan
- ✅ View your own patients only
- ✅ Book and manage appointments
- ✅ Track patient admissions
- ✅ See your workload dashboard

### As Finance Staff
- ✅ Create invoices
- ✅ Record payments
- ✅ View revenue statistics
- ✅ Track pending vs paid invoices

### As Reception
- ✅ View all patients
- ✅ Check-in patients for appointments
- ✅ Book new appointments
- ✅ View appointment schedule

## 🏥 Common Workflows

### Admit a Patient (Doctor)
1. Login as Doctor
2. Go to **Patient Management**
3. Click **"+ Add Patient"** button
4. Fill in personal & medical information
5. Enter diagnosis and treatment plan
6. Click **"Admit Patient"**

### Schedule an Appointment
1. Go to **Appointments**
2. Click **"+ Book Appointment"**
3. Select patient and doctor
4. Choose date and time
5. Add reason/notes (optional)
6. Click **"Book Appointment"**

### View Dashboard
1. Navigate to **Dashboard** from menu
2. See role-specific metrics:
   - Admins: Total patients, staff, revenue, invoices
   - Doctors: My patients, today's appointments
   - Finance: Revenue, paid/pending invoices
   - Reception: Patients, scheduled appointments

## 💾 Data Storage

- **All data is saved locally** on your computer
- Data persists when you close and reopen the app
- No internet connection needed
- Each computer has its own separate database

## 🔒 Logging Out

- Click **"Logout"** button in top-right
- You'll be returned to login screen
- Your session ends and data is kept safe

## ⚙️ Settings

- Role-based menu filtering (different menus for different roles)
- User info displayed in navbar
- Responsive design works on different screen sizes

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Forgot password | Use demo credentials above or contact admin |
| App won't start | Run `npm start` in terminal from app folder |
| Can't see a menu option | Check your role - not all roles see all options |
| Data disappeared | Data is stored locally - check if browser data was cleared |
| Login fails | Double-check username/password are exact match (case-sensitive) |

## 📞 Need Help?

1. **Check the credentials** - Username and password are case-sensitive
2. **Verify your role** - Different roles see different menus
3. **Clear browser cache** if having display issues
4. **Re-run app** if experiencing freezes

## 🎓 Training Scenario

Try this workflow to learn the system:

1. **Login as Admin** - See full dashboard and all patients
2. **Logout and login as Doctor** - Admit a new patient
3. **As Doctor, book an appointment** - Schedule patient visit
4. **Logout and login as Reception** - See the scheduled appointment
5. **Logout and login as Finance** - Create an invoice for the patient

---

**Happy using RehabApp! 🎉**

For detailed features, see: `FEATURES_IMPLEMENTED.md`
