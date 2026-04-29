# Project Proposal — Persephone's Basket CRM

## Project Title
Persephone's Basket CRM — Contact & Pipeline Manager

## Project Type
Custom Project

## Overview
A purpose-built, browser-based CRM (Customer Relationship Management) web app designed for **Persephone's Basket**, a crop health intelligence startup. The app allows the team to manage contacts (farmers, advisors, investors, and research partners) and track where each relationship stands in the business pipeline — all in one clean, deployable interface.

This project is grounded in a real business need: as Persephone's Basket grows its farmer network and advisor relationships, a lightweight internal tool is more practical than a generic CRM like HubSpot at this stage.

---

## Problem Statement
Early-stage startups in the agricultural tech space need to manage a diverse set of relationships — farmers using the platform, research advisors, potential investors, and university partners. Existing CRM tools are either too complex, too expensive, or not tailored to this kind of mixed-contact workflow. This project solves that by building a simple, focused CRM from scratch.

---

## Core Features

### 1. Contact Dashboard
- Add, edit, and delete contacts
- Each contact includes:
  - Name
  - Contact type (Farmer / Advisor / Investor / Partner)
  - Location
  - Crop type(s) *(for farmers)*
  - Email
  - Notes
  - Relationship stage (Prospect → Outreach → Active → Partner)
- Filter and search contacts by type or stage

### 2. Pipeline Tracker (Kanban Board)
- Visual board with columns representing relationship stages
- Contact cards populate each column based on their current stage
- Click a card to view full contact details
- Update a contact's stage directly from the board

---

## Technologies & Concepts Used
- **HTML/CSS** — layout, responsive design, custom styling
- **Vanilla JavaScript** — DOM manipulation, event handling, state management
- **LocalStorage** — persist contact data across page refreshes without a backend
- **CSS Grid / Flexbox** — Kanban board layout and responsive contact cards
- **GitHub Pages** — deployment

---

## Stretch Goals *(if time allows)*
- Export contacts to CSV
- Sort contacts by date added or alphabetically
- Tag system for more granular categorization
- Simple activity log per contact (e.g., "Sent intro email — April 28")

---

## Why This Project
This project pushes me to practice real-world JavaScript skills — specifically state management across multiple views, dynamic DOM rendering based on data, and persisting data in the browser. It also goes beyond a toy example by solving a genuine problem for an actual startup, which makes the design and UX decisions meaningful rather than arbitrary.

---

## Deliverables
- `PROPOSAL.md` — this document
- `README.md` — setup instructions, features, screenshots
- `index.html` — main entry point
- `style.css` — all custom styles
- `app.js` — application logic
- Deployed site via **GitHub Pages**
- Linked from `oim3690` repo README and `projects.html` portfolio page

---

## Repo
`https://github.com/732198/persephonebasket-crm`