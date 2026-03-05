/* ════════════════════════════════════
 * Meet Ball - 찬조 / 회원관리 / 엑셀 / 데이터
 * ════════════════════════════════════ */

// ── 찬조 관리 ──────────────────────────────────────────────
// 구조: { id, name, amount, reason, date, note }
function loadSponsors() {
  const _cached = window.fbLoad ? window.fbLoad('sponsors', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(SPONSOR_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return [];
}
function saveSponsors(list) {
  try { localStorage.setItem(SPONSOR_KEY, JSON.stringify(list)); } catch(e) {}
  window.fbSave && window.fbSave('sponsors', list);
}

function addSponsor() {
  if(!isAdmin) { toast('관리자만 등록할 수 있습니다.', 'error'); return; }
  const name   = document.getElementById('sp_name').value.trim();
  const amount = parseInt(document.getElementById('sp_amount').value.replace(/,/g,'')) || 0;
  const reason = document.getElementById('sp_reason').value.trim();
  const date   = document.getElementById('sp_date').value;
  const note   = document.getElementById('sp_note').value.trim();
  if(!name)   { toast('이름을 입력하세요.', 'error'); return; }
  if(!amount) { toast('금액을 입력하세요.', 'error'); return; }
  const list = loadSponsors();
  list.unshift({ id:'sp'+Date.now(), name, amount, reason, date: date || new Date().toISOString().slice(0,10), note });
  saveSponsors(list);
  document.getElementById('sp_amount').value = '';
  document.getElementById('sp_reason').value = '';
  document.getElementById('sp_note').value   = '';
  renderSponsor();
  toast(`${name} 찬조 ${amount.toLocaleString()}원 등록 완료!`);
}

function deleteSponsor(id) {
  if(!isAdmin) return;
  if(!confirm('이 찬조 내역을 삭제할까요?')) return;
  saveSponsors(loadSponsors().filter(x => x.id !== id));
  renderSponsor();
  toast('삭제 완료');
}

function renderSponsor() {
  const container = document.getElementById('sponsorContent');
  if(!container) return;
  const data  = loadData();
  const list  = loadSponsors();
  const members = Object.keys(data.members || BASE_PLAYERS).sort();

  // 통계
  const totalAmt = list.reduce((a,x) => a+x.amount, 0);
  // 찬조자별 합계
  const byName = {};
  list.forEach(s => { byName[s.name] = (byName[s.name]||0) + s.amount; });
  const topList = Object.entries(byName).sort((a,b)=>b[1]-a[1]);

  container.innerHTML = `
  <!-- 요약 카드 -->
  <div class="fine-summary-grid" style="margin-bottom:24px;">
    <div class="fine-summary-card" style="border-color:rgba(234,179,8,0.4);">
      <div class="fine-summary-icon">🎁</div>
      <div class="fine-summary-val" style="color:var(--yellow);">${(totalAmt/10000).toFixed(0)}<span style="font-size:14px;">만원</span></div>
      <div class="fine-summary-label">총 찬조금액</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(249,115,22,0.3);">
      <div class="fine-summary-icon">👥</div>
      <div class="fine-summary-val" style="color:var(--accent);">${Object.keys(byName).length}<span style="font-size:14px;">명</span></div>
      <div class="fine-summary-label">찬조 인원</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">📋</div>
      <div class="fine-summary-val" style="color:var(--text);">${list.length}<span style="font-size:14px;">건</span></div>
      <div class="fine-summary-label">총 건수</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(234,179,8,0.3);">
      <div class="fine-summary-icon">🥇</div>
      <div class="fine-summary-val" style="color:var(--yellow);font-size:16px;">${topList[0]?topList[0][0]:'-'}</div>
      <div class="fine-summary-label">${topList[0]?topList[0][1].toLocaleString()+'원':'찬조 없음'}</div>
    </div>
  </div>

  <!-- 찬조자별 누계 바 -->
  ${topList.length > 0 ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">🏅 찬조자별 누계</div>
    ${topList.map(([name, amt], i) => {
      const pct = Math.round(amt / topList[0][1] * 100);
      const colors = ['var(--yellow)','var(--text2)','#b45309','var(--accent)'];
      const c = colors[Math.min(i, colors.length-1)];
      return `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <div style="width:20px;height:20px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${c};flex-shrink:0;">${i+1}</div>
        <div style="width:70px;flex-shrink:0;font-weight:700;font-size:13px;">${name}</div>
        <div style="flex:1;background:var(--bg3);border-radius:4px;height:8px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${c};border-radius:4px;transition:width .5s;"></div>
        </div>
        <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:${c};width:80px;text-align:right;">${amt.toLocaleString()}원</div>
      </div>`;
    }).join('')}
  </div>` : ''}

  <!-- 등록 폼 (관리자) -->
  ${isAdmin ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">🎁 찬조 등록</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
      <div class="input-group">
        <label>이름</label>
        <input type="text" id="sp_name" list="sp_name_list" placeholder="홍길동"
          style="width:110px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
        <datalist id="sp_name_list">${members.map(m=>`<option value="${m}">`).join('')}</datalist>
      </div>
      <div class="input-group">
        <label>금액 (원)</label>
        <input type="number" id="sp_amount" placeholder="50000" min="0" step="1000"
          style="width:130px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:'JetBrains Mono',monospace;">
      </div>
      <div class="input-group">
        <label>사유</label>
        <input type="text" id="sp_reason" placeholder="예) 창립기념 찬조"
          style="width:180px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>날짜</label>
        <input type="date" id="sp_date" value="${new Date().toISOString().slice(0,10)}"
          style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>메모 (선택)</label>
        <input type="text" id="sp_note" placeholder="추가 메모"
          style="width:150px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <button class="btn btn-primary" style="background:var(--yellow);color:#000;font-weight:700;" onclick="addSponsor()">🎁 등록</button>
    </div>
  </div>` : ''}

  <!-- 내역 목록 -->
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
    <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
      <div style="font-weight:700;font-size:14px;">📋 찬조 내역 (최신순)</div>
      <div style="font-size:12px;color:var(--text3);">총 ${list.length}건 · ${totalAmt.toLocaleString()}원</div>
    </div>
    ${list.length === 0
      ? `<div class="empty"><div class="empty-icon">🎁</div><div class="empty-text">등록된 찬조 내역이 없습니다</div></div>`
      : list.map(s => `
      <div class="fine-row">
        <div style="font-size:22px;">🎁</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:14px;">${s.name}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:2px;">
            ${s.reason||'찬조'}${s.note?' · '+s.note:''} · ${s.date}
          </div>
        </div>
        <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px;color:var(--yellow);">
          ${s.amount.toLocaleString()}원
        </div>
        ${isAdmin ? `<button onclick="deleteSponsor('${s.id}')"
          style="background:none;border:1px solid rgba(239,68,68,0.3);color:var(--red);border-radius:6px;padding:2px 8px;font-size:11px;cursor:pointer;">✕</button>` : ''}
      </div>`).join('')}
  </div>`;
}

// ── 회원관리 ──────────────────────────────────────────────

function renderMemberList() {
  const data = loadData();
  const members = data.members || {...BASE_PLAYERS};
  const stats = getPlayerStats();
  const names = Object.keys(members).sort();
  document.getElementById('memberCount').textContent = `총 ${names.length}명`;
  const container = document.getElementById('memberListTable');
  container.innerHTML = names.map((name, i) => {
    const baseAvg = members[name] || 0;
    const s = stats[name];
    const attend = s ? s.attend : 0;
    const curAvg = s && s.avg ? Math.round(s.avg) : '-';
    const handi = calcHandi(s?.avg || baseAvg);
    return `
    <div class="member-row">
      <div class="member-num">${i+1}</div>
      <div class="member-name-cell">
        ${name}
        <div style="font-size:11px;color:var(--text3);margin-top:2px;">누적에버 ${curAvg} · 핸디 ${handi} · ${attend}회 출전</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <!-- 성별 토글 -->
        <div style="display:flex;gap:4px;">
          <button onclick="saveGender('${name}','M')"
            style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid ${!isFemale(name)?'var(--blue)':'var(--border)'};background:${!isFemale(name)?'rgba(59,130,246,0.15)':'var(--bg3)'};color:${!isFemale(name)?'var(--blue)':'var(--text3)'};">♂ 남</button>
          <button onclick="saveGender('${name}','F')"
            style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid ${isFemale(name)?'#f472b6':'var(--border)'};background:${isFemale(name)?'rgba(244,114,182,0.15)':'var(--bg3)'};color:${isFemale(name)?'#f472b6':'var(--text3)'};">♀ 여</button>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;color:var(--text3);">기준에버</span>
          <input type="number" class="member-avg-input" value="${baseAvg}"
            id="avgInput_${name}" min="0" max="300"
            onkeydown="if(event.key==='Enter')saveMemberAvg('${name}')">
          <button class="member-save-btn" onclick="saveMemberAvg('${name}')">저장</button>
        </div>
        <button class="member-del-btn" onclick="deleteMember('${name}')">🗑 삭제</button>
      </div>
    </div>`;
  }).join('');
}

function addMember() {
  if(!isAdmin) { toast('관리자만 추가할 수 있습니다.', 'error'); return; }
  const name = document.getElementById('newMemberName').value.trim();
  const avg = parseInt(document.getElementById('newMemberAvg').value) || 0;
  if(!name) { toast('이름을 입력하세요.', 'error'); return; }
  const data = loadData();
  if(!data.members) data.members = {};
  if(data.members.hasOwnProperty(name)) { toast(`${name}은 이미 등록된 회원입니다.`, 'error'); return; }
  data.members[name] = avg;
  saveData(data);
  document.getElementById('newMemberName').value = '';
  document.getElementById('newMemberAvg').value = '';
  refreshAll();
  renderMemberList();
  toast(`${name} 회원 추가 완료!`);
}

function addMember2() {
  if(!isAdmin) { toast('관리자만 추가할 수 있습니다.', 'error'); return; }
  const name = document.getElementById('newMemberName2').value.trim();
  const avg  = parseInt(document.getElementById('newMemberAvg2').value) || 0;
  if(!name) { toast('이름을 입력하세요.', 'error'); return; }
  const data = loadData();
  if(!data.members) data.members = {};
  if(data.members.hasOwnProperty(name)) { toast(`${name}은 이미 등록된 회원입니다.`, 'error'); return; }
  data.members[name] = avg;
  saveData(data);
  const gender2 = document.getElementById('newMemberGender2')?.value || 'M';
  const genders2 = loadGenders(); genders2[name] = gender2; saveGenders(genders2);
  document.getElementById('newMemberName2').value = '';
  document.getElementById('newMemberAvg2').value = '';
  renderMemberList();
  renderPlayers();
  if(currentRankTab) renderRanking(currentRankTab);
  toast(`${name} 회원 추가 완료!`);
}

function saveMemberAvg(name) {
  if(!isAdmin) { toast('관리자만 수정할 수 있습니다.', 'error'); return; }
  const input = document.getElementById(`avgInput_${name}`);
  const avg = parseInt(input.value) || 0;
  const data = loadData();
  if(!data.members) data.members = {};
  data.members[name] = avg;
  saveData(data);
  renderMemberList();
  renderPlayers();
  if(currentRankTab) renderRanking(currentRankTab);
  toast(`${name} 기준에버 ${avg}로 저장 완료!`);
}

function deleteMember(name) {
  if(!isAdmin) { toast('관리자만 삭제할 수 있습니다.', 'error'); return; }
  const data = loadData();
  const hasScores = data.rounds.some(r => r.scores.some(sc => sc.name === name));
  const msg = hasScores
    ? `[${name}] 회원을 삭제할까요?\n⚠️ 해당 회원의 점수 기록도 함께 삭제됩니다.`
    : `[${name}] 회원을 삭제할까요?`;
  if(!confirm(msg)) return;
  if(data.members) delete data.members[name];
  for(const round of data.rounds) {
    round.scores = round.scores.filter(sc => sc.name !== name);
  }
  saveData(data);
  renderMemberList();
  refreshAll();
  toast(`${name} 회원 삭제 완료`);
}

function deletePlayerFromRound(roundId, name) {
  if(!isAdmin) { toast('관리자만 삭제할 수 있습니다.', 'error'); return; }
  if(!confirm(`[${name}] 선수의 이번 회차 점수를 삭제할까요?`)) return;
  const data = loadData();
  const round = data.rounds.find(r => r.id === roundId);
  if(!round) return;
  round.scores = round.scores.filter(sc => sc.name !== name);
  saveData(data);
  refreshAll();
  toast(`${name} 점수 삭제 완료`);
}

function refreshAllViews() {
  refreshAll();
  const activeSection = document.querySelector('.section.active');
  if(!activeSection) return;
  const id = activeSection.id;
  if(id === 'notice')      renderNotice();
  if(id === 'dues')        switchMoneyTab(_currentMoneyTab || 'dues');
  if(id === 'vote')        switchVoteTab(_currentVoteTab || 'regular');
  if(id === 'teambuilder') renderTeamBuilder();
  if(id === 'ranking')     renderRanking(currentRankTab || 'avg');
}

function refreshAll() {
  renderRounds();
  renderPlayers();
  if(currentRankTab) renderRanking(currentRankTab);
  const finesSection = document.getElementById('fines');
  if(finesSection && finesSection.classList.contains('active')) renderFines();
}
