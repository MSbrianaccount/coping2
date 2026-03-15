# 🎨 RehabApp - Visual Guide & UI Overview

## Login Page Layout

```
┌─────────────────────────────────────┐
│                                     │
│         RehabApp Logo (S)           │
│              RehabApp               │
│   Rehabilitation Management System  │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ Select Role:  [Dropdown ▼]     │ │
│  │                                  │ │
│  │ Username:     [________________] │ │
│  │                                  │ │
│  │ Password:     [________________] │ │
│  │                                  │ │
│  │         [LOGIN BUTTON]          │ │
│  │                                  │ │
│  │ Demo Credentials:                │ │
│  │ Admin: admin / admin123          │ │
│  │ Doctor: doctor1 / doctor123      │ │
│  └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘

Color Scheme: 
- Primary: Blue (#1976d2)
- Secondary: Purple (#7B2CBF)
- Background: White
```

---

## Main App Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰ RehabApp           [DOCTOR]  Dr. Sarah      [Logout]  │  ← NAVBAR
├──────────────────────────────────────────────────────────┤
│ │ NAVIGATION        │                                    │
│ │ ─────────────────  │  ┌───────────────────────────────┐ │
│ │ └ Dashboard        │  │ CONTENT AREA                  │ │
│ │ └ Patient Mgmt     │  │ ┌──────────────────────────┐  │ │
│ │ └ Appointments     │  │ │ Dashboard                │  │ │
│ │                    │  │ │ ┌─────────────────────────┐ │ │
│ │                    │  │ │ │ My Patients: 12         │ │ │
│ │                    │  │ │ ├─────────────────────────┤ │ │
│ │                    │  │ │ │ Appointments: 5         │ │ │
│ │                    │  │ │ ├─────────────────────────┤ │ │
│ │                    │  │ │ │ Completed: 28           │ │ │
│ │                    │  │ │ └─────────────────────────┘ │ │
│ │ SIDEBAR            │  │                                │ │
│ │ (for logged in     │  │                                │ │
│ │  user menu)        │  │                                │ │
│ │                    │  │                                │ │
└──────────────────────────────────────────────────────────┘

Sidebar Width: 280px
Navbar Height: 70px
Main Content: Fills remaining space
```

---

## Menu Modal (When clicking "Menu" button)

```
┌──────────────────────────────────────────┐
│                                          │
│  Coping Wellness - Navigation        [×] │  ← Close Button
│  ────────────────────────────────────── │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   📊         │  │   👥         │    │
│  │  Dashboard   │  │   Patient    │    │
│  │   View...    │  │   Manage...  │    │
│  └──────────────┘  └──────────────┘    │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   👔         │  │   💰         │    │
│  │   Staff      │  │   Billing    │    │
│  │   Manage...  │  │   Invoice... │    │
│  └──────────────┘  └──────────────┘    │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   📈         │  │   ⚙️          │    │
│  │  Reports     │  │  Settings    │    │
│  │  Generate... │  │  Configure...│    │
│  └──────────────┘  └──────────────┘    │
│                                          │
└──────────────────────────────────────────┘

- 6 colored cards
- Hover effect: Lifts up, shows shadow
- Click closes menu and navigates
- Can close by clicking X or outside
```

---

## Patient Addition Form Modal

```
┌───────────────────────────────────────────┐
│ Admit Patient                          [×] │
│ ────────────────────────────────────────  │
│                                           │
│ ┌─ Personal Information ────────────────┐ │
│ │                                       │ │
│ │ First Name:    [________________]    │ │
│ │ Last Name:     [________________]    │ │
│ │ Email:         [________________]    │ │
│ │ Phone:         [________________]    │ │
│ │ Date of Birth: [_______________]    │ │
│ │ Gender:        [Admin ▼]            │ │
│ │                                       │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ┌─ Medical Information ──────────────────┐ │
│ │                                       │ │
│ │ Diagnosis:  [_______________________] │ │
│ │             [_______________________] │ │
│ │             [_______________________] │ │
│ │                                       │ │
│ │ Allergies:  [_______________________] │ │
│ │             [_______________________] │ │
│ │                                       │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ┌─ Admission Details ───────────────────┐ │
│ │                                       │ │
│ │ Admission Date: [_______________]    │ │
│ │ Ward/Room:      [________________]    │ │
│ │ Treatment Plan: [_______________________] │
│ │                 [_______________________] │ │
│ │ Emergency Contact: [________________]    │ │
│ │                                       │ │
│ └───────────────────────────────────────┘ │
│                                           │
│          [ADMIT PATIENT BUTTON]           │
│                                           │
└───────────────────────────────────────────┘

Features:
- Scrollable if content is long
- Required fields marked with *
- Submit button at bottom
- Close button (×) at top right
- Click outside to close
```

---

## Patient List Display

```
┌────────────────────────────────────────────────┐
│ Patient Management                             │
│ [+ Add Patient Button]                         │
│                                                │
│ ┌─────────────────────────────────────────────┐│
│ │ ID   │ Name        │ Phone │ Email │Status ││
│ ├─────────────────────────────────────────────┤│
│ │ 1001 │ John Doe    │ 123.. │ john..│ ✅   ││
│ │ 1002 │ Jane Smith  │ 234.. │ jane..│ ✅   ││
│ │ 1003 │ Bob Wilson  │ 345.. │ bob.. │ ❌   ││
│ │ 1004 │ Alice Brown │ 456.. │ alice.│ ✅   ││
│ │                                             ││
│ └─────────────────────────────────────────────┘│
└────────────────────────────────────────────────┘

Status Colors:
✅ Active    = Green background
❌ Inactive  = Orange background
```

---

## Appointments Calendar

```
┌──────────────────────────────────────────┐
│ Appointment Booking                      │
│ [+ Book Appointment Button]              │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ID   │ Patient │ Doctor │Date │Time ││ │
│ ├──────────────────────────────────────┤ │
│ │ 001  │ John    │ Sarah  │1/30│10:00││ │
│ │ 002  │ Jane    │ Sarah  │1/30│10:30││ │
│ │ 003  │ Bob     │ Michael│1/31│14:00││ │
│ │ 004  │ Alice   │ Sarah  │2/1 │09:30││ │
│ │                                      ││ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘

Time Slots:
- 30-minute intervals
- 9:00 AM - 5:00 PM
- Green = Available
- Red = Booked
- Gray = Past
```

---

## Dashboard Widgets

```
FOR ADMIN:
┌────────────────────────────────────────┐
│ Dashboard                              │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ Total        │  │ Active       │    │
│ │ Patients     │  │ Staff        │    │
│ │              │  │              │    │
│ │     45       │  │     12       │    │
│ └──────────────┘  └──────────────┘    │
│                                        │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ Total        │  │ Pending      │    │
│ │ Revenue      │  │ Invoices     │    │
│ │              │  │              │    │
│ │   $5,420     │  │     8        │    │
│ └──────────────┘  └──────────────┘    │
└────────────────────────────────────────┘

FOR DOCTOR:
┌────────────────────────────────────────┐
│ Dashboard                              │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ My           │  │ Today's      │    │
│ │ Patients     │  │ Appointments │    │
│ │              │  │              │    │
│ │     12       │  │     5        │    │
│ └──────────────┘  └──────────────┘    │
│                                        │
│ ┌──────────────┐                      │
│ │ Completed    │                      │
│ │ Appointments │                      │
│ │              │                      │
│ │     28       │                      │
│ └──────────────┘                      │
└────────────────────────────────────────┘

FOR FINANCE:
┌────────────────────────────────────────┐
│ Dashboard                              │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ Total        │  │ Paid         │    │
│ │ Revenue      │  │ Invoices     │    │
│ │              │  │              │    │
│ │   $12,550    │  │     35       │    │
│ └──────────────┘  └──────────────┘    │
│                                        │
│ ┌──────────────┐                      │
│ │ Pending      │                      │
│ │ Invoices     │                      │
│ │              │                      │
│ │     12       │                      │
│ └──────────────┘                      │
└────────────────────────────────────────┘
```

---

## Navbar Components

```
┌────────────────────────────────────────────────────────┐
│  S  RehabApp    │  [DOCTOR]  Dr. Sarah    │  [Logout]  │
└────────────────────────────────────────────────────────┘
   ↑                    ↑                       ↑
   │                    │                       │
Logo               User Info            Logout Button
                   - Role badge         - Click to logout
                   - User name          - Confirmation dialog

Colors:
- Background: Blue (#1976d2)
- Text: White
- Accents: Purple (#7B2CBF)
```

---

## Color Scheme

```
PRIMARY COLORS:
- Blue (#1976d2)        - Navbar, buttons, links
- Purple (#7B2CBF)      - Highlights, badges
- White (#FFFFFF)       - Background, cards

STATUS COLORS:
- Green (#4caf50)       - Active, Success
- Orange (#ff9800)      - Warning, Inactive
- Red (#dc004e)         - Error, Delete

NEUTRAL COLORS:
- Dark Gray (#333)      - Text
- Light Gray (#f5f5f5)  - Secondary background
- Border Gray (#ddd)    - Dividers
```

---

## Responsive Breakpoints

```
Desktop (1200px+):
├── Full navbar
├── Full sidebar (280px)
└── Main content area full width

Tablet (768px - 1199px):
├── Compact navbar
├── Sidebar toggleable
└── Main content flexible

Mobile (< 768px):
├── Stacked layout
├── Hamburger menu
└── Full-width content
```

---

## Interactive Elements

### Buttons
```
Normal:       Blue background, white text
Hover:        Darker blue, slight lift effect
Click:        Slight scale down
Active:       Blue with white border
Disabled:     Gray, cursor not-allowed
```

### Form Inputs
```
Default:      White, gray border
Focus:        Blue border, subtle shadow
Error:        Red border, error message
Success:      Green checkmark
```

### Tables
```
Header:       Blue background, white text
Rows:         White, gray on hover
Status Cells: Color-coded badges
```

### Modals
```
Overlay:      Dark semi-transparent background
Content:      White card, rounded corners
Close Button: Top-right X icon
```

---

## Animation Effects

```
Transitions:  0.3s ease (all properties)
Hover:        Lift effect (translateY -2px)
Click:        Scale effect (0.98x)
Open/Close:   Fade in/out animation
Smooth:       All interactions feel responsive
```

---

## Accessibility Features

✅ Clear labels on all inputs
✅ Semantic HTML structure
✅ Keyboard navigation support
✅ Color + icon indicators (not color alone)
✅ Sufficient contrast ratios
✅ ARIA roles where needed
✅ Focus indicators visible
✅ Error messages clear and helpful

---

**This visual guide shows the complete UI of RehabApp and how to interact with each element.**
