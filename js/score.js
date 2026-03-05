/* ════════════════════════════════════
 * Meet Ball - 점수 에디터
 * ════════════════════════════════════ */

// ── 점수 에디터 렌더 ───────────────────────────────────────────
function renderScoreEditor(scores) {
  const data = loadData();
  const members = data.members || BASE_PLAYERS;
  const memberNames = Object.keys(members).sort();
  const datalistOptions = memberNames.map(n => `<option value="${n}">`).join('');

  // datalist가 없으면 추가
  if (!document.getElementById('memberDatalist')) {
    const dl = document.createElement('datalist');
    dl.id = 'memberDatalist';
    dl.innerHTML = datalistOptions;
    document.body.appendChild(dl);
  } else {
    document.getElementById('memberDatalist').innerHTML = datalistOptions;
  }

  const tbody = document.getElementById('scoreTableBody');
  tbody.innerHTML = scores.map((row, i) => {
    const avg = (row.g1 || 0) + (row.g2 || 0) + (row.g3 || 0);
    const baseAvg = row.name && members[row.name] ? members[row.name] : 0;
    const fine = baseAvg > 0 ? Math.max(0, Math.min(200, baseAvg) - Math.round(avg / 3)) * 100 : 0;
    const nameColor = row.name && memberNames.includes(row.name) ? 'var(--accent)' : (row.name ? 'var(--yellow,#f5a623)' : 'var(--text)');
    return `<tr id="scoreRow_${i}">
      <td>
        <input type="text" value="${row.name || ''}" list="memberDatalist"
          oninput="updateRowCalc(${i})"
          placeholder="이름 입력/수정"
          style="background:var(--bg3);border:1px solid var(--border);color:${nameColor};padding:4px 8px;border-radius:6px;font-size:13px;font-family:inherit;width:100%;font-weight:${row.name ? '700' : '400'};">
      </td>
      <td><input type="number" value="${row.g1||0}" min="0" max="300" onchange="updateRowCalc(${i})" style="width:60px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px;border-radius:6px;text-align:center;font-family:inherit;"></td>
      <td><input type="number" value="${row.g2||0}" min="0" max="300" onchange="updateRowCalc(${i})" style="width:60px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px;border-radius:6px;text-align:center;font-family:inherit;"></td>
      <td><input type="number" value="${row.g3||0}" min="0" max="300" onchange="updateRowCalc(${i})" style="width:60px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px;border-radius:6px;text-align:center;font-family:inherit;"></td>
      <td id="total_${i}" style="font-weight:700;color:var(--accent);text-align:center;">${avg}</td>
      <td id="avg_${i}" style="text-align:center;">${avg > 0 ? (avg/3).toFixed(1) : '-'}</td>
      <td style="text-align:center;color:var(--text3);">${baseAvg || '-'}</td>
      <td id="fine_${i}" style="text-align:center;color:${fine>0?'var(--red)':'var(--text3)'};">${fine > 0 ? fine.toLocaleString()+'원' : '-'}</td>
    </tr>`;
  }).join('');

  document.getElementById('scoreEditor').classList.add('show');
}

function updateRowCalc(i) {
  const row = document.getElementById('scoreRow_' + i);
  if (!row) return;
  const inputs = row.querySelectorAll('input[type=number]');
  const g1 = parseInt(inputs[0].value) || 0;
  const g2 = parseInt(inputs[1].value) || 0;
  const g3 = parseInt(inputs[2].value) || 0;
  const total = g1 + g2 + g3;
  const avgVal = total > 0 ? (total/3).toFixed(1) : '-';

  const nameInput = row.querySelector('input[type=text]');
  const name = nameInput ? nameInput.value.trim() : '';
  const data = loadData();
  const members = data.members || BASE_PLAYERS;
  const memberNames = Object.keys(members).sort();
  const baseAvg = name && members[name] ? members[name] : 0;
  const fine = baseAvg > 0 ? Math.max(0, Math.min(200, baseAvg) - Math.round(total/3)) * 100 : 0;

  // 이름 색상: 회원목록에 있으면 accent, 입력중이면 노란색
  if (nameInput) {
    nameInput.style.color = memberNames.includes(name) ? 'var(--accent)' : (name ? 'var(--yellow,#f5a623)' : 'var(--text)');
    nameInput.style.fontWeight = name ? '700' : '400';
  }

  document.getElementById('total_' + i).textContent = total;
  document.getElementById('avg_' + i).textContent = avgVal;
  const fineEl = document.getElementById('fine_' + i);
  fineEl.textContent = fine > 0 ? fine.toLocaleString() + '원' : '-';
  fineEl.style.color = fine > 0 ? 'var(--red)' : 'var(--text3)';
}

function addManualRow() {
  const tbody = document.getElementById('scoreTableBody');
  const i = tbody.rows.length;
  const data = loadData();
  const members = data.members || BASE_PLAYERS;
  const memberNames = Object.keys(members).sort();
  const memberOptions = memberNames.map(n => `<option value="${n}">${n}</option>`).join('');
  const tr = document.createElement('tr');
  tr.id = 'scoreRow_' + i;
  tr.innerHTML = `
    <td><input type="text" value="" list="memberDatalist" oninput="updateRowCalc(${i})" placeholder="이름 입력/수정" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:13px;font-family:inherit;width:100%;"></td>
    <td><input type="number" value="0" min="0" max="300" onchange="updateRowCalc(${i})" style="width:60px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px;border-radius:6px;text-align:center;font-family:inherit;"></td>
    <td><input type="number" value="0" min="0" max="300" onchange="updateRowCalc(${i})" style="width:60px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px;border-radius:6px;text-align:center;font-family:inherit;"></td>
    <td><input type="number" value="0" min="0" max="300" onchange="updateRowCalc(${i})" style="width:60px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px;border-radius:6px;text-align:center;font-family:inherit;"></td>
    <td id="total_${i}" style="font-weight:700;color:var(--accent);text-align:center;">0</td>
    <td id="avg_${i}" style="text-align:center;">-</td>
    <td style="text-align:center;color:var(--text3);">-</td>
    <td id="fine_${i}" style="text-align:center;color:var(--text3);">-</td>
  `;
  tbody.appendChild(tr);
  document.getElementById('scoreEditor').classList.add('show');
  // 스크롤해서 에디터 보이게
  document.getElementById('scoreEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearEditor() {
  document.getElementById('scoreEditor').classList.remove('show');
  document.getElementById('scoreTableBody').innerHTML = '';
  const preview = document.getElementById('previewImg');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
}

function saveScores() {
  const rows = document.querySelectorAll('#scoreTableBody tr');
  const date = document.getElementById('matchDate').value;
  const round = document.getElementById('matchRound').value;
  if (!date) { toast('날짜를 선택해주세요.', 'error'); return; }

  const data = loadData();
  const scores = [];

  rows.forEach(row => {
    const nameInput = row.querySelector('input[type=text]');
    const inputs = row.querySelectorAll('input[type=number]');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) return;
    const g1 = parseInt(inputs[0].value) || 0;
    const g2 = parseInt(inputs[1].value) || 0;
    const g3 = parseInt(inputs[2].value) || 0;
    if (g1 === 0 && g2 === 0 && g3 === 0) return;
    scores.push({ name, g1, g2, g3, total: g1+g2+g3 });
  });

  if (scores.length === 0) { toast('저장할 점수가 없습니다.', 'error'); return; }

  // 기존 라운드에 추가 or 새로 생성
  if (!data.rounds) data.rounds = [];
  let roundEntry = data.rounds.find(r => r.date === date && r.round === round);
  if (!roundEntry) {
    roundEntry = { date, round, scores: [] };
    data.rounds.push(roundEntry);
  }
  // 중복 이름 처리: 덮어쓰기
  scores.forEach(s => {
    const idx = roundEntry.scores.findIndex(r => r.name === s.name);
    if (idx >= 0) roundEntry.scores[idx] = s;
    else roundEntry.scores.push(s);
  });

  saveData(data);
  clearEditor();
  renderRanking(currentRankTab || 'avg');
  renderRounds();
  toast('✅ ' + scores.length + '명 점수 저장 완료!', 'success');
}

async function analyzeTxImage(dataUrl, mimeType) {
  const loading = document.getElementById('tx_loading');
  const resultDiv = document.getElementById('tx_result');
  loading.style.display = 'block';
  resultDiv.style.display = 'none';

  try {
    const appData2 = loadData();
    const members = Object.keys(appData2.members || BASE_PLAYERS).sort();
    const apiKey2 = getApiKey();

    if (apiKey2) {
      // ── Claude Vision 모드 ──
      const base64Tx = dataUrl.split(',')[1];
      const mimeTx = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';

      const txResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey2,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeTx, data: base64Tx } },
              { type: 'text', text: `은행 거래내역 이미지에서 입금 항목만 추출해줘.
회원 목록: ${members.join(', ')}

JSON 배열만 출력. 설명 없이.
[{"rawText":"원문텍스트","amount":숫자,"name":"이름","category":"분류"}]
규칙:
- amount: 입금 금액 (숫자만, 콤마없이)
- name: 회원 목록에서 가장 유사한 이름. 없으면 null
- category: 30000원→"dues"(회비), 10000원미만→"fine"(벌금), 나머지→"unknown"
- 잔액/출금 행 제외, 입금만 포함
- 이름이 합쳐진 경우(예: 이윤경오욱현) 60000원이면 각각 30000원씩 2개 행으로 분리` }
            ]
          }]
        })
      });

      if (!txResp.ok) throw new Error('API 오류 ' + txResp.status);
      const txResult = await txResp.json();
      const txRaw = txResult.content?.map(c => c.text || '').join('').trim();
      let items = [];
      try {
        items = JSON.parse(txRaw.replace(/```json|```/g, '').trim());
        if (!Array.isArray(items)) items = [];
      } catch(e) { items = []; }

      loading.style.display = 'none';
      renderTxManualEditor(items, members);

    } else {
      // ── Tesseract 폴백 ──
      const processedUrl2 = await preprocessImage(dataUrl);
      const { data: { text } } = await Tesseract.recognize(processedUrl2, 'kor+eng', {
        logger: () => {},
        tessedit_pageseg_mode: '4',
      });

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const items = [];
      for(const line of lines) {
        const amtMatch = line.match(/([0-9,]+)원/);
        if(!amtMatch) continue;
        const amount = parseInt(amtMatch[1].replace(/,/g,''));
        if(amount < 1000 || amount > 10000000) continue;
        let name = null;
        for(const m of members) { if(line.includes(m)) { name = m; break; } }
        items.push({ rawText: line, amount, name, category: amount === 30000 ? 'dues' : amount < 10000 ? 'fine' : 'unknown' });
      }
      loading.style.display = 'none';
      renderTxManualEditor(items, members);
    }
  } catch(e) {
    loading.style.display = 'none';
    toast('OCR 실패: ' + e.message, 'error');
  }
}

function renderTxManualEditor(items, members) {
  const resultDiv = document.getElementById('tx_result');
  if(!members) {
    const data = loadData();
    members = Object.keys(data.members || BASE_PLAYERS).sort();
  }
  const rows = items.length > 0 ? items : [{ rawText:'', amount:0, name:null, category:'dues', direction:'in' }];

  const catOptions = `<option value="dues">회비</option><option value="fine">벌금</option><option value="prize">상금</option><option value="sponsor">찬조</option><option value="unknown">미분류</option>`;
  const memberOptions = members.map(m => `<option value="${m}">${m}</option>`).join('');

  resultDiv.innerHTML = `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-top:16px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:4px;">📋 거래내역 보정</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:14px;">이름과 분류를 확인·수정 후 저장하세요</div>
    <div id="txManualRows" style="display:flex;flex-direction:column;gap:10px;">
      ${rows.map((item, i) => `
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
        <div style="font-size:11px;color:var(--text3);width:100%;margin-bottom:2px;">${item.rawText||'수동입력'}</div>
        <select data-idx="${i}" class="tx-name-sel" style="flex:1;min-width:90px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;font-family:inherit;">
          <option value="">-- 이름 선택 --</option>
          ${members.map(m=>`<option value="${m}" ${item.name===m?'selected':''}>${m}</option>`).join('')}
        </select>
        <input type="number" class="tx-amount-inp" value="${item.amount||''}" placeholder="금액" style="width:90px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;font-family:inherit;">
        <select class="tx-cat-sel" style="flex:1;min-width:80px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;font-family:inherit;">
          ${catOptions.replace(`value="${item.category}"`, `value="${item.category}" selected`)}
        </select>
        <input type="number" class="tx-month-inp" value="" placeholder="월(회비)" min="1" max="12" style="width:70px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;font-family:inherit;">
        <button onclick="this.closest('div[data-row]')?.remove()||this.closest('.tx-row')?.remove()" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;">삭제</button>
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
      <button onclick="addTxManualRow()" class="btn btn-secondary" style="font-size:12px;padding:7px 14px;">➕ 행 추가</button>
      <button onclick="saveTxManualRows()" class="btn btn-primary" style="font-size:12px;padding:7px 14px;">💾 저장</button>
    </div>
  </div>`;
  resultDiv.style.display = 'block';
}

function addTxManualRow() {
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS).sort();
  const catOptions = `<option value="dues">회비</option><option value="fine">벌금</option><option value="prize">상금</option><option value="sponsor">찬조</option><option value="unknown">미분류</option>`;
  const div = document.createElement('div');
  div.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;';
  div.innerHTML = `
    <div style="font-size:11px;color:var(--text3);width:100%;">수동입력</div>
    <select class="tx-name-sel" style="flex:1;min-width:90px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;font-family:inherit;">
      <option value="">-- 이름 선택 --</option>
      ${members.map(m=>`<option value="${m}">${m}</option>`).join('')}
    </select>
    <input type="number" class="tx-amount-inp" placeholder="금액" style="width:90px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;font-family:inherit;">
    <select class="tx-cat-sel" style="flex:1;min-width:80px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;font-family:inherit;">${catOptions}</select>
    <input type="number" class="tx-month-inp" placeholder="월(회비)" min="1" max="12" style="width:70px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;font-family:inherit;">
    <button onclick="this.closest('div').remove()" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;">삭제</button>`;
  document.getElementById('txManualRows').appendChild(div);
}

function saveTxManualRows() {
  if(!isAdmin) { toast('관리자만 저장할 수 있습니다.', 'error'); return; }
  const rows = document.querySelectorAll('#txManualRows > div');
  const data = loadData();
  let saved = 0;
  for(const row of rows) {
    const name = row.querySelector('.tx-name-sel')?.value;
    const amount = parseInt(row.querySelector('.tx-amount-inp')?.value||'0');
    const cat = row.querySelector('.tx-cat-sel')?.value;
    const month = parseInt(row.querySelector('.tx-month-inp')?.value||'0');
    if(!name || !amount) continue;
    const key = `${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    if(!data.fees) data.fees = {};
    data.fees[key] = {
      name, amount, category: cat,
      month: month || new Date().getMonth()+1,
      date: new Date().toISOString().slice(0,10),
      direction: 'in', confirmed: true
    };
    saved++;
  }
  saveData(data);
  toast(`${saved}건 저장 완료!`);
  document.getElementById('tx_result').style.display = 'none';
}

async function analyzeTxText() {
  const text = document.getElementById('tx_textInput').value.trim();
  if(!text) { toast('거래내역을 입력해주세요.', 'error'); return; }
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS).sort();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];
  for(const line of lines) {
    const amtMatch = line.match(/([0-9,]+)원/);
    if(!amtMatch) continue;
    const amount = parseInt(amtMatch[1].replace(/,/g,''));
    if(amount < 100) continue;
    let name = null;
    for(const m of members) { if(line.includes(m)) { name = m; break; } }
    items.push({
      rawText: line, amount, name,
      category: amount % 30000 === 0 ? 'dues' : amount < 10000 ? 'fine' : 'unknown',
      direction: 'in'
    });
  }
  if(items.length === 0) { toast('금액(원) 항목을 찾지 못했습니다. 형식을 확인해주세요.', 'error'); return; }
  renderTxManualEditor(items, members);
}

function buildTxAnalysisPrompt(memberNames) {
  return `당신은 볼링 동호회 회비 관리 AI입니다. 아래 거래내역을 분석하여 각 항목을 분류해주세요.

회원 명단: ${memberNames}

분류 기준:
- dues(회비): 월 정기 납부, 30,000원 단위, "회비", "월회비" 키워드
- fine(벌금): 소액(1,000~10,000원), "벌금", "미투표", "클럽티", "지각", "불참", "페널티" 키워드  
- prize(상금): "상금", "1위", "2위", "퍼펙트", "하이게임", "뽑기" 키워드 또는 수령(출금)
- sponsor(찬조): "찬조", "후원", "협찬", 큰 금액 입금 키워드

이름 매칭 주의사항:
- 회원 명단과 거래 메모의 이름을 최대한 매칭하되, 애칭/별명도 고려
- 이름이 확실하지 않으면 name을 null로 설정
- 동명이인 가능성이 있으면 confidence를 low로

⚡ 금액 주의:
- 30,000원 배수(60,000/90,000 등)의 회비 입금은 여러 명이 같이 낸 것일 수 있음 → canSplit:true
- 금액이 클수록 여러 명의 회비를 합산했을 가능성 높음
- 0원 또는 비정상 금액은 unknown으로 처리

반드시 아래 JSON 형식으로만 답변하세요. 코드블록 없이 JSON만:
{
  "items": [
    {
      "name": "회원이름(모르면 null)",
      "amount": 금액(숫자),
      "category": "dues|fine|prize|sponsor|unknown",
      "label": "분류 이유 한 줄 설명",
      "date": "날짜(없으면 null)",
      "memo": "원본 메모 그대로",
      "confidence": "high|medium|low",
      "month": 월(회비인 경우 해당 월 숫자, 없으면 null),
      "direction": "in|out",
      "canSplit": false
    }
  ],
  "summary": "전체 분석 요약 1-2문장"
}`;
}

function parseTxAnalysisResult(raw) {
  const loading = document.getElementById('tx_loading');
  const resultDiv = document.getElementById('tx_result');
  loading.style.display = 'none';

  let parsed;
  try {
    const cleaned = raw.replace(/```json|```/g,'').trim();
    parsed = JSON.parse(cleaned);
  } catch(e) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
    <div style="background:var(--card);border:1px solid rgba(239,68,68,0.3);border-radius:16px;padding:20px;">
      <div style="font-weight:700;color:var(--red);margin-bottom:8px;">⚠️ 분석 결과 파싱 오류</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:12px;">AI 응답을 해석하지 못했습니다. 거래내역 형식을 확인하거나 직접 텍스트로 입력해주세요.</div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text3);white-space:pre-wrap;max-height:200px;overflow-y:auto;">${raw.slice(0,500)}</div>
    </div>`;
    return;
  }

  window._txAnalysisResult = parsed;

  // 30,000원 배수 회비 → 수동 분리 가능 표시
  (parsed.items || []).forEach(it => {
    if(it.category === 'dues' && it.amount && it.amount % 30000 === 0 && it.amount > 30000) {
      it.canSplit = true;
      it._splitCount = it.amount / 30000;
    }
  });


  // renderTxResultUI로 위임
  renderTxResultUI(parsed);
}

function toggleSplitPanel(idx) {
  const panel = document.getElementById('tx_split_' + idx);
  if(panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function applySplit(idx) {
  const result = window._txAnalysisResult;
  if(!result) return;
  const orig = result.items[idx];
  if(!orig || !orig.canSplit) return;
  const count = orig._splitCount || 2;
  const newItems = [];
  for(let si = 0; si < count; si++) {
    const nameEl  = document.getElementById('tx_sp_name_' + idx + '_' + si);
    const monthEl = document.getElementById('tx_sp_month_' + idx + '_' + si);
    const name  = nameEl ? nameEl.value : null;
    const month = monthEl ? parseInt(monthEl.value) : (orig.month || new Date().getMonth()+1);
    if(!name) { toast((si+1) + '번째 이름을 선택해주세요.', 'error'); return; }
    newItems.push(Object.assign({}, orig, { name, amount: 30000, month, canSplit: false, isSplit: true,
      label: name + ' ' + month + '월 회비 (분리)', confidence: 'high' }));
  }
  result.items.splice(idx, 1, ...newItems);
  renderTxResultUI(result);
  toast('✂️ ' + count + '건으로 분리 완료!');
}

function renderTxResultUI(parsed) {
  const resultDiv = document.getElementById('tx_result');
  if(!resultDiv) return;
  window._txAnalysisResult = parsed;
  const catInfo = {
    dues:    { icon:'💳', label:'회비',   color:'var(--blue)',   bg:'rgba(59,130,246,0.12)'  },
    fine:    { icon:'💸', label:'벌금',   color:'var(--red)',    bg:'rgba(239,68,68,0.1)'    },
    prize:   { icon:'🏆', label:'상금',   color:'var(--yellow)', bg:'rgba(234,179,8,0.1)'   },
    sponsor: { icon:'🎁', label:'찬조',   color:'#facc15',       bg:'rgba(250,204,21,0.08)'  },
    unknown: { icon:'❓', label:'미분류', color:'var(--text3)',  bg:'rgba(100,116,139,0.08)' },
  };
  const items = parsed.items || [];
  const bycat = {};
  items.forEach(function(it) { bycat[it.category] = (bycat[it.category]||0) + 1; });
  const allMembers = Object.keys(loadData().members||BASE_PLAYERS).sort();
  const memberOpts = allMembers.map(function(m){ return '<option value="' + m + '">' + m + '</option>'; }).join('');

  function makeMemberSel(selId, selName) {
    return '<select id="' + selId + '" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:12px;outline:none;font-family:inherit;">'
      + '<option value="">이름 선택</option>'
      + allMembers.map(function(m){ return '<option value="' + m + '"' + (m===selName?' selected':'') + '>' + m + '</option>'; }).join('')
      + '</select>';
  }
  function makeMonthSel(selId, curMonth) {
    return '<select id="' + selId + '" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:12px;outline:none;font-family:inherit;">'
      + [1,2,3,4,5,6,7,8,9,10,11,12].map(function(m){ return '<option value="' + m + '"' + (m==curMonth?' selected':'') + '>' + m + '월</option>'; }).join('')
      + '</select>';
  }

  var itemsHtml = items.map(function(it, idx) {
    var ci = catInfo[it.category]||catInfo.unknown;
    var confColor = it.confidence==='high'?'var(--green)':it.confidence==='medium'?'var(--yellow)':'var(--text3)';
    var confLabel = it.confidence==='high'?'높음':it.confidence==='medium'?'보통':'낮음';
    var amtColor = it.direction==='out'?'var(--red)':'var(--green)';
    var amtSign  = it.direction==='out'?'-':'+';
    var splitRows = '';
    if(it.canSplit) {
      var cnt = it._splitCount||2;
      for(var si=0; si<cnt; si++) {
        splitRows += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">'
          + '<span style="font-size:12px;color:var(--text3);width:40px;">' + (si+1) + '번째</span>'
          + makeMemberSel('tx_sp_name_'+idx+'_'+si, si===0?it.name:null)
          + makeMonthSel('tx_sp_month_'+idx+'_'+si, it.month||new Date().getMonth()+1)
          + '<span style="font-family:JetBrains Mono,monospace;font-size:12px;color:var(--blue);">30,000원</span>'
          + '</div>';
      }
    }
    return '<div id="tx_item_' + idx + '" style="padding:14px 20px;border-bottom:1px solid rgba(30,45,69,0.4);display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;">'
      + '<input type="checkbox" id="tx_chk_' + idx + '" ' + (it.canSplit?'':'checked') + ' style="margin-top:3px;accent-color:var(--accent);width:16px;height:16px;cursor:pointer;flex-shrink:0;">'
      + '<div style="font-size:22px;flex-shrink:0;">' + ci.icon + '</div>'
      + '<div style="flex:1;min-width:180px;">'
        + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">'
          + '<span style="font-weight:700;font-size:14px;">' + (it.name||'(이름 미확인)') + '</span>'
          + '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + ci.bg + ';color:' + ci.color + ';border:1px solid ' + ci.color + '33;">' + ci.label + '</span>'
          + '<span style="font-size:10px;color:' + confColor + ';">신뢰도: ' + confLabel + '</span>'
          + (it.isSplit ? '<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);">✂️ 분리됨</span>' : '')
          + (it.canSplit ? '<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:rgba(234,179,8,0.15);color:var(--yellow);border:1px solid rgba(234,179,8,0.3);">⚠️ ' + (it._splitCount||2) + '명분 · 분리 필요</span>' : '')
        + '</div>'
        + '<div style="font-size:12px;color:var(--text3);">' + (it.label||'') + (it.date?' · '+it.date:'') + (it.memo?' · '+it.memo:'') + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center;">'
          + makeMemberSel('tx_name_'+idx, it.name).replace('>', ' onchange="updateTxItem('+idx+')">')
          + '<select id="tx_cat_' + idx + '" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:12px;outline:none;font-family:inherit;" onchange="updateTxItem(' + idx + ')">'
            + '<option value="dues"' + (it.category==='dues'?' selected':'') + '>💳 회비</option>'
            + '<option value="fine"' + (it.category==='fine'?' selected':'') + '>💸 벌금</option>'
            + '<option value="prize"' + (it.category==='prize'?' selected':'') + '>🏆 상금</option>'
            + '<option value="sponsor"' + (it.category==='sponsor'?' selected':'') + '>🎁 찬조</option>'
            + '<option value="unknown"' + (it.category==='unknown'?' selected':'') + '>❓ 미분류</option>'
          + '</select>'
          + (it.category==='dues' ? makeMonthSel('tx_month_'+idx, it.month||new Date().getMonth()+1) : '')
          + (it.canSplit ? '<button onclick="toggleSplitPanel('+idx+')" style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.4);color:#a855f7;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:700;">✂️ 분리하기</button>' : '')
        + '</div>'
        + (it.canSplit ? '<div id="tx_split_' + idx + '" style="display:none;margin-top:10px;background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.25);border-radius:10px;padding:14px;">'
          + '<div style="font-size:12px;font-weight:700;color:#a855f7;margin-bottom:10px;">✂️ 분리 설정 · 총 ' + (it.amount||0).toLocaleString() + '원 → 30,000원 × ' + (it._splitCount||2) + '명</div>'
          + splitRows
          + '<div style="display:flex;gap:6px;margin-top:6px;">'
            + '<button onclick="applySplit('+idx+')" style="background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.5);color:#a855f7;border-radius:6px;padding:5px 14px;font-size:12px;cursor:pointer;font-weight:700;">✅ 분리 확정</button>'
            + '<button onclick="toggleSplitPanel('+idx+')" style="background:none;border:1px solid var(--border);color:var(--text3);border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;">취소</button>'
          + '</div>'
        + '</div>' : '')
      + '</div>'
      + '<div style="font-family:JetBrains Mono,monospace;font-weight:700;font-size:16px;color:' + amtColor + ';flex-shrink:0;">' + amtSign + (it.amount||0).toLocaleString() + '원</div>'
    + '</div>';
  }).join('');

  resultDiv.innerHTML = '<div style="background:var(--card);border:1px solid rgba(34,197,94,0.3);border-radius:16px;overflow:hidden;">'
    + '<div style="padding:16px 20px;background:rgba(34,197,94,0.06);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">'
      + '<div><div style="font-weight:700;font-size:15px;margin-bottom:4px;">🤖 AI 분석 완료 · ' + items.length + '건</div>'
      + '<div style="font-size:12px;color:var(--text3);">' + (parsed.summary||'') + '</div></div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;">'
        + Object.entries(bycat).map(function(e){ var cat=e[0],cnt=e[1],ci=catInfo[cat]||catInfo.unknown; return '<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:'+ci.bg+';color:'+ci.color+';border:1px solid '+ci.color+'33;">'+ci.icon+' '+ci.label+' '+cnt+'건</span>'; }).join('')
      + '</div>'
    + '</div>'
    + '<div id="tx_item_list">' + itemsHtml + '</div>'
    + '<div style="padding:16px 20px;background:var(--bg3);border-top:1px solid var(--border);display:flex;gap:10px;flex-wrap:wrap;align-items:center;">'
      + '<button class="btn btn-primary" onclick="applyTxResult()" style="font-size:14px;padding:10px 24px;">✅ 선택 항목 일괄 적용</button>'
      + '<button class="btn btn-secondary" onclick="toggleAllTxItems(true)">전체 선택</button>'
      + '<button class="btn btn-secondary" onclick="toggleAllTxItems(false)">전체 해제</button>'
      + '<span style="font-size:12px;color:var(--text3);margin-left:auto;">⚠️ 분리 필요 항목은 먼저 분리 후 체크하세요</span>'
    + '</div>'
  + '</div>';
}


function updateTxItem(idx) {
  if(!window._txAnalysisResult) return;
  const nameEl = document.getElementById('tx_name_' + idx);
  const catEl  = document.getElementById('tx_cat_'  + idx);
  if(nameEl) window._txAnalysisResult.items[idx].name = nameEl.value;
  if(catEl)  window._txAnalysisResult.items[idx].category = catEl.value;
}

function toggleAllTxItems(val) {
  const items = window._txAnalysisResult?.items || [];
  items.forEach((_, idx) => {
    const chk = document.getElementById('tx_chk_' + idx);
    if(chk) chk.checked = val;
  });
}

function applyTxResult() {
  if(!isAdmin) { toast('관리자만 적용할 수 있습니다.', 'error'); return; }
  const result = window._txAnalysisResult;
  if(!result) { toast('분석 결과가 없습니다.', 'error'); return; }

  const items = result.items || [];
  const history = loadTxHistory();
  let appliedCount = 0;
  let skipped = [];

  items.forEach((it, idx) => {
    const chk = document.getElementById('tx_chk_' + idx);
    if(!chk || !chk.checked) return;
    if(it.category === 'unknown') { skipped.push(it); return; }
    if(!it.name) { skipped.push(it); return; }

    const now = new Date().toLocaleString('ko-KR');
    const histItem = { name: it.name, category: it.category, label: it.label||it.memo||'', amount: it.amount||0, memo: it.memo, appliedAt: now };

    if(it.category === 'dues') {
      // 회비 납부 처리
      const monthEl = document.getElementById('tx_month_' + idx);
      const month = monthEl ? parseInt(monthEl.value) : (it.month || new Date().getMonth()+1);
      const dues = loadDues();
      if(!dues[it.name]) dues[it.name] = {};
      dues[it.name][month] = true;
      saveDues(dues);
      histItem.label = `${month}월 회비`;
      appliedCount++;
    } else if(it.category === 'fine') {
      // 추가 벌금 납부 처리 (기존 벌금 중 이름 매칭해서 납부 처리 시도)
      const payments = loadFinePayments();
      const data = loadData();
      let matched = false;
      if(data.rounds) {
        data.rounds.forEach(round => {
          const key = `${round.id}__${it.name}`;
          if(!payments[key]) {
            // 해당 회차에 벌금이 있는 경우 납부 처리 (미납인 경우만)
            const roundFines = getAllFines ? getAllFines() : [];
            const hasFine = roundFines.some && roundFines.some(f => f.roundId===round.id && f.name===it.name && !f.paid);
            if(hasFine) { payments[key] = true; matched = true; }
          }
        });
      }
      if(matched) { saveFinePayments(payments); }
      // 추가벌금으로도 등록
      const extraFines = loadExtraFines();
      extraFines.push({ id:'ef'+Date.now()+'_'+idx, roundLabel:'거래내역', name:it.name, type:'custom', amount:it.amount||0, paid:true, memo:'[AI분석] '+( it.memo||it.label||'' ) });
      saveExtraFines(extraFines);
      appliedCount++;
    } else if(it.category === 'prize') {
      const prizes = loadPrizes();
      prizes.push({ id:'pr'+Date.now()+'_'+idx, roundLabel:'거래내역', name:it.name, amount:it.amount||0, reason:(it.memo||it.label||'거래내역'), paid: it.direction==='out', date: it.date || new Date().toISOString().slice(0,10) });
      savePrizes(prizes);
      appliedCount++;
    } else if(it.category === 'sponsor') {
      const sponsors = loadSponsors();
      sponsors.unshift({ id:'sp'+Date.now()+'_'+idx, name:it.name, amount:it.amount||0, reason:(it.memo||it.label||'찬조'), date: it.date || new Date().toISOString().slice(0,10), note:'[AI분석]' });
      saveSponsors(sponsors);
      appliedCount++;
    }

    history.push(histItem);
  });

  saveTxHistory(history);
  window._txAnalysisResult = null;

  if(appliedCount > 0) {
    toast(`✅ ${appliedCount}건 적용 완료!${skipped.length>0?' (미분류/이름없음 '+skipped.length+'건 건너뜀)':''}`, 'success');
    // 관련 렌더 갱신
    renderDues(); renderFines(); renderPrizes(); renderSponsor();
    // 결과 영역 초기화 후 이력 표시
    setTimeout(() => renderTxScan(), 300);
  } else {
    toast('적용할 항목이 없습니다. 이름과 분류를 확인해주세요.', 'error');
  }
}

function renderTxScan() {
  const container = document.getElementById('txscanContent');
  if (!container) return;

  const history = loadTxHistory();
  const apiKey = getApiKey();
  const apiStatus = apiKey
    ? '<span style="color:var(--green);font-size:11px;">✅ Claude AI 사용 중</span>'
    : '<span style="color:var(--text3);font-size:11px;">⚠️ API 키 없음 (텍스트 입력만 가능)</span>';

  // 이력 HTML 별도 생성 (중첩 템플릿 리터럴 방지)
  let historyHtml = '';
  if (history.length > 0) {
    const rows = history.slice(-10).reverse().map(function(h) {
      const cat = h.category === 'dues' ? '회비' : h.category === 'fine' ? '벌금' : h.category === 'prize' ? '상금' : '기타';
      return '<div style="background:var(--bg3);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:8px;">'
        + '<div><div style="font-size:13px;font-weight:600;">' + (h.name || '(이름없음)') + '</div>'
        + '<div style="font-size:11px;color:var(--text3);">' + cat + ' · ' + (h.date || '-') + '</div></div>'
        + '<div style="font-weight:700;color:var(--accent);">' + ((h.amount||0).toLocaleString()) + '원</div></div>';
    }).join('');
    historyHtml = '<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">'
      + '<div style="font-weight:700;font-size:14px;">📋 분석 적용 이력 (최근 ' + history.length + '건)</div>'
      + '<button onclick="clearTxHistory()" class="btn btn-secondary" style="font-size:11px;padding:5px 10px;">🗑️ 이력 삭제</button></div>'
      + '<div style="display:flex;flex-direction:column;gap:8px;">' + rows + '</div></div>';
  }

  container.innerHTML = '<div style="display:flex;flex-direction:column;gap:16px;">'

    + '<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">'
    + '<span style="font-size:18px;">📸</span>'
    + '<div><div style="font-weight:700;font-size:14px;">거래내역 이미지 분석 ' + apiStatus + '</div>'
    + '<div style="font-size:11px;color:var(--text3);">은행 앱 거래내역 스크린샷을 업로드하면 AI가 자동 분석합니다</div></div></div>'
    + '<div id="tx_loading" style="display:none;padding:12px;background:var(--bg3);border-radius:8px;margin-bottom:12px;font-size:13px;color:var(--text2);">🤖 분석 중...</div>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;">'
    + '<input type="file" id="txFileInput" accept="image/*" style="display:none;" onchange="handleTxImageUpload(this)">'
    + '<button class="btn btn-primary" style="font-size:13px;padding:9px 18px;" onclick="document.getElementById(&quot;txFileInput&quot;).click()">📷 이미지 업로드</button>'
    + '</div>'
    + '<div id="tx_result" style="display:none;margin-top:14px;"></div></div>'

    + '<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;">'
    + '<div style="font-weight:700;font-size:14px;margin-bottom:4px;">📝 텍스트로 직접 입력</div>'
    + '<div style="font-size:11px;color:var(--text3);margin-bottom:10px;">거래내역을 복사해서 붙여넣으세요</div>'
    + '<textarea id="tx_textInput" rows="6" placeholder="이재필 100,000원&#10;김용태(3월) 30,000원" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px;border-radius:8px;font-size:13px;font-family:inherit;resize:vertical;"></textarea>'
    + '<button onclick="analyzeTxText()" class="btn btn-primary" style="margin-top:10px;font-size:13px;">🔍 분석하기</button></div>'

    + historyHtml
    + '</div>';
}

function handleTxImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => analyzeTxImage(e.target.result, file.type);
  reader.readAsDataURL(file);
}

function clearTxHistory() {
  if(!confirm('분석 적용 이력을 모두 삭제할까요?')) return;
  saveTxHistory([]);
  renderTxScan();
  toast('이력 삭제 완료');
}
