# Password-Based Authentication System

## New Workflow

### How It Works

1. **App Starts** → Shows **Menu** immediately (no login page)
2. **User Clicks "☰ Menu"** → Prompts for **Password**
3. **Password Options:**
   - **Admin Password**: `admin123`
   - **Staff Passwords**: Individual passwords set by admin
4. **Successful Password Entry** → Navigation menu opens
5. **Admin Features** → Can add/remove staff members

---

## Default Admin Access

- **Password**: `admin123`
- **Authority**: Only admin can authorize and register new staff members
- **Capabilities**: Full system access

---

## How Admin Authorizes Staff

1. **Click "☰ Menu"**
2. **Enter Admin Password**: `admin123`
3. **Click "Admin: Add Staff"** button
4. **Fill in staff details:**
   - Full Name
   - Username (unique identifier)
   - Password
   - Role (Doctor, Finance, Reception, Therapist)
5. **Click "Add Staff Member"**
6. **Staff can now login** with their username/password

---

## Staff Login Process

1. **Click "☰ Menu"**
2. **Enter your password** (provided by admin)
3. **Access menu and features** based on your role

---

## Admin: Manage Staff

1. **Click "☰ Menu"**
2. **Enter Admin Password**: `admin123`
3. **Click "Admin: Add Staff"**
4. **View All Staff** - See all registered staff members
5. **Delete Staff** - Remove staff members by clicking Delete button

---

## Default Staff (Pre-registered)

These staff members are registered by default:

| Role | Username | Password | Privileges |
|------|----------|----------|-----------|
| Doctor | doctor1 | doctor123 | Admit patients, manage appointments |
| Finance | finance1 | finance123 | Manage billing and payments |
| Reception | reception1 | reception123 | Schedule appointments |
| Therapist | therapist1 | therapist123 | View patient progress |

---

## Features By Role

### Admin
- Full system access
- Add/remove staff members
- View all patients and data
- Manage finances
- Generate reports

### Doctor
- Admit patients
- Manage own patients
- Schedule appointments
- View medical records

### Finance
- Create invoices
- Process payments
- Track revenue
- Financial reports

### Reception
- Schedule appointments
- Check-in patients
- View appointments
- Patient information

### Therapist
- View assigned patients
- Track patient progress
- View medical history

---

## Security Notes

✅ **Password-Protected Access** - Menu requires password entry
✅ **Admin-Only Authorization** - Only admin can add staff
✅ **Independent Passwords** - Each staff member has unique password
✅ **Role-Based Access** - Features limited by role
✅ **Local Storage** - All passwords stored locally (not transmitted)

---

## Troubleshooting

**Forgot Password?**
- Admin password is always: `admin123`
- Contact system admin to change staff password

**Can't Add Staff?**
- Only admin can add staff members
- Verify you entered correct admin password

**Staff Member Deleted?**
- Admin can remove staff members
- Contact admin to be re-registered

---

## Session Management

- Users stay logged in until they click **Logout**
- Click **Logout** button in top-right corner
- Must enter password again to re-access menu

---

For questions or issues, refer to the documentation files included with the application.
