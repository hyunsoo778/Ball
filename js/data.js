/* ════════════════════════════════════
 * Meet Ball - 데이터 / 저장소 / 초기화
 * ════════════════════════════════════ */

/*
 * ════════════════════════════════════════════════════════════
 *  🎳 볼링 정기전 관리 앱 v2.0 - 버그 수정 버전
 * ════════════════════════════════════════════════════════════
 *  수정 내역:
 *  [FIX1] initDataIfEmpty: 기준에버 강제 덮어쓰기 버그 수정
 *         → 관리자가 저장한 기준에버가 새로고침 후에도 유지됨
 *  [FIX2] getRoundAvgAndHandi: 기준에버 우선순위 수정
 *         → BASE_PLAYERS 대신 members(관리자 수정값) 우선 적용
 *  [FIX3] renderScoreEditor: 벌금 미리보기에 200 상한선 통일
 *         → checkFine() 함수로 통일하여 저장 후 결과와 일치
 *  [FIX4] updateRow: 벌금 미리보기 동일하게 checkFine() 통일
 *  [FIX5] getPlayerStats: avg 소수점 정밀도 2자리로 향상
 *         → 경계값 근처 벌금 판정 오류 방지
 *  [FIX6] 핸디 현황 탭 초기핸디 기준을 ORIGINAL_PLAYERS로 통일
 *         → 핸디 변동이력 탭과 동일한 기준
 *  [FIX7] handi_applied 순위: 각 회차 당시 직전 핸디로 정밀 계산
 *         → 최종 핸디 소급 적용 → 회차별 직전 핸디 개별 적용
 *  [FIX8] 회차 선택 드롭다운 12개월로 확장 (3월까지 → 12월까지)
 *  [FIX9] addMember/addMember2: data.members 초기화 로직 통일
 * ════════════════════════════════════════════════════════════
 */

// ── 관리자 인증 ───────────────────────────────────────────
const ADMIN_PW = '6950';
let isAdmin = false;

function toggleAdmin() {
  if(isAdmin) {
    document.getElementById('logoutModal').classList.add('show');
  } else {
    document.getElementById('adminModal').classList.add('show');
    setTimeout(() => document.getElementById('adminPwInput').focus(), 100);
  }
}

function checkAdminPw() {
  const pw = document.getElementById('adminPwInput').value;
  const input = document.getElementById('adminPwInput');
  const err = document.getElementById('adminPwError');
  if(pw === ADMIN_PW) {
    isAdmin = true;
    document.body.classList.add('admin-mode');
    document.getElementById('adminBadge').classList.add('active');
    document.getElementById('adminBadge').innerHTML = '🔓 관리자';
    document.getElementById('adminModal').classList.remove('show');
    document.getElementById('adminPwInput').value = '';
    err.textContent = '';
    document.getElementById('uploadLocked').style.display = 'none';
    document.getElementById('uploadContent').style.display = 'block';
    document.getElementById('membersNavBtn').style.display = 'inline-flex';
    document.getElementById('dataMenuBtn').style.display = 'inline-flex';
    // 거래내역 분석 탭 표시
    const txBtn = document.getElementById('moneytab_txscan');
    if(txBtn) txBtn.style.display = '';
    toast('관리자 모드 활성화 ✓', 'success');
    refreshAll();
  } else {
    input.classList.add('error');
    err.textContent = '비밀번호가 올바르지 않습니다';
    setTimeout(() => input.classList.remove('error'), 400);
    input.value = '';
  }
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('show');
  document.getElementById('adminPwInput').value = '';
  document.getElementById('adminPwError').textContent = '';
}

function closeLogoutModal() {
  document.getElementById('logoutModal').classList.remove('show');
}

function doLogout() {
  isAdmin = false;
  document.body.classList.remove('admin-mode');
  document.getElementById('adminBadge').classList.remove('active');
  document.getElementById('adminBadge').innerHTML = '🔒 관리자';
  document.getElementById('logoutModal').classList.remove('show');
  document.getElementById('membersNavBtn').style.display = 'none';
  document.getElementById('dataMenuBtn').style.display = 'none';
  document.getElementById('dataMenu').style.display = 'none';
  // 거래내역 탭 숨기기
  const txBtn = document.getElementById('moneytab_txscan');
  if(txBtn) txBtn.style.display = 'none';
  // txscan 탭에 있으면 dues로 이동
  if(_currentMoneyTab === 'txscan') switchMoneyTab('dues');
  document.getElementById('uploadLocked').style.display = 'flex';
  document.getElementById('uploadContent').style.display = 'none';
  if(document.getElementById('members').classList.contains('active')) {
    document.getElementById('members').classList.remove('active');
    document.getElementById('ranking').classList.add('active');
  }
  toast('로그아웃 완료');
  refreshAll();
}


// ── 선수 기준 데이터 ──────────────────────────────────────
// 여자 회원 목록 (벌금 기준에버 상한 190 적용)
const FEMALE_PLAYERS = new Set(['윤미라','이시은','이윤경','장은선']);

const BASE_PLAYERS = {
  '권우섭':192,'김동현':174,'김상윤':195,'김용태':211,'김주영':231,
  '박만수':184,'박성준':159,'박종성':150,'양해성':191,'오욱현':209,
  '오일주':181,'윤미라':158,'윤연균':184,'이구연':102,'이시은':130,
  '이윤경':157,'이지윤':199,'장경훈':121,'장민상':174,'장은선':139,
  '장훈석':206,'정현수':190,'조용상':142,'조정행':182,
  '이재필':222,'김기범':183,
};


// ── 정기전 시작 전 원래 에버 (핸디 변동이력 초기핸디 기준 = 1월 8일 1회차 직전 에버) ──────────
const ORIGINAL_PLAYERS = {
  '권우섭':192,'김동현':174,'김상윤':195,'김용태':211,'김주영':231,
  '박만수':184,'박성준':159,'박종성':150,'양해성':191,'오욱현':209,
  '오일주':181,'윤미라':158,'윤연균':184,'이구연':102,'이시은':130,
  '이윤경':157,'이지윤':199,'장경훈':121,'장민상':174,'장은선':139,
  '장훈석':206,'정현수':190,'조용상':142,'조정행':182,
  '이재필':222,'김기범':183,
};
// ── 저장소 ──────────────────────────────────────────────
const STORAGE_KEY = 'bowlingApp_data';
const FINE_PAYMENT_KEY = 'bowlingApp_finePayments';
const TX_HISTORY_KEY = 'bowlingApp_txHistory';

function loadTxHistory() {
  try { const r = localStorage.getItem(TX_HISTORY_KEY); return r ? JSON.parse(r) : []; } catch(e) { return []; }
}
function saveTxHistory(list) {
  try { localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(list)); } catch(e) {}
}
const EXTRA_FINES_KEY = 'bowlingApp_extraFines';   // 추가 벌금 (미투표/클럽티/불참 등)
const PRIZES_KEY = 'bowlingApp_prizes';             // 상금 내역

function loadData() {
  const _cached = window.fbLoad ? window.fbLoad('data', null) : null;
  if(_cached !== null) return _cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e) {}
  return { rounds: [], members: JSON.parse(JSON.stringify(BASE_PLAYERS)) };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window._bowlingData = data;
  } catch(e) { console.error('저장 실패', e); }
  window.fbSave && window.fbSave('data', data);
}

// 벌금 납부 정보 (roundId_playerName → true/false)
function loadFinePayments() {
  const _cached = window.fbLoad ? window.fbLoad('finePayments', null) : null;
  if(_cached !== null) return _cached;
  try {
    const raw = localStorage.getItem(FINE_PAYMENT_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e) {}
  return {};
}

function saveFinePayments(payments) {
  try {
    localStorage.setItem(FINE_PAYMENT_KEY, JSON.stringify(payments));
  } catch(e) { console.error('벌금저장 실패', e); }
  window.fbSave && window.fbSave('finePayments', payments);
}

function toggleFinePayment(roundId, name) {
  const payments = loadFinePayments();
  const key = `${roundId}__${name}`;
  payments[key] = !payments[key];
  saveFinePayments(payments);
  // 현재 탭 리렌더
  renderFineByRound();
}

function isFinePayment(roundId, name) {
  const payments = loadFinePayments();
  return !!payments[`${roundId}__${name}`];
}

// ── 성별 관리 ─────────────────────────────────────────
const GENDER_KEY = 'bowlingApp_genders';
function loadGenders() {
  const _cached = window.fbLoad ? window.fbLoad('genders', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(GENDER_KEY); if(r) return JSON.parse(r); } catch(e) {}
  // 기본값: FEMALE_PLAYERS 기준으로 초기화
  const g = {};
  for(const name in BASE_PLAYERS) g[name] = FEMALE_PLAYERS.has(name) ? 'F' : 'M';
  return g;
}
function saveGenders(g) {
  try { localStorage.setItem(GENDER_KEY, JSON.stringify(g)); } catch(e) {}
  window.fbSave && window.fbSave('genders', g);
}

function isFemale(name) {
  const g = loadGenders();
  // localStorage 값 우선, 없으면 FEMALE_PLAYERS 기준
  if(name in g) return g[name] === 'F';
  return FEMALE_PLAYERS.has(name);
}
function saveGender(name, gender) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  const g = loadGenders();
  g[name] = gender;
  saveGenders(g);
  renderMemberList();
  refreshAll();
  toast(`${name} 성별 ${gender === 'F' ? '여자' : '남자'}로 변경 완료`);
}

// ── 추가 벌금 (미투표 / 클럽티 미착용 / 무단불참·늦참) ────────────
// 구조: { id, roundLabel, name, type, amount, paid, date, memo }
const EXTRA_FINE_TYPES = {
  vote:   { label: '미투표',         amount: 2000,  icon: '🗳️' },
  shirt:  { label: '클럽티 미착용',   amount: 5000,  icon: '👕' },
  absent: { label: '무단불참/늦참',   amount: 10000, icon: '⏰' },
};

function loadExtraFines() {
  const _cached = window.fbLoad ? window.fbLoad('extraFines', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(EXTRA_FINES_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return [];
}
function saveExtraFines(list) {
  try { localStorage.setItem(EXTRA_FINES_KEY, JSON.stringify(list)); } catch(e) {}
  window.fbSave && window.fbSave('extraFines', list);
}

function addExtraFine() {
  if(!isAdmin) { toast('관리자만 추가할 수 있습니다.', 'error'); return; }
  const name  = document.getElementById('ef_name').value.trim();
  const type  = document.getElementById('ef_type').value;
  const round = document.getElementById('ef_round').value.trim();
  const memo  = document.getElementById('ef_memo').value.trim();
  if(!name) { toast('이름을 선택하세요.', 'error'); return; }
  const info = EXTRA_FINE_TYPES[type];
  const list = loadExtraFines();
  list.push({ id: 'ef' + Date.now(), roundLabel: round, name, type, amount: info.amount, paid: false, memo });
  saveExtraFines(list);
  document.getElementById('ef_memo').value = '';
  renderExtraFines();
  renderFineByPlayer();
  toast(`${name} ${info.label} ${info.amount.toLocaleString()}원 추가!`);
}

function toggleExtraFinePaid(id) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  const list = loadExtraFines();
  const item = list.find(x => x.id === id);
  if(!item) return;
  item.paid = !item.paid;
  saveExtraFines(list);
  renderExtraFines();
  renderFineByPlayer();
  toast(item.paid ? `납부 완료 처리 ✓` : `납부 취소`);
}

function deleteExtraFine(id) {
  if(!isAdmin) { toast('관리자만 삭제할 수 있습니다.', 'error'); return; }
  if(!confirm('이 벌금 항목을 삭제할까요?')) return;
  const list = loadExtraFines().filter(x => x.id !== id);
  saveExtraFines(list);
  renderExtraFines();
  renderFineByPlayer();
  toast('삭제 완료');
}

// ── 상금 ─────────────────────────────────────────────────
// 구조: { id, roundLabel, name, amount, reason, date }
function loadPrizes() {
  const _cached = window.fbLoad ? window.fbLoad('prizes', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(PRIZES_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return [];
}
function savePrizes(list) {
  try { localStorage.setItem(PRIZES_KEY, JSON.stringify(list)); } catch(e) {}
  window.fbSave && window.fbSave('prizes', list);
}

function addPrize() {
  if(!isAdmin) { toast('관리자만 추가할 수 있습니다.', 'error'); return; }
  const name   = document.getElementById('pr_name').value.trim();
  const round  = document.getElementById('pr_round').value.trim();
  const amount = parseInt(document.getElementById('pr_amount').value) || 0;
  const reason = document.getElementById('pr_reason').value.trim();
  if(!name)   { toast('이름을 선택하세요.', 'error'); return; }
  if(!amount) { toast('금액을 입력하세요.', 'error'); return; }
  if(!reason) { toast('상금 사유를 입력하세요.', 'error'); return; }
  const list = loadPrizes();
  list.push({ id: 'pr' + Date.now(), roundLabel: round, name, amount, reason, paid: false });
  savePrizes(list);
  document.getElementById('pr_amount').value = '';
  document.getElementById('pr_reason').value = '';
  renderPrizes();
  toast(`${name} 상금 ${amount.toLocaleString()}원 추가!`);
}

function togglePrizePaid(id) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  const list = loadPrizes();
  const item = list.find(x => x.id === id);
  if(!item) return;
  item.paid = !item.paid;
  savePrizes(list);
  renderPrizes();
  toast(item.paid ? '지급 완료 ✓' : '지급 취소');
}

function deletePrize(id) {
  if(!isAdmin) { toast('관리자만 삭제할 수 있습니다.', 'error'); return; }
  if(!confirm('이 상금 항목을 삭제할까요?')) return;
  const list = loadPrizes().filter(x => x.id !== id);
  savePrizes(list);
  renderPrizes();
  toast('삭제 완료');
}

function initDataIfEmpty() {
  const raw = localStorage.getItem('bowlingApp_data');
  // 완전히 새로운 경우(localStorage 없음)에만 BASE_PLAYERS로 초기화
  if(!raw) {
    const data = { rounds: JSON.parse(JSON.stringify(INIT_ROUNDS)), members: JSON.parse(JSON.stringify(BASE_PLAYERS)) };
    saveData(data);
    window._bowlingData = data;
    return;
  }
  const data = loadData();
  if(!data.rounds || data.rounds.length === 0) {
    data.rounds = JSON.parse(JSON.stringify(INIT_ROUNDS));
  }
  // data.members가 아예 없을 때만 BASE_PLAYERS로 채움
  // (이미 members가 있으면 관리자가 수동 삭제한 회원은 건드리지 않음)
  if(!data.members) {
    data.members = JSON.parse(JSON.stringify(BASE_PLAYERS));
  }
  saveData(data);
  window._bowlingData = data;
}

// 초기 데이터 (기존 4회차)
const INIT_ROUNDS = [
  {
    id:'r1', label:'1월 1회차', date:'2026-01-08',
    scores:[
      {name:'권우섭',g:[196,235,186],total:617},
      {name:'김동현',g:[161,206,191],total:558},
      {name:'김용태',g:[212,211,207],total:630},
      {name:'박성준',g:[172,154,138],total:464},
      {name:'박종성',g:[179,180,222],total:581},
      {name:'양해성',g:[183,135,182],total:500},
      {name:'오욱현',g:[190,214,216],total:620},
      {name:'오일주',g:[176,245,181],total:602},
      {name:'윤미라',g:[145,129,141],total:415},
      {name:'윤연균',g:[173,150,203],total:526},
      {name:'이구연',g:[104,97,185], total:386},
      {name:'이시은',g:[145,132,148],total:425},
      {name:'이윤경',g:[165,124,164],total:453},
      {name:'이지윤',g:[217,223,146],total:586},
      {name:'장경훈',g:[166,122,108],total:396},
      {name:'장민상',g:[237,144,193],total:574},
      {name:'장은선',g:[152,120,125],total:397},
      {name:'장훈석',g:[224,254,205],total:683},
      {name:'정현수',g:[184,192,245],total:621},
      {name:'조용상',g:[186,152,130],total:468},
      {name:'조정행',g:[208,186,192],total:586},
    ]
  },
  {
    id:'r2', label:'1월 2회차', date:'2026-01-22',
    scores:[
      {name:'김상윤', g:[183,229,221], total:633},
      {name:'박성준', g:[132,146,166], total:444},
      {name:'오욱현', g:[213,246,216], total:675},
      {name:'오일주', g:[189,154,234], total:577},
      {name:'윤연균', g:[163,213,191], total:567},
      {name:'이구연', g:[103,124,149], total:376},
      {name:'이시은', g:[132,202,182], total:516},
      {name:'이지윤', g:[202,167,207], total:576},
      {name:'장경훈', g:[125,81,142],  total:348},
      {name:'장은선', g:[110,105,157], total:372},
      {name:'장훈석', g:[216,267,256], total:739},
      {name:'정현수', g:[193,201,180], total:574},
      {name:'조용상', g:[187,140,142], total:469},
      {name:'조정행', g:[259,213,193], total:665},
    ]
  },
  {
    id:'r3', label:'2월 1회차', date:'2026-02-12',
    scores:[
      {name:'장훈석',g:[227,246,280],total:753},
      {name:'오욱현',g:[201,246,228],total:675},
      {name:'윤미라',g:[123,159,179],total:461},
      {name:'양해성',g:[211,172,201],total:584},
      {name:'장민상',g:[247,191,171],total:609},
      {name:'김용태',g:[223,268,159],total:650},
      {name:'이구연',g:[121,151,183],total:455},
      {name:'김기범',g:[164,220,165],total:549},
      {name:'오일주',g:[176,172,210],total:558},
      {name:'이윤경',g:[177,155,175],total:507},
      {name:'조정행',g:[167,198,240],total:605},
      {name:'조용상',g:[123,150,132],total:405},
      {name:'이재필',g:[196,190,225],total:611},
      {name:'이지윤',g:[177,176,256],total:609},
      {name:'장경훈',g:[200,156,167],total:523},
    ]
  },
  {
    id:'r4', label:'2월 2회차', date:'2026-02-26',
    scores:[
      {name:'김용태',g:[225,194,257],total:676},
      {name:'이구연',g:[159,107,118],total:384},
      {name:'오일주',g:[157,190,147],total:494},
      {name:'장은선',g:[125,152,108],total:385},
      {name:'박종성',g:[142,152,148],total:442},
      {name:'장훈석',g:[221,249,222],total:692},
      {name:'조용상',g:[128,98,121], total:347},
      {name:'양해성',g:[181,192,184],total:557},
      {name:'이윤경',g:[180,135,146],total:461},
      {name:'이재필',g:[204,206,256],total:666},
      {name:'이지윤',g:[232,231,200],total:663},
      {name:'조정행',g:[201,213,214],total:628},
      {name:'오욱현',g:[225,239,257],total:721},
      {name:'장경훈',g:[194,137,199],total:530},
      {name:'박성준',g:[148,151,139],total:438},
    ]
  },
];

window._bowlingData = { rounds: INIT_ROUNDS, players: {} };
