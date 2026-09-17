const PLAN = {
  className: '1P',
  validFrom: '14.09.2026',
  source: 'https://zsmeie.torun.pl/plan/#1P',
  times: [
    ['08:00','08:45'], ['08:50','09:35'], ['09:45','10:30'], ['10:35','11:20'],
    ['11:30','12:15'], ['12:20','13:05'], ['13:25','14:10'], ['14:30','15:15'],
    ['15:25','16:10'], ['16:15','17:00'], ['17:05','17:50'], ['17:55','18:40'], ['18:45','19:30']
  ],
  days: {
    1: [
      null,
      [{name:'Wychowanie fizyczne',teacher:'Bu',room:'s3'}],
      [{name:'Wychowanie fizyczne',teacher:'Bu',room:'s3'},{name:'Język niemiecki',teacher:'Sz',room:'42a'}],
      [{name:'Język polski',teacher:'MS',room:'80'}],
      [{name:'Język polski',teacher:'MS',room:'80'}],
      [{name:'Bezpieczeństwo i higiena pracy',teacher:'ŁC',room:'68'}],
      [{name:'Matematyka',teacher:'HŻ',room:'82'}],
      [{name:'Edukacja dla bezpieczeństwa',teacher:'TA',room:'77'},{name:'Religia',teacher:'RK',room:'76'}],
      [{name:'Religia',teacher:'RK',room:'76'}], null, null, null, null
    ],
    2: [
      [{name:'t_projektowanie i administrowanie bazami danych',teacher:'Po',room:'23'}],
      [{name:'t_projektowanie i administrowanie bazami danych',teacher:'Po',room:'23'}],
      [{name:'t_projektowanie i administrowanie bazami danych',teacher:'Po',room:'18'},{name:'Informatyka rozszerzona',teacher:'Kh',room:'69'}],
      [{name:'p_projektowanie i administrowanie bazami danych',teacher:'Po',room:'18'},{name:'Wychowanie fizyczne',teacher:'ŁC',room:'s2'}],
      [{name:'Język angielski',teacher:'CI',room:'52'},{name:'Wychowanie fizyczne',teacher:'ŁC',room:'s2'}],
      [{name:'Biologia',teacher:'MŁ',room:'64'}],
      [{name:'Język niemiecki',teacher:'GO',room:'42b'},{name:'Język angielski',teacher:'SR',room:'6i'}],
      [{name:'Zajęcia z wychowawcą',teacher:'Kh',room:'20'}],
      null, null, null, null, null
    ],
    3: [
      null,
      [{name:'Język angielski',teacher:'CI',room:'52'}],
      [{name:'Informatyka',teacher:'Kh',room:'69'}],
      [{name:'Informatyka',teacher:'Kh',room:'69'},{name:'Język niemiecki',teacher:'Sz',room:'42a'}],
      [{name:'Fizyka',teacher:'WA',room:'71'}],
      [{name:'t_język angielski zawodowy',teacher:'CI',room:'48'}],
      [{name:'Biznes i zarządzanie',teacher:'SG',room:'68'}],
      [{name:'Chemia',teacher:'Sa',room:'64'}],
      [{name:'p_projektowanie i administrowanie bazami danych',teacher:'Po',room:'18'}],
      [{name:'p_projektowanie i administrowanie bazami danych',teacher:'Po',room:'18'}],
      null, null, null
    ],
    4: [
      [{name:'Geografia',teacher:'LM',room:'54'}],
      [{name:'Wychowanie fizyczne',teacher:'Bu',room:'s2'},{name:'Wychowanie fizyczne',teacher:'ŁC',room:'s4'}],
      [{name:'Informatyka rozszerzona',teacher:'Kh',room:'69'},{name:'p_projektowanie i tworzenie stron internetowych',teacher:'KC',room:'18'}],
      [{name:'Język niemiecki',teacher:'GO',room:'42b'},{name:'p_projektowanie i tworzenie stron internetowych',teacher:'KC',room:'18'}],
      [{name:'Matematyka',teacher:'HŻ',room:'82'}],
      [{name:'Język polski',teacher:'MS',room:'80'}],
      [{name:'t_podstawy informatyki',teacher:'BO',room:'54'}],
      null, null, null, null, null, null
    ],
    5: [
      [{name:'p_projektowanie i tworzenie stron internetowych',teacher:'KC',room:'18'},{name:'Informatyka',teacher:'Kh',room:'69'}],
      [{name:'p_projektowanie i tworzenie stron internetowych',teacher:'KC',room:'18'},{name:'Wychowanie fizyczne',teacher:'ŁC',room:'s4'}],
      [{name:'Historia',teacher:'JO',room:'68'}],
      [{name:'Matematyka',teacher:'HŻ',room:'82'}],
      [{name:'t_projektowanie i tworzenie stron internetowych',teacher:'KC',room:'54'}],
      [{name:'t_projektowanie i tworzenie stron internetowych',teacher:'KC',room:'54'}],
      [{name:'Język angielski',teacher:'SR',room:'6i'}],
      null, null, null, null, null, null
    ]
  }
};

const DAY_NAMES = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
const SHORT_DAYS = ['Nd','Pn','Wt','Śr','Cz','Pt','So'];
const $ = id => document.getElementById(id);

const defaultSettings = {
  group: 1,
  showTeacher: true,
  showRoom: true,
  showBothGroups: true,
  darkMode: true,
  fiveMin: true,
  lessonStartNotice: false,
  breakEndNotice: false,
  haptics: true
};

let settings = {...defaultSettings, ...(JSON.parse(localStorage.getItem('aestroSettings') || '{}'))};
let tasks = JSON.parse(localStorage.getItem('aestroTasks') || '[]');
let notes = JSON.parse(localStorage.getItem('aestroNotes') || '{}');
let lastFiveMinKey = localStorage.getItem('aestroFiveMinKey') || '';
let currentTab = 'today';
let selectedPlanDay = new Date().getDay();

const minutes = hm => { const [h,m] = hm.split(':').map(Number); return h*60+m; };
const nowMinutes = d => d.getHours()*60 + d.getMinutes() + d.getSeconds()/60;
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selected = lessons => lessons?.length ? lessons[Math.min(settings.group-1, lessons.length-1)] : null;
const meta = lesson => [settings.showTeacher && lesson?.teacher, settings.showRoom && lesson?.room].filter(Boolean).join(' · ');
const dayLessons = d => PLAN.days[d] || [];
const lessonLabel = l => l?.name || '—';
const isSplit = lessons => (lessons?.length || 0) > 1;

function saveSettings(){localStorage.setItem('aestroSettings', JSON.stringify(settings)); applyTheme();}
function saveTasks(){localStorage.setItem('aestroTasks', JSON.stringify(tasks));}
function saveNotes(){localStorage.setItem('aestroNotes', JSON.stringify(notes));}
function applyTheme(){document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';}

function scheduleState(day = new Date().getDay(), date = new Date()) {
  const rows = dayLessons(day).map((lessons,i)=>({i,start:PLAN.times[i][0],end:PLAN.times[i][1],lessons})).filter(x=>x.lessons?.length);
  const mins = nowMinutes(date);
  let current = null, next = null, previous = null;
  for (const row of rows){
    if (mins >= minutes(row.start) && mins < minutes(row.end)){ current = row; break; }
    if (mins < minutes(row.start)){ next = row; break; }
    previous = row;
  }
  let breakInfo = null;
  if (!current && previous && next){
    const gap = minutes(next.start)-minutes(previous.end);
    if (gap > 0) breakInfo = {start:minutes(previous.end), end:minutes(next.start), length:gap, remaining:Math.max(0,Math.ceil(minutes(next.start)-mins))};
  }
  return {rows, mins, current, next, previous, breakInfo};
}

function currentDayTitle(){
  const d = new Date();
  return d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'});
}

function renderToday(){
  const d = new Date();
  const day = d.getDay();
  const {rows,mins,current,next,breakInfo} = scheduleState(day,d);
  const todayName = day >= 1 && day <= 5 ? currentDayTitle() : 'Weekend';
  $('todayTitle').textContent = todayName;
  $('todaySubtitle').textContent = `${PLAN.className} · Grupa ${settings.group} · plan od ${PLAN.validFrom}`;

  const chip = $('stateChip');
  let mainTitle = '', mainMeta = '', timer = '', caption='', progress=0;
  if (current){
    chip.textContent = '● TERAZ'; chip.className='state-chip live';
    const chosen = selected(current.lessons);
    mainTitle = lessonLabel(chosen); mainMeta = meta(chosen);
    const total = minutes(current.end)-minutes(current.start);
    const passed = mins-minutes(current.start);
    const left = Math.max(0,Math.ceil(minutes(current.end)-mins));
    timer = left === 0 ? '00:00' : formatCountdown(left*60);
    caption = 'do końca lekcji'; progress = Math.max(0,Math.min(100,(passed/total)*100));
    if (isSplit(current.lessons) && settings.showBothGroups){
      mainMeta = `G1: ${lessonLabel(current.lessons[0])} · ${meta(current.lessons[0]) || '—'}\nG2: ${lessonLabel(current.lessons[1])} · ${meta(current.lessons[1]) || '—'}`;
    }
  } else if (breakInfo){
    chip.textContent='PRZERWA'; chip.className='state-chip break';
    mainTitle='Masz przerwę';
    const chosen = selected(next?.lessons);
    mainMeta = next ? `Następna: ${lessonLabel(chosen)} · ${next.start}` : 'Brak kolejnej lekcji';
    timer=formatCountdown(breakInfo.remaining*60); caption='przerwy zostało';
    progress=Math.max(0,Math.min(100,((mins-breakInfo.start)/breakInfo.length)*100));
  } else if (next){
    chip.textContent='NASTĘPNA'; chip.className='state-chip next';
    const chosen = selected(next.lessons);
    mainTitle=lessonLabel(chosen); mainMeta=meta(chosen);
    const until=Math.max(0,Math.ceil(minutes(next.start)-mins));
    timer=formatCountdown(until*60); caption='do rozpoczęcia'; progress=0;
  } else {
    chip.textContent='KONIEC'; chip.className='state-chip done';
    mainTitle='Koniec zajęć'; mainMeta='Na dziś nie masz już lekcji.'; timer=''; caption=''; progress=100;
  }
  $('heroTitle').textContent=mainTitle;
  $('heroMeta').textContent=mainMeta;
  $('heroMeta').classList.toggle('multiline', mainMeta.includes('\n'));
  $('heroTimer').textContent=timer;
  $('heroCaption').textContent=caption;
  $('heroProgress').style.width=`${progress}%`;

  const nextChosen = selected(next?.lessons);
  $('nextTitle').textContent = next ? lessonLabel(nextChosen) : '—';
  $('nextMeta').textContent = next ? `${next.start}–${next.end}${meta(nextChosen)?' · '+meta(nextChosen):''}` : 'Brak kolejnej lekcji';
  $('nextDay').textContent = next ? SHORT_DAYS[day] : '—';

  if (breakInfo){
    $('breakNumber').textContent = `${breakInfo.length}`;
    $('breakUnit').textContent = 'min';
    $('breakMeta').textContent = `zostało ${formatCompact(breakInfo.remaining)}`;
  } else {
    $('breakNumber').textContent = '—'; $('breakUnit').textContent = ''; $('breakMeta').textContent='Poza przerwą';
  }

  $('lessonCount').textContent = `${rows.length} ${rows.length===1?'lekcja':'lekcji'}`;
  $('schoolUntil').textContent = rows.length ? `${rows[rows.length-1].end}` : '—';
  renderTodayList(rows,current,mins);
  renderQuickNotes(current);
  maybeFiveMin(current);
}

function renderTodayList(rows,current,mins){
  const list=$('todayList'); list.innerHTML='';
  rows.forEach(row=>{
    const chosen=selected(row.lessons);
    const active=current && current.i===row.i;
    const done=mins>=minutes(row.end);
    const card=document.createElement('div');
    card.className=`timeline-row ${active?'active ':''}${done?'passed':''}`;
    card.innerHTML=`
      <div class="timeline-time"><b>${row.start}</b><span>${row.end}</span></div>
      <div class="timeline-line"><i></i></div>
      <div class="timeline-main">
        <div class="timeline-head"><div class="timeline-name">${esc(lessonLabel(chosen))}</div><span class="timeline-tag">${active?'TERAZ':row.lessons.length>1?'2 GR.':''}</span></div>
        <div class="timeline-meta">${esc(meta(chosen) || 'Brak dodatkowych danych')}</div>
        ${row.lessons.length>1 && settings.showBothGroups ? `<div class="split-row"><div class="split-label g1">G1</div><div>${esc(lessonLabel(row.lessons[0]))}<span>${esc(meta(row.lessons[0])||'')}</span></div><div class="split-label g2">G2</div><div>${esc(lessonLabel(row.lessons[1]))}<span>${esc(meta(row.lessons[1])||'')}</span></div></div>`:''}
        ${notes[lessonLabel(chosen)]?`<div class="note-preview">📝 ${esc(notes[lessonLabel(chosen)].slice(0,110))}</div>`:''}
      </div>`;
    card.onclick=()=>openLessonDetail(row);
    list.appendChild(card);
  });
  if (!rows.length) list.innerHTML='<div class="empty-card"><span>☕</span><div><b>Brak lekcji</b><p>Ten dzień jest pusty w planie.</p></div></div>';
}

function renderQuickNotes(current){
  const chosen = selected(current?.lessons);
  const key = lessonLabel(chosen);
  $('currentNotePreview').textContent = key && notes[key] ? notes[key] : 'Dodaj notatkę do aktualnego przedmiotu';
  $('quickNoteBtn').disabled = !key;
}

function renderPlan(){
  $('planSubtitle').textContent=`Plan ${PLAN.className} · obowiązuje od ${PLAN.validFrom}`;
  document.querySelectorAll('.day-tab').forEach(btn=>btn.classList.toggle('active', Number(btn.dataset.day)===selectedPlanDay));
  const rows=dayLessons(selectedPlanDay).map((lessons,i)=>({start:PLAN.times[i][0],end:PLAN.times[i][1],lessons}));
  const container=$('planGrid'); container.innerHTML='';
  const validRows=rows.filter(r=>r.lessons?.length);
  validRows.forEach(row=>{
    const chosen=selected(row.lessons);
    const block=document.createElement('div'); block.className='plan-card';
    block.innerHTML=`<div class="plan-time"><b>${row.start}</b><span>${row.end}</span></div><div class="plan-content"><div class="plan-name">${esc(lessonLabel(chosen))}</div><div class="plan-meta">${esc(meta(chosen)||'')}</div>${row.lessons.length>1&&settings.showBothGroups?`<div class="group-cards"><button data-g="1" class="group-card ${settings.group===1?'selected':''}"><strong>GRUPA 1</strong><span>${esc(lessonLabel(row.lessons[0]))}</span><small>${esc(meta(row.lessons[0])||'')}</small></button><button data-g="2" class="group-card ${settings.group===2?'selected':''}"><strong>GRUPA 2</strong><span>${esc(lessonLabel(row.lessons[1]))}</span><small>${esc(meta(row.lessons[1])||'')}</small></button></div>`:''}</div>`;
    block.querySelectorAll('[data-g]').forEach(b=>b.onclick=e=>{e.stopPropagation();settings.group=Number(b.dataset.g);saveSettings();renderAll();});
    container.appendChild(block);
  });
  if (!validRows.length) container.innerHTML='<div class="empty-card"><span>📭</span><div><b>Brak lekcji</b><p>W tym dniu plan jest pusty.</p></div></div>';
}

function renderTasks(){
  const today=new Date();
  const active=tasks.filter(t=>!t.done).sort((a,b)=>(a.due||'').localeCompare(b.due||''));
  const done=tasks.filter(t=>t.done).sort((a,b)=>b.created-a.created);
  $('taskStats').textContent=`${active.length} aktywn${active.length===1?'e':'ych'} · ${done.length} ukończon${done.length===1?'e':'ych'}`;
  const list=$('tasksList'); list.innerHTML='';
  if(!tasks.length){list.innerHTML='<div class="empty-card"><span>✅</span><div><b>Brak zadań</b><p>Dodaj pierwsze zadanie domowe.</p></div></div>';return;}
  [...active,...done].forEach(task=>{
    const item=document.createElement('div'); item.className=`task-item ${task.done?'done':''}`;
    item.innerHTML=`<button class="check ${task.done?'on':''}" aria-label="Zmień status">${task.done?'✓':''}</button><div class="task-body"><b>${esc(task.text)}</b><span>${esc(task.subject||'Ogólne')}${task.due?' · termin '+esc(task.due):''}</span></div><button class="icon-btn delete-task" aria-label="Usuń">×</button>`;
    item.querySelector('.check').onclick=()=>{task.done=!task.done;saveTasks();renderTasks();};
    item.querySelector('.delete-task').onclick=()=>{tasks=tasks.filter(x=>x.id!==task.id);saveTasks();renderTasks();};
    list.appendChild(item);
  });
}

function renderSettings(){
  $('groupSelect').value=String(settings.group);
  $('showTeacher').checked=!!settings.showTeacher;
  $('showRoom').checked=!!settings.showRoom;
  $('showBothGroups').checked=!!settings.showBothGroups;
  $('darkMode').checked=!!settings.darkMode;
  $('fiveMin').checked=!!settings.fiveMin;
  $('lessonStartNotice').checked=!!settings.lessonStartNotice;
  $('breakEndNotice').checked=!!settings.breakEndNotice;
  $('haptics').checked=!!settings.haptics;
}

function renderNotesPanel(){
  const subjectKeys=[...new Set(Object.values(PLAN.days).flat().filter(Boolean).flat().map(l=>l.name))].sort((a,b)=>a.localeCompare(b,'pl'));
  const select=$('noteSubject'); const cur=select.value;
  select.innerHTML=subjectKeys.map(x=>`<option>${esc(x)}</option>`).join('');
  if(cur && subjectKeys.includes(cur)) select.value=cur;
  loadNoteEditor();
}

function loadNoteEditor(){
  const key=$('noteSubject').value; $('noteEditor').value=notes[key]||'';
  $('noteSaved').textContent='';
}

function showTab(tab){
  currentTab=tab;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${tab}`));
  if(tab==='today')renderToday();
  if(tab==='plan')renderPlan();
  if(tab==='tasks')renderTasks();
  if(tab==='notes')renderNotesPanel();
  if(tab==='settings')renderSettings();
}

function openLessonDetail(row){
  const chosen=selected(row.lessons); if(!chosen)return;
  $('lessonDetailTitle').textContent=lessonLabel(chosen);
  $('lessonDetailMeta').textContent=`${SHORT_DAYS[selectedPlanDay] || SHORT_DAYS[new Date().getDay()]} · ${row.start}–${row.end} · ${meta(chosen)}`;
  $('lessonNote').value=notes[lessonLabel(chosen)]||'';
  $('lessonDetailModal').classList.remove('hidden');
  $('saveLessonNote').onclick=()=>{notes[lessonLabel(chosen)]=$('lessonNote').value.trim();saveNotes();$('lessonDetailModal').classList.add('hidden');renderAll();showToast('Notatka zapisana');};
}

function openTaskModal(){
  $('taskText').value=''; $('taskSubject').value=''; $('taskDue').value=''; $('taskModal').classList.remove('hidden'); setTimeout(()=>$('taskText').focus(),50);
}

function addTask(){
  const text=$('taskText').value.trim(); if(!text){showToast('Wpisz treść zadania');return;}
  tasks.push({id:crypto.randomUUID?.()||String(Date.now()),text,subject:$('taskSubject').value.trim(),due:$('taskDue').value,done:false,created:Date.now()});
  saveTasks(); $('taskModal').classList.add('hidden'); renderTasks(); showToast('Zadanie dodane');
}

function maybeFiveMin(current){
  if(!settings.fiveMin || !current) return;
  const d=new Date(); const left=minutes(current.end)-nowMinutes(d);
  if(left>0 && left<=5){
    const key=`${d.toISOString().slice(0,10)}_${current.start}`;
    if(key!==lastFiveMinKey){
      lastFiveMinKey=key; localStorage.setItem('aestroFiveMinKey',key);
      showToast(`⏰ 5 min do końca: ${lessonLabel(selected(current.lessons))}`);
      if(settings.haptics && navigator.vibrate) try{navigator.vibrate([120,70,120]);}catch{}
      if('Notification' in window && Notification.permission==='granted') try{new Notification('Aestro Plan',{body:`5 min do końca: ${lessonLabel(selected(current.lessons))}`});}catch{}
    }
  }
}

function formatCountdown(totalSeconds){
  const s=Math.max(0,Math.ceil(totalSeconds)); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60;
  return h>0 ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
function formatCompact(n){return `${Math.max(0,n)} min`}
function showToast(text){const t=$('toast');t.textContent=text;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),3600);}

function requestNotifications(){
  if(!('Notification'in window)){showToast('Ta przeglądarka nie obsługuje powiadomień.');return;}
  Notification.requestPermission().then(p=>showToast(p==='granted'?'Powiadomienia włączone.':'Zgoda na powiadomienia nie została przyznana.'));
}

function bind(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
  document.querySelectorAll('.day-tab').forEach(b=>b.onclick=()=>{selectedPlanDay=Number(b.dataset.day);renderPlan();});
  $('settingsBtnTop').onclick=()=>showTab('settings');
  $('openPlanSource').onclick=()=>window.open(PLAN.source,'_blank','noopener');
  $('notifyBtn').onclick=requestNotifications;
  $('addTaskBtn').onclick=openTaskModal;
  $('quickAddTask').onclick=openTaskModal;
  $('quickNoteBtn').onclick=()=>{showTab('notes');};
  $('closeTask').onclick=()=>$('taskModal').classList.add('hidden');
  $('cancelTask').onclick=()=>$('taskModal').classList.add('hidden');
  $('saveTask').onclick=addTask;
  $('closeLessonDetail').onclick=()=>$('lessonDetailModal').classList.add('hidden');
  $('cancelLessonNote').onclick=()=>$('lessonDetailModal').classList.add('hidden');
  $('saveNote').onclick=()=>{
    const key=$('noteSubject').value; notes[key]=$('noteEditor').value.trim(); saveNotes(); $('noteSaved').textContent='Zapisano';
    setTimeout(()=>{$('noteSaved').textContent='';},1500);
    renderToday();
  };
  $('noteSubject').onchange=loadNoteEditor;
  $('useCurrentSubject').onclick=()=>{const {current}=scheduleState();const chosen=selected(current?.lessons);if(chosen){$('noteSubject').value=lessonLabel(chosen);loadNoteEditor();}};
  $('groupSelect').onchange=e=>{settings.group=Number(e.target.value);saveSettings();renderAll();};
  [['showTeacher','showTeacher'],['showRoom','showRoom'],['showBothGroups','showBothGroups'],['darkMode','darkMode'],['fiveMin','fiveMin'],['lessonStartNotice','lessonStartNotice'],['breakEndNotice','breakEndNotice'],['haptics','haptics']].forEach(([id,key])=>$(id).onchange=e=>{settings[key]=e.target.checked;saveSettings();renderAll();});
}

function renderAll(){applyTheme();renderToday();renderPlan();renderTasks();renderNotesPanel();renderSettings();document.body.dataset.tab=currentTab;}

if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
bind();renderAll();showTab('today');setInterval(()=>{if(currentTab==='today')renderToday();},250);
