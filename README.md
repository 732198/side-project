# 🧺 Persephone's Basket — CRM

A purpose-built, browser-based CRM (Customer Relationship Management) web app for [Persephone's Basket](https://github.com/OIM3690/resources), a crop health intelligence startup connecting small and mid-sized farms through pest and disease monitoring.

> Built as an elective mini project for OIM3690 — Web Technologies at Babson College.

---

## 🔗 Live Demo

**[View on GitHub Pages](https://732198.github.io/persephonebasket-crm)**

---

## 📸 Screenshots

### Contacts Dashboard
> Grid view of all contacts with search, type filtering, and quick-glance details.

![Contacts Dashboard](screenshots/dashboard.png)

### Pipeline View
> Kanban board tracking each contact's relationship stage.

![Pipeline View](screenshots/pipeline.png)

---

## ✨ Features

- **Contacts Dashboard** — Add, edit, and delete contacts across four types: Farmer, Advisor, Investor, and Partner
- **Search** — Live search across name, email, location, crop types, and notes
- **Filter by Type** — Quickly narrow the view to a specific contact category
- **Pipeline (Kanban Board)** — Visual board with four relationship stages: Prospect → Outreach → Active → Partner
- **Stage Updates** — Change a contact's stage directly from their detail view; the Kanban updates instantly
- **LocalStorage Persistence** — All data is saved in the browser, no backend required
- **Seed Data** — Pre-loaded with sample contacts so the app is immediately useful for demo

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS3 | Styling, layout (Grid + Flexbox), animations |
| Vanilla JavaScript (ES6+) | State management, DOM manipulation, LocalStorage |
| Google Fonts | Playfair Display + DM Sans typography |
| GitHub Pages | Deployment |

No frameworks. No dependencies. No build step.

---

## 📁 File Structure

```
persephonebasket-crm/
├── index.html       # App structure, modals, sidebar, views
├── style.css        # All styles and responsive layout
├── app.js           # All logic: CRUD, filtering, rendering, persistence
├── PROPOSAL.md      # Original project proposal
└── README.md        # This file
```

---

## 🚀 Running Locally

No installation needed.

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/persephonebasket-crm.git
   ```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Esc` | Close any open modal |
| `Cmd + K` / `Ctrl + K` | Jump to search |

---

## 🌱 About Persephone's Basket

Persephone's Basket is a crop health intelligence platform built for the 1.88 million small and mid-sized farms in the US. Farmers log, map, and share pest and disease observations in real time — creating an early-warning network for regional outbreaks. This CRM was built to support the team's growing network of farmers, research advisors, investors, and university partners.
