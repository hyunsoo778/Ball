/* ════════════════════════════════════
 * Meet Ball - 팀 편성
 * ════════════════════════════════════ */

// ── A/B 리그 그룹 저장 ────────────────────────────────────
const LEAGUE_KEY = 'bowlingApp_leagues';
function loadLeagues() {
  const _cached = window.fbLoad ? window.fbLoad('leagues', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(LEAGUE_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return {}; // { name: 'A' | 'B' }
}
function saveLeagues(d) {
  try { localStorage.setItem(LEAGUE_KEY, JSON.stringify(d)); } catch(e) {}
  window.fbSave && window.fbSave('leagues', d);
}
function getMemberLeague(name) {
  return loadLeagues()[name] || 'A';
}
function setMemberLeague(name, league) {
  const d = loadLeagues(); d[name] = league; saveLeagues(d);
}

function renderTeamBuilder(presetMembers) {
  const container = document.getElementById('teambuilderContent');
  if(!container) return;
  const data = loadData();
  const allMembers = Object.keys(data.members || BASE_PLAYERS).sort();
  const stats = getPlayerStats();
  const preset = presetMembers || window._teamBuilderPreset || [];
  const leagues = loadLeagues();

  const aMembers = allMembers.filter(n => (leagues[n]||'A') === 'A');
  const bMembers = allMembers.filter(n => (leagues[n]||'A') === 'B');

  function memberCard(name) {
    const s = stats[name];
    const avg = s?.avg ? Math.round(s.avg) : (data.members?.[name] || 0);
    const handi = Math.max(0, 200 - avg);
    const checked = preset.includes(name) ? 'checked' : '';
    const league = leagues[name] || 'A';
    const lColor = league === 'A' ? '#3b82f6' : '#22c55e';
    return `<label style="display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:10px;cursor:pointer;border:1px solid var(--border);background:var(--bg3);min-width:120px;transition:all .15s;"
      id="tb_label_${name}"
      onmouseout="updateTbLabelColor(this,'${name}')">
      <input type="checkbox" id="tb_${name}" value="${name}" ${checked}
        onchange="updateTbLabelColor(document.getElementById('tb_label_${name}'),'${name}');updateBuilderStats()"
        style="width:14px;height:14px;accent-color:${lColor};">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:12px;display:flex;align-items:center;gap:4px;">
          ${name}
          <span style="font-size:9px;padding:1px 5px;border-radius:6px;background:${lColor}22;color:${lColor};border:1px solid ${lColor}44;flex-shrink:0;">${league}</span>
        </div>
        <div style="font-size:10px;color:var(--text3);">에버 ${avg} · 핸디 ${handi}</div>
      </div>
    </label>`;
  }

  container.innerHTML = `
  <!-- 리그 구분 안내 -->
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
    <div style="font-size:13px;font-weight:700;">📋 리그전 규칙 요약</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--text2);">
      <span style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:4px 10px;">🔵 A리그 14명</span>
      <span style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:4px 10px;">🟢 B리그 9명</span>
      <span style="color:var(--text3);">짝수: 리그별 승점 1:1 (승3·무2·패1)</span>
      <span style="color:var(--text3);">홀수: 개인전 상위70%=3점 중간=2점 하위30%=1점</span>
      <span style="color:var(--text3);">핸디: 200 - 에버</span>
    </div>
    ${isAdmin ? `<button onclick="showLeagueManager()" class="btn btn-secondary" style="font-size:12px;padding:5px 12px;margin-left:auto;">⚙️ 리그 배정 관리</button>` : ''}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
    <!-- 참가자 선택 -->
    <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:6px;">👥 참가자 선택</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:12px;">체크하면 팀 편성에 포함됩니다</div>
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">
        <button onclick="checkAllMembers(true)" class="btn btn-secondary" style="font-size:11px;padding:4px 10px;">전체선택</button>
        <button onclick="checkAllMembers(false)" class="btn btn-secondary" style="font-size:11px;padding:4px 10px;">전체해제</button>
        <button onclick="checkLeague('A',true)" class="btn btn-secondary" style="font-size:11px;padding:4px 10px;color:#3b82f6;border-color:rgba(59,130,246,0.4);">A리그만</button>
        <button onclick="checkLeague('B',true)" class="btn btn-secondary" style="font-size:11px;padding:4px 10px;color:#22c55e;border-color:rgba(34,197,94,0.4);">B리그만</button>
      </div>

      <!-- A리그 -->
      <div style="margin-bottom:14px;">
        <div style="font-size:12px;font-weight:700;color:#3b82f6;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <span style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.4);border-radius:6px;padding:2px 8px;">🔵 A리그</span>
          <span style="color:var(--text3);font-weight:400;">${aMembers.length}명</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;">
          ${aMembers.map(memberCard).join('')}
        </div>
      </div>

      <!-- B리그 -->
      <div>
        <div style="font-size:12px;font-weight:700;color:#22c55e;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <span style="background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);border-radius:6px;padding:2px 8px;">🟢 B리그</span>
          <span style="color:var(--text3);font-weight:400;">${bMembers.length}명</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;">
          ${bMembers.length > 0 ? bMembers.map(memberCard).join('') : '<span style="font-size:12px;color:var(--text3);">B리그 회원이 없습니다. 리그 배정을 해주세요.</span>'}
        </div>
      </div>
    </div>

    <!-- 설정 -->
    <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:14px;">⚙️ 팀 편성 설정</div>
      <div style="display:flex;flex-direction:column;gap:14px;">

        <!-- 통합/분리 모드 토글 -->
        <div class="input-group">
          <label>편성 모드</label>
          <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden;width:fit-content;">
            <button id="tb_mode_unified" onclick="setTbMode('unified')"
              style="padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:var(--accent);color:#fff;transition:0.2s;">
              🔗 통합
            </button>
            <button id="tb_mode_split" onclick="setTbMode('split')"
              style="padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:var(--bg3);color:var(--text3);transition:0.2s;">
              ✂️ 분리 (A/B 각각)
            </button>
          </div>
        </div>

        <!-- 통합 모드: 팀 수 -->
        <div id="tb_unified_options">
          <div class="input-group">
            <label>팀 수 (전체)</label>
            <select id="tb_teamcount" onchange="updateBuilderStats()" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;width:fit-content;">
              <option value="2">2팀</option>
              <option value="3">3팀</option>
              <option value="4">4팀</option>
              <option value="5">5팀</option>
              <option value="6">6팀</option>
            </select>
          </div>
        </div>

        <!-- 분리 모드: A/B 각각 팀 수 -->
        <div id="tb_split_options" style="display:none;">
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <!-- A그룹 -->
            <div style="flex:1;min-width:140px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.25);border-radius:10px;padding:12px;">
              <div style="font-size:12px;font-weight:700;color:#3b82f6;margin-bottom:8px;">🔵 A그룹</div>
              <div style="display:flex;gap:0;border:1px solid rgba(59,130,246,0.3);border-radius:8px;overflow:hidden;margin-bottom:8px;">
                <button id="tb_a_team_btn" onclick="setGroupMode('A','team')"
                  style="flex:1;padding:6px 0;font-size:12px;font-weight:700;cursor:pointer;border:none;background:rgba(59,130,246,0.8);color:#fff;transition:.15s;">
                  🤝 팀전
                </button>
                <button id="tb_a_solo_btn" onclick="setGroupMode('A','solo')"
                  style="flex:1;padding:6px 0;font-size:12px;font-weight:700;cursor:pointer;border:none;background:var(--bg3);color:var(--text3);transition:.15s;">
                  🏆 개인전
                </button>
              </div>
              <div id="tb_a_team_opts">
                <div class="input-group">
                  <label style="color:#3b82f6;font-size:11px;">팀 수</label>
                  <select id="tb_teamcount_a" onchange="updateBuilderStats()" style="background:var(--bg3);border:1px solid rgba(59,130,246,0.4);color:var(--text);padding:6px 10px;border-radius:8px;font-size:13px;outline:none;font-family:inherit;width:100%;">
                    <option value="2">2팀</option>
                    <option value="3">3팀</option>
                    <option value="4">4팀</option>
                    <option value="5">5팀</option>
                  </select>
                </div>
              </div>
              <div id="tb_a_solo_opts" style="display:none;font-size:11px;color:#eab308;padding:4px 0;">상위30%=3점 · 중위=2점 · 하위30%=1점</div>
            </div>
            <!-- B그룹 -->
            <div style="flex:1;min-width:140px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.25);border-radius:10px;padding:12px;">
              <div style="font-size:12px;font-weight:700;color:#22c55e;margin-bottom:8px;">🟢 B그룹</div>
              <div style="display:flex;gap:0;border:1px solid rgba(34,197,94,0.3);border-radius:8px;overflow:hidden;margin-bottom:8px;">
                <button id="tb_b_team_btn" onclick="setGroupMode('B','team')"
                  style="flex:1;padding:6px 0;font-size:12px;font-weight:700;cursor:pointer;border:none;background:rgba(34,197,94,0.8);color:#fff;transition:.15s;">
                  🤝 팀전
                </button>
                <button id="tb_b_solo_btn" onclick="setGroupMode('B','solo')"
                  style="flex:1;padding:6px 0;font-size:12px;font-weight:700;cursor:pointer;border:none;background:var(--bg3);color:var(--text3);transition:.15s;">
                  🏆 개인전
                </button>
              </div>
              <div id="tb_b_team_opts">
                <div class="input-group">
                  <label style="color:#22c55e;font-size:11px;">팀 수</label>
                  <select id="tb_teamcount_b" onchange="updateBuilderStats()" style="background:var(--bg3);border:1px solid rgba(34,197,94,0.4);color:var(--text);padding:6px 10px;border-radius:8px;font-size:13px;outline:none;font-family:inherit;width:100%;">
                    <option value="2">2팀</option>
                    <option value="3">3팀</option>
                    <option value="4">4팀</option>
                    <option value="5">5팀</option>
                  </select>
                </div>
              </div>
              <div id="tb_b_solo_opts" style="display:none;font-size:11px;color:#eab308;padding:4px 0;">상위30%=3점 · 중위=2점 · 하위30%=1점</div>
            </div>
          </div>
          <select id="tb_teamcount_dummy" style="display:none;"><option value="2">2</option></select>
        </div>

        <div class="input-group">
          <label>편성 방식</label>
          <select id="tb_method" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
            <option value="ab_snake">🏆 A/B 균등 분산 (권장)</option>
            <option value="snake">스네이크 드래프트 (에버순)</option>
            <option value="random">랜덤 셔플 후 균등분배</option>
            <option value="ab_snake_nohandi">🏅 A/B 균등 분산 (핸디없음)</option>
            <option value="snake_nohandi">🎯 스네이크 드래프트 (핸디없음)</option>
            <option value="random_nohandi">🎲 랜덤 셔플 (핸디없음)</option>
          </select>
        </div>
        <div id="tb_mode_desc" style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:12px;font-size:12px;color:var(--text2);line-height:1.7;">
          <b style="color:#3b82f6;">🔗 통합 모드:</b><br>
          A/B 그룹을 함께 섞어 팀을 구성합니다.<br>
          각 팀에 A·B 인원을 균등하게 배분합니다.
        </div>
        <div id="tb_stats" style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:13px;color:var(--text3);">
          참가자를 선택하면 정보가 표시됩니다
        </div>
        <button onclick="buildTeams()" class="btn btn-primary" style="font-size:15px;padding:12px 24px;">⚡ 팀 편성 실행</button>
      </div>
    </div>
  </div>

  <!-- 리그 배정 관리 (관리자) -->
  <div id="leagueManager" style="display:none;background:var(--card);border:1px solid rgba(249,115,22,0.3);border-radius:16px;padding:20px;margin-bottom:24px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;">
      <span>⚙️ 리그 배정 관리</span>
      <button onclick="hideLeagueManager()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;">✕</button>
    </div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:12px;">각 회원의 A/B 리그를 설정하세요</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${allMembers.map(name => {
        const lg = leagues[name] || 'A';
        return `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:8px 12px;display:flex;align-items:center;gap:8px;min-width:150px;">
          <span style="font-weight:700;font-size:13px;flex:1;">${name}</span>
          <button onclick="setLeagueAndRefresh('${name}','A')"
            style="padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid ${lg==='A'?'rgba(59,130,246,0.7)':'var(--border)'};background:${lg==='A'?'rgba(59,130,246,0.2)':'var(--bg3)'};color:${lg==='A'?'#3b82f6':'var(--text3)'};">A</button>
          <button onclick="setLeagueAndRefresh('${name}','B')"
            style="padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid ${lg==='B'?'rgba(34,197,94,0.7)':'var(--border)'};background:${lg==='B'?'rgba(34,197,94,0.2)':'var(--bg3)'};color:${lg==='B'?'#22c55e':'var(--text3)'};">B</button>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div id="tb_result"></div>
  `;

  // 초기 체크 색상
  allMembers.forEach(name => {
    const lbl = document.getElementById(`tb_label_${name}`);
    if(lbl) updateTbLabelColor(lbl, name);
  });
  updateBuilderStats();
}

function showLeagueManager() {
  const el = document.getElementById('leagueManager');
  if(el) el.style.display = 'block';
}
function hideLeagueManager() {
  const el = document.getElementById('leagueManager');
  if(el) el.style.display = 'none';
}
function setLeagueAndRefresh(name, league) {
  setMemberLeague(name, league);
  renderTeamBuilder();
  // 리그 관리자 패널 다시 열기
  setTimeout(() => showLeagueManager(), 50);
}

function updateTbLabelColor(label, name) {
  const chk = document.getElementById(`tb_${name}`);
  const league = getMemberLeague(name);
  const lColor = league === 'A' ? '#3b82f6' : '#22c55e';
  if(!chk) return;
  if(chk.checked) {
    label.style.borderColor = lColor;
    label.style.background  = league === 'A' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)';
  } else {
    label.style.borderColor = 'var(--border)';
    label.style.background  = 'var(--bg3)';
  }
}

function checkAllMembers(val) {
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS);
  members.forEach(name => {
    const chk = document.getElementById(`tb_${name}`);
    const lbl = document.getElementById(`tb_label_${name}`);
    if(chk) { chk.checked = val; }
    if(lbl) updateTbLabelColor(lbl, name);
  });
  updateBuilderStats();
}

function checkLeague(league, val) {
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS);
  // 먼저 전체 해제
  members.forEach(name => {
    const chk = document.getElementById(`tb_${name}`);
    const lbl = document.getElementById(`tb_label_${name}`);
    if(chk) { chk.checked = false; }
    if(lbl) updateTbLabelColor(lbl, name);
  });
  // 해당 리그만 선택
  members.filter(n => getMemberLeague(n) === league).forEach(name => {
    const chk = document.getElementById(`tb_${name}`);
    const lbl = document.getElementById(`tb_label_${name}`);
    if(chk) { chk.checked = val; }
    if(lbl) updateTbLabelColor(lbl, name);
  });
  updateBuilderStats();
}

function getCheckedMembers() {
  const data = loadData();
  const members = Object.keys(data.members || BASE_PLAYERS);
  return members.filter(name => {
    const chk = document.getElementById(`tb_${name}`);
    return chk && chk.checked;
  });
}

function getMemberAvg(name) {
  const data = loadData();
  const stats = getPlayerStats();
  const s = stats[name];
  return s?.avg ? parseFloat(s.avg.toFixed(2)) : (data.members?.[name] || 0);
}

// ── 통합/분리 모드 전환 ──────────────────────────────────
window._tbMode = 'unified';
window._groupMode = { A: 'team', B: 'team' };

function setGroupMode(group, mode) {
  window._groupMode = window._groupMode || { A: 'team', B: 'team' };
  window._groupMode[group] = mode;
  const color = group === 'A' ? 'rgba(59,130,246,0.8)' : 'rgba(34,197,94,0.8)';
  const g = group.toLowerCase();
  const teamBtn = document.getElementById(`tb_${g}_team_btn`);
  const soloBtn = document.getElementById(`tb_${g}_solo_btn`);
  const teamOpts = document.getElementById(`tb_${g}_team_opts`);
  const soloOpts = document.getElementById(`tb_${g}_solo_opts`);
  if(!teamBtn) return;
  if(mode === 'team') {
    teamBtn.style.background = color; teamBtn.style.color = '#fff';
    soloBtn.style.background = 'var(--bg3)'; soloBtn.style.color = 'var(--text3)';
    teamOpts.style.display = ''; soloOpts.style.display = 'none';
  } else {
    soloBtn.style.background = '#eab308'; soloBtn.style.color = '#fff';
    teamBtn.style.background = 'var(--bg3)'; teamBtn.style.color = 'var(--text3)';
    teamOpts.style.display = 'none'; soloOpts.style.display = '';
  }
  updateBuilderStats();
}

function setTbMode(mode) {
  window._tbMode = mode;
  const btnUnified = document.getElementById('tb_mode_unified');
  const btnSplit   = document.getElementById('tb_mode_split');
  const optUnified = document.getElementById('tb_unified_options');
  const optSplit   = document.getElementById('tb_split_options');
  const descEl     = document.getElementById('tb_mode_desc');
  if(mode === 'unified') {
    btnUnified.style.background = 'var(--accent)';
    btnUnified.style.color = '#fff';
    btnSplit.style.background = 'var(--bg3)';
    btnSplit.style.color = 'var(--text3)';
    optUnified.style.display = '';
    optSplit.style.display = 'none';
    descEl.innerHTML = '<b style="color:#3b82f6;">🔗 통합 모드:</b><br>A/B 그룹을 함께 섞어 팀을 구성합니다.<br>각 팀에 A·B 인원을 균등하게 배분합니다.';
  } else {
    btnSplit.style.background = 'var(--accent)';
    btnSplit.style.color = '#fff';
    btnUnified.style.background = 'var(--bg3)';
    btnUnified.style.color = 'var(--text3)';
    optUnified.style.display = 'none';
    optSplit.style.display = '';
    descEl.innerHTML = '<b style="color:#f97316;">✂️ 분리 모드:</b><br>A그룹과 B그룹을 각각 독립적으로 팀 편성합니다.<br>결과에 🔵 A팀 · 🟢 B팀이 분리 표시됩니다.';
  }
  updateBuilderStats();
}

function updateBuilderStats() {
  const sel = getCheckedMembers();
  const mode = window._tbMode || 'unified';
  const statsEl = document.getElementById('tb_stats');
  if(!statsEl) return;
  if(sel.length === 0) {
    statsEl.innerHTML = '참가자를 선택하면 정보가 표시됩니다';
    return;
  }
  const aList = sel.filter(n => getMemberLeague(n) === 'A');
  const bList = sel.filter(n => getMemberLeague(n) === 'B');
  const aCount = aList.length;
  const bCount = bList.length;
  const avgs = sel.map(getMemberAvg);
  const totalAvg = avgs.reduce((a,b)=>a+b,0);
  const avgOfAvg = Math.round(totalAvg / sel.length);
  const aEven = aCount % 2 === 0;
  const bEven = bCount % 2 === 0;
  const aStatus = aEven
    ? `<span style="color:#22c55e;font-size:10px;">✅짝수</span>`
    : `<span style="color:#ef4444;font-size:10px;">⚠️홀수</span>`;
  const bStatus = bEven
    ? `<span style="color:#22c55e;font-size:10px;">✅짝수</span>`
    : `<span style="color:#ef4444;font-size:10px;">⚠️홀수</span>`;

  let extraMsg = '';
  if(mode === 'unified') {
    const teamCount = parseInt(document.getElementById('tb_teamcount')?.value || 2);
    const tpCount = (aEven ? aCount : 0) + (bEven ? bCount : 0);
    const perTeam = tpCount > 0 ? Math.floor(tpCount / teamCount) : 0;
    const soloCount = (!aEven ? aCount : 0) + (!bEven ? bCount : 0);
    extraMsg = `<span>🏃 팀당 <b style="color:var(--green);">${perTeam}명</b></span>`;
    if(soloCount > 0) extraMsg += `<span style="color:#eab308;">🏆 개인전 <b>${soloCount}명</b> (홀수 그룹 전원)</span>`;
  } else {
    const gMode = window._groupMode || { A: 'team', B: 'team' };
    const tcA = parseInt(document.getElementById('tb_teamcount_a')?.value || 2);
    const tcB = parseInt(document.getElementById('tb_teamcount_b')?.value || 2);
    const aIsSolo = gMode.A === 'solo' || (!aEven);
    const bIsSolo = gMode.B === 'solo' || (!bEven);
    const perA = (!aIsSolo && aCount > 0) ? Math.floor(aCount/tcA) : 0;
    const perB = (!bIsSolo && bCount > 0) ? Math.floor(bCount/tcB) : 0;
    if(!aIsSolo) extraMsg += `<span style="color:#3b82f6;">A팀당 <b>${perA}명</b></span>`;
    else extraMsg += `<span style="color:#eab308;font-size:11px;">🏆 A그룹 개인전 (${aCount}명)</span>`;
    if(!bIsSolo) extraMsg += `<span style="color:#22c55e;">B팀당 <b>${perB}명</b></span>`;
    else extraMsg += `<span style="color:#eab308;font-size:11px;">🏆 B그룹 개인전 (${bCount}명)</span>`;
  }

  statsEl.innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;align-items:center;">
      <span>👥 <b style="color:var(--accent);">${sel.length}명</b></span>
      <span style="color:#3b82f6;display:flex;align-items:center;gap:4px;">🔵 A그룹 <b>${aCount}명</b> ${aStatus}</span>
      <span style="color:#22c55e;display:flex;align-items:center;gap:4px;">🟢 B그룹 <b>${bCount}명</b> ${bStatus}</span>
      <span>📊 평균에버 <b style="color:var(--blue);">${avgOfAvg}</b></span>
      ${extraMsg}
    </div>
  `;
}

function buildTeams() {
  const mode = window._tbMode || 'unified';
  if(mode === 'split') { buildTeamsSplit(); return; }

  // ── 통합 모드 ─────────────────────────────────────────
  const sel = getCheckedMembers();
  if(sel.length < 2) { toast('최소 2명 이상 선택하세요.', 'error'); return; }
  const teamCount = parseInt(document.getElementById('tb_teamcount').value);
  if(teamCount > sel.length) { toast('팀 수가 참가자보다 많습니다.', 'error'); return; }
  const method = document.getElementById('tb_method').value;
  const noHandi = method.endsWith('_nohandi');
  const baseMethod = noHandi ? method.replace('_nohandi','') : method;

  const players = sel.map(name => ({
    name,
    avg: getMemberAvg(name),
    handi: noHandi ? 0 : Math.max(0, 200 - getMemberAvg(name)),
    league: getMemberLeague(name)
  }));

  const aPlayers = players.filter(p => p.league === 'A');
  const bPlayers = players.filter(p => p.league === 'B');
  const aOdd = aPlayers.length % 2 !== 0;
  const bOdd = bPlayers.length % 2 !== 0;

  // 홀수 그룹은 전원 개인전으로 분리
  const soloGroups = [];
  if(aOdd) soloGroups.push({ label: '🔵 A그룹', color: '#3b82f6', members: aPlayers });
  if(bOdd) soloGroups.push({ label: '🟢 B그룹', color: '#22c55e', members: bPlayers });

  const teamPlayers = players.filter(p => !(aOdd && p.league === 'A') && !(bOdd && p.league === 'B'));

  if(teamPlayers.length < 2 && soloGroups.length > 0) {
    // 전원 개인전인 경우
    renderTeamResult([], players, noHandi, '통합', soloGroups, []);
    return;
  }
  if(teamPlayers.length < 2) { toast('팀 편성 가능한 인원이 부족합니다.', 'error'); return; }

  const teams = Array.from({length: teamCount}, (_,i) => ({ name: `Team ${i+1}`, members: [], totalAvg: 0 }));

  function snakeAssign(arr, tms) {
    const sorted = [...arr].sort((a,b) => b.avg - a.avg);
    let idx = 0, dir = 1;
    sorted.forEach((player, i) => {
      tms[idx].members.push(player);
      tms[idx].totalAvg += player.avg;
      if(idx === tms.length - 1) dir = -1;
      else if(idx === 0 && i > 0) dir = 1;
      idx += dir;
    });
    let changed = true;
    while(changed) {
      changed = false;
      const maxTeam = tms.reduce((a,b) => a.members.length >= b.members.length ? a : b);
      const minTeam = tms.reduce((a,b) => a.members.length <= b.members.length ? a : b);
      if(maxTeam.members.length - minTeam.members.length > 1) {
        const moved = maxTeam.members.pop();
        maxTeam.totalAvg -= moved.avg;
        minTeam.members.push(moved);
        minTeam.totalAvg += moved.avg;
        changed = true;
      }
    }
  }

  if(baseMethod === 'ab_snake') {
    const aS = teamPlayers.filter(p => p.league === 'A').sort((a,b) => b.avg - a.avg);
    const bS = teamPlayers.filter(p => p.league === 'B').sort((a,b) => b.avg - a.avg);
    let idx = 0, dir = 1;
    aS.forEach((player, i) => {
      teams[idx].members.push(player); teams[idx].totalAvg += player.avg;
      if(idx === teamCount - 1) dir = -1; else if(idx === 0 && i > 0) dir = 1; idx += dir;
    });
    idx = 0; dir = 1;
    bS.forEach((player, i) => {
      teams[idx].members.push(player); teams[idx].totalAvg += player.avg;
      if(idx === teamCount - 1) dir = -1; else if(idx === 0 && i > 0) dir = 1; idx += dir;
    });
    const maxPer = Math.ceil(teamPlayers.length / teamCount);
    for(let t = 0; t < teamCount; t++) {
      while(teams[t].members.length > maxPer) {
        const moved = teams[t].members.pop(); teams[t].totalAvg -= moved.avg;
        const minTeam = teams.reduce((a,b) => a.members.length <= b.members.length ? a : b);
        minTeam.members.push(moved); minTeam.totalAvg += moved.avg;
      }
    }
  } else if(baseMethod === 'snake') {
    snakeAssign(teamPlayers, teams);
  } else {
    const shuffled = [...teamPlayers];
    for(let i = shuffled.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    shuffled.forEach((player, i) => { const t = i % teamCount; teams[t].members.push(player); teams[t].totalAvg += player.avg; });
  }

  renderTeamResult(teams, players, noHandi, '통합', soloGroups, teamPlayers);
}

// ── 분리 모드 팀편성 ─────────────────────────────────────
function buildTeamsSplit() {
  const sel = getCheckedMembers();
  if(sel.length < 2) { toast('최소 2명 이상 선택하세요.', 'error'); return; }
  const method = document.getElementById('tb_method').value;
  const noHandi = method.endsWith('_nohandi');
  const baseMethod = noHandi ? method.replace('_nohandi','') : method;
  const gMode = window._groupMode || { A: 'team', B: 'team' };

  const players = sel.map(name => ({
    name,
    avg: getMemberAvg(name),
    handi: noHandi ? 0 : Math.max(0, 200 - getMemberAvg(name)),
    league: getMemberLeague(name)
  }));

  const aPlayers = players.filter(p => p.league === 'A');
  const bPlayers = players.filter(p => p.league === 'B');

  // 개인전으로 설정된 그룹은 soloGroups로 분리
  const soloGroups = [];
  let aTeamPool = aPlayers;
  let bTeamPool = bPlayers;

  if(gMode.A === 'solo') {
    if(aPlayers.length > 0) soloGroups.push({ label: '🔵 A그룹', color: '#3b82f6', members: aPlayers });
    aTeamPool = [];
  } else {
    // 홀수면 자동으로 전원 개인전
    if(aPlayers.length % 2 !== 0) {
      soloGroups.push({ label: '🔵 A그룹', color: '#3b82f6', members: aPlayers });
      aTeamPool = [];
    }
  }

  if(gMode.B === 'solo') {
    if(bPlayers.length > 0) soloGroups.push({ label: '🟢 B그룹', color: '#22c55e', members: bPlayers });
    bTeamPool = [];
  } else {
    if(bPlayers.length % 2 !== 0) {
      soloGroups.push({ label: '🟢 B그룹', color: '#22c55e', members: bPlayers });
      bTeamPool = [];
    }
  }

  const tcA = parseInt(document.getElementById('tb_teamcount_a')?.value || 2);
  const tcB = parseInt(document.getElementById('tb_teamcount_b')?.value || 2);
  if(aTeamPool.length > 0 && tcA > aTeamPool.length) { toast('A그룹 팀 수가 인원보다 많습니다.', 'error'); return; }
  if(bTeamPool.length > 0 && tcB > bTeamPool.length) { toast('B그룹 팀 수가 인원보다 많습니다.', 'error'); return; }

  function makeTeams(pool, count, prefix, color) {
    const tms = Array.from({length: count}, (_,i) => ({ name: `${prefix}${i+1}팀`, members: [], totalAvg: 0, color }));
    const sorted = [...pool].sort((a,b) => b.avg - a.avg);
    if(baseMethod === 'random') {
      for(let i = sorted.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [sorted[i], sorted[j]] = [sorted[j], sorted[i]]; }
      sorted.forEach((p,i) => { const t = i % count; tms[t].members.push(p); tms[t].totalAvg += p.avg; });
    } else {
      let idx = 0, dir = 1;
      sorted.forEach((p, i) => {
        tms[idx].members.push(p); tms[idx].totalAvg += p.avg;
        if(idx === count - 1) dir = -1; else if(idx === 0 && i > 0) dir = 1; idx += dir;
      });
      let changed = true;
      while(changed) {
        changed = false;
        const maxT = tms.reduce((a,b) => a.members.length >= b.members.length ? a : b);
        const minT = tms.reduce((a,b) => a.members.length <= b.members.length ? a : b);
        if(maxT.members.length - minT.members.length > 1) {
          const moved = maxT.members.pop(); maxT.totalAvg -= moved.avg;
          minT.members.push(moved); minT.totalAvg += moved.avg; changed = true;
        }
      }
    }
    return tms;
  }

  const aTeams = aTeamPool.length >= 2 ? makeTeams(aTeamPool, tcA, 'A', '#3b82f6') : [];
  const bTeams = bTeamPool.length >= 2 ? makeTeams(bTeamPool, tcB, 'B', '#22c55e') : [];

  renderTeamResultSplit(aTeams, bTeams, aTeamPool, bTeamPool, noHandi, soloGroups);
}

// ── 공통 렌더 함수 ────────────────────────────────────────
function renderTeamResult(teams, players, noHandi, modeLabel, soloGroups, teamPlayers) {
  soloGroups = soloGroups || [];
  teamPlayers = teamPlayers || players;
  const colors = ['#3b82f6','#f97316','#a855f7','#ec4899','#14b8a6','#eab308'];
  const result = document.getElementById('tb_result');
  const overallAvg = players.length > 0 ? players.reduce((a,p)=>a+p.avg,0) / players.length : 0;

  // 개인전 그룹 섹션
  const soloSection = soloGroups.length > 0 ? `
  <div style="background:var(--card);border:2px solid rgba(234,179,8,0.5);border-radius:16px;padding:20px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;">
      <div style="font-size:20px;">🏆</div>
      <div style="font-weight:700;font-size:16px;color:#eab308;">개인전</div>
      <span style="font-size:11px;padding:2px 9px;border-radius:20px;background:rgba(234,179,8,0.12);color:#eab308;border:1px solid rgba(234,179,8,0.4);">개인전</span>
    </div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:14px;">해당 그룹은 팀 편성 없이 개인전으로 진행합니다.<br>
    <b style="color:#22c55e;">상위 30% = 3점</b> &nbsp;·&nbsp; <b style="color:#3b82f6;">중위 40% = 2점</b> &nbsp;·&nbsp; <b style="color:#94a3b8;">하위 30% = 1점</b></div>
    ${soloGroups.map(group => {
      const sorted = [...group.members].sort((a,b) => b.avg - a.avg);
      const top30 = Math.ceil(sorted.length * 0.3);
      const bot30 = Math.floor(sorted.length * 0.3);
      return `
      <div style="margin-bottom:14px;">
        <div style="font-size:13px;font-weight:700;color:${group.color};margin-bottom:8px;">${group.label} · ${group.members.length}명</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${sorted.map((p, i) => {
            const tier = i < top30 ? {label:'상위 30%', bg:'rgba(34,197,94,0.1)', border:'rgba(34,197,94,0.4)', txt:'#22c55e', pt:'3점'}
                       : i >= sorted.length - bot30 ? {label:'하위 30%', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.3)', txt:'#94a3b8', pt:'1점'}
                       : {label:'중위', bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.3)', txt:'#3b82f6', pt:'2점'};
            return `<div style="background:${tier.bg};border:1px solid ${tier.border};border-radius:10px;padding:8px 14px;min-width:110px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;">
                <span style="font-weight:700;font-size:13px;">${p.name}</span>
                <span style="font-size:11px;font-weight:700;color:${tier.txt};">${tier.pt}</span>
              </div>
              <div style="font-size:10px;color:var(--text3);">에버 <b style="font-family:'JetBrains Mono',monospace;color:${tier.txt};">${Math.round(p.avg)}</b>${!noHandi?` · 핸디 ${p.handi}`:''}</div>
              <div style="font-size:9px;color:${tier.txt};margin-top:2px;">${tier.label}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>` : '';

  const teamSection = teams.length > 0 ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
      <div style="font-weight:700;font-size:16px;">⚡ 팀 편성 결과 <span style="font-size:12px;color:var(--text3);font-weight:400;">🔗 통합</span>${soloGroups.length>0?` <span style="font-size:11px;color:#eab308;"> + 개인전 포함</span>`:''}</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <span style="font-size:13px;color:var(--text3);">팀전 평균에버: <b style="color:var(--accent);">${teamPlayers.length>0?Math.round(teamPlayers.reduce((a,p)=>a+p.avg,0)/teamPlayers.length):0}</b></span>
        <button onclick="buildTeams()" class="btn btn-secondary" style="font-size:12px;padding:6px 14px;">🔀 다시 편성</button>
        <button onclick="copyTeamResult()" class="btn btn-secondary" style="font-size:12px;padding:6px 14px;">📋 복사</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;">
      ${teams.map((team, i) => {
        const teamAvg = team.members.length > 0 ? Math.round(team.totalAvg / team.members.length) : 0;
        const tpAvg = teamPlayers.length>0 ? teamPlayers.reduce((a,p)=>a+p.avg,0)/teamPlayers.length : 0;
        const diff = teamAvg - Math.round(tpAvg);
        const color = colors[i % colors.length];
        const aIn = team.members.filter(p=>p.league==='A').length;
        const bIn = team.members.filter(p=>p.league==='B').length;
        const teamHandi = team.members.reduce((s,p)=>s+p.handi,0);
        return `
        <div style="background:var(--bg3);border:2px solid ${color}33;border-radius:14px;overflow:hidden;">
          <div style="background:${color}22;border-bottom:1px solid ${color}33;padding:12px 16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <div style="font-weight:700;font-size:15px;color:${color};">🎳 ${team.name}</div>
              <div style="text-align:right;">
                <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px;color:${color};">${teamAvg}</div>
                <div style="font-size:10px;color:var(--text3);">평균에버 (${diff>0?'+':''}${diff})</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:10px;color:#3b82f6;">A:${aIn}</span>
              <span style="font-size:10px;color:#22c55e;">B:${bIn}</span>
              ${!noHandi ? `<span style="font-size:10px;padding:2px 7px;border-radius:6px;background:rgba(249,115,22,0.1);color:var(--accent);border:1px solid rgba(249,115,22,0.3);">팀핸디 ${teamHandi}</span>` : ""}
            </div>
          </div>
          ${team.members.map((p, rank) => {
            const lColor = p.league === 'A' ? '#3b82f6' : '#22c55e';
            return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid rgba(30,45,69,0.4);">
              <div style="display:flex;align-items:center;gap:7px;">
                <span style="width:18px;height:18px;border-radius:50%;background:${color}22;color:${color};font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1px solid ${color}44;">${rank+1}</span>
                <span style="font-size:9px;padding:1px 5px;border-radius:5px;background:${lColor}18;color:${lColor};border:1px solid ${lColor}33;">${p.league}</span>
                <span style="font-weight:700;font-size:13px;">${p.name}</span>
              </div>
              <div style="text-align:right;">
                <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text2);">에버 ${Math.round(p.avg)}</div>
                ${!noHandi ? `<div style="font-size:10px;color:var(--text3);">핸디 ${p.handi}</div>` : ""}
              </div>
            </div>`;
          }).join('')}
          <div style="padding:6px 14px 10px;text-align:right;font-size:11px;color:var(--text3);">${team.members.length}명</div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">📊 팀별 평균에버 비교</div>
    ${teams.map((team, i) => {
      const teamAvg = team.members.length > 0 ? Math.round(team.totalAvg / team.members.length) : 0;
      const maxAvg = Math.max(...teams.map(t => t.members.length > 0 ? t.totalAvg/t.members.length : 0));
      const pct = maxAvg > 0 ? Math.round(teamAvg / maxAvg * 100) : 0;
      const color = colors[i % colors.length];
      const aIn = team.members.filter(p=>p.league==='A').length;
      const bIn = team.members.filter(p=>p.league==='B').length;
      return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:65px;font-weight:700;font-size:13px;color:${color};">${team.name}</div>
        <div style="flex:1;background:var(--bg3);border-radius:6px;height:10px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:6px;transition:width .6s;"></div>
        </div>
        <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;color:${color};width:36px;text-align:right;">${teamAvg}</div>
        <div style="font-size:11px;color:var(--text3);white-space:nowrap;">A:${aIn} B:${bIn}</div>
      </div>`;
    }).join('')}
  </div>` : (soloGroups.length > 0 ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px 20px;text-align:center;">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <span style="font-size:13px;color:var(--text3);">전원 개인전으로 진행됩니다</span>
      <div style="display:flex;gap:8px;">
        <button onclick="buildTeams()" class="btn btn-secondary" style="font-size:12px;padding:6px 14px;">🔀 다시 편성</button>
        <button onclick="copyTeamResult()" class="btn btn-secondary" style="font-size:12px;padding:6px 14px;">📋 복사</button>
      </div>
    </div>
  </div>` : '');

  result.innerHTML = soloSection + teamSection;

  const soloText = soloGroups.map(g => {
    const sorted = [...g.members].sort((a,b) => b.avg - a.avg);
    const top30 = Math.ceil(sorted.length * 0.3);
    const bot30 = Math.floor(sorted.length * 0.3);
    return `[🏆 개인전 · ${g.label}]\n${sorted.map((p,i) => {
      const tier = i < top30 ? '상위30%(3점)' : i >= sorted.length-bot30 ? '하위30%(1점)' : '중위(2점)';
      return `  ${i+1}. ${p.name} (에버${Math.round(p.avg)}${!noHandi?' 핸디'+p.handi:''}) - ${tier}`;
    }).join('\n')}`;
  }).join('\n\n');

  const teamText = teams.map((team) => {
    const teamAvg = team.members.length > 0 ? Math.round(team.totalAvg / team.members.length) : 0;
    return `[${team.name}] 평균에버: ${teamAvg}\n${team.members.map((p,r)=>`  ${r+1}. [${p.league}] ${p.name} (에버${Math.round(p.avg)} 핸디${p.handi})`).join('\n')}`;
  }).join('\n\n');

  window._lastTeamResult = [soloText, teamText].filter(Boolean).join('\n\n');
}

function renderTeamResultSplit(aTeams, bTeams, aPlayers, bPlayers, noHandi, splitSoloPlayers) {
  splitSoloPlayers = splitSoloPlayers || [];
  const result = document.getElementById('tb_result');
  const aAvg = aPlayers.length ? Math.round(aPlayers.reduce((s,p)=>s+p.avg,0)/aPlayers.length) : 0;
  const bAvg = bPlayers.length ? Math.round(bPlayers.reduce((s,p)=>s+p.avg,0)/bPlayers.length) : 0;
  const aColors = ['#3b82f6','#60a5fa','#93c5fd','#1d4ed8','#2563eb'];
  const bColors = ['#22c55e','#4ade80','#86efac','#15803d','#16a34a'];

  function teamCards(teams, colors, groupLabel) {
    const groupAvg = teams.reduce((s,t)=>s+t.totalAvg,0) / teams.reduce((s,t)=>s+t.members.length,0);
    return teams.map((team, i) => {
      const teamAvg = team.members.length > 0 ? Math.round(team.totalAvg / team.members.length) : 0;
      const diff = teamAvg - Math.round(groupAvg);
      const color = team.color || colors[i % colors.length];
      const teamHandi = team.members.reduce((s,p)=>s+p.handi,0);
      return `
      <div style="background:var(--bg3);border:2px solid ${color}44;border-radius:14px;overflow:hidden;">
        <div style="background:${color}22;border-bottom:1px solid ${color}33;padding:12px 16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div style="font-weight:700;font-size:15px;color:${color};">🎳 ${team.name}</div>
            <div style="text-align:right;">
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px;color:${color};">${teamAvg}</div>
              <div style="font-size:10px;color:var(--text3);">평균에버 (${diff>0?'+':''}${diff})</div>
            </div>
          </div>
          ${!noHandi ? `<div style="font-size:10px;color:var(--text3);">팀핸디 ${teamHandi}</div>` : ""}
        </div>
        ${team.members.map((p, rank) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid rgba(30,45,69,0.4);">
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="width:18px;height:18px;border-radius:50%;background:${color}22;color:${color};font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1px solid ${color}44;">${rank+1}</span>
            <span style="font-weight:700;font-size:13px;">${p.name}</span>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text2);">에버 ${Math.round(p.avg)}</div>
            ${!noHandi ? `<div style="font-size:10px;color:var(--text3);">핸디 ${p.handi}</div>` : ""}
          </div>
        </div>`).join('')}
        <div style="padding:6px 14px 10px;text-align:right;font-size:11px;color:var(--text3);">${team.members.length}명</div>
      </div>`;
    }).join('');
  }

  function barChart(teams) {
    const maxAvg = Math.max(...teams.map(t => t.members.length > 0 ? t.totalAvg/t.members.length : 0));
    return teams.map(team => {
      const teamAvg = team.members.length > 0 ? Math.round(team.totalAvg / team.members.length) : 0;
      const pct = maxAvg > 0 ? Math.round(teamAvg / maxAvg * 100) : 0;
      const color = team.color;
      return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:60px;font-weight:700;font-size:13px;color:${color};">${team.name}</div>
        <div style="flex:1;background:var(--bg3);border-radius:6px;height:10px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:6px;transition:width .6s;"></div>
        </div>
        <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;color:${color};width:36px;text-align:right;">${teamAvg}</div>
      </div>`;
    }).join('');
  }

  const splitSoloHTML = splitSoloPlayers.length > 0 ? `
  <div style="background:var(--card);border:2px solid rgba(234,179,8,0.4);border-radius:16px;padding:20px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
      <div style="font-size:18px;">🏆</div>
      <div style="font-weight:700;font-size:15px;color:#eab308;">개인전 선수</div>
      <span style="font-size:11px;padding:2px 9px;border-radius:20px;background:rgba(234,179,8,0.12);color:#eab308;border:1px solid rgba(234,179,8,0.35);">홀수 자동 처리</span>
    </div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:10px;">인원 홀수로 개인전 진행 · 상위30%=3점 · 중위40%=2점 · 하위30%=1점</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${splitSoloPlayers.map(p => {
        const lColor = p.league === 'A' ? '#3b82f6' : '#22c55e';
        return `<div style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.35);border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:9px;padding:1px 5px;border-radius:5px;background:${lColor}20;color:${lColor};border:1px solid ${lColor}33;">${p.league}</span>
          <span style="font-weight:700;font-size:13px;">${p.name}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#eab308;">에버 ${Math.round(p.avg)}</span>
        </div>`;
      }).join('')}
    </div>
  </div>` : '';

  result.innerHTML = splitSoloHTML + `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
      <div style="font-weight:700;font-size:16px;">⚡ 팀 편성 결과 <span style="font-size:12px;color:var(--text3);font-weight:400;">✂️ 분리</span>${splitSoloPlayers.length>0?` <span style="font-size:11px;color:#eab308;"> + 개인전 ${splitSoloPlayers.length}명</span>`:''}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button onclick="buildTeams()" class="btn btn-secondary" style="font-size:12px;padding:6px 14px;">🔀 다시 편성</button>
        <button onclick="copyTeamResult()" class="btn btn-secondary" style="font-size:12px;padding:6px 14px;">📋 복사</button>
      </div>
    </div>

    <!-- A그룹 -->
    <div style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.4);border-radius:10px;padding:6px 14px;font-weight:700;color:#3b82f6;">🔵 A그룹 팀편성</div>
        <span style="font-size:13px;color:var(--text3);">평균에버 <b style="color:#3b82f6;">${aAvg}</b></span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
        ${aTeams.length > 0 ? teamCards(aTeams, aColors, 'A') : '<div style="color:var(--text3);font-size:13px;padding:12px;">A그룹 인원 없음</div>'}
      </div>
    </div>

    <!-- 구분선 -->
    <div style="border-top:2px dashed var(--border);margin:20px 0;"></div>

    <!-- B그룹 -->
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);border-radius:10px;padding:6px 14px;font-weight:700;color:#22c55e;">🟢 B그룹 팀편성</div>
        <span style="font-size:13px;color:var(--text3);">평균에버 <b style="color:#22c55e;">${bAvg}</b></span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
        ${bTeams.length > 0 ? teamCards(bTeams, bColors, 'B') : '<div style="color:var(--text3);font-size:13px;padding:12px;">B그룹 인원 없음</div>'}
      </div>
    </div>
  </div>

  <!-- 비교 바 -->
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;">
    <div style="font-weight:700;font-size:14px;margin-bottom:14px;">📊 팀별 평균에버 비교</div>
    <div style="font-size:12px;color:#3b82f6;font-weight:700;margin-bottom:6px;">🔵 A그룹</div>
    ${barChart(aTeams)}
    <div style="border-top:1px dashed var(--border);margin:12px 0;"></div>
    <div style="font-size:12px;color:#22c55e;font-weight:700;margin-bottom:6px;">🟢 B그룹</div>
    ${barChart(bTeams)}
  </div>`;

  const allTeams = [...aTeams, ...bTeams];
  window._lastTeamResult = allTeams.map(team => {
    const teamAvg = team.members.length > 0 ? Math.round(team.totalAvg / team.members.length) : 0;
    return `[${team.name}] 평균에버: ${teamAvg}\n${team.members.map((p,r)=>`  ${r+1}. ${p.name} (에버${Math.round(p.avg)} 핸디${p.handi})`).join('\n')}`;
  }).concat(splitSoloPlayers.length > 0 ? [`\n[🏆 개인전]\n${splitSoloPlayers.map((p,r)=>`  ${r+1}. [${p.league}] ${p.name} (에버${Math.round(p.avg)} 핸디${p.handi})`).join('\n')}\n  ※ 점수기준: 상위30%=3점, 중위40%=2점, 하위30%=1점`] : []).join('\n\n');
}

function copyTeamResult() {
  const text = window._lastTeamResult || '';
  if(!text) return;
  navigator.clipboard.writeText(text).then(() => toast('팀 편성 결과 복사 완료! 📋')).catch(() => {
    const el = document.createElement('textarea');
    el.value = text; document.body.appendChild(el); el.select();
    document.execCommand('copy'); document.body.removeChild(el);
    toast('복사 완료!');
  });
}

// ── 앱 초기화 ─────────────────────────────────────────────
initDataIfEmpty();
updateApiKeyStatus();

document.getElementById('matchDate').value = new Date().toISOString().slice(0,10);
// 기본 순위 렌더
renderRanking('avg');
renderRounds();
renderPlayers();
renderFines();
renderPrizes();
renderNotice();
renderSponsor();
renderTourney();
renderVote();
renderTeamBuilder();