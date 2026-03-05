/* ════════════════════════════════════
 * Meet Ball - 공지사항 / 회비 관리
 * ════════════════════════════════════ */

// ── 회비 관리 ─────────────────────────────────────────
const DUES_MONTHLY = 30000; // 월 회비 3만원
const DUES_YEAR = 2026;

// 이미지 기반 초기 납부 데이터
const INIT_DUES = {
  '권우섭': {1:true,  2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '김동현': {1:true,  2:false, 3:true,  4:false, 5:true,  6:false, 7:false, 8:true,  9:true,  10:true,  11:true,  12:false},
  '김상윤': {1:true,  2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '김용태': {1:true,  2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '김주영': {1:false, 2:false, 3:true,  4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '박만수': {1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '박성준': {1:true,  2:true,  3:true,  4:true,  5:true,  6:false, 7:true,  8:true,  9:true,  10:true,  11:true,  12:true },
  '박종성': {1:true,  2:false, 3:true,  4:false, 5:false, 6:false, 7:true,  8:true,  9:true,  10:true,  11:true,  12:false},
  '양해성': {1:true,  2:false, 3:true,  4:true,  5:true,  6:false, 7:true,  8:true,  9:true,  10:true,  11:true,  12:false},
  '오욱현': {1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '오일주': {1:true,  2:true,  3:true,  4:true,  5:true,  6:false, 7:false, 8:true,  9:true,  10:true,  11:true,  12:false},
  '윤미라': {1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '윤연균': {1:true,  2:true,  3:true,  4:true,  5:true,  6:false, 7:false, 8:true,  9:true,  10:true,  11:true,  12:false},
  '이구연': {1:false, 2:true,  3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '이시은': {1:false, 2:true,  3:true,  4:true,  5:false, 6:false, 7:false, 8:true,  9:true,  10:true,  11:true,  12:false},
  '이윤경': {1:true,  2:false, 3:true,  4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '이지윤': {1:true,  2:true,  3:true,  4:true,  5:true,  6:false, 7:true,  8:true,  9:true,  10:true,  11:true,  12:true },
  '장경훈': {1:true,  2:false, 3:true,  4:true,  5:false, 6:false, 7:true,  8:true,  9:true,  10:true,  11:true,  12:true },
  '장민상': {1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '장은선': {1:true,  2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '장훈석': {1:false, 2:true,  3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '정현수': {1:true,  2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '조용상': {1:true,  2:false, 3:true,  4:true,  5:true,  6:false, 7:true,  8:true,  9:true,  10:true,  11:true,  12:true },
  '조정행': {1:false, 2:true,  3:true,  4:true,  5:true,  6:false, 7:true,  8:true,  9:true,  10:true,  11:true,  12:true },
  '이재필': {1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
  '김기범': {1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false},
};

function loadDues() {
  const cached = fbLoad('dues', null);
  if(cached) return cached;
  try {
    const r = localStorage.getItem(DUES_KEY);
    if(r) return JSON.parse(r);
  } catch(e) {}
  return JSON.parse(JSON.stringify(INIT_DUES));
}
function saveDues(data) {
  try { localStorage.setItem(DUES_KEY, JSON.stringify(data)); } catch(e) {}
  window.fbSave && window.fbSave('dues', data);
}

function toggleDues(name, month) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  const dues = loadDues();
  if(!dues[name]) dues[name] = {};
  const cur = dues[name][month];
  // 순환: 미납(false/undefined) → 납부(true) → 해당없음('N') → 미납
  if(!cur)          dues[name][month] = true;
  else if(cur===true) dues[name][month] = 'N';
  else               dues[name][month] = false;
  saveDues(dues);
  renderDues();
}

function payAllDues(name) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  const dues = loadDues();
  if(!dues[name]) dues[name] = {};
  for(let m = 1; m <= 12; m++) {
    if(dues[name][m] !== 'N') dues[name][m] = true;
  }
  saveDues(dues);
  renderDues();
  toast(`${name} 연회비 전액 납부 처리 완료!`);
}

function clearAllDues(name) {
  if(!isAdmin) { toast('관리자만 변경할 수 있습니다.', 'error'); return; }
  if(!confirm(`${name}의 회비 납부 기록을 전부 초기화할까요?`)) return;
  const dues = loadDues();
  dues[name] = {};
  saveDues(dues);
  renderDues();
  toast(`${name} 회비 초기화 완료`);
}

let duesViewTab = 'table'; // 'table' | 'summary'
function switchDuesTab(tab, btn) {
  duesViewTab = tab;
  document.querySelectorAll('#duesTabs .tab').forEach(t => t.classList.remove('active'));
  if(btn) btn.classList.add('active');
  renderDues();
}

function renderDues() {
  const container = document.getElementById('duesContent');
  if(!container) return;
  const data = loadData();
  const dues = loadDues();
  const members = Object.keys(data.members || BASE_PLAYERS).sort();
  const now = new Date();
  const curMonth = now.getFullYear() === DUES_YEAR ? now.getMonth() + 1 : 12;
  const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];
  const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  // 전체 통계
  let totalExpected = 0, totalPaid = 0, totalUnpaid = 0;
  const memberStats = members.map(name => {
    const d = dues[name] || {};
    const paidMonths   = MONTHS.filter(m => d[m] === true);
    const naMonths     = MONTHS.filter(m => d[m] === 'N');
    const paidAmt      = paidMonths.length * DUES_MONTHLY;
    // 해당없음(N) 달은 청구 제외
    const expectedMonths = MONTHS.filter(m => m <= curMonth && d[m] !== 'N');
    const expectedAmt  = expectedMonths.length * DUES_MONTHLY;
    const unpaidAmt    = Math.max(0, expectedAmt - paidAmt);
    totalExpected += expectedAmt;
    totalPaid += paidAmt;
    totalUnpaid += unpaidAmt;
    return { name, d, paidMonths, paidAmt, expectedAmt, unpaidAmt };
  });

  const payRate = totalExpected > 0 ? Math.round(totalPaid / totalExpected * 100) : 0;

  container.innerHTML = `
  <!-- 요약 카드 -->
  <div class="fine-summary-grid" style="margin-bottom:24px;">
    <div class="fine-summary-card" style="border-color:rgba(59,130,246,0.4);">
      <div class="fine-summary-icon">💳</div>
      <div class="fine-summary-val" style="color:var(--blue);">${(totalExpected/10000).toFixed(0)}<span style="font-size:14px;">만원</span></div>
      <div class="fine-summary-label">청구 합계 (~${curMonth}월)</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(34,197,94,0.3);">
      <div class="fine-summary-icon">✅</div>
      <div class="fine-summary-val" style="color:var(--green);">${(totalPaid/10000).toFixed(0)}<span style="font-size:14px;">만원</span></div>
      <div class="fine-summary-label">납부 완료</div>
    </div>
    <div class="fine-summary-card" style="border-color:rgba(239,68,68,0.3);">
      <div class="fine-summary-icon">⏳</div>
      <div class="fine-summary-val" style="color:var(--red);">${(totalUnpaid/10000).toFixed(0)}<span style="font-size:14px;">만원</span></div>
      <div class="fine-summary-label">미납 합계</div>
    </div>
    <div class="fine-summary-card">
      <div class="fine-summary-icon">📊</div>
      <div class="fine-summary-val" style="color:var(--accent);">${payRate}<span style="font-size:14px;">%</span></div>
      <div class="fine-summary-label">납부율</div>
    </div>
  </div>

  <!-- 탭 -->
  <div class="tabs" id="duesTabs">
    <button class="tab ${duesViewTab==='table'?'active':''}" onclick="switchDuesTab('table',this)">📅 월별 현황표</button>
    <button class="tab ${duesViewTab==='summary'?'active':''}" onclick="switchDuesTab('summary',this)">👤 선수별 요약</button>
  </div>

  ${duesViewTab === 'table' ? renderDuesTable(members, dues, MONTHS, MONTH_LABELS, curMonth) : renderDuesSummary(memberStats, curMonth)}
  `;
}

function renderDuesTable(members, dues, MONTHS, MONTH_LABELS, curMonth) {
  return `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
  <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
    <table style="width:100%;border-collapse:collapse;min-width:900px;">
      <thead>
        <tr>
          <th style="padding:12px 16px;text-align:left;font-size:12px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);position:sticky;left:0;z-index:5;">회원</th>
          ${MONTH_LABELS.map((ml,i) => `
          <th style="padding:10px 6px;font-size:11px;color:${i+1<=curMonth?'var(--text2)':'var(--text3)'};background:var(--bg3);border-bottom:1px solid var(--border);text-align:center;min-width:52px;">
            ${ml}<br><span style="font-size:9px;color:var(--text3);">3만원</span>
          </th>`).join('')}
          <th style="padding:10px 8px;font-size:11px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);text-align:center;min-width:70px;">납부액</th>
          <th style="padding:10px 8px;font-size:11px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);text-align:center;min-width:70px;">미납액</th>
          ${isAdmin ? `<th style="padding:10px 8px;font-size:11px;color:var(--text3);background:var(--bg3);border-bottom:1px solid var(--border);text-align:center;">관리</th>` : ''}
        </tr>
      </thead>
      <tbody>
        ${members.map((name, ri) => {
          const d = dues[name] || {};
          const paidMonths = MONTHS.filter(m => d[m] === true);
          const paidAmt    = paidMonths.length * 30000;
          const expectedAmt = MONTHS.filter(m => m <= curMonth && d[m] !== 'N').length * 30000;
          const unpaidAmt  = Math.max(0, expectedAmt - paidAmt);
          return `
          <tr style="background:${ri%2===0?'var(--bg3)':'transparent'}">
            <td style="padding:10px 16px;font-weight:700;font-size:13px;border-bottom:1px solid rgba(30,45,69,0.4);position:sticky;left:0;background:${ri%2===0?'var(--bg3)':'var(--card)'};z-index:4;">${name}</td>
            ${MONTHS.map(m => {
              const val = d[m];
              const isPast = m <= curMonth;
              // 상태별 스타일
              const isNA   = val === 'N';
              const isPaid = val === true;
              const isUnpaid = !val && isPast && !isNA;
              const bdColor = isPaid?'rgba(34,197,94,0.5)':isNA?'var(--border)':isUnpaid?'rgba(239,68,68,0.3)':'var(--border)';
              const bgColor = isPaid?'rgba(34,197,94,0.15)':isNA?'rgba(100,116,139,0.1)':isUnpaid?'rgba(239,68,68,0.06)':'transparent';
              const txColor = isPaid?'var(--green)':isNA?'var(--text3)':isUnpaid?'var(--red)':'var(--text3)';
              const label   = isPaid?'✓':isNA?'⊘':isUnpaid?'✗':'-';
              const title   = isPaid?'납부완료':isNA?'해당없음 (가입 전)':isUnpaid?'미납':'미도래';
              return `<td style="padding:6px 4px;text-align:center;border-bottom:1px solid rgba(30,45,69,0.4);position:relative;z-index:2;">
                ${isAdmin
                  ? `<button onclick="event.stopPropagation();toggleDues('${name}',${m})" title="${title}"
                      style="width:36px;height:28px;border-radius:8px;border:1px solid ${bdColor};
                      background:${bgColor};color:${txColor};
                      font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;
                      position:relative;z-index:3;">
                      ${label}
                    </button>`
                  : `<span title="${title}" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:24px;border-radius:6px;font-size:12px;font-weight:700;
                      background:${bgColor};color:${txColor};">
                      ${label}
                    </span>`}
              </td>`;
            }).join('')}
            <td style="padding:10px 8px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:var(--green);border-bottom:1px solid rgba(30,45,69,0.4);">${(paidAmt/10000).toFixed(0)}만</td>
            <td style="padding:10px 8px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:${unpaidAmt>0?'var(--red)':'var(--text3)'};border-bottom:1px solid rgba(30,45,69,0.4);">${unpaidAmt>0?(unpaidAmt/10000).toFixed(0)+'만':'-'}</td>
            ${isAdmin ? `<td style="padding:6px 8px;text-align:center;border-bottom:1px solid rgba(30,45,69,0.4);position:relative;z-index:2;">
              <button onclick="event.stopPropagation();payAllDues('${name}')" title="연간 전액납부" style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:var(--green);border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;white-space:nowrap;position:relative;z-index:3;">전액✓</button>
            </td>` : ''}
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  </div>`;
}

function renderDuesSummary(memberStats, curMonth) {
  const sorted = [...memberStats].sort((a,b) => b.unpaidAmt - a.unpaidAmt || a.name.localeCompare(b.name));
  return `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
    <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
      <div style="font-weight:700;font-size:14px;">👤 선수별 납부 현황 (미납 내림차순)</div>
      <div style="font-size:12px;color:var(--text3);">기준: ~${curMonth}월 / 월 3만원</div>
    </div>
    ${sorted.map(s => {
      const barPaid = s.expectedAmt > 0 ? Math.round(s.paidAmt / s.expectedAmt * 100) : 0;
      const allPaid = s.unpaidAmt === 0;
      return `
      <div class="fine-row ${allPaid?'paid':''}">
        <div style="width:80px;flex-shrink:0;">
          <div style="font-weight:700;font-size:14px;">${s.name}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px;">${s.paidMonths.length}개월 납부</div>
        </div>
        <div style="flex:1;max-width:200px;">
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px;">납부율 ${barPaid}%</div>
          <div style="background:var(--bg3);border-radius:4px;height:6px;overflow:hidden;">
            <div style="width:${barPaid}%;height:100%;background:${allPaid?'var(--green)':'var(--blue)'};border-radius:4px;transition:width .5s;"></div>
          </div>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div style="text-align:center;">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;color:var(--green);">${(s.paidAmt/10000).toFixed(0)}만원</div>
            <div style="font-size:10px;color:var(--text3);">납부</div>
          </div>
          <div style="text-align:center;">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;color:${s.unpaidAmt>0?'var(--red)':'var(--text3)'};">${s.unpaidAmt>0?(s.unpaidAmt/10000).toFixed(0)+'만원':'-'}</div>
            <div style="font-size:10px;color:var(--text3);">미납</div>
          </div>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;max-width:220px;">
          ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>{
            const v=s.d[m];
            const isNA=v==='N', isPaid=v===true, isUnpaid=!v&&m<=curMonth;
            return `<span style="font-size:10px;padding:2px 5px;border-radius:5px;
              background:${isPaid?'rgba(34,197,94,0.15)':isNA?'rgba(100,116,139,0.1)':isUnpaid?'rgba(239,68,68,0.1)':'transparent'};
              color:${isPaid?'var(--green)':isNA?'var(--text3)':isUnpaid?'var(--red)':'var(--text3)'};
              border:1px solid ${isPaid?'rgba(34,197,94,0.3)':isNA?'var(--border)':isUnpaid?'rgba(239,68,68,0.2)':'var(--border)'};
              white-space:nowrap;" title="${isNA?'해당없음':isPaid?'납부':isUnpaid?'미납':'미도래'}">${m}월${isPaid?'✓':isNA?'⊘':''}</span>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

