/* ════════════════════════════════════
 * Meet Ball - 회원 관리 / 순위 / 라운드
 * ════════════════════════════════════ */

// ── 회원관리 ──────────────────────────────────────────────

function renderFines() {
  if(currentFineTab === 'by_round') renderFineByRound();
  else if(currentFineTab === 'by_player') renderFineByPlayer();
  else if(currentFineTab === 'extra') renderExtraFines();
}

function renderFineByRound() {
  const { finesByRound } = getAllFines();
  const container = document.getElementById('fineContent');

  if(finesByRound.length === 0) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">💸</div><div class="empty-text">벌금 대상자가 없습니다</div><div class="empty-sub">모든 게임에서 기준에버 이상을 기록했습니다!</div></div>`;
    return;
  }

  // 통계 요약
  let totalFine = 0, totalPaid = 0, totalUnpaid = 0, totalCount = 0, paidCount = 0;
  finesByRound.forEach(r => {
    r.fines.forEach(f => {
      totalFine += f.amount;
      totalCount++;
      if(f.paid) { totalPaid += f.amount; paidCount++; }
      else totalUnpaid += f.amount;
    });
  });

  const payRate = totalCount > 0 ? Math.round(paidCount/totalCount*100) : 0;

  container.innerHTML = `
  <!-- 요약 카드 -->
  <div class="fine-summary-grid" style="margin-bottom:28px;">
    <div class="fine-summary-card" style="border-color:rgba(239,68,68,0.3);">
      <div class="fine-summary-icon">💸</div>
      <div class="fine-summary-val" style="color:var(--red);">${totalFine.toLocaleString()}<span style="font-size:14px;font-weight:400;">원</span></div>
      <div class="fine-summary-label">총 벌금 합계</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(34,197,94,0.3);">
      <div class="fine-summary-icon">✅</div>
      <div class="fine-summary-val" style="color:var(--green);">${totalPaid.toLocaleString()}<span style="font-size:14px;font-weight:400;">원</span></div>
      <div class="fine-summary-label">납부 완료</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(239,68,68,0.2);">
      <div class="fine-summary-icon">⏳</div>
      <div class="fine-summary-val" style="color:${totalUnpaid>0?'var(--red)':'var(--text2)'};">${totalUnpaid.toLocaleString()}<span style="font-size:14px;font-weight:400;">원</span></div>
      <div class="fine-summary-label">미납 합계</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">📊</div>
      <div class="fine-summary-val" style="color:var(--accent);">${payRate}<span style="font-size:14px;font-weight:400;">%</span></div>
      <div class="fine-summary-label">납부율 (${paidCount}/${totalCount}명)</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">🎳</div>
      <div class="fine-summary-val" style="color:var(--blue);">${totalCount}<span style="font-size:14px;font-weight:400;">건</span></div>
      <div class="fine-summary-label">총 벌금 건수</div>
    </div>
  </div>

  <!-- 납부 안내 -->
  <div style="background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.2);border-radius:12px;padding:14px 18px;margin-bottom:24px;display:flex;align-items:center;gap:10px;">
    <span style="font-size:18px;">💡</span>
    <div style="font-size:13px;color:var(--text2);">
      체크박스를 클릭하면 납부 상태가 변경됩니다.
      ${!isAdmin ? '<span style="color:var(--text3);"> (관리자 로그인 시 수정 가능)</span>' : ''}
    </div>
  </div>

  <!-- 회차별 카드 -->
  ${[...finesByRound].reverse().map(r => {
    const roundTotal = r.fines.reduce((a,f) => a+f.amount, 0);
    const roundPaid = r.fines.filter(f=>f.paid).reduce((a,f)=>a+f.amount, 0);
    const roundUnpaid = roundTotal - roundPaid;
    const allPaid = r.fines.every(f=>f.paid);
    return `
    <div class="fine-round-card">
      <div class="fine-round-header">
        <div>
          <div style="font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px;">
            ${r.label}
            ${allPaid ? `<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(34,197,94,0.15);color:var(--green);border:1px solid rgba(34,197,94,0.3);">✓ 정산완료</span>` : ''}
          </div>
          <div style="font-size:12px;color:var(--text3);margin-top:3px;">${r.date} · 벌금대상 ${r.fines.length}명</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:var(--red);">${roundTotal.toLocaleString()}원</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px;">
            납부 <span style="color:var(--green);font-weight:600;">${roundPaid.toLocaleString()}</span> · 
            미납 <span style="color:${roundUnpaid>0?'var(--red)':'var(--text3)'};">${roundUnpaid.toLocaleString()}</span>
          </div>
        </div>
      </div>
      ${r.fines.map(f => f.extra ? `
      <div class="fine-row ${f.paid ? 'paid' : ''}" style="border-left:3px solid var(--yellow);">
        <!-- 추가벌금 체크박스 -->
        <div class="fine-check-wrap">
          <input type="checkbox" id="chk_ef_${f.efId}"
            ${f.paid ? 'checked' : ''}
            ${!isAdmin ? 'disabled' : ''}
            onchange="toggleExtraFinePaidAndRefresh('${f.efId}')">
          <label class="fine-check-box" for="chk_ef_${f.efId}" style="${!isAdmin?'cursor:not-allowed;opacity:0.5;':''}"></label>
        </div>
        <!-- 이름 & 정보 -->
        <div style="flex:1;min-width:0;">
          <div class="fine-name" style="${f.paid ? 'text-decoration:line-through;color:var(--text3);' : ''}">${f.name}</div>
          <div class="fine-detail">${f.icon} ${f.label}</div>
        </div>` : `
      <div class="fine-row ${f.paid ? 'paid' : ''}">
        <!-- 체크박스 -->
        <div class="fine-check-wrap">
          <input type="checkbox" id="chk_${r.roundId}_${f.name}"
            ${f.paid ? 'checked' : ''}
            ${!isAdmin ? 'disabled' : ''}
            onchange="toggleFinePaymentAndRefresh('${r.roundId}','${f.name}')">
          <label class="fine-check-box" for="chk_${r.roundId}_${f.name}" style="${!isAdmin?'cursor:not-allowed;opacity:0.5;':''}"></label>
        </div>
        <!-- 이름 & 정보 -->
        <div style="flex:1;min-width:0;">
          <div class="fine-name" style="${f.paid ? 'text-decoration:line-through;color:var(--text3);' : ''}">${f.name}</div>
          <div class="fine-detail">
            게임: ${f.g.map((g,i) => `<span style="${g < f.baseAvg ? 'color:var(--red);' : ''}">${g}</span>`).join(' · ')}
            &nbsp;·&nbsp; 기준에버 ${Math.round(f.baseAvg)}
          </div>
        </div>
        <!-- 금액 & 뱃지 -->
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <div class="fine-amount" style="${f.paid ? 'color:var(--text3);text-decoration:line-through;' : ''}">${f.amount.toLocaleString()}원</div>
          ${f.paid
            ? `<span class="fine-paid-badge">✓ 납부완료</span>`
            : `<span class="fine-unpaid-badge">⏳ 미납</span>`}
        </div>
      </div>`).join('')}
    </div>`;
  }).join('')}
  `;
}

function toggleFinePaymentAndRefresh(roundId, name) {
  if(!isAdmin) { toast('관리자만 납부 상태를 변경할 수 있습니다.', 'error'); return; }
  const payments = loadFinePayments();
  const key = `${roundId}__${name}`;
  const newVal = !payments[key];
  payments[key] = newVal;
  saveFinePayments(payments);
  renderFineByRound();
  toast(newVal ? `${name} 납부 완료 처리 ✓` : `${name} 납부 취소`, newVal ? 'success' : 'error');
}

function toggleExtraFinePaidAndRefresh(efId) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  const list = loadExtraFines();
  const ef = list.find(e => e.id === efId);
  if(!ef) return;
  ef.paid = !ef.paid;
  saveExtraFines(list);
  renderFines();
}

function renderFineByPlayer() {
  const { finesByPlayer } = getAllFines();
  const container = document.getElementById('fineContent');
  const players = Object.entries(finesByPlayer).sort((a,b) => b[1].unpaid - a[1].unpaid || b[1].total - a[1].total);

  if(players.length === 0) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">🎉</div><div class="empty-text">벌금 대상자가 없습니다</div></div>`;
    return;
  }

  const totalAll = players.reduce((a,[,p])=>a+p.total, 0);
  const paidAll = players.reduce((a,[,p])=>a+p.paid, 0);
  const unpaidAll = players.reduce((a,[,p])=>a+p.unpaid, 0);

  container.innerHTML = `
  <!-- 요약 -->
  <div class="fine-summary-grid" style="margin-bottom:28px;">
    <div class="fine-summary-card" style="border-color:rgba(239,68,68,0.3);">
      <div class="fine-summary-icon">💸</div>
      <div class="fine-summary-val" style="color:var(--red);">${totalAll.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">총 누적 벌금</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(34,197,94,0.3);">
      <div class="fine-summary-icon">✅</div>
      <div class="fine-summary-val" style="color:var(--green);">${paidAll.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">총 납부 금액</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">⏳</div>
      <div class="fine-summary-val" style="color:${unpaidAll>0?'var(--red)':'var(--text2)'};">${unpaidAll.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">총 미납 금액</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">👤</div>
      <div class="fine-summary-val" style="color:var(--accent);">${players.length}<span style="font-size:14px;">명</span></div>
      <div class="fine-summary-label">벌금 부과 인원</div>
    </div>
  </div>

  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
    <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
      <div style="font-weight:700;font-size:15px;">👤 선수별 벌금 누적 현황</div>
      <div style="font-size:12px;color:var(--text3);">미납액 내림차순 정렬</div>
    </div>
    ${players.map(([name, p]) => {
      const barPaid = p.total > 0 ? Math.round(p.paid / p.total * 100) : 0;
      return `
      <div class="fine-player-card">
        <div style="width:130px;flex-shrink:0;">
          <div style="font-weight:700;font-size:14px;">${name}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:3px;">${p.details.length}회 벌금</div>
        </div>
        <!-- 납부 진행 바 -->
        <div class="fine-bar-wrap" style="flex:1;max-width:180px;">
          <div style="font-size:11px;color:var(--text3);margin-bottom:5px;">납부율 ${barPaid}%</div>
          <div class="fine-bar-bg">
            <div class="fine-bar-fill fine-bar-paid" style="width:${barPaid}%;"></div>
          </div>
        </div>
        <!-- 금액 정보 -->
        <div style="display:flex;gap:20px;flex-wrap:wrap;">
          <div style="text-align:center;">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;color:var(--red);">${p.total.toLocaleString()}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px;">총 벌금</div>
          </div>
          <div style="text-align:center;">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;color:var(--green);">${p.paid.toLocaleString()}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px;">납부</div>
          </div>
          <div style="text-align:center;">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;color:${p.unpaid>0?'var(--red)':'var(--text3)'};">${p.unpaid.toLocaleString()}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px;">미납</div>
          </div>
        </div>
        <!-- 회차별 내역 -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0;">
          ${p.details.map(d => `
          <span title="${d.label}" style="font-size:11px;padding:3px 8px;border-radius:8px;
            background:${d.paid?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)'};
            color:${d.paid?'var(--green)':'var(--red)'};
            border:1px solid ${d.paid?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'};
            white-space:nowrap;">
            ${d.label.replace('회차','').trim()} ${d.paid?'✓':'⏳'}
          </span>`).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ── 추가 벌금 렌더링 ─────────────────────────────────────
function renderExtraFines() {
  const container = document.getElementById('fineContent');
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS).sort();
  const rounds = data.rounds.map(r => r.label);
  const list = loadExtraFines();

  const totalAmt  = list.reduce((a,x) => a + x.amount, 0);
  const paidAmt   = list.filter(x=>x.paid).reduce((a,x) => a + x.amount, 0);
  const unpaidAmt = totalAmt - paidAmt;

  container.innerHTML = `
  <!-- 요약 -->
  <div class="fine-summary-grid" style="margin-bottom:24px;">
    <div class="fine-summary-card" style="border-color:rgba(239,68,68,0.3);">
      <div class="fine-summary-icon">💸</div>
      <div class="fine-summary-val" style="color:var(--red);">${totalAmt.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">추가벌금 합계</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(34,197,94,0.3);">
      <div class="fine-summary-icon">✅</div>
      <div class="fine-summary-val" style="color:var(--green);">${paidAmt.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">납부 완료</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">⏳</div>
      <div class="fine-summary-val" style="color:${unpaidAmt>0?'var(--red)':'var(--text2)'};">${unpaidAmt.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">미납 합계</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">📋</div>
      <div class="fine-summary-val" style="color:var(--accent);">${list.length}<span style="font-size:14px;">건</span></div>
      <div class="fine-summary-label">총 건수</div>
    </div>
  </div>

  <!-- 종류별 금액 안내 -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
    ${Object.entries(EXTRA_FINE_TYPES).map(([k,v])=>`
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;">${v.icon}</span>
      <div>
        <div style="font-size:13px;font-weight:700;">${v.label}</div>
        <div style="font-size:12px;color:var(--red);font-family:'JetBrains Mono',monospace;">${v.amount.toLocaleString()}원</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- 추가 입력 폼 (관리자만) -->
  ${isAdmin ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:24px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">➕ 추가 벌금 등록</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
      <div class="input-group">
        <label>이름</label>
        <select id="ef_name" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
          <option value="">선택</option>
          ${members.map(m=>`<option>${m}</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label>회차</label>
        <select id="ef_round" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
          <option value="">전체</option>
          ${rounds.map(r=>`<option>${r}</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label>종류</label>
        <select id="ef_type" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
          ${Object.entries(EXTRA_FINE_TYPES).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label} (${v.amount.toLocaleString()}원)</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label>메모 (선택)</label>
        <input type="text" id="ef_memo" placeholder="예) 2월 1회차 지각" style="width:160px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <button class="btn btn-primary" onclick="addExtraFine()">➕ 등록</button>
    </div>
  </div>` : ''}

  <!-- 목록 -->
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
    <div style="padding:14px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:14px;">📋 추가 벌금 목록</div>
    ${list.length === 0 ? `<div class="empty"><div class="empty-icon">🎉</div><div class="empty-text">추가 벌금이 없습니다</div></div>` :
    list.slice().reverse().map(item => {
      const info = EXTRA_FINE_TYPES[item.type] || { label: item.type, icon: '💸' };
      return `
      <div class="fine-row ${item.paid?'paid':''}">
        <div class="fine-check-wrap">
          <input type="checkbox" id="efchk_${item.id}" ${item.paid?'checked':''} ${!isAdmin?'disabled':''}
            onchange="toggleExtraFinePaid('${item.id}')">
          <label class="fine-check-box" for="efchk_${item.id}" style="${!isAdmin?'cursor:not-allowed;opacity:0.5;':''}"></label>
        </div>
        <div style="font-size:20px;">${info.icon}</div>
        <div style="flex:1;min-width:0;">
          <div class="fine-name" style="${item.paid?'text-decoration:line-through;color:var(--text3);':''}">${item.name}</div>
          <div class="fine-detail">${info.label}${item.roundLabel?' · '+item.roundLabel:''}${item.memo?' · '+item.memo:''}</div>
        </div>
        <div class="fine-amount" style="${item.paid?'color:var(--text3);text-decoration:line-through;':''}">${item.amount.toLocaleString()}원</div>
        ${item.paid ? `<span class="fine-paid-badge">✓ 납부완료</span>` : `<span class="fine-unpaid-badge">⏳ 미납</span>`}
        ${isAdmin ? `<button onclick="deleteExtraFine('${item.id}')" style="background:none;border:1px solid rgba(239,68,68,0.3);color:var(--red);border-radius:6px;padding:2px 8px;font-size:11px;cursor:pointer;">✕</button>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

// ── 상금 렌더링 ──────────────────────────────────────────
function renderPrizes() {
  const container = document.getElementById('prizesContent');
  if(!container) return;
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS).sort();
  const rounds = data.rounds.map(r => r.label);
  const list = loadPrizes();

  const totalAmt  = list.reduce((a,x) => a + x.amount, 0);
  const paidAmt   = list.filter(x=>x.paid).reduce((a,x) => a + x.amount, 0);
  const unpaidAmt = totalAmt - paidAmt;

  // 선수별 상금 집계
  const byPlayer = {};
  list.forEach(p => {
    if(!byPlayer[p.name]) byPlayer[p.name] = 0;
    byPlayer[p.name] += p.amount;
  });
  const topPlayer = Object.entries(byPlayer).sort((a,b)=>b[1]-a[1])[0];

  container.innerHTML = `
  <!-- 요약 -->
  <div class="fine-summary-grid" style="margin-bottom:24px;">
    <div class="fine-summary-card" style="border-color:rgba(234,179,8,0.4);">
      <div class="fine-summary-icon">🏆</div>
      <div class="fine-summary-val" style="color:var(--yellow);">${totalAmt.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">총 상금</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(34,197,94,0.3);">
      <div class="fine-summary-icon">✅</div>
      <div class="fine-summary-val" style="color:var(--green);">${paidAmt.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">지급 완료</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">⏳</div>
      <div class="fine-summary-val" style="color:${unpaidAmt>0?'var(--yellow)':'var(--text2)'};">${unpaidAmt.toLocaleString()}<span style="font-size:14px;">원</span></div>
      <div class="fine-summary-label">미지급</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(249,115,22,0.3);">
      <div class="fine-summary-icon">🥇</div>
      <div class="fine-summary-val" style="color:var(--accent);font-size:18px;">${topPlayer ? topPlayer[0] : '-'}</div>
      <div class="fine-summary-label">${topPlayer ? topPlayer[1].toLocaleString()+'원 수령' : '상금 없음'}</div>
    </div>
  </div>

  <!-- 입력 폼 (관리자만) -->
  ${isAdmin ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:24px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">🏆 상금 등록</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
      <div class="input-group">
        <label>이름</label>
        <select id="pr_name" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
          <option value="">선택</option>
          ${members.map(m=>`<option>${m}</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label>회차</label>
        <select id="pr_round" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
          <option value="">전체</option>
          ${rounds.map(r=>`<option>${r}</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label>금액 (원)</label>
        <input type="number" id="pr_amount" placeholder="50000" min="0" step="1000"
          style="width:130px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:'JetBrains Mono',monospace;">
      </div>
      <div class="input-group">
        <label>사유</label>
        <input type="text" id="pr_reason" placeholder="예) 하이게임 1위, 핸디 1위"
          style="width:200px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <button class="btn btn-primary" style="background:var(--yellow);color:#000;" onclick="addPrize()">🏆 등록</button>
    </div>
  </div>` : ''}

  <!-- 목록 -->
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
    <div style="padding:14px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:14px;">🏅 상금 내역</div>
    ${list.length === 0 ? `<div class="empty"><div class="empty-icon">🏆</div><div class="empty-text">등록된 상금이 없습니다</div></div>` :
    list.slice().reverse().map((item,i) => `
      <div class="fine-row ${item.paid?'paid':''}">
        <div class="fine-check-wrap">
          <input type="checkbox" id="prchk_${item.id}" ${item.paid?'checked':''} ${!isAdmin?'disabled':''}
            onchange="togglePrizePaid('${item.id}')">
          <label class="fine-check-box" for="prchk_${item.id}"
            style="${!isAdmin?'cursor:not-allowed;opacity:0.5;':''}background:${item.paid?'var(--yellow)':'var(--bg3)'};border-color:${item.paid?'var(--yellow)':'var(--border)'};"></label>
        </div>
        <div style="font-size:20px;">🏆</div>
        <div style="flex:1;min-width:0;">
          <div class="fine-name" style="${item.paid?'text-decoration:line-through;color:var(--text3);':''}">${item.name}</div>
          <div class="fine-detail">${item.reason}${item.roundLabel?' · '+item.roundLabel:''}</div>
        </div>
        <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;color:${item.paid?'var(--text3)':'var(--yellow)'};${item.paid?'text-decoration:line-through;':''}">
          ${item.amount.toLocaleString()}원
        </div>
        ${item.paid
          ? `<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(234,179,8,0.12);color:var(--yellow);border:1px solid rgba(234,179,8,0.3);white-space:nowrap;">✓ 지급완료</span>`
          : `<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(234,179,8,0.06);color:var(--text3);border:1px solid var(--border);white-space:nowrap;">⏳ 미지급</span>`}
        ${isAdmin ? `<button onclick="deletePrize('${item.id}')" style="background:none;border:1px solid rgba(239,68,68,0.3);color:var(--red);border-radius:6px;padding:2px 8px;font-size:11px;cursor:pointer;">✕</button>` : ''}
      </div>`).join('')}
  </div>`;
}
