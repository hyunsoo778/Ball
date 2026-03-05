/* ════════════════════════════════════
 * Meet Ball - 토너먼트 / 방개 / 투표
 * ════════════════════════════════════ */

// ── 엑셀 다운로드 ─────────────────────────────────────────
function exportExcel() {
  const stats = getPlayerStats();
  const { finesByPlayer } = getAllFines();
  const rows = [['연번','이름','기준에버','누적에버','핸디','출전횟수','총핀수','최고총점','누적벌금','납부완료','미납금액']];
  let idx = 1;
  Object.values(stats).sort((a,b)=>b.avg-a.avg).forEach(s => {
    const fp = finesByPlayer[s.name];
    rows.push([idx++, s.name, BASE_PLAYERS[s.name]||'-', Math.round(s.avg), s.handi, s.attend, s.totalPins, s.bestTotal,
      fp ? fp.total : 0, fp ? fp.paid : 0, fp ? fp.unpaid : 0]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom+csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `볼링_순위표_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast('엑셀(CSV) 다운로드 완료!');
}

// ── 데이터 메뉴 ─────────────────────────────────────────────
function toggleDataMenu() {
  const menu = document.getElementById('dataMenu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
// 메뉴 바깥 클릭 시 닫기
document.addEventListener('click', e => {
  const menu = document.getElementById('dataMenu');
  const btn  = document.getElementById('dataMenuBtn');
  if(menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.style.display = 'none';
  }
});

function exportHTMLSnapshot() {
  document.getElementById('dataMenu').style.display = 'none';

  // 모든 localStorage 데이터 수집
  const snapshot = {
    bowlingApp_data:         localStorage.getItem('bowlingApp_data'),
    bowlingApp_finePayments: localStorage.getItem('bowlingApp_finePayments'),
    bowlingApp_extraFines:   localStorage.getItem('bowlingApp_extraFines'),
    bowlingApp_prizes:       localStorage.getItem('bowlingApp_prizes'),
    bowlingApp_dues:         localStorage.getItem('bowlingApp_dues'),
    bowlingApp_genders:      localStorage.getItem('bowlingApp_genders'),
    bowlingApp_notices:      localStorage.getItem('bowlingApp_notices'),
    bowlingApp_sponsors:     localStorage.getItem('bowlingApp_sponsors'),
    bowlingApp_tourney:      localStorage.getItem('bowlingApp_tourney'),
    bowlingApp_votes:        localStorage.getItem('bowlingApp_votes'),
    bowlingApp_leagues:      localStorage.getItem('bowlingApp_leagues'),
  };

  // 관리자 모드 클래스 임시 제거 후 HTML 저장 (저장된 파일이 관리자 모드로 열리지 않도록)
  document.body.classList.remove('admin-mode');
  const html = document.documentElement.outerHTML;
  if(isAdmin) document.body.classList.add('admin-mode'); // 현재 세션은 유지

  // <head> 안에 데이터 복원 스크립트 삽입
  const restoreScript = `<script id="__snapshot_restore__">
(function(){
  const snap = ${JSON.stringify(snapshot)};
  for(const [k,v] of Object.entries(snap)) {
    if(v !== null) try { localStorage.setItem(k, v); } catch(e) {}
  }
  const el = document.getElementById('__snapshot_restore__');
  if(el) el.remove();
})();
<\/script>`;

  const injected = html.replace('</head>', restoreScript + '</head>');

  const blob = new Blob([injected], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0,10);
  a.download = `볼링정기전_${date}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('HTML 스냅샷 저장 완료! 이 파일을 공유하세요 🎳');
}

// ══════════════════════════════════════════════════════════════
// 대회 참가비 관리
// ══════════════════════════════════════════════════════════════
const TOURNEY_KEY = 'bowlingApp_tourney';

function loadTourneys() {
  const _cached = window.fbLoad ? window.fbLoad('tourneys', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(TOURNEY_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return { events: [] }; // { events: [{id, name, date, fee, payments:{name:true/false}}] }
}
function saveTourneys(data) {
  try { localStorage.setItem(TOURNEY_KEY, JSON.stringify(data)); } catch(e) {}
  window.fbSave && window.fbSave('tourneys', data);
}

// ════════════════════════════════════════════════════
// ⚡ 번개 관련 함수
// ════════════════════════════════════════════════════
const BANGGAE_KEY = 'bowlingApp_banggae';

function loadBanggae() {
  const _cached = window.fbLoad ? window.fbLoad('banggae', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(BANGGAE_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return { events: [] };
}
function saveBanggae(data) {
  try { localStorage.setItem(BANGGAE_KEY, JSON.stringify(data)); } catch(e) {}
  window.fbSave && window.fbSave('banggae', data);
}

function createBanggae() {
  if(!isAdmin) { toast('관리자만 만들 수 있습니다.', 'error'); return; }
  const title    = document.getElementById('bg_title').value.trim();
  const date     = document.getElementById('bg_date').value;
  const deadline = document.getElementById('bg_deadline').value;
  if(!title) { toast('번개 제목을 입력하세요.', 'error'); return; }
  const b = loadBanggae();
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS);
  const votes = {};
  members.forEach(m => { votes[m] = ''; });
  b.events.unshift({
    id: 'bg' + Date.now(),
    title,
    date: date || new Date().toISOString().slice(0,10),
    deadline: deadline || '',
    status: 'open',
    votes
  });
  saveBanggae(b);
  document.getElementById('bg_title').value = '';
  renderBanggae();
  toast('번개 투표가 생성됐습니다!');
}

function castBanggaeVote(eventId, name, choice) {
  const b = loadBanggae();
  const ev = b.events.find(e => e.id === eventId);
  if(!ev || ev.status !== 'open') { toast('마감된 투표입니다.', 'error'); return; }
  // 같은 선택 다시 누르면 취소
  if(ev.votes[name] === choice) {
    ev.votes[name] = '';
    saveBanggae(b);
    renderBanggae();
    toast(`${name} 투표 취소`);
    return;
  }
  ev.votes[name] = choice;
  saveBanggae(b);
  renderBanggae();
  const labels = { yes:'✅ 참석', no:'❌ 불참' };
  toast(`${name} → ${labels[choice]} 선택 완료!`);
}

function closeBanggae(eventId) {
  if(!isAdmin) return;
  const b = loadBanggae();
  const ev = b.events.find(e => e.id === eventId);
  if(ev) { ev.status = 'closed'; saveBanggae(b); renderBanggae(); toast('번개 투표 마감!'); }
}

function deleteBanggae(eventId) {
  if(!isAdmin) return;
  if(!confirm('이 번개를 삭제할까요?')) return;
  const b = loadBanggae();
  b.events = b.events.filter(e => e.id !== eventId);
  saveBanggae(b);
  renderBanggae();
  toast('삭제됐습니다.');
}

// 마감시간 자동 체크
setInterval(() => {
  const b = loadBanggae();
  let changed = false;
  b.events.forEach(ev => {
    if(ev.status === 'open' && ev.deadline && new Date() >= new Date(ev.deadline)) {
      ev.status = 'closed'; changed = true;
    }
  });
  if(changed) { saveBanggae(b); renderBanggae(); }
}, 30000);

function renderBanggae() {
  const container = document.getElementById('banggaeContent');
  if(!container) return;
  const b = loadBanggae();
  const data = loadData();
  const allMembers = Object.keys(data.members || BASE_PLAYERS).sort();

  container.innerHTML = `
  ${isAdmin ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:24px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">⚡ 번개 만들기</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
      <div class="input-group">
        <label>번개 제목</label>
        <input type="text" id="bg_title" placeholder="예) 3월 번개 모임"
          style="width:220px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>날짜</label>
        <input type="date" id="bg_date" value="${new Date().toISOString().slice(0,10)}"
          style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>마감시간 (선택)</label>
        <input type="datetime-local" id="bg_deadline"
          style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <button class="btn btn-primary" onclick="createBanggae()">⚡ 번개 생성</button>
    </div>
  </div>` : ''}

  ${b.events.length === 0
    ? `<div class="empty"><div class="empty-icon">⚡</div><div class="empty-text">진행 중인 번개가 없습니다</div><div class="empty-sub">관리자가 번개를 생성하면 참석 여부를 선택할 수 있습니다</div></div>`
    : b.events.map(ev => {
        const yesVoters = Object.entries(ev.votes).filter(([,v])=>v==='yes').map(([n])=>n);
        const noVoters  = Object.entries(ev.votes).filter(([,v])=>v==='no').map(([n])=>n);
        const total     = Object.keys(ev.votes).length;
        const responded = Object.values(ev.votes).filter(v=>v!=='').length;
        const isOpen    = ev.status === 'open';
        const deadlineStr = ev.deadline
          ? new Date(ev.deadline).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) + ' 마감'
          : '';
        return `
        <div style="background:var(--card);border:1px solid ${isOpen?'rgba(34,197,94,0.3)':'var(--border)'};border-radius:16px;overflow:hidden;margin-bottom:20px;">
          <div style="padding:16px 20px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-weight:700;font-size:15px;">${ev.title}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:3px;">${ev.date}${deadlineStr?' · ⏰ '+deadlineStr:''} · ${responded}/${total}명 응답</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span style="font-size:11px;padding:3px 10px;border-radius:20px;font-weight:700;
                background:${isOpen?'rgba(34,197,94,0.15)':'rgba(100,116,139,0.15)'};
                color:${isOpen?'var(--green)':'var(--text3)'};">
                ${isOpen?'🟢 진행중':'⛔ 마감'}
              </span>
              ${isAdmin && isOpen ? `<button onclick="closeBanggae('${ev.id}')" style="font-size:11px;padding:4px 10px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:var(--red);cursor:pointer;">마감</button>` : ''}
              ${isAdmin ? `<button onclick="deleteBanggae('${ev.id}')" style="font-size:11px;padding:4px 10px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);color:var(--text3);cursor:pointer;">삭제</button>` : ''}
            </div>
          </div>
          <div style="padding:16px 20px;">
            <!-- 참석 현황 요약 -->
            <div style="display:flex;gap:12px;margin-bottom:16px;">
              <div style="flex:1;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:12px;text-align:center;">
                <div style="font-size:22px;font-weight:900;color:var(--green);">${yesVoters.length}</div>
                <div style="font-size:11px;color:var(--text3);margin-top:2px;">✅ 참석</div>
                <div style="font-size:11px;color:var(--text2);margin-top:4px;">${yesVoters.join(', ') || '-'}</div>
              </div>
              <div style="flex:1;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:12px;text-align:center;">
                <div style="font-size:22px;font-weight:900;color:var(--red);">${noVoters.length}</div>
                <div style="font-size:11px;color:var(--text3);margin-top:2px;">❌ 불참</div>
                <div style="font-size:11px;color:var(--text2);margin-top:4px;">${noVoters.join(', ') || '-'}</div>
              </div>
            </div>
            <!-- 개인 투표 버튼 -->
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${allMembers.map(name => {
                const v = ev.votes[name];
                const btnYes = `background:${v==='yes'?'rgba(34,197,94,0.2)':'var(--bg3)'};border:1px solid ${v==='yes'?'var(--green)':'var(--border)'};color:${v==='yes'?'var(--green)':'var(--text2)'}`;
                const btnNo  = `background:${v==='no'?'rgba(239,68,68,0.2)':'var(--bg3)'};border:1px solid ${v==='no'?'var(--red)':'var(--border)'};color:${v==='no'?'var(--red)':'var(--text2)'}`;
                return `
                <div style="display:flex;align-items:center;gap:4px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:6px 10px;">
                  <span style="font-size:12px;font-weight:700;min-width:40px;">${name}</span>
                  ${isOpen ? `
                  <button onclick="castBanggaeVote('${ev.id}','${name}','yes')"
                    style="font-size:11px;padding:3px 8px;border-radius:6px;cursor:pointer;${btnYes}">✅</button>
                  <button onclick="castBanggaeVote('${ev.id}','${name}','no')"
                    style="font-size:11px;padding:3px 8px;border-radius:6px;cursor:pointer;${btnNo}">❌</button>
                  ` : `<span style="font-size:11px;color:${v==='yes'?'var(--green)':v==='no'?'var(--red)':'var(--text3)'};">${v==='yes'?'✅ 참석':v==='no'?'❌ 불참':'미응답'}</span>`}
                </div>`;
              }).join('')}
            </div>
            <!-- 팀편성 바로가기 -->
            ${yesVoters.length > 0 ? `
            <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);">
              <button onclick="goBanggaeTeamById('${ev.id}')"
                style="width:100%;padding:10px;border-radius:10px;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);color:var(--yellow);font-weight:700;font-size:13px;cursor:pointer;">
                ⚡ 참석자 ${yesVoters.length}명으로 팀 편성하기
              </button>
            </div>` : ''}
          </div>
        </div>`;
      }).join('')
  }`;
}

function goBanggaeTeam(yesVoters) {
  window._teamBuilderPreset = yesVoters;
  showSection('teambuilder', document.querySelector('.nav-btn[onclick*="teambuilder"]'));
  renderTeamBuilder(yesVoters);
  window.scrollTo({top:0, behavior:'smooth'});
  toast(`참석자 ${yesVoters.length}명으로 팀 편성 화면으로 이동했습니다!`);
}

function goBanggaeTeamById(eventId) {
  const b = loadBanggae();
  const ev = b.events.find(e => e.id === eventId);
  if(!ev) return;
  const yesVoters = Object.entries(ev.votes).filter(([,v]) => v === 'yes').map(([n]) => n);
  if(yesVoters.length === 0) { toast('참석자가 없습니다.', 'error'); return; }
  window._teamBuilderPreset = yesVoters;
  showSection('teambuilder', document.querySelector('.nav-btn[onclick*="teambuilder"]'));
  renderTeamBuilder(yesVoters);
  window.scrollTo({top:0, behavior:'smooth'});
  toast(`참석자 ${yesVoters.length}명으로 팀 편성 화면으로 이동했습니다!`);
}


function addTourneyEvent() {
  if(!isAdmin) { toast('관리자만 등록할 수 있습니다.', 'error'); return; }
  const name = document.getElementById('te_name').value.trim();
  const date = document.getElementById('te_date').value;
  const fee  = parseInt(document.getElementById('te_fee').value) || 0;
  if(!name) { toast('대회명을 입력하세요.', 'error'); return; }
  if(!fee)  { toast('참가비를 입력하세요.', 'error'); return; }
  const t = loadTourneys();
  // 현재 등록된 회원 모두 미납으로 초기화
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS);
  const payments = {};
  members.forEach(m => { payments[m] = false; });
  t.events.unshift({ id: 'te' + Date.now(), name, date: date || new Date().toISOString().slice(0,10), fee, payments });
  saveTourneys(t);
  document.getElementById('te_name').value = '';
  document.getElementById('te_fee').value  = '';
  renderTourney();
  toast(`${name} 대회 등록 완료!`);
}

function deleteTourneyEvent(id) {
  if(!isAdmin) return;
  if(!confirm('이 대회를 삭제할까요?')) return;
  const t = loadTourneys();
  t.events = t.events.filter(e => e.id !== id);
  saveTourneys(t);
  renderTourney();
  toast('삭제 완료');
}

function toggleTourneyPayment(eventId, name) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  const t = loadTourneys();
  const ev = t.events.find(e => e.id === eventId);
  if(!ev) return;
  ev.payments[name] = !ev.payments[name];
  saveTourneys(t);
  renderTourney();
  toast(ev.payments[name] ? `${name} 납부완료 ✓` : `${name} 납부 취소`);
}

function toggleAllTourneyPayment(eventId, val) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  const t = loadTourneys();
  const ev = t.events.find(e => e.id === eventId);
  if(!ev) return;
  Object.keys(ev.payments).forEach(k => { ev.payments[k] = val; });
  saveTourneys(t);
  renderTourney();
}

function removeTourneyMemberDirect(eventId, name) {
  if(!isAdmin) { toast('관리자만 제거할 수 있습니다.', 'error'); return; }
  if(!confirm(`[${name}]을(를) 이 대회 참가자 목록에서 제거할까요?`)) return;
  const t = loadTourneys();
  const ev = t.events.find(e => e.id === eventId);
  if(!ev) return;
  delete ev.payments[name];
  saveTourneys(t);
  renderTourney();
  toast(`${name} 제거 완료`);
}

function renderTourney() {
  const container = document.getElementById('tourneyContent');
  if(!container) return;
  const t = loadTourneys();
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS).sort();

  // 전체 통계
  let totalFee = 0, totalPaid = 0;
  t.events.forEach(ev => {
    const participants = Object.keys(ev.payments);
    totalFee  += participants.length * ev.fee;
    totalPaid += participants.filter(k => ev.payments[k]).length * ev.fee;
  });
  const totalUnpaid = totalFee - totalPaid;

  container.innerHTML = `
  <!-- 요약 카드 -->
  <div class="fine-summary-grid" style="margin-bottom:24px;">
    <div class="fine-summary-card" style="border-color:rgba(59,130,246,0.4);">
      <div class="fine-summary-icon">🏟️</div>
      <div class="fine-summary-val" style="color:var(--blue);">${t.events.length}<span style="font-size:14px;">개</span></div>
      <div class="fine-summary-label">등록된 대회</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(34,197,94,0.3);">
      <div class="fine-summary-icon">✅</div>
      <div class="fine-summary-val" style="color:var(--green);">${totalPaid.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">납부 완료</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(239,68,68,0.3);">
      <div class="fine-summary-icon">⏳</div>
      <div class="fine-summary-val" style="color:${totalUnpaid>0?'var(--red)':'var(--text2)'};">${totalUnpaid.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">미납 합계</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">💰</div>
      <div class="fine-summary-val" style="color:var(--accent);">${totalFee.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">총 참가비 청구액</div>
    </div>
  </div>

  <!-- 대회 등록 폼 (관리자) -->
  ${isAdmin ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:24px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">🏟️ 대회 등록</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
      <div class="input-group">
        <label>대회명</label>
        <input type="text" id="te_name" placeholder="예) 2026 춘계 대회"
          style="width:200px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>날짜</label>
        <input type="date" id="te_date" value="${new Date().toISOString().slice(0,10)}"
          style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>참가비 (원)</label>
        <input type="number" id="te_fee" placeholder="30000" min="0" step="1000"
          style="width:130px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:'JetBrains Mono',monospace;">
      </div>
      <button class="btn btn-primary" onclick="addTourneyEvent()">🏟️ 등록</button>
    </div>
  </div>` : ''}

  <!-- 대회 목록 -->
  ${t.events.length === 0
    ? `<div class="empty"><div class="empty-icon">🏟️</div><div class="empty-text">등록된 대회가 없습니다</div><div class="empty-sub">관리자가 대회를 등록하면 납부 현황을 관리할 수 있습니다</div></div>`
    : t.events.map(ev => {
        const sortedEntries = Object.entries(ev.payments).sort((a,b) => a[0].localeCompare(b[0]));
        const paidCount  = sortedEntries.filter(([,v]) => v).length;
        const totalCount = sortedEntries.length;
        const paidAmt    = paidCount * ev.fee;
        const unpaidAmt  = (totalCount - paidCount) * ev.fee;
        const payPct     = totalCount > 0 ? Math.round(paidCount / totalCount * 100) : 0;
        return `
        <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:20px;">

          <!-- 헤더 -->
          <div style="padding:16px 20px;background:var(--bg3);border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
              <div>
                <div style="font-weight:700;font-size:17px;">🏟️ ${ev.name}</div>
                <div style="font-size:12px;color:var(--text3);margin-top:4px;">${ev.date} &nbsp;·&nbsp; 1인 참가비 <b style="color:var(--accent);">${ev.fee.toLocaleString()}원</b> &nbsp;·&nbsp; ${paidCount}/${totalCount}명 납부</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;padding:4px 10px;border-radius:8px;background:rgba(34,197,94,0.1);color:var(--green);border:1px solid rgba(34,197,94,0.3);">✅ ${paidAmt.toLocaleString()}원</span>
                <span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;padding:4px 10px;border-radius:8px;background:${unpaidAmt>0?'rgba(239,68,68,0.1)':'var(--bg3)'};color:${unpaidAmt>0?'var(--red)':'var(--text3)'};border:1px solid ${unpaidAmt>0?'rgba(239,68,68,0.3)':'var(--border)'};">⏳ ${unpaidAmt.toLocaleString()}원</span>
                ${isAdmin ? `
                <button onclick="toggleAllTourneyPayment('${ev.id}',true)" style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:var(--green);border-radius:7px;padding:5px 11px;font-size:11px;font-weight:600;cursor:pointer;">전원납부</button>
                <button onclick="toggleAllTourneyPayment('${ev.id}',false)" style="background:rgba(100,116,139,0.1);border:1px solid var(--border);color:var(--text3);border-radius:7px;padding:5px 11px;font-size:11px;font-weight:600;cursor:pointer;">전원취소</button>
                <button onclick="deleteTourneyEvent('${ev.id}')" style="background:none;border:1px solid rgba(239,68,68,0.3);color:var(--red);border-radius:7px;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;">🗑 대회삭제</button>` : ''}
              </div>
            </div>
            <!-- 납부율 바 -->
            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:4px;"><span>납부율</span><span>${payPct}%</span></div>
              <div style="background:var(--bg);border-radius:6px;height:6px;overflow:hidden;">
                <div style="width:${payPct}%;height:100%;background:var(--green);border-radius:6px;transition:width .5s;"></div>
              </div>
            </div>
          </div>

          <!-- 납부 목록 테이블 -->
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="padding:9px 16px;text-align:left;font-size:11px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);font-weight:600;text-transform:uppercase;letter-spacing:.4px;width:40px;">#</th>
                  <th style="padding:9px 16px;text-align:left;font-size:11px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);font-weight:600;text-transform:uppercase;letter-spacing:.4px;">이름</th>
                  <th style="padding:9px 12px;text-align:center;font-size:11px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);font-weight:600;text-transform:uppercase;letter-spacing:.4px;">참가비</th>
                  <th style="padding:9px 12px;text-align:center;font-size:11px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);font-weight:600;text-transform:uppercase;letter-spacing:.4px;">납부상태</th>
                  ${isAdmin ? `<th style="padding:9px 12px;text-align:center;font-size:11px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);font-weight:600;text-transform:uppercase;letter-spacing:.4px;">제거</th>` : ''}
                </tr>
              </thead>
              <tbody>
                ${sortedEntries.map(([name, paid], idx) => `
                <tr style="transition:background .12s;" onmouseover="this.style.background='rgba(249,115,22,0.04)'" onmouseout="this.style.background='transparent'">
                  <td style="padding:11px 16px;font-size:12px;color:var(--text3);border-bottom:1px solid rgba(30,45,69,0.4);text-align:center;">${idx+1}</td>
                  <td style="padding:11px 16px;font-weight:700;font-size:14px;border-bottom:1px solid rgba(30,45,69,0.4);">${name}</td>
                  <td style="padding:11px 12px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--text2);border-bottom:1px solid rgba(30,45,69,0.4);">${ev.fee.toLocaleString()}원</td>
                  <td style="padding:11px 12px;text-align:center;border-bottom:1px solid rgba(30,45,69,0.4);">
                    ${isAdmin
                      ? `<button onclick="toggleTourneyPayment('${ev.id}','${name}')"
                          style="padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;
                            background:${paid?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.1)'};
                            color:${paid?'var(--green)':'var(--red)'};
                            border:1px solid ${paid?'rgba(34,197,94,0.5)':'rgba(239,68,68,0.4)'};">
                            ${paid?'✅ 납부완료':'⏳ 미납'}
                          </button>`
                      : `<span style="padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;
                            background:${paid?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.08)'};
                            color:${paid?'var(--green)':'var(--red)'};
                            border:1px solid ${paid?'rgba(34,197,94,0.4)':'rgba(239,68,68,0.3)'};">
                            ${paid?'✅ 납부완료':'⏳ 미납'}
                          </span>`}
                  </td>
                  ${isAdmin ? `
                  <td style="padding:11px 12px;text-align:center;border-bottom:1px solid rgba(30,45,69,0.4);">
                    <button onclick="removeTourneyMemberDirect('${ev.id}','${name}')"
                      style="background:none;border:1px solid rgba(239,68,68,0.3);color:var(--red);border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;"
                      onmouseover="this.style.background='rgba(239,68,68,0.12)'" onmouseout="this.style.background='none'">
                      🗑 제거
                    </button>
                  </td>` : ''}
                </tr>`).join('')}
              </tbody>
              <tfoot>
                <tr style="background:var(--bg3);">
                  <td colspan="2" style="padding:10px 16px;font-weight:700;font-size:12px;color:var(--text3);border-top:2px solid var(--border);">합계 (${totalCount}명)</td>
                  <td style="padding:10px 12px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:var(--text2);border-top:2px solid var(--border);">${(totalCount * ev.fee).toLocaleString()}원</td>
                  <td style="padding:10px 12px;text-align:center;border-top:2px solid var(--border);">
                    <span style="font-size:12px;color:var(--green);font-weight:700;">납부 ${paidAmt.toLocaleString()}원</span>
                    ${unpaidAmt > 0 ? `<span style="font-size:12px;color:var(--red);font-weight:700;margin-left:8px;">미납 ${unpaidAmt.toLocaleString()}원</span>` : `<span style="font-size:12px;color:var(--green);font-weight:700;margin-left:6px;">🎉 완납</span>`}
                  </td>
                  ${isAdmin ? `<td style="border-top:2px solid var(--border);"></td>` : ''}
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- 참가자 추가 (관리자) -->
          ${isAdmin ? `
          <div style="padding:12px 20px;border-top:1px solid rgba(30,45,69,0.4);background:rgba(59,130,246,0.03);display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:12px;color:var(--text3);font-weight:600;">➕ 참가자 추가:</span>
            <select id="te_add_${ev.id}" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:8px;font-size:13px;outline:none;font-family:inherit;">
              <option value="">-- 회원 선택 --</option>
              ${members.filter(m => !ev.payments.hasOwnProperty(m)).map(m=>`<option>${m}</option>`).join('')}
            </select>
            <button onclick="addTourneyMember('${ev.id}')" style="background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.3);color:var(--blue);border-radius:7px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;">➕ 추가</button>
          </div>` : ''}
        </div>`;
      }).join('')}
  `;
}

function addTourneyMember(eventId) {
  if(!isAdmin) return;
  const sel = document.getElementById(`te_add_${eventId}`);
  const name = sel?.value;
  if(!name) { toast('회원을 선택하세요.', 'error'); return; }
  const t = loadTourneys();
  const ev = t.events.find(e => e.id === eventId);
  if(!ev) return;
  ev.payments[name] = false;
  saveTourneys(t);
  renderTourney();
  toast(`${name} 참가자 추가!`);
}

function removeTourneyMember(eventId) {
  if(!isAdmin) return;
  const sel = document.getElementById(`te_del_${eventId}`);
  const name = sel?.value;
  if(!name) { toast('제거할 회원을 선택하세요.', 'error'); return; }
  if(!confirm(`${name}을(를) 대회 참가자에서 제거할까요?`)) return;
  const t = loadTourneys();
  const ev = t.events.find(e => e.id === eventId);
  if(!ev) return;
  delete ev.payments[name];
  saveTourneys(t);
  renderTourney();
  toast(`${name} 제거 완료`);
}


// ══════════════════════════════════════════════════════════════
// 정기전 투표 기능
// ══════════════════════════════════════════════════════════════
const VOTE_KEY = 'bowlingApp_votes';

function loadVotes() {
  const _cached = window.fbLoad ? window.fbLoad('votes', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(VOTE_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return { polls: [] }; // [{id, title, date, roundLabel, status:'open'/'closed', votes:{name:'yes'/'no'/'maybe'}}]
}
function saveVotes(data) {
  try { localStorage.setItem(VOTE_KEY, JSON.stringify(data)); } catch(e) {}
  window.fbSave && window.fbSave('votes', data);
}

function createVotePoll() {
  if(!isAdmin) { toast('관리자만 투표를 만들 수 있습니다.', 'error'); return; }
  const title    = document.getElementById('vp_title').value.trim();
  const date     = document.getElementById('vp_date').value;
  const roundNum = document.getElementById('vp_round_num').value;   // 1~24
  const roundMon = document.getElementById('vp_round_mon').value;   // 1~12
  const deadline = document.getElementById('vp_deadline').value;    // datetime-local
  if(!title) { toast('투표 제목을 입력하세요.', 'error'); return; }
  const roundLabel = roundMon && roundNum ? `${roundMon}월 ${roundNum}회차` : '';
  const v = loadVotes();
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS);
  const votes = {};
  members.forEach(m => { votes[m] = ''; });
  v.polls.unshift({
    id: 'vp' + Date.now(),
    title,
    date: date || new Date().toISOString().slice(0,10),
    roundLabel,
    deadline: deadline || '',
    status: 'open',
    votes
  });
  saveVotes(v);
  document.getElementById('vp_title').value = '';
  renderVote();
  toast('투표 생성 완료! 회원들이 참가 여부를 선택할 수 있습니다.');
}

// 마감시간 자동 체크
function checkVoteDeadlines() {
  const v = loadVotes();
  let changed = false;
  v.polls.forEach(poll => {
    if(poll.status === 'open' && poll.deadline) {
      if(new Date() >= new Date(poll.deadline)) {
        poll.status = 'closed';
        changed = true;
      }
    }
  });
  if(changed) { saveVotes(v); renderVote(); }
}
setInterval(checkVoteDeadlines, 30000); // 30초마다 체크

function castVote(pollId, name, choice) {
  const v = loadVotes();
  const poll = v.polls.find(p => p.id === pollId);
  if(!poll || poll.status !== 'open') { toast('마감된 투표입니다.', 'error'); return; }
  // 같은 선택 다시 누르면 취소
  if(poll.votes[name] === choice) {
    poll.votes[name] = '';
    saveVotes(v);
    renderVote();
    toast(`${name} 투표 취소`);
    return;
  }
  poll.votes[name] = choice;
  saveVotes(v);
  renderVote();
  const labels = { yes:'✅ 참가', no:'❌ 불참', maybe:'🤔 미정' };
  toast(`${name} → ${labels[choice]} 선택 완료!`);
}

function closePoll(pollId) {
  if(!isAdmin) { toast('관리자만 마감할 수 있습니다.', 'error'); return; }
  const v = loadVotes();
  const poll = v.polls.find(p => p.id === pollId);
  if(!poll) return;
  poll.status = 'closed';
  saveVotes(v);
  renderVote();
  toast('투표 마감 완료!');
}

function reopenPoll(pollId) {
  if(!isAdmin) return;
  const v = loadVotes();
  const poll = v.polls.find(p => p.id === pollId);
  if(!poll) return;
  poll.status = 'open';
  saveVotes(v);
  renderVote();
  toast('투표 재개!');
}

function deletePoll(pollId) {
  if(!isAdmin) return;
  if(!confirm('이 투표를 삭제할까요?')) return;
  const v = loadVotes();
  v.polls = v.polls.filter(p => p.id !== pollId);
  saveVotes(v);
  renderVote();
  toast('삭제 완료');
}

function renderVote() {
  const container = document.getElementById('voteContent');
  if(!container) return;
  const v = loadVotes();
  const data = loadData();
  const allMembers = Object.keys(data.members || BASE_PLAYERS).sort();
  const stats = getPlayerStats();

  const roundOpts = data.rounds.map(r => r.label);

  container.innerHTML = `
  ${isAdmin ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:24px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">🗳️ 새 투표 만들기</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
      <div class="input-group">
        <label>투표 제목</label>
        <input type="text" id="vp_title" placeholder="예) 3월 2회차 정기전 참가 투표"
          style="width:260px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>날짜</label>
        <input type="date" id="vp_date" value="${new Date().toISOString().slice(0,10)}"
          style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>월</label>
        <select id="vp_round_mon" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
          ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>`<option value="${m}" ${m===new Date().getMonth()+1?'selected':''}>${m}월</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label>회차</label>
        <select id="vp_round_num" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
          <option value="1">1회차</option>
          <option value="2">2회차</option>
          <option value="3">3회차</option>
          <option value="4">4회차</option>
        </select>
      </div>
      <div class="input-group">
        <label>마감시간 (선택)</label>
        <input type="datetime-local" id="vp_deadline"
          style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <button class="btn btn-primary" onclick="createVotePoll()">📋 투표 생성</button>
    </div>
  </div>` : ''}

  ${v.polls.length === 0
    ? `<div class="empty"><div class="empty-icon">🗳️</div><div class="empty-text">진행 중인 투표가 없습니다</div><div class="empty-sub">관리자가 투표를 생성하면 참가 여부를 선택할 수 있습니다</div></div>`
    : v.polls.map(poll => {
        const yesVoters    = Object.entries(poll.votes).filter(([,v])=>v==='yes').map(([n])=>n);
        const noVoters     = Object.entries(poll.votes).filter(([,v])=>v==='no').map(([n])=>n);
        const maybeVoters  = Object.entries(poll.votes).filter(([,v])=>v==='maybe').map(([n])=>n);
        const emptyVoters  = Object.entries(poll.votes).filter(([,v])=>!v).map(([n])=>n);
        const total        = Object.keys(poll.votes).length;
        const responded    = total - emptyVoters.length;

        // 참가자 에버 합산
        const yesAvgs = yesVoters.map(n => {
          const s = stats[n]; const d = data.members;
          return s?.avg || d?.[n] || 0;
        });
        const totalAvg = yesAvgs.reduce((a,b)=>a+b, 0);
        const avgOfAvg = yesVoters.length > 0 ? Math.round(totalAvg / yesVoters.length) : 0;

        return `
        <div style="background:var(--card);border:1px solid ${poll.status==='open'?'rgba(34,197,94,0.4)':'var(--border)'};border-radius:16px;overflow:hidden;margin-bottom:20px;">
          <div style="padding:16px 20px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:11px;padding:2px 10px;border-radius:20px;font-weight:700;
                  background:${poll.status==='open'?'rgba(34,197,94,0.15)':'rgba(100,116,139,0.15)'};
                  color:${poll.status==='open'?'var(--green)':'var(--text3)'};
                  border:1px solid ${poll.status==='open'?'rgba(34,197,94,0.4)':'var(--border)'};">
                  ${poll.status==='open'?'🟢 진행중':'🔒 마감'}
                </span>
                <div style="font-weight:700;font-size:16px;">${poll.title}</div>
              </div>
              <div style="font-size:12px;color:var(--text3);">${poll.date}${poll.roundLabel?' · '+poll.roundLabel:''} · ${responded}/${total}명 응답${poll.deadline ? ' · ⏰ ' + new Date(poll.deadline).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) + ' 마감' : ''}</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${isAdmin && poll.status==='open' ? `<button onclick="closePoll('${poll.id}')" class="btn btn-secondary" style="font-size:12px;padding:6px 12px;">🔒 마감</button>` : ''}
              ${isAdmin && poll.status==='closed' ? `<button onclick="reopenPoll('${poll.id}')" class="btn btn-secondary" style="font-size:12px;padding:6px 12px;">🔓 재개</button>` : ''}
              ${isAdmin ? `<button onclick="deletePoll('${poll.id}')" style="background:none;border:1px solid rgba(239,68,68,0.3);color:var(--red);border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">✕ 삭제</button>` : ''}
            </div>
          </div>

          <!-- 투표 현황 요약 -->
          <div style="display:flex;gap:12px;padding:16px 20px;border-bottom:1px solid rgba(30,45,69,0.5);flex-wrap:wrap;">
            <div style="flex:1;min-width:80px;text-align:center;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:12px;padding:12px 8px;">
              <div style="font-size:22px;">✅</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:22px;color:var(--green);">${yesVoters.length}</div>
              <div style="font-size:11px;color:var(--text3);">참가</div>
            </div>
            <div style="flex:1;min-width:80px;text-align:center;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:12px 8px;">
              <div style="font-size:22px;">❌</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:22px;color:var(--red);">${noVoters.length}</div>
              <div style="font-size:11px;color:var(--text3);">불참</div>
            </div>
            <div style="flex:1;min-width:80px;text-align:center;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.3);border-radius:12px;padding:12px 8px;">
              <div style="font-size:22px;">🤔</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:22px;color:var(--yellow);">${maybeVoters.length}</div>
              <div style="font-size:11px;color:var(--text3);">미정</div>
            </div>
            <div style="flex:1;min-width:80px;text-align:center;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);border-radius:12px;padding:12px 8px;">
              <div style="font-size:22px;">📊</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:18px;color:var(--blue);">${avgOfAvg}</div>
              <div style="font-size:11px;color:var(--text3);">참가자 평균에버</div>
            </div>
          </div>

          <!-- 투표 버튼 (투표 가능한 경우) -->
          ${poll.status === 'open' ? `
          <div style="padding:16px 20px;border-bottom:1px solid rgba(30,45,69,0.5);">
            <div style="font-size:12px;color:var(--text3);margin-bottom:10px;">이름을 선택 후 참가 여부를 클릭하세요</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
              ${allMembers.map(name => {
                const v = poll.votes[name];
                const btnYes    = `background:${v==='yes'?'rgba(34,197,94,0.2)':'var(--bg3)'};border:1px solid ${v==='yes'?'var(--green)':'var(--border)'};color:${v==='yes'?'var(--green)':'var(--text2)'}`;
                const btnMaybe  = `background:${v==='maybe'?'rgba(234,179,8,0.2)':'var(--bg3)'};border:1px solid ${v==='maybe'?'var(--yellow)':'var(--border)'};color:${v==='maybe'?'var(--yellow)':'var(--text2)'}`;
                const btnNo     = `background:${v==='no'?'rgba(239,68,68,0.2)':'var(--bg3)'};border:1px solid ${v==='no'?'var(--red)':'var(--border)'};color:${v==='no'?'var(--red)':'var(--text2)'}`;
                return `
                <div style="display:flex;align-items:center;gap:4px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:6px 10px;">
                  <span style="font-size:12px;font-weight:700;min-width:42px;">${name}</span>
                  <button onclick="castVote('${poll.id}','${name}','yes')"
                    style="font-size:11px;padding:3px 8px;border-radius:6px;cursor:pointer;${btnYes}">✅</button>
                  <button onclick="castVote('${poll.id}','${name}','maybe')"
                    style="font-size:11px;padding:3px 8px;border-radius:6px;cursor:pointer;${btnMaybe}">🤔</button>
                  <button onclick="castVote('${poll.id}','${name}','no')"
                    style="font-size:11px;padding:3px 8px;border-radius:6px;cursor:pointer;${btnNo}">❌</button>
                </div>`;
              }).join('')}
            </div>
            </div>
          </div>` : ''}

          <!-- 회원별 투표 현황 -->
          <div style="padding:16px 20px;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${Object.entries(poll.votes).sort((a,b)=>a[0].localeCompare(b[0])).map(([name, choice]) => {
                const bg = choice==='yes'?'rgba(34,197,94,0.1)':choice==='no'?'rgba(239,68,68,0.08)':choice==='maybe'?'rgba(234,179,8,0.08)':'var(--bg3)';
                const border = choice==='yes'?'rgba(34,197,94,0.4)':choice==='no'?'rgba(239,68,68,0.3)':choice==='maybe'?'rgba(234,179,8,0.3)':'var(--border)';
                const icon   = choice==='yes'?'✅':choice==='no'?'❌':choice==='maybe'?'🤔':'⬜';
                const col    = choice==='yes'?'var(--green)':choice==='no'?'var(--red)':choice==='maybe'?'var(--yellow)':'var(--text3)';
                const s = stats[name]; const d = data.members;
                const avg = s?.avg ? Math.round(s.avg) : (d?.[name] || 0);
                return `<div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:8px 12px;text-align:center;min-width:70px;">
                  <div style="font-size:16px;">${icon}</div>
                  <div style="font-weight:700;font-size:12px;color:${col};">${name}</div>
                  <div style="font-size:10px;color:var(--text3);">에버 ${avg}</div>
                </div>`;
              }).join('')}
            </div>
          </div>

          <!-- 참가 확정자 목록 + 팀편성 바로가기 -->
          ${yesVoters.length > 0 ? `
          <div style="padding:12px 20px 16px;border-top:1px solid rgba(30,45,69,0.5);background:rgba(34,197,94,0.04);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <div style="font-size:13px;font-weight:700;color:var(--green);">✅ 참가 확정 ${yesVoters.length}명</div>
              <button onclick="sendToTeamBuilder('${poll.id}')" class="btn btn-primary" style="font-size:12px;padding:6px 14px;">⚡ 팀 편성하기</button>
            </div>
            <div style="font-size:12px;color:var(--text3);">${yesVoters.join(', ')}</div>
          </div>` : ''}
        </div>`;
      }).join('')}
  `;
}

function castVoteFromSelect(pollId, choice) {
  const sel = document.getElementById(`vote_name_${pollId}`);
  const name = sel?.value;
  if(!name) { toast('이름을 선택하세요.', 'error'); return; }
  castVote(pollId, name, choice);
}

// 투표 결과로 팀편성 이동
function sendToTeamBuilder(pollId) {
  const v = loadVotes();
  const poll = v.polls.find(p => p.id === pollId);
  if(!poll) return;
  const yesVoters = Object.entries(poll.votes).filter(([,v])=>v==='yes').map(([n])=>n);
  // 팀편성 섹션으로 이동하면서 참가자 자동 설정
  window._teamBuilderPreset = yesVoters;
  showSection('teambuilder', document.querySelector('.nav-btn[onclick*="teambuilder"]'));
  renderTeamBuilder(yesVoters);
  window.scrollTo({top:0, behavior:'smooth'});
  toast(`${yesVoters.length}명 참가자로 팀 편성 화면으로 이동했습니다!`);
}


// ══════════════════════════════════════════════════════════════
// 팀 편성 (에버 기반 균등 배분)
// ══════════════════════════════════════════════════════════════
let teamBuilderResult = null;
