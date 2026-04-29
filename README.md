# 🧺 Persephone's Basket — CRM

A purpose-built, browser-based CRM (Customer Relationship Management) web app for **Persephone's Basket**, a crop health intelligence startup connecting small and mid-sized farms through real-time pest and disease monitoring.

> Built as an elective mini project (Custom Project) for OIM3690 — Web Technologies at Babson College.

---

## 🔗 Live Demo

**[https://732198.github.io/side-project/](https://732198.github.io/side-project/)**

---

## ✨ Features

### 👥 Contacts Dashboard
- Add, edit, and delete contacts across four types: **Farmer, Advisor, Investor, Partner**
- Live search across name, email, location, crop types, and notes
- Filter contacts by type from the sidebar
- Stats bar showing total contacts, breakdown by type, and active vs. prospect counts

### 📋 Pipeline (Kanban Board)
- Visual board with four relationship stages: **Prospect → Outreach → Active → Partner**
- Click any card to open the full contact detail view
- Update a contact's stage directly from the detail modal — Kanban updates instantly

### 📅 Calendar
- Full month grid view with forward/back navigation
- Schedule four event types per contact: **Meeting, Email, Call, Follow-up**
- Color-coded event chips on each day
- Click any day to pre-fill the date in the schedule form
- Upcoming events sidebar sorted by date, with past events dimmed
- Scheduling an event auto-logs it in the contact's activity history

### 📋 Activity Log
- Per-contact log of every interaction (calls, emails, site visits, etc.)
- Type a note and hit Log or press Enter to add an entry
- Stage changes and new events are auto-logged with timestamps
- Delete individual log entries

### ⬇️ Export CSV
- One-click export of all contacts to a dated `.csv` file
- Includes all fields: name, type, email, location, crops, stage, notes, date added

### ⬆️ Import CSV
- Upload any `.csv` with a `Name` column to bulk-import contacts
- Auto-maps `Type`, `Email`, `Location`, `Crops`, `Stage`, `Notes` columns if present
- Handles quoted fields and gracefully defaults unknown values
- Each imported contact gets an auto-logged activity entry
- Toast notification confirms how many contacts were imported

### 💾 LocalStorage Persistence
- All contacts, activity logs, and calendar events are saved in the browser
- Data survives page refreshes with no backend required

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure, modals, forms |
| CSS3 | Layout (Grid + Flexbox), animations, responsive design |
| Vanilla JavaScript (ES6+) | State management, DOM manipulation, LocalStorage, File API |
| Google Fonts | Playfair Display + DM Sans typography |
| GitHub Pages | Deployment |

No frameworks. No dependencies. No build step.

---

## 📁 File Structure

```
side-project/
├── index.html       # Full app structure: sidebar, views, all modals
├── style.css        # All styles, layout, responsive breakpoints
├── app.js           # All logic: CRUD, CSV import/export, calendar, activity log
├── PROPOSAL.md      # Original project proposal
└── README.md        # This file
```

---

## 🚀 Running Locally

No installation needed.

1. Clone the repo:
   ```bash
   git clone https://github.com/732198/side-project.git
   ```
2. Open `index.html` in your browser — that's it.

Or visit the [live site](https://732198.github.io/side-project/).

---

## 💡 Key Concepts Demonstrated

- **DOM Manipulation** — dynamically rendering contact cards, Kanban columns, and calendar grids from a JS state array
- **State Management** — a single source of truth (`contacts`, `events`, `activityLog`) drives all three views
- **Event Handling** — form submissions, modal open/close, keyboard shortcuts (`Esc`, `Cmd+K`, `Enter`), calendar day clicks
- **File API** — reading and parsing uploaded `.csv` files via `FileReader`
- **Blob API** — generating and downloading `.csv` files client-side
- **LocalStorage** — persisting and hydrating three separate data stores across sessions
- **CSS Grid + Flexbox** — multi-column Kanban board, calendar month grid, responsive sidebar
- **CSS Animations** — fade-in and slide-up transitions for views and modals

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Esc` | Close any open modal |
| `Cmd + K` / `Ctrl + K` | Jump to search |
| `Enter` | Submit activity log entry |

---

## 🌱 About Persephone's Basket

Persephone's Basket is a crop health intelligence platform built for the 1.88 million small and mid-sized farms in the US. Farmers log, map, and share pest and disease observations in real time — creating an early-warning data network for regional outbreaks. This CRM was built to support the team's growing network of farmers, research advisors, investors, and university partners.

---

## 📬 Contact

Built by [Charles Zhang](https://github.com/732198) · OIM3690 · Babson College