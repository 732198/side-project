// ── STATE ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'pb_crm_contacts';
let contacts = [];
let currentFilter = 'all';
let currentView = 'dashboard';
let detailId = null;

// ── SEED DATA ──────────────────────────────────────────────────────────
const seedContacts = [
  {
    id: uid(),
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
    id: uid(),
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
    id: uid(),
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
    id: uid(),
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

// ── INIT ───────────────────────────────────────────────────────────────
function init() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    contacts = JSON.parse(stored);
  } else {
    contacts = seedContacts;
    save();
  }
  renderContacts();
  renderPipeline();
  updateCount();
}

// ── STORAGE ────────────────────────────────────────────────────────────
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

// ── UTILS ──────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avatarClass(type) {
  const map = { Farmer: 'avatar-farmer', Advisor: 'avatar-advisor', Investor: 'avatar-investor', Partner: 'avatar-partner' };
  return map[type] || 'avatar-farmer';
}

function badgeClass(type) {
  const map = { Farmer: 'badge-farmer', Advisor: 'badge-advisor', Investor: 'badge-investor', Partner: 'badge-partner' };
  return map[type] || 'badge-farmer';
}

function stageDotClass(stage) {
  const map = { Prospect: 'prospect', Outreach: 'outreach', Active: 'active-stage', Partner: 'partner-stage' };
  return map[stage] || 'prospect';
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
    const matchType = currentFilter === 'all' || c.type === currentFilter;
    const matchSearch = !query ||
      c.name.toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.location || '').toLowerCase().includes(query) ||
      (c.crops || '').toLowerCase().includes(query) ||
      (c.notes || '').toLowerCase().includes(query);
    return matchType && matchSearch;
  });
}

// ── RENDER CONTACTS ────────────────────────────────────────────────────
function renderContacts() {
  const grid = document.getElementById('contacts-grid');
  const empty = document.getElementById('empty-state');
  const filtered = getFiltered();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    updateCount();
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
        ${c.email ? `<span>✉ ${c.email}</span>` : ''}
        ${c.location ? `<span>📍 ${c.location}</span>` : ''}
        ${c.crops ? `<span>🌾 ${c.crops}</span>` : ''}
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
}

// ── RENDER PIPELINE ────────────────────────────────────────────────────
function renderPipeline() {
  const stages = ['Prospect', 'Outreach', 'Active', 'Partner'];
  stages.forEach(stage => {
    const col = document.getElementById('col-' + stage);
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
          ${c.location ? c.location : ''}
          ${c.location && c.email ? ' · ' : ''}
          ${c.email ? c.email : ''}
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

// ── ADD / EDIT MODAL ───────────────────────────────────────────────────
function openModal(id = null) {
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('modal-title').textContent = id ? 'Edit Contact' : 'Add Contact';
  document.getElementById('field-id').value = id || '';

  if (id) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    document.getElementById('field-name').value     = c.name || '';
    document.getElementById('field-type').value     = c.type || '';
    document.getElementById('field-email').value    = c.email || '';
    document.getElementById('field-location').value = c.location || '';
    document.getElementById('field-stage').value    = c.stage || '';
    document.getElementById('field-crops').value    = c.crops || '';
    document.getElementById('field-notes').value    = c.notes || '';
  } else {
    document.getElementById('field-name').value     = '';
    document.getElementById('field-type').value     = '';
    document.getElementById('field-email').value    = '';
    document.getElementById('field-location').value = '';
    document.getElementById('field-stage').value    = '';
    document.getElementById('field-crops').value    = '';
    document.getElementById('field-notes').value    = '';
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

  const errEl = document.getElementById('form-error');

  if (!name) { showError('Please enter a name.'); return; }
  if (!type) { showError('Please select a contact type.'); return; }
  if (!stage) { showError('Please select a stage.'); return; }

  errEl.style.display = 'none';

  if (id) {
    const idx = contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      contacts[idx] = { ...contacts[idx], name, type, email, location, stage, crops, notes };
    }
  } else {
    contacts.unshift({ id: uid(), name, type, email, location, stage, crops, notes, createdAt: Date.now() });
  }

  save();
  closeModal();
  renderContacts();
  renderPipeline();
}

function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
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
            <option ${c.stage==='Active'?'selected':''}>Active</option>
            <option ${c.stage==='Partner'?'selected':''}>Partner</option>
          </select>
        </div>
      </div>
      ${c.email ? `<div class="detail-item"><label>Email</label><p>${c.email}</p></div>` : ''}
      ${c.location ? `<div class="detail-item"><label>Location</label><p>${c.location}</p></div>` : ''}
      ${c.crops ? `<div class="detail-item detail-full"><label>Crop Types</label><p>${c.crops}</p></div>` : ''}
      ${c.notes ? `<div class="detail-item detail-full"><label>Notes</label><p>${c.notes}</p></div>` : ''}
      <div class="detail-item">
        <label>Added</label>
        <p>${new Date(c.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}</p>
      </div>
    </div>
  `;

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
    contacts[idx].stage = stage;
    save();
    renderContacts();
    renderPipeline();
  }
  // update dot in detail modal
  const dot = document.querySelector('.detail-stage-bar .stage-dot');
  if (dot) {
    dot.className = 'stage-dot ' + stageDotClass(stage);
  }
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
  save();
  closeDetail();
  renderContacts();
  renderPipeline();
}

// ── KEYBOARD SHORTCUTS ─────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeDetail();
  }
  // Cmd/Ctrl + K to focus search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const s = document.getElementById('search-input');
    if (s) { switchView('dashboard'); s.focus(); }
  }
});

// ── START ──────────────────────────────────────────────────────────────
init();