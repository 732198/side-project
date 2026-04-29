// ── STATE ──────────────────────────────────────────────────────────────
const STORAGE_KEY    = 'pb_crm_contacts';
const ACTIVITY_KEY   = 'pb_crm_activity';

let contacts  = [];
let activityLog = {}; // { contactId: [{ id, text, timestamp }] }
let currentFilter = 'all';
let currentView   = 'dashboard';
let detailId      = null;

// ── SEED DATA ──────────────────────────────────────────────────────────
const seedContacts = [
  {
    id: 'seed1',
    name: "Flora Krivak-Tetley",
    type: "Advisor",
    email: "flora.krivak@dartmouth.edu",
    location: "Hanover, NH",
    crops: "",
    stage: "Active",
    notes: "Invasive insect ecology researcher at Dartmouth. Key advisor for Sirex noctilio detection methodology.",
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'seed2',
    name: "Raymond Delacroix",
    type: "Farmer",
    email: "rdelacroix@valleyfarm.com",
    location: "Concord, NH",
    crops: "Corn, Soybean",
    stage: "Active",
    notes: "250-acre operation. Early adopter, very engaged. Wants monthly check-ins.",
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'seed3',
    name: "Meridian Ag Ventures",
    type: "Investor",
    email: "deals@meridianag.vc",
    location: "Boston, MA",
    crops: "",
    stage: "Outreach",
    notes: "AgTech-focused fund. Intro from NUIH. Follow up after pitch deck revision.",
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'seed4',
    name: "UNH Cooperative Extension",
    type: "Partner",
    email: "extension@unh.edu",
    location: "Durham, NH",
    crops: "",
    stage: "Prospect",
    notes: "Potential data-sharing partner. Could provide access to regional farm network.",
    createdAt: Date.now() - 86400000 * 1
  }
];

const seedActivity = {
  'seed1': [
    { id: 'a1', text: 'Initial intro call — discussed Sirex noctilio mapping approach', timestamp: Date.now() - 86400000 * 4 },
    { id: 'a2', text: 'Sent research methodology doc for review', timestamp: Date.now() - 86400000 * 2 }
  ],
  'seed2': [
    { id: 'a3', text: 'On-site farm visit — demo of sensor hardware', timestamp: Date.now() - 86400000 * 2 }
  ]
};

// ── INIT ───────────────────────────────────────────────────────────────
function init() {
  const stored         = localStorage.getItem(STORAGE_KEY);
  const storedActivity = localStorage.getItem(ACTIVITY_KEY);

  contacts    = stored         ? JSON.parse(stored)         : seedContacts;
  activityLog = storedActivity ? JSON.parse(storedActivity) : seedActivity;

  if (!stored)         save();
  if (!storedActivity) saveActivity();

  renderContacts();
  renderPipeline();
  updateCount();
  renderStats();
}

// ── STORAGE ────────────────────────────────────────────────────────────
function save()         { localStorage.setItem(STORAGE_KEY,  JSON.stringify(contacts)); }
function saveActivity() { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityLog)); }

// ── UTILS ──────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function avatarClass(type) {
  return { Farmer: 'avatar-farmer', Advisor: 'avatar-advisor', Investor: 'avatar-investor', Partner: 'avatar-partner' }[type] || 'avatar-farmer';
}
function badgeClass(type) {
  return { Farmer: 'badge-farmer', Advisor: 'badge-advisor', Investor: 'badge-investor', Partner: 'badge-partner' }[type] || 'badge-farmer';
}
function stageDotClass(stage) {
  return { Prospect: 'prospect', Outreach: 'outreach', Active: 'active-stage', Partner: 'partner-stage' }[stage] || 'prospect';
}
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ── VIEW SWITCHING ─────────────────────────────────────────────────────
function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  if (view === 'pipeline') renderPipeline();
}

// ── FILTER ─────────────────────────────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderContacts();
}

function getFiltered() {
  const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  return contacts.filter(c => {
    const matchType   = currentFilter === 'all' || c.type === currentFilter;
    const matchSearch = !query ||
      c.name.toLowerCase().includes(query) ||
      (c.email    || '').toLowerCase().includes(query) ||
      (c.location || '').toLowerCase().includes(query) ||
      (c.crops    || '').toLowerCase().includes(query) ||
      (c.notes    || '').toLowerCase().includes(query);
    return matchType && matchSearch;
  });
}

// ── RENDER CONTACTS ────────────────────────────────────────────────────
function renderContacts() {
  const grid     = document.getElementById('contacts-grid');
  const empty    = document.getElementById('empty-state');
  const filtered = getFiltered();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    updateCount();
    renderStats();
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = filtered.map(c => `
    <div class="contact-card" onclick="openDetail('${c.id}')">
      <div class="card-top">
        <div class="card-avatar ${avatarClass(c.type)}">${initials(c.name)}</div>
        <span class="type-badge ${badgeClass(c.type)}">${c.type}</span>
      </div>
      <div class="card-name">${c.name}</div>
      <div class="card-meta">
        ${c.email    ? `<span>✉ ${c.email}</span>`    : ''}
        ${c.location ? `<span>📍 ${c.location}</span>` : ''}
        ${c.crops    ? `<span>🌾 ${c.crops}</span>`    : ''}
      </div>
      ${c.notes ? `<p class="card-notes">${c.notes}</p>` : ''}
      <div class="card-footer">
        <span class="stage-label">
          <span class="stage-dot ${stageDotClass(c.stage)}"></span>
          ${c.stage}
        </span>
      </div>
    </div>
  `).join('');

  updateCount();
  renderStats();
}

// ── STATS BAR ──────────────────────────────────────────────────────────
function renderStats() {
  document.getElementById('stat-total').textContent     = contacts.length;
  document.getElementById('stat-farmers').textContent   = contacts.filter(c => c.type  === 'Farmer').length;
  document.getElementById('stat-advisors').textContent  = contacts.filter(c => c.type  === 'Advisor').length;
  document.getElementById('stat-investors').textContent = contacts.filter(c => c.type  === 'Investor').length;
  document.getElementById('stat-partners').textContent  = contacts.filter(c => c.type  === 'Partner').length;
  document.getElementById('stat-active').textContent    = contacts.filter(c => c.stage === 'Active').length;
  document.getElementById('stat-prospect').textContent  = contacts.filter(c => c.stage === 'Prospect').length;
}

// ── RENDER PIPELINE ────────────────────────────────────────────────────
function renderPipeline() {
  const stages = ['Prospect', 'Outreach', 'Active', 'Partner'];
  stages.forEach(stage => {
    const col   = document.getElementById('col-'   + stage);
    const count = document.getElementById('count-' + stage);
    const stageContacts = contacts.filter(c => c.stage === stage);

    count.textContent = stageContacts.length;

    if (stageContacts.length === 0) {
      col.innerHTML = `<div class="kanban-empty">No contacts</div>`;
      return;
    }

    col.innerHTML = stageContacts.map(c => `
      <div class="kanban-card" onclick="openDetail('${c.id}')">
        <div class="kanban-card-name">${c.name}</div>
        <div class="kanban-card-meta">
          ${c.location ? c.location : ''}${c.location && c.email ? ' · ' : ''}${c.email ? c.email : ''}
        </div>
        <span class="kanban-card-type ${badgeClass(c.type)}">${c.type}</span>
      </div>
    `).join('');
  });
}

// ── COUNT ──────────────────────────────────────────────────────────────
function updateCount() {
  document.getElementById('total-count').textContent =
    contacts.length === 1 ? '1 contact' : `${contacts.length} contacts`;
}

// ── CSV EXPORT ─────────────────────────────────────────────────────────
function exportCSV() {
  if (contacts.length === 0) {
    alert('No contacts to export.');
    return;
  }

  const headers = ['Name', 'Type', 'Email', 'Location', 'Crops', 'Stage', 'Notes', 'Date Added'];
  const rows = contacts.map(c => [
    c.name,
    c.type,
    c.email    || '',
    c.location || '',
    c.crops    || '',
    c.stage,
    (c.notes   || '').replace(/"/g, '""'),
    new Date(c.createdAt).toLocaleDateString('en-US')
  ].map(v => `"${v}"`).join(','));

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);

  link.href     = url;
  link.download = `persephones-basket-crm-${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── ADD / EDIT MODAL ───────────────────────────────────────────────────
function openModal(id = null) {
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('modal-title').textContent  = id ? 'Edit Contact' : 'Add Contact';
  document.getElementById('field-id').value = id || '';

  if (id) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    document.getElementById('field-name').value     = c.name     || '';
    document.getElementById('field-type').value     = c.type     || '';
    document.getElementById('field-email').value    = c.email    || '';
    document.getElementById('field-location').value = c.location || '';
    document.getElementById('field-stage').value    = c.stage    || '';
    document.getElementById('field-crops').value    = c.crops    || '';
    document.getElementById('field-notes').value    = c.notes    || '';
  } else {
    ['field-name','field-type','field-email','field-location','field-stage','field-crops','field-notes']
      .forEach(fid => { document.getElementById(fid).value = ''; });
  }

  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('field-name').focus(), 80);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function saveContact() {
  const id       = document.getElementById('field-id').value;
  const name     = document.getElementById('field-name').value.trim();
  const type     = document.getElementById('field-type').value;
  const email    = document.getElementById('field-email').value.trim();
  const location = document.getElementById('field-location').value.trim();
  const stage    = document.getElementById('field-stage').value;
  const crops    = document.getElementById('field-crops').value.trim();
  const notes    = document.getElementById('field-notes').value.trim();

  if (!name)  { showError('Please enter a name.');          return; }
  if (!type)  { showError('Please select a contact type.'); return; }
  if (!stage) { showError('Please select a stage.');        return; }

  document.getElementById('form-error').style.display = 'none';

  if (id) {
    const idx = contacts.findIndex(c => c.id === id);
    if (idx !== -1) contacts[idx] = { ...contacts[idx], name, type, email, location, stage, crops, notes };
  } else {
    const newId = uid();
    contacts.unshift({ id: newId, name, type, email, location, stage, crops, notes, createdAt: Date.now() });
    if (!activityLog[newId]) activityLog[newId] = [];
    activityLog[newId].unshift({ id: uid(), text: 'Contact added', timestamp: Date.now() });
    saveActivity();
  }

  save();
  closeModal();
  renderContacts();
  renderPipeline();
}

function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent   = msg;
  el.style.display = 'block';
}

// ── DETAIL MODAL ───────────────────────────────────────────────────────
function openDetail(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  detailId = id;

  document.getElementById('detail-name').textContent = c.name;
  document.getElementById('detail-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <label>Type</label>
        <p><span class="type-badge ${badgeClass(c.type)}">${c.type}</span></p>
      </div>
      <div class="detail-item">
        <label>Stage</label>
        <div class="detail-stage-bar">
          <span class="stage-dot ${stageDotClass(c.stage)}"></span>
          <select id="detail-stage-select" onchange="updateStageFromDetail('${c.id}', this.value)">
            <option ${c.stage==='Prospect'?'selected':''}>Prospect</option>
            <option ${c.stage==='Outreach'?'selected':''}>Outreach</option>
            <option ${c.stage==='Active'  ?'selected':''}>Active</option>
            <option ${c.stage==='Partner' ?'selected':''}>Partner</option>
          </select>
        </div>
      </div>
      ${c.email    ? `<div class="detail-item"><label>Email</label><p>${c.email}</p></div>`       : ''}
      ${c.location ? `<div class="detail-item"><label>Location</label><p>${c.location}</p></div>` : ''}
      ${c.crops    ? `<div class="detail-item detail-full"><label>Crop Types</label><p>${c.crops}</p></div>` : ''}
      ${c.notes    ? `<div class="detail-item detail-full"><label>Notes</label><p>${c.notes}</p></div>`      : ''}
      <div class="detail-item">
        <label>Added</label>
        <p>${new Date(c.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}</p>
      </div>
    </div>
  `;

  renderActivityList(id);
  document.getElementById('detail-overlay').classList.add('open');
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.remove('open');
  detailId = null;
}

function closeDetailOnOverlay(e) {
  if (e.target === document.getElementById('detail-overlay')) closeDetail();
}

function updateStageFromDetail(id, stage) {
  const idx = contacts.findIndex(c => c.id === id);
  if (idx !== -1) {
    const oldStage = contacts[idx].stage;
    contacts[idx].stage = stage;
    save();
    renderContacts();
    renderPipeline();
    logActivity(id, `Stage changed: ${oldStage} → ${stage}`);
  }
  const dot = document.querySelector('.detail-stage-bar .stage-dot');
  if (dot) dot.className = 'stage-dot ' + stageDotClass(stage);
}

function editFromDetail() {
  const id = detailId;
  closeDetail();
  setTimeout(() => openModal(id), 80);
}

function deleteFromDetail() {
  if (!detailId) return;
  const c = contacts.find(x => x.id === detailId);
  if (!c) return;
  if (!confirm(`Delete ${c.name}? This cannot be undone.`)) return;
  contacts = contacts.filter(x => x.id !== detailId);
  delete activityLog[detailId];
  save();
  saveActivity();
  closeDetail();
  renderContacts();
  renderPipeline();
}

// ── ACTIVITY LOG ───────────────────────────────────────────────────────
function logActivity(contactId, text) {
  if (!activityLog[contactId]) activityLog[contactId] = [];
  activityLog[contactId].unshift({ id: uid(), text, timestamp: Date.now() });
  saveActivity();
  if (detailId === contactId) renderActivityList(contactId);
}

function addActivity() {
  if (!detailId) return;
  const input = document.getElementById('activity-input');
  const text  = input.value.trim();
  if (!text) return;
  logActivity(detailId, text);
  input.value = '';
  input.focus();
}

function deleteActivity(contactId, activityId) {
  if (!activityLog[contactId]) return;
  activityLog[contactId] = activityLog[contactId].filter(a => a.id !== activityId);
  saveActivity();
  renderActivityList(contactId);
}

function renderActivityList(contactId) {
  const list       = document.getElementById('activity-list');
  const activities = activityLog[contactId] || [];

  if (activities.length === 0) {
    list.innerHTML = `<div class="activity-empty">No activity logged yet.</div>`;
    return;
  }

  list.innerHTML = activities.map(a => `
    <div class="activity-item">
      <span class="activity-dot"></span>
      <span class="activity-text">${a.text}</span>
      <span class="activity-time">${formatTime(a.timestamp)}</span>
      <button class="activity-delete" onclick="deleteActivity('${contactId}', '${a.id}')" title="Remove">✕</button>
    </div>
  `).join('');
}

// ── KEYBOARD SHORTCUTS ─────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeDetail(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const s = document.getElementById('search-input');
    if (s) { switchView('dashboard'); s.focus(); }
  }
  if (e.key === 'Enter' && document.activeElement?.id === 'activity-input') {
    addActivity();
  }
});

// ── START ──────────────────────────────────────────────────────────────
init();