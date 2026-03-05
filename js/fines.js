/* ════════════════════════════════════
 * Meet Ball - 벌금 / 상금 렌더링
 * ════════════════════════════════════ */

// ── 공지사항 ──────────────────────────────────────────────
// 구조: { id, title, body, imageDataUrl, createdAt }
const SPONSOR_KEY = 'bowlingApp_sponsors'; // 찬조 내역
const DUES_KEY = 'bowlingApp_dues'; // { year, name, months: {1:true,...} }
const NOTICE_KEY = 'bowlingApp_notices';
function loadNotices() {
  const _cached = window.fbLoad ? window.fbLoad('notices', null) : null;
  if(_cached !== null) return _cached;
  try { const r = localStorage.getItem(NOTICE_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return [];
}
function saveNotices(list) {
  try { localStorage.setItem(NOTICE_KEY, JSON.stringify(list)); } catch(e) {}
  window.fbSave && window.fbSave('notices', list);
}

function addNotice() {
  if(!isAdmin) { toast('관리자만 등록할 수 있습니다.', 'error'); return; }
  const title = document.getElementById('nt_title').value.trim();
  const body  = document.getElementById('nt_body').value.trim();
  const imgEl = document.getElementById('nt_imgPreview');
  const imageDataUrl = imgEl?.src && imgEl.src !== window.location.href ? imgEl.src : '';
  if(!title && !body && !imageDataUrl) { toast('제목, 내용, 이미지 중 하나는 입력해주세요.', 'error'); return; }
  const list = loadNotices();
  list.unshift({ id: 'nt' + Date.now(), title, body, imageDataUrl, createdAt: new Date().toLocaleDateString('ko-KR') });
  saveNotices(list);
  document.getElementById('nt_title').value = '';
  document.getElementById('nt_body').value = '';
  if(imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
  renderNotice();
  toast('공지사항 등록 완료!');
}

function deleteNotice(id) {
  if(!isAdmin) return;
  if(!confirm('이 공지를 삭제할까요?')) return;
  saveNotices(loadNotices().filter(x => x.id !== id));
  renderNotice();
  toast('공지 삭제 완료');
}

function editNotice(id) {
  if(!isAdmin) return;
  const n = loadNotices().find(x => x.id === id);
  if(!n) return;
  const card = document.getElementById('nc_' + id);
  if(!card) return;
  card.innerHTML = `
    <div style="padding:14px 20px;background:rgba(249,115,22,0.08);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;">
      <span style="font-size:13px;font-weight:700;color:var(--accent);">✏️ 공지 수정 중</span>
    </div>
    <div style="padding:20px;display:flex;flex-direction:column;gap:12px;">
      <div class="input-group">
        <label>제목</label>
        <input id="en_title_${id}" type="text" value="${(n.title||'').replace(/"/g,'&quot;')}"
          style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>내용</label>
        <textarea id="en_body_${id}" rows="5"
          style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;resize:vertical;line-height:1.6;">${n.body||''}</textarea>
      </div>
      <div>
        <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:6px;">이미지</label>
        <img id="en_img_${id}" src="${n.imageDataUrl||''}" style="display:${n.imageDataUrl?'block':'none'};max-width:100%;max-height:260px;border-radius:10px;border:1px solid var(--border);margin-bottom:8px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <label style="display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px dashed var(--border);border-radius:8px;padding:8px 14px;cursor:pointer;font-size:12px;color:var(--text2);">
            🖼️ 이미지 변경
            <input type="file" accept="image/*" style="display:none;" onchange="handleEditNoticeImg('${id}',this.files[0])">
          </label>
          ${n.imageDataUrl ? `<button onclick="clearEditNoticeImg('${id}')" style="background:none;border:1px solid rgba(239,68,68,0.3);color:var(--red);border-radius:8px;padding:8px 12px;font-size:12px;cursor:pointer;">🗑 이미지 제거</button>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:4px;">
        <button class="btn btn-primary" onclick="saveNoticeEdit('${id}')">💾 저장</button>
        <button class="btn btn-secondary" onclick="renderNotice()">취소</button>
      </div>
    </div>`;
}

function handleEditNoticeImg(id, file) {
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('en_img_' + id);
    if(img) { img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function clearEditNoticeImg(id) {
  const img = document.getElementById('en_img_' + id);
  if(img) { img.src = ''; img.style.display = 'none'; }
}

function saveNoticeEdit(id) {
  if(!isAdmin) return;
  const title = document.getElementById('en_title_' + id)?.value.trim() || '';
  const body  = document.getElementById('en_body_'  + id)?.value.trim() || '';
  const imgEl = document.getElementById('en_img_'   + id);
  const imageDataUrl = (imgEl?.style.display !== 'none' && imgEl?.src && imgEl.src !== window.location.href) ? imgEl.src : '';
  const list = loadNotices();
  const idx  = list.findIndex(x => x.id === id);
  if(idx < 0) return;
  list[idx] = { ...list[idx], title, body, imageDataUrl, updatedAt: new Date().toLocaleDateString('ko-KR') };
  saveNotices(list);
  renderNotice();
  toast('공지 수정 완료!');
}

function handleNoticeImage(file) {
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('nt_imgPreview');
    if(img) { img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function renderNotice() {
  const container = document.getElementById('noticeContent');
  if(!container) return;
  const list = loadNotices();

  container.innerHTML = `
  ${isAdmin ? `
  <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:28px;">
    <div style="font-weight:700;font-size:15px;margin-bottom:16px;">📝 공지 등록</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div class="input-group">
        <label>제목</label>
        <input type="text" id="nt_title" placeholder="공지 제목"
          style="width:100%;max-width:500px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">
      </div>
      <div class="input-group">
        <label>내용</label>
        <textarea id="nt_body" placeholder="공지 내용을 입력하세요..." rows="4"
          style="width:100%;max-width:600px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-size:14px;outline:none;font-family:inherit;resize:vertical;line-height:1.6;"></textarea>
      </div>
      <div class="input-group">
        <label>이미지 첨부 (선택)</label>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="display:inline-flex;align-items:center;gap:8px;background:var(--bg3);border:1px dashed var(--border);border-radius:10px;padding:12px 20px;cursor:pointer;width:fit-content;transition:border-color .2s;"
            onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
            <span style="font-size:20px;">🖼️</span>
            <span style="font-size:13px;color:var(--text2);">이미지 선택 (JPG, PNG)</span>
            <input type="file" accept="image/*" style="display:none;" onchange="handleNoticeImage(this.files[0])">
          </label>
          <img id="nt_imgPreview" style="display:none;max-width:400px;max-height:300px;border-radius:12px;border:1px solid var(--border);">
        </div>
      </div>
      <div>
        <button class="btn btn-primary" onclick="addNotice()">📢 공지 등록</button>
      </div>
    </div>
  </div>` : ''}

  ${list.length === 0 ? `
  <div class="empty">
    <div class="empty-icon">📢</div>
    <div class="empty-text">등록된 공지사항이 없습니다</div>
  </div>` :
  list.map((n, i) => `
  <div id="nc_${n.id}" style="background:var(--card);border:1px solid ${i===0?'rgba(249,115,22,0.4)':'var(--border)'};border-radius:16px;overflow:hidden;margin-bottom:16px;">
    <div style="padding:16px 20px;background:${i===0?'rgba(249,115,22,0.06)':'var(--bg3)'};border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:10px;">
        ${i===0?'<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:var(--accent);color:white;font-weight:700;">NEW</span>':''}
        <div style="font-weight:700;font-size:15px;">${n.title || '(제목 없음)'}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <span style="font-size:12px;color:var(--text3);">${n.updatedAt ? n.updatedAt+' 수정됨' : n.createdAt}</span>
        ${isAdmin ? `
          <button onclick="editNotice('${n.id}')" style="background:none;border:1px solid rgba(249,115,22,0.35);color:var(--accent);border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;white-space:nowrap;">✏️ 수정</button>
          <button onclick="deleteNotice('${n.id}')" style="background:none;border:1px solid rgba(239,68,68,0.3);color:var(--red);border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;white-space:nowrap;">✕ 삭제</button>
        ` : ''}
      </div>
    </div>
    <div style="padding:20px;">
      ${n.body ? `<div style="font-size:14px;line-height:1.8;color:var(--text2);white-space:pre-wrap;margin-bottom:${n.imageDataUrl?'16px':'0'};">${n.body}</div>` : ''}
      ${n.imageDataUrl ? `<img src="${n.imageDataUrl}" style="max-width:100%;border-radius:12px;border:1px solid var(--border);">` : ''}
    </div>
  </div>`).join('')}
  `;
}

