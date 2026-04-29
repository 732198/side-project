// ── STATE ──────────────────────────────────────────────────────────────
const STORAGE_KEY  = 'pb_crm_contacts';
const ACTIVITY_KEY = 'pb_crm_activity';
const EVENTS_KEY   = 'pb_crm_events';

let contacts    = [];
let activityLog = {};
let events      = [];
let currentFilter = 'all';
let currentView   = 'dashboard';
let detailId      = null;
let calYear, calMonth;

// ── SEED DATA ──────────────────────────────────────────────────────────
const seedContacts = [
  { id:'seed1', name:"Flora Krivak-Tetley",    type:"Advisor",  email:"flora.krivak@dartmouth.edu",  location:"Hanover, NH",  crops:"", stage:"Active",   notes:"Invasive insect ecology researcher at Dartmouth. Key advisor for Sirex noctilio detection.", createdAt: Date.now()-86400000*5 },
  { id:'seed2', name:"Raymond Delacroix",       type:"Farmer",   email:"rdelacroix@valleyfarm.com",   location:"Concord, NH",  crops:"Corn, Soybean", stage:"Active",   notes:"250-acre operation. Early adopter, very engaged.", createdAt: Date.now()-86400000*3 },
  { id:'seed3', name:"Meridian Ag Ventures",    type:"Investor", email:"deals@meridianag.vc",          location:"Boston, MA",   crops:"", stage:"Outreach", notes:"AgTech-focused fund. Follow up after pitch deck revision.", createdAt: Date.now()-86400000*2 },
  { id:'seed4', name:"UNH Cooperative Extension",type:"Partner", email:"extension@unh.edu",            location:"Durham, NH",   crops:"", stage:"Prospect", notes:"Potential data-sharing partner.", createdAt: Date.now()-86400000*1 }
];

const seedActivity = {
  'seed1': [
    { id:'a1', text:'Initial intro call — discussed Sirex noctilio mapping approach', timestamp: Date.now()-86400000*4 },
    { id:'a2', text:'Sent research methodology doc for review', timestamp: Date.now()-86400000*2 }
  ],
  'seed2': [{ id:'a3', text:'On-site farm visit — demo of sensor hardware', timestamp: Date.now()-86400000*2 }]
};

function seedEvents() {
  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0,10);
  const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate()+n); return d; };
  return [
    { id:'e1', type:'meeting', contactId:'seed1', date: fmt(addDays(2)),  time:'10:00', notes:'Q2 research check-in',              createdAt: Date.now() },
    { id:'e2', type:'email',   contactId:'seed3', date: fmt(addDays(1)),  time:'09:00', notes:'Send updated pitch deck',           createdAt: Date.now() },
    { id:'e3', type:'call',    contactId:'seed2', date: fmt(addDays(5)),  time:'14:00', notes:'Monthly farm check-in call',        createdAt: Date.now() },
    { id:'e4', type:'followup',contactId:'seed4', date: fmt(addDays(7)),  time:'',      notes:'Follow up on data-sharing MOU',     createdAt: Date.now() },
    { id:'e5', type:'meeting', contactId:'seed3', date: fmt(addDays(10)), time:'11:30', notes:'Intro meeting with Meridian team',  createdAt: Date.now() },
  ];
}

// ── INIT ───────────────────────────────────────────────────────────────
function init() {
  const stored    = localStorage.getItem(STORAGE_KEY);
  const storedAct = localStorage.getItem(ACTIVITY_KEY);
  const storedEv  = localStorage.getItem(EVENTS_KEY);

  contacts    = stored    ? JSON.parse(stored)    : seedContacts;
  activityLog = storedAct ? JSON.parse(storedAct) : seedActivity;
  events      = storedEv  ? JSON.parse(storedEv)  : seedEvents();

  if (!stored)    save();
  if (!storedAct) saveActivity();
  if (!storedEv)  saveEvents();

  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();

  renderContacts();
  renderPipeline();
  renderStats();
  updateCount();
}

// ── STORAGE ────────────────────────────────────────────────────────────
function save()         { localStorage.setItem(STORAGE_KEY,  JSON.stringify(contacts)); }
function saveActivity() { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityLog)); }
function saveEvents()   { localStorage.setItem(EVENTS_KEY,   JSON.stringify(events)); }

// ── UTILS ──────────────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function initials(name) { return name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function avatarClass(type) { return {Farmer:'avatar-farmer',Advisor:'avatar-advisor',Investor:'avatar-investor',Partner:'avatar-partner'}[type]||'avatar-farmer'; }
function badgeClass(type)  { return {Farmer:'badge-farmer', Advisor:'badge-advisor', Investor:'badge-investor', Partner:'badge-partner'}[type] ||'badge-farmer'; }
function stageDotClass(stage) { return {Prospect:'prospect',Outreach:'outreach',Active:'active-stage',Partner:'partner-stage'}[stage]||'prospect'; }
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' · ' + d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}
function eventIcon(type) { return {meeting:'📅',email:'✉️',call:'📞',followup:'🔔'}[type]||'📅'; }
function eventLabel(type) { return {meeting:'Meeting',email:'Email',call:'Call',followup:'Follow-up'}[type]||type; }
function chipClass(type) { return {meeting:'chip-meeting',email:'chip-email',call:'chip-call',followup:'chip-followup'}[type]||'chip-meeting'; }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
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
  if (view === 'calendar') renderCalendar();
}

// ── FILTER ─────────────────────────────────────────────────────────────
function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === f));
  renderContacts();
}

function getFiltered() {
  const q = (document.getElementById('search-input')?.value||'').toLowerCase().trim();
  return contacts.filter(c => {
    const mt = currentFilter === 'all' || c.type === currentFilter;
    const ms = !q || [c.name,c.email,c.location,c.crops,c.notes].some(v=>(v||'').toLowerCase().includes(q));
    return mt && ms;
  });
}

// ── RENDER CONTACTS ────────────────────────────────────────────────────
function renderContacts() {
  const grid  = document.getElementById('contacts-grid');
  const empty = document.getElementById('empty-state');
  const list  = getFiltered();
  if (list.length === 0) { grid.innerHTML=''; empty.style.display='block'; updateCount(); renderStats(); return; }
  empty.style.display = 'none';
  grid.innerHTML = list.map(c => `
    <div class="contact-card" onclick="openDetail('${c.id}')">
      <div class="card-top">
        <div class="card-avatar ${avatarClass(c.type)}">${initials(c.name)}</div>
        <span class="type-badge ${badgeClass(c.type)}">${c.type}</span>
      </div>
      <div class="card-name">${c.name}</div>
      <div class="card-meta">
        ${c.email    ?`<span>✉ ${c.email}</span>`:''}
        ${c.location ?`<span>📍 ${c.location}</span>`:''}
        ${c.crops    ?`<span>🌾 ${c.crops}</span>`:''}
      </div>
      ${c.notes?`<p class="card-notes">${c.notes}</p>`:''}
      <div class="card-footer">
        <span class="stage-label"><span class="stage-dot ${stageDotClass(c.stage)}"></span>${c.stage}</span>
      </div>
    </div>`).join('');
  updateCount(); renderStats();
}

// ── STATS ──────────────────────────────────────────────────────────────
function renderStats() {
  document.getElementById('stat-total').textContent     = contacts.length;
  document.getElementById('stat-farmers').textContent   = contacts.filter(c=>c.type==='Farmer').length;
  document.getElementById('stat-advisors').textContent  = contacts.filter(c=>c.type==='Advisor').length;
  document.getElementById('stat-investors').textContent = contacts.filter(c=>c.type==='Investor').length;
  document.getElementById('stat-partners').textContent  = contacts.filter(c=>c.type==='Partner').length;
  document.getElementById('stat-active').textContent    = contacts.filter(c=>c.stage==='Active').length;
  document.getElementById('stat-prospect').textContent  = contacts.filter(c=>c.stage==='Prospect').length;
}

// ── PIPELINE ───────────────────────────────────────────────────────────
function renderPipeline() {
  ['Prospect','Outreach','Active','Partner'].forEach(stage => {
    const col = document.getElementById('col-'+stage);
    const cnt = document.getElementById('count-'+stage);
    const sc  = contacts.filter(c=>c.stage===stage);
    cnt.textContent = sc.length;
    col.innerHTML = sc.length === 0
      ? `<div class="kanban-empty">No contacts</div>`
      : sc.map(c=>`
        <div class="kanban-card" onclick="openDetail('${c.id}')">
          <div class="kanban-card-name">${c.name}</div>
          <div class="kanban-card-meta">${c.location||''}${c.location&&c.email?' · ':''}${c.email||''}</div>
          <span class="kanban-card-type ${badgeClass(c.type)}">${c.type}</span>
        </div>`).join('');
  });
}

// ── COUNT ──────────────────────────────────────────────────────────────
function updateCount() {
  document.getElementById('total-count').textContent = contacts.length===1?'1 contact':`${contacts.length} contacts`;
}

// ── CSV EXPORT ─────────────────────────────────────────────────────────
function exportCSV() {
  if (!contacts.length) { alert('No contacts to export.'); return; }
  const headers = ['Name','Type','Email','Location','Crops','Stage','Notes','Date Added'];
  const rows = contacts.map(c=>[c.name,c.type,c.email||'',c.location||'',c.crops||'',c.stage,(c.notes||'').replace(/"/g,'""'),new Date(c.createdAt).toLocaleDateString('en-US')].map(v=>`"${v}"`).join(','));
  const csv  = [headers.join(','),...rows].join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `pb-crm-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
  showToast(`✓ Exported ${contacts.length} contacts`);
}

// ── CSV IMPORT ─────────────────────────────────────────────────────────
function importCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split('\n').map(l=>l.trim()).filter(Boolean);
    if (lines.length < 2) { showToast('⚠️ CSV appears empty'); return; }

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g,'').toLowerCase().trim());
    const nameIdx     = headers.findIndex(h=>h.includes('name'));
    const typeIdx     = headers.findIndex(h=>h.includes('type'));
    const emailIdx    = headers.findIndex(h=>h.includes('email'));
    const locationIdx = headers.findIndex(h=>h.includes('location'));
    const cropsIdx    = headers.findIndex(h=>h.includes('crop'));
    const stageIdx    = headers.findIndex(h=>h.includes('stage'));
    const notesIdx    = headers.findIndex(h=>h.includes('note'));

    if (nameIdx === -1) { showToast('⚠️ CSV must have a "Name" column'); return; }

    const validTypes  = ['Farmer','Advisor','Investor','Partner'];
    const validStages = ['Prospect','Outreach','Active','Partner'];

    let added = 0, skipped = 0;

    lines.slice(1).forEach(line => {
      const cols = parseCSVLine(line);
      const name = (cols[nameIdx]||'').trim();
      if (!name) { skipped++; return; }

      const rawType  = (cols[typeIdx]||'').trim();
      const rawStage = (cols[stageIdx]||'').trim();

      const type  = validTypes.find(t=>t.toLowerCase()===rawType.toLowerCase())  || 'Farmer';
      const stage = validStages.find(s=>s.toLowerCase()===rawStage.toLowerCase()) || 'Prospect';

      const newId = uid();
      contacts.push({
        id:        newId,
        name,
        type,
        email:     emailIdx    !== -1 ? (cols[emailIdx]   ||'').trim() : '',
        location:  locationIdx !== -1 ? (cols[locationIdx]||'').trim() : '',
        crops:     cropsIdx    !== -1 ? (cols[cropsIdx]   ||'').trim() : '',
        stage,
        notes:     notesIdx    !== -1 ? (cols[notesIdx]   ||'').trim() : '',
        createdAt: Date.now()
      });
      activityLog[newId] = [{ id: uid(), text: 'Imported via CSV', timestamp: Date.now() }];
      added++;
    });

    save(); saveActivity();
    renderContacts(); renderPipeline(); renderStats(); updateCount();
    showToast(`✓ Imported ${added} contact${added!==1?'s':''}${skipped?` · ${skipped} skipped`:''}`);
    event.target.value = '';
  };
  reader.readAsText(file);
}

function parseCSVLine(line) {
  const result = [];
  let current = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── CONTACT MODAL ──────────────────────────────────────────────────────
function openModal(id=null) {
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('modal-title').textContent  = id ? 'Edit Contact' : 'Add Contact';
  document.getElementById('field-id').value = id||'';
  if (id) {
    const c = contacts.find(x=>x.id===id); if (!c) return;
    document.getElementById('field-name').value     = c.name||'';
    document.getElementById('field-type').value     = c.type||'';
    document.getElementById('field-email').value    = c.email||'';
    document.getElementById('field-location').value = c.location||'';
    document.getElementById('field-stage').value    = c.stage||'';
    document.getElementById('field-crops').value    = c.crops||'';
    document.getElementById('field-notes').value    = c.notes||'';
  } else {
    ['field-name','field-type','field-email','field-location','field-stage','field-crops','field-notes'].forEach(fid=>{ document.getElementById(fid).value=''; });
  }
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('field-name').focus(), 80);
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
function closeModalOnOverlay(e) { if (e.target===document.getElementById('modal-overlay')) closeModal(); }

function saveContact() {
  const id       = document.getElementById('field-id').value;
  const name     = document.getElementById('field-name').value.trim();
  const type     = document.getElementById('field-type').value;
  const email    = document.getElementById('field-email').value.trim();
  const location = document.getElementById('field-location').value.trim();
  const stage    = document.getElementById('field-stage').value;
  const crops    = document.getElementById('field-crops').value.trim();
  const notes    = document.getElementById('field-notes').value.trim();
  if (!name)  { showFormError('form-error','Please enter a name.'); return; }
  if (!type)  { showFormError('form-error','Please select a contact type.'); return; }
  if (!stage) { showFormError('form-error','Please select a stage.'); return; }
  document.getElementById('form-error').style.display='none';
  if (id) {
    const idx = contacts.findIndex(c=>c.id===id);
    if (idx!==-1) contacts[idx] = {...contacts[idx], name,type,email,location,stage,crops,notes};
  } else {
    const newId = uid();
    contacts.unshift({id:newId,name,type,email,location,stage,crops,notes,createdAt:Date.now()});
    if (!activityLog[newId]) activityLog[newId]=[];
    activityLog[newId].unshift({id:uid(),text:'Contact added',timestamp:Date.now()});
    saveActivity();
  }
  save(); closeModal(); renderContacts(); renderPipeline();
}

function showFormError(elId, msg) {
  const el = document.getElementById(elId);
  el.textContent=msg; el.style.display='block';
}

// ── DETAIL MODAL ───────────────────────────────────────────────────────
function openDetail(id) {
  const c = contacts.find(x=>x.id===id); if (!c) return;
  detailId = id;
  document.getElementById('detail-name').textContent = c.name;
  document.getElementById('detail-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><label>Type</label><p><span class="type-badge ${badgeClass(c.type)}">${c.type}</span></p></div>
      <div class="detail-item"><label>Stage</label>
        <div class="detail-stage-bar">
          <span class="stage-dot ${stageDotClass(c.stage)}"></span>
          <select id="detail-stage-select" onchange="updateStageFromDetail('${c.id}',this.value)">
            ${['Prospect','Outreach','Active','Partner'].map(s=>`<option ${c.stage===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      ${c.email    ?`<div class="detail-item"><label>Email</label><p>${c.email}</p></div>`:''}
      ${c.location ?`<div class="detail-item"><label>Location</label><p>${c.location}</p></div>`:''}
      ${c.crops    ?`<div class="detail-item detail-full"><label>Crop Types</label><p>${c.crops}</p></div>`:''}
      ${c.notes    ?`<div class="detail-item detail-full"><label>Notes</label><p>${c.notes}</p></div>`:''}
      <div class="detail-item"><label>Added</label><p>${new Date(c.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</p></div>
    </div>`;
  renderActivityList(id);
  document.getElementById('detail-overlay').classList.add('open');
}
function closeDetail() { document.getElementById('detail-overlay').classList.remove('open'); detailId=null; }
function closeDetailOnOverlay(e) { if (e.target===document.getElementById('detail-overlay')) closeDetail(); }

function updateStageFromDetail(id, stage) {
  const idx = contacts.findIndex(c=>c.id===id);
  if (idx!==-1) { const old=contacts[idx].stage; contacts[idx].stage=stage; save(); renderContacts(); renderPipeline(); logActivity(id,`Stage changed: ${old} → ${stage}`); }
  const dot = document.querySelector('.detail-stage-bar .stage-dot');
  if (dot) dot.className='stage-dot '+stageDotClass(stage);
}
function editFromDetail() { const id=detailId; closeDetail(); setTimeout(()=>openModal(id),80); }
function deleteFromDetail() {
  if (!detailId) return;
  const c = contacts.find(x=>x.id===detailId); if (!c) return;
  if (!confirm(`Delete ${c.name}? This cannot be undone.`)) return;
  contacts = contacts.filter(x=>x.id!==detailId);
  events   = events.filter(e=>e.contactId!==detailId);
  delete activityLog[detailId];
  save(); saveActivity(); saveEvents();
  closeDetail(); renderContacts(); renderPipeline();
  if (currentView==='calendar') renderCalendar();
}

// ── ACTIVITY LOG ───────────────────────────────────────────────────────
function logActivity(contactId, text) {
  if (!activityLog[contactId]) activityLog[contactId]=[];
  activityLog[contactId].unshift({id:uid(),text,timestamp:Date.now()});
  saveActivity();
  if (detailId===contactId) renderActivityList(contactId);
}
function addActivity() {
  if (!detailId) return;
  const input = document.getElementById('activity-input');
  const text  = input.value.trim(); if (!text) return;
  logActivity(detailId, text); input.value=''; input.focus();
}
function deleteActivity(contactId, activityId) {
  if (!activityLog[contactId]) return;
  activityLog[contactId] = activityLog[contactId].filter(a=>a.id!==activityId);
  saveActivity(); renderActivityList(contactId);
}
function renderActivityList(contactId) {
  const list = document.getElementById('activity-list');
  const acts = activityLog[contactId]||[];
  list.innerHTML = acts.length===0
    ? `<div class="activity-empty">No activity logged yet.</div>`
    : acts.map(a=>`
      <div class="activity-item">
        <span class="activity-dot"></span>
        <span class="activity-text">${a.text}</span>
        <span class="activity-time">${formatTime(a.timestamp)}</span>
        <button class="activity-delete" onclick="deleteActivity('${contactId}','${a.id}')" title="Remove">✕</button>
      </div>`).join('');
}

// ── CALENDAR ───────────────────────────────────────────────────────────
function changeMonth(dir) { calMonth += dir; if (calMonth>11){calMonth=0;calYear++;}else if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); }

function renderCalendar() {
  const label   = document.getElementById('cal-month-label');
  const daysEl  = document.getElementById('cal-days');
  const today   = new Date();

  label.textContent = new Date(calYear, calMonth, 1).toLocaleDateString('en-US',{month:'long',year:'numeric'});

  const firstDay  = new Date(calYear, calMonth, 1).getDay();
  const daysInMon = new Date(calYear, calMonth+1, 0).getDate();
  const daysInPrev= new Date(calYear, calMonth, 0).getDate();

  let html = '';
  // prev month padding
  for (let i = firstDay-1; i >= 0; i--) {
    html += `<div class="cal-cell other-month"><div class="cal-date">${daysInPrev-i}</div></div>`;
  }
  // current month
  for (let d = 1; d <= daysInMon; d++) {
    const dateStr  = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayEvents= events.filter(e=>e.date===dateStr);
    const isToday  = d===today.getDate() && calMonth===today.getMonth() && calYear===today.getFullYear();
    html += `<div class="cal-cell${isToday?' today':''}" onclick="handleDayClick('${dateStr}')">
      <div class="cal-date">${d}</div>
      <div class="cal-events">
        ${dayEvents.slice(0,3).map(e=>{
          const c = contacts.find(x=>x.id===e.contactId);
          return `<div class="cal-event-chip ${chipClass(e.type)}" onclick="event.stopPropagation();openEventModal('${e.id}')" title="${c?c.name:'Unknown'} — ${eventLabel(e.type)}">${eventIcon(e.type)} ${c?c.name.split(' ')[0]:'?'}</div>`;
        }).join('')}
        ${dayEvents.length>3?`<div class="cal-event-chip chip-meeting">+${dayEvents.length-3} more</div>`:''}
      </div>
    </div>`;
  }
  // next month padding
  const total = firstDay + daysInMon;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= remaining; d++) {
    html += `<div class="cal-cell other-month"><div class="cal-date">${d}</div></div>`;
  }

  daysEl.innerHTML = html;
  renderUpcoming();
}

function handleDayClick(dateStr) {
  openEventModal(null, dateStr);
}

function renderUpcoming() {
  const list  = document.getElementById('upcoming-list');
  const count = document.getElementById('upcoming-count');
  const today = new Date().toISOString().slice(0,10);

  const sorted = [...events].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  const upcoming = sorted.filter(e=>e.date>=today);
  const past     = sorted.filter(e=>e.date<today).slice(-3).reverse();
  const display  = [...upcoming, ...past];

  count.textContent = upcoming.length;

  if (display.length===0) { list.innerHTML=`<div class="upcoming-empty">No events scheduled yet.</div>`; return; }

  list.innerHTML = display.map(e=>{
    const c    = contacts.find(x=>x.id===e.contactId);
    const isPast = e.date < today;
    const dateLabel = new Date(e.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    return `<div class="upcoming-item${isPast?' past':''}" onclick="openEventModal('${e.id}')">
      <span class="upcoming-icon">${eventIcon(e.type)}</span>
      <div class="upcoming-info">
        <div class="upcoming-contact">${c?c.name:'Unknown contact'}</div>
        <div class="upcoming-meta">${eventLabel(e.type)} · ${dateLabel}${e.time?' · '+formatDisplayTime(e.time):''}</div>
        ${e.notes?`<div class="upcoming-meta" style="margin-top:2px;font-style:italic;">${e.notes}</div>`:''}
      </div>
      <button class="upcoming-delete" onclick="event.stopPropagation();deleteEvent('${e.id}')" title="Delete">✕</button>
    </div>`;
  }).join('');
}

function formatDisplayTime(t) {
  if (!t) return '';
  const [h,m] = t.split(':');
  const hh = parseInt(h);
  return `${hh>12?hh-12:hh||12}:${m} ${hh>=12?'PM':'AM'}`;
}

function deleteEvent(id) {
  events = events.filter(e=>e.id!==id);
  saveEvents(); renderCalendar();
}

// ── EVENT MODAL ────────────────────────────────────────────────────────
function openEventModal(id=null, prefillDate=null) {
  document.getElementById('event-error').style.display='none';
  document.getElementById('event-modal-title').textContent = id ? 'Edit Event' : 'Schedule Event';
  document.getElementById('event-id').value = id||'';

  // populate contact dropdown
  const sel = document.getElementById('event-contact');
  sel.innerHTML = `<option value="">Select contact…</option>` +
    contacts.map(c=>`<option value="${c.id}">${c.name} (${c.type})</option>`).join('');

  if (id) {
    const ev = events.find(e=>e.id===id); if (!ev) return;
    document.getElementById('event-type').value    = ev.type;
    document.getElementById('event-contact').value = ev.contactId;
    document.getElementById('event-date').value    = ev.date;
    document.getElementById('event-time').value    = ev.time||'';
    document.getElementById('event-notes').value   = ev.notes||'';
  } else {
    document.getElementById('event-type').value    = '';
    document.getElementById('event-contact').value = '';
    document.getElementById('event-date').value    = prefillDate || new Date().toISOString().slice(0,10);
    document.getElementById('event-time').value    = '';
    document.getElementById('event-notes').value   = '';
  }

  document.getElementById('event-overlay').classList.add('open');
}
function closeEventModal() { document.getElementById('event-overlay').classList.remove('open'); }
function closeEventOnOverlay(e) { if (e.target===document.getElementById('event-overlay')) closeEventModal(); }

function saveEvent() {
  const id        = document.getElementById('event-id').value;
  const type      = document.getElementById('event-type').value;
  const contactId = document.getElementById('event-contact').value;
  const date      = document.getElementById('event-date').value;
  const time      = document.getElementById('event-time').value;
  const notes     = document.getElementById('event-notes').value.trim();

  if (!type)      { showFormError('event-error','Please select an event type.'); return; }
  if (!contactId) { showFormError('event-error','Please select a contact.'); return; }
  if (!date)      { showFormError('event-error','Please select a date.'); return; }

  document.getElementById('event-error').style.display='none';

  if (id) {
    const idx = events.findIndex(e=>e.id===id);
    if (idx!==-1) events[idx] = {...events[idx], type, contactId, date, time, notes};
  } else {
    events.push({id:uid(), type, contactId, date, time, notes, createdAt:Date.now()});
    // auto-log on the contact
    logActivity(contactId, `${eventLabel(type)} scheduled for ${new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}`);
  }

  saveEvents(); closeEventModal(); renderCalendar();
}

// ── KEYBOARD ───────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key==='Escape') { closeModal(); closeDetail(); closeEventModal(); }
  if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); const s=document.getElementById('search-input'); if (s){switchView('dashboard');s.focus();} }
  if (e.key==='Enter' && document.activeElement?.id==='activity-input') addActivity();
});

// ── START ──────────────────────────────────────────────────────────────
init();