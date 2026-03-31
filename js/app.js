/* SQLCraft — app logic */

let db = null;
let currentEx = null;
let solvedIds = new Set(JSON.parse(localStorage.getItem('sqlcraft_solved')||'[]'));
let doneWeeks = new Set(JSON.parse(localStorage.getItem('sqlcraft_weeks')||'[]'));
let currentFilter = 'all';
let openModalWeek = null;

function saveSolved() { localStorage.setItem('sqlcraft_solved', JSON.stringify([...solvedIds])); }
function saveWeeks() { localStorage.setItem('sqlcraft_weeks', JSON.stringify([...doneWeeks])); }

async function initDB() {
  const SQL = await initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` });
  db = new SQL.Database();
  db.run(DB_SQL);
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
  const pg = document.getElementById('page-' + name);
  if (pg) pg.classList.add('active');
  const map = {home:0, curriculum:1, practice:2, cheatsheet:3, progress:4, contact:5};
  const tabs = document.querySelectorAll('.nav-tab');
  const dtabs = document.querySelectorAll('.drawer-tab');
  if (map[name] !== undefined) {
    if (tabs[map[name]]) tabs[map[name]].classList.add('active');
    if (dtabs[map[name]]) dtabs[map[name]].classList.add('active');
  }
  if (name === 'curriculum') renderCurriculum();
  if (name === 'progress') renderProgress();
  if (name === 'cheatsheet') renderCheatSheet();
  const footer = document.querySelector('.site-footer');
  if (footer) footer.style.display = name === 'practice' ? 'none' : 'block';
  window.scrollTo(0,0);
  updateNav();
}

function toggleDrawer() {
  const drawer = document.getElementById('nav-drawer');
  const burger = document.getElementById('nav-hamburger');
  const open = drawer.classList.toggle('open');
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

function updateNav() {
  document.getElementById('nav-solved').textContent = solvedIds.size;
  const mob = document.getElementById('nav-solved-mobile');
  if (mob) mob.textContent = solvedIds.size;
}

function renderCurriculum() {
  const grid = document.getElementById('curriculum-grid');
  grid.innerHTML = weekData.map(w => `
    <div class="week-card ${w.ph} ${doneWeeks.has(w.w)?'solved':''}" onclick="openWeekModal(${w.w})">
      ${doneWeeks.has(w.w)?'<div class="wc-done-badge">✓</div>':''}
      <div class="wc-top">
        <span class="wc-num">WEEK ${w.w}</span>
        <span class="wc-badge ${w.badge}">${w.label}</span>
      </div>
      <div class="wc-title">${w.title}</div>
      <div class="wc-meta">${w.time} · ${w.topics.length} topics</div>
    </div>
  `).join('');
}

function openWeekModal(wNum) {
  const w = weekData.find(x => x.w === wNum);
  openModalWeek = wNum;
  document.getElementById('modal-week-num').textContent = `WEEK ${w.w} — ${w.label.toUpperCase()}`;
  document.getElementById('modal-title').textContent = w.title;
  document.getElementById('modal-topics').innerHTML = w.topics.map(t =>
    `<div class="topic-row"><div class="topic-check"></div><span>${t}</span></div>`
  ).join('');
  document.getElementById('modal-deliverable').textContent = w.del;
  document.getElementById('modal-mark-btn').textContent = doneWeeks.has(wNum) ? 'Mark incomplete' : 'Mark as done';
  document.getElementById('week-modal').classList.add('open');
}

function toggleWeekDone() {
  if (doneWeeks.has(openModalWeek)) doneWeeks.delete(openModalWeek);
  else doneWeeks.add(openModalWeek);
  saveWeeks();
  document.getElementById('modal-mark-btn').textContent = doneWeeks.has(openModalWeek) ? 'Mark incomplete' : 'Mark as done';
  renderCurriculum();
  updateNav();
}

function closeModal() {
  document.getElementById('week-modal').classList.remove('open');
}

function renderExerciseList(filter) {
  const list = document.getElementById('exercise-list');
  const filtered = filter === 'all' ? exercises : exercises.filter(e => e.diff === filter);
  document.getElementById('ep-count').textContent = `${filtered.length} exercises`;
  list.innerHTML = filtered.map(e => `
    <div class="ex-item ${solvedIds.has(e.id)?'solved':''} ${currentEx&&currentEx.id===e.id?'active':''}" onclick="loadExercise(${e.id})">
      <div class="ex-title">${e.title}</div>
      <div class="ex-meta">
        <div class="diff-dot diff-${e.diff}"></div>
        <span class="diff-label">${e.diff}</span>
        <span class="ex-topic">${e.topic}</span>
      </div>
    </div>
  `).join('');
}

function filterEx(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderExerciseList(f);
}

function loadExercise(id) {
  currentEx = exercises.find(e => e.id === id);
  document.getElementById('problem-title').textContent = currentEx.title;
  document.getElementById('problem-desc').textContent = currentEx.desc;
  const schemaSection = document.getElementById('schema-section');
  schemaSection.style.display = 'block';
  const tablesDiv = document.getElementById('schema-tables');
  tablesDiv.innerHTML = currentEx.tables.map(t => {
    const info = SCHEMA_INFO[t];
    return `<div class="schema-table">
      <div class="st-name">${t}</div>
      ${info.fields.map(f => {
        const parts = f.split(' ');
        return `<div class="st-field">${parts[0]} <span>${parts.slice(1).join(' ')}</span></div>`;
      }).join('')}
    </div>`;
  }).join('');
  const editor = document.getElementById('sql-editor');
  editor.value = currentEx.starter || '';
  document.getElementById('result-status').style.display = 'none';
  document.getElementById('results-body').innerHTML = '<div class="empty-state">Run your query to see results</div>';
  document.getElementById('hint-box').classList.remove('show');
  updateLineNums();
  renderExerciseList(currentFilter);
  editor.focus();
}

function runQuery() {
  if (!db) { document.getElementById('results-body').innerHTML = '<div class="empty-state" style="color:var(--amber)">Database loading... try again in a moment.</div>'; return; }
  if (!currentEx) { document.getElementById('results-body').innerHTML = '<div class="empty-state">Select an exercise first.</div>'; return; }
  const sql = document.getElementById('sql-editor').value.trim();
  if (!sql) return;
  const statusEl = document.getElementById('result-status');
  const bodyEl = document.getElementById('results-body');
  try {
    const results = db.exec(sql);
    if (!results.length) {
      bodyEl.innerHTML = '<div class="empty-state">Query ran successfully. No rows returned.</div>';
      statusEl.className = 'result-status status-success';
      statusEl.textContent = 'OK';
      statusEl.style.display = 'flex';
      return;
    }
    const { columns, values } = results[0];
    const rows = values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
    const rowCountEl = document.getElementById('result-row-count');
    if (rowCountEl) rowCountEl.textContent = rows.length + ' row' + (rows.length !== 1 ? 's' : '');
    const isCorrect = currentEx.validate(rows);
    if (isCorrect && !solvedIds.has(currentEx.id)) {
      solvedIds.add(currentEx.id);
      saveSolved();
      updateNav();
      renderExerciseList(currentFilter);
    }
    statusEl.className = 'result-status ' + (isCorrect ? 'status-correct' : 'status-wrong');
    statusEl.textContent = isCorrect ? '✓ Correct!' : '✗ Not quite';
    statusEl.style.display = 'flex';
    bodyEl.innerHTML = `
      <table class="results-table">
        <thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${rows.slice(0,50).map(r => `<tr>${columns.map(c => `<td>${r[c] === null ? '<span style="color:var(--faint)">NULL</span>' : r[c]}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      ${rows.length > 50 ? `<div style="font-size:12px;color:var(--muted);padding:8px 12px">Showing 50 of ${rows.length} rows</div>` : ''}
    `;
  } catch (e) {
    statusEl.className = 'result-status status-error';
    statusEl.textContent = 'Error';
    statusEl.style.display = 'flex';
    bodyEl.innerHTML = `<div style="color:var(--red);font-family:var(--mono);font-size:13px;padding:12px">${e.message}</div>`;
  }
}

function showHint() {
  const box = document.getElementById('hint-box');
  if (!currentEx) return;
  box.textContent = currentEx.hint;
  box.classList.toggle('show');
}

function resetEditor() {
  if (!currentEx) return;
  document.getElementById('sql-editor').value = currentEx.starter || '';
  document.getElementById('hint-box').classList.remove('show');
  document.getElementById('result-status').style.display = 'none';
  document.getElementById('results-body').innerHTML = '<div class="empty-state">Run your query to see results</div>';
  updateLineNums();
}

function updateLineNums() {
  const editor = document.getElementById('sql-editor');
  const lines = editor.value.split('\n').length;
  document.getElementById('line-nums').textContent = Array.from({length: Math.max(lines, 20)}, (_, i) => i + 1).join('\n');
}

function renderProgress() {
  const phase1 = exercises.filter(e=>e.phase===1);
  const phase2 = exercises.filter(e=>e.phase===2);
  const phase3 = exercises.filter(e=>e.phase===3);
  const phase4 = exercises.filter(e=>e.phase===4);
  const s1 = phase1.filter(e=>solvedIds.has(e.id)).length;
  const s2 = phase2.filter(e=>solvedIds.has(e.id)).length;
  const s3 = phase3.filter(e=>solvedIds.has(e.id)).length;
  const s4 = phase4.filter(e=>solvedIds.has(e.id)).length;
  const total = solvedIds.size;
  document.getElementById('p-solved').textContent = total;
  document.getElementById('p-weeks').textContent = doneWeeks.size;
  document.getElementById('p-streak').textContent = total > 0 ? Math.min(total, 7) : 0;
  document.getElementById('p-pct').textContent = Math.round(total / exercises.length * 100) + '%';
  document.getElementById('pp1').textContent = `${s1} / ${phase1.length}`;
  document.getElementById('pp2').textContent = `${s2} / ${phase2.length}`;
  document.getElementById('pp3').textContent = `${s3} / ${phase3.length}`;
  document.getElementById('pp4').textContent = `${s4} / ${phase4.length}`;
  document.getElementById('pb1').style.width = Math.round(s1/phase1.length*100)+'%';
  document.getElementById('pb2').style.width = Math.round(s2/phase2.length*100)+'%';
  document.getElementById('pb3').style.width = Math.round(s3/phase3.length*100)+'%';
  document.getElementById('pb4').style.width = Math.round(s4/phase4.length*100)+'%';
  const grid = document.getElementById('streak-grid');
  grid.innerHTML = Array.from({length:12},(_,i)=>{
    const wNum = i+1;
    const wExs = exercises.filter(e=>e.week===wNum);
    const solvedInWeek = wExs.filter(e=>solvedIds.has(e.id)).length;
    const cls = solvedInWeek === wExs.length ? 'done' : solvedInWeek > 0 ? 'partial' : '';
    return `<div class="streak-dot ${cls}" title="Week ${wNum}: ${solvedInWeek}/${wExs.length} solved"></div>`;
  }).join('');
}

document.getElementById('sql-editor').addEventListener('input', updateLineNums);
document.getElementById('sql-editor').addEventListener('scroll', function() {
  document.getElementById('line-nums').scrollTop = this.scrollTop;
});
document.getElementById('sql-editor').addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = this.selectionStart, end = this.selectionEnd;
    this.value = this.value.substring(0,s) + '  ' + this.value.substring(end);
    this.selectionStart = this.selectionEnd = s + 2;
    updateLineNums();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery(); }
});

renderExerciseList('all');
updateNav();
initDB();
function submitContact() {
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const type = document.getElementById('cf-type').value;
  const msg = document.getElementById('cf-msg').value.trim();

  if (!name) { document.getElementById('cf-name').focus(); return; }
  if (!email || !email.includes('@')) { document.getElementById('cf-email').focus(); return; }
  if (!msg) { document.getElementById('cf-msg').focus(); return; }

  const btn = document.getElementById('cf-submit');
  btn.disabled = true;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending...';

  const subject = encodeURIComponent('[SQLCraft] ' + (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Message') + ' from ' + name);
  const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nTopic: ' + (type || 'General') + '\n\n' + msg);
  const mailtoUrl = 'mailto:salaipome@gmail.com?subject=' + subject + '&body=' + body;

  window.location.href = mailtoUrl;

  setTimeout(() => {
    document.getElementById('contact-form-wrap').style.display = 'none';
    document.getElementById('contact-success').classList.add('show');
  }, 800);
}

function resetContactForm() {
  document.getElementById('cf-name').value = '';
  document.getElementById('cf-email').value = '';
  document.getElementById('cf-type').value = '';
  document.getElementById('cf-msg').value = '';
  document.getElementById('cf-submit').disabled = false;
  document.getElementById('cf-submit').innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send message';
  document.getElementById('contact-form-wrap').style.display = 'block';
  document.getElementById('contact-success').classList.remove('show');
}

(function() {
  let isDragging = false;
  let startY = 0;
  let startEditorH = 0;
  let startResultsH = 0;
  const MIN_EDITOR_H = 80;
  const MIN_RESULTS_H = 60;

  function initSplitter() {
    const divider  = document.getElementById('drag-divider');
    const codeSection = document.getElementById('code-section');
    const resultPane  = document.getElementById('results-pane');
    const container   = document.querySelector('.editor-results-container');
    if (!divider || !codeSection || !resultPane) return;

    // Set initial pixel heights from natural layout
    function setInitialHeights() {
      const totalH = container.clientHeight - divider.offsetHeight;
      const editorH = Math.round(totalH * 0.58);
      const resultsH = totalH - editorH;
      codeSection.style.flex = 'none';
      codeSection.style.height = editorH + 'px';
      resultPane.style.flex = 'none';
      resultPane.style.height = resultsH + 'px';
    }
    setInitialHeights();

    // Mouse
    divider.addEventListener('mousedown', function(e) {
      e.preventDefault();
      isDragging = true;
      startY = e.clientY;
      startEditorH = codeSection.offsetHeight;
      startResultsH = resultPane.offsetHeight;
      divider.classList.add('dragging');
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      const dy = e.clientY - startY;
      let newEditorH = startEditorH + dy;
      let newResultsH = startResultsH - dy;
      if (newEditorH < MIN_EDITOR_H) {
        newEditorH = MIN_EDITOR_H;
        newResultsH = startEditorH + startResultsH - MIN_EDITOR_H;
      }
      if (newResultsH < MIN_RESULTS_H) {
        newResultsH = MIN_RESULTS_H;
        newEditorH = startEditorH + startResultsH - MIN_RESULTS_H;
      }
      codeSection.style.height = newEditorH + 'px';
      resultPane.style.height = newResultsH + 'px';
      // sync line numbers scroll
      const editor = document.getElementById('sql-editor');
      if (editor) {
        const ln = document.getElementById('line-nums');
        if (ln) ln.scrollTop = editor.scrollTop;
      }
    });

    document.addEventListener('mouseup', function() {
      if (!isDragging) return;
      isDragging = false;
      divider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });

    // Touch support
    divider.addEventListener('touchstart', function(e) {
      const t = e.touches[0];
      isDragging = true;
      startY = t.clientY;
      startEditorH = codeSection.offsetHeight;
      startResultsH = resultPane.offsetHeight;
      divider.classList.add('dragging');
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      const t = e.touches[0];
      const dy = t.clientY - startY;
      let newEditorH = startEditorH + dy;
      let newResultsH = startResultsH - dy;
      if (newEditorH < MIN_EDITOR_H) { newEditorH = MIN_EDITOR_H; newResultsH = startEditorH + startResultsH - MIN_EDITOR_H; }
      if (newResultsH < MIN_RESULTS_H) { newResultsH = MIN_RESULTS_H; newEditorH = startEditorH + startResultsH - MIN_RESULTS_H; }
      codeSection.style.height = newEditorH + 'px';
      resultPane.style.height = newResultsH + 'px';
    }, { passive: true });

    document.addEventListener('touchend', function() {
      isDragging = false;
      divider.classList.remove('dragging');
    });

    // Double-click divider: reset to 58/42 split
    divider.addEventListener('dblclick', function() {
      const totalH = container.clientHeight - divider.offsetHeight;
      const editorH = Math.round(totalH * 0.58);
      const resultsH = totalH - editorH;
      codeSection.style.height = editorH + 'px';
      resultPane.style.height = resultsH + 'px';
    });

    // Re-init on window resize
    window.addEventListener('resize', function() {
      const totalH = container.clientHeight - divider.offsetHeight;
      const currentEditorH = codeSection.offsetHeight;
      const currentResultsH = resultPane.offsetHeight;
      const currentTotal = currentEditorH + currentResultsH;
      if (currentTotal > 0) {
        const ratio = currentEditorH / currentTotal;
        codeSection.style.height = Math.round(totalH * ratio) + 'px';
        resultPane.style.height = Math.round(totalH * (1 - ratio)) + 'px';
      }
    });
  }

  // Init after page is shown (practice page may not be visible on load)
  const origShowPage = window.showPage;
  window.showPage = function(name) {
    origShowPage(name);
    if (name === 'practice') {
      requestAnimationFrame(function() {
        const divider = document.getElementById('drag-divider');
        const codeSection = document.getElementById('code-section');
        if (divider && codeSection && !codeSection.style.height) {
          initSplitter();
        }
      });
    }
  };

  // Also init if practice is already visible on load
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('page-practice').classList.contains('active')) {
      initSplitter();
    }
  });

  // Expose for manual call
  window._initSplitter = initSplitter;
})();