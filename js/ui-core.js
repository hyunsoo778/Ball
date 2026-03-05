/* ════════════════════════════════════
 * Meet Ball - UI 공통 헬퍼 (섹션전환/탭/토스트)
 * ════════════════════════════════════ */

// ── UI 헬퍼 ──────────────────────────────────────────────
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(id === 'ranking')     renderRanking(currentRankTab || 'avg');
  if(id === 'rounds')      renderRounds();
  if(id === 'players')     renderPlayers();
  if(id === 'members')     renderMemberList();
  if(id === 'notice')      renderNotice();
  if(id === 'dues')        switchMoneyTab('dues');
  if(id === 'vote')        switchVoteTab('regular');
  if(id === 'teambuilder') renderTeamBuilder();
}

// ── 회비·벌금·상금 탭 전환 ──
let _currentMoneyTab = 'dues';
function switchMoneyTab(tab) {
  _currentMoneyTab = tab;
  ['dues','fines','prizes','tourney','sponsor','txscan'].forEach(t => {
    const btn = document.getElementById('moneytab_' + t);
    if(btn) btn.classList.toggle('active', t === tab);
    const panel = document.getElementById('moneyPanel_' + t);
    if(panel) panel.style.display = t === tab ? '' : 'none';
  });
  if(tab==='dues')    renderDues();
  if(tab==='fines')   renderFines();
  if(tab==='prizes')  renderPrizes();
  if(tab==='tourney') renderTourney();
  if(tab==='sponsor') renderSponsor();
  if(tab==='txscan')  renderTxScan();
}

// ── 투표 탭 전환 ──
let _currentVoteTab = 'regular';
function switchVoteTab(tab) {
  _currentVoteTab = tab;
  ['regular','banggae'].forEach(t => {
    const btn = document.getElementById('votetab_' + t);
    if(btn) btn.classList.toggle('active', t === tab);
    const panel = document.getElementById('votePanel_' + t);
    if(panel) panel.style.display = t === tab ? '' : 'none';
  });
  if(tab==='regular') renderVote();
  if(tab==='banggae') renderBanggae();
}


function toast(msg, type='success') {
  const t = document.getElementById('toast');
  t.className = `toast show ${type}`;
  t.innerHTML = (type==='success'?'✅':'❌') + ' ' + msg;
  setTimeout(() => t.classList.remove('show'), 3000);
}
