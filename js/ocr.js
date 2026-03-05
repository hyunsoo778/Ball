/* ════════════════════════════════════
 * Meet Ball - OCR / AI 이미지 인식
 * ════════════════════════════════════ */

// ── 이미지 업로드 & AI 인식 ────────────────────────────────
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault(); uploadArea.classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if(file && file.type.startsWith('image/')) handleImage(file);
});
fileInput.addEventListener('change', e => { if(e.target.files[0]) handleImage(e.target.files[0]); });

function handleImage(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const preview = document.getElementById('previewImg');
    preview.src = e.target.result;
    preview.style.display = 'block';
    await recognizeScores(e.target.result);
  };
  reader.readAsDataURL(file);
}

// ── Claude API 키 관리 ────────────────────────────────────────
const API_KEY_STORAGE = 'meetball_claude_api_key';

function getApiKey() {
  try { return localStorage.getItem(API_KEY_STORAGE) || ''; } catch(e) { return ''; }
}

function saveApiKey() {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (!val) { toast('API 키를 입력해주세요.', 'error'); return; }
  if (!val.startsWith('sk-ant-')) { toast('올바른 Claude API 키 형식이 아닙니다. (sk-ant-로 시작)', 'error'); return; }
  try { localStorage.setItem(API_KEY_STORAGE, val); } catch(e) {}
  document.getElementById('apiKeyInput').value = '';
  updateApiKeyStatus();
  toast('✅ API 키가 저장되었습니다!', 'success');
}

function clearApiKey() {
  try { localStorage.removeItem(API_KEY_STORAGE); } catch(e) {}
  document.getElementById('apiKeyInput').value = '';
  updateApiKeyStatus();
  toast('API 키가 초기화되었습니다.', 'error');
}

function updateApiKeyStatus() {
  const el = document.getElementById('apiKeyStatus');
  if (!el) return;
  const key = getApiKey();
  if (key) {
    el.textContent = '✅ 설정됨 (' + key.slice(0,12) + '...)';
    el.style.color = 'var(--green)';
  } else {
    el.textContent = '미설정 (Tesseract 사용)';
    el.style.color = 'var(--text3)';
  }
}

// 이미지 전처리: 대비 강화 + 그레이스케일 + 이진화
function preprocessImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // 해상도 2배 업스케일 (OCR 정확도 향상)
      const scale = Math.min(3, Math.max(1, 1200 / Math.max(img.width, img.height)));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');

      // 흰 배경으로 초기화
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 픽셀 조작: 그레이스케일 + 대비강화 + 이진화
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        // 그레이스케일 변환
        const gray = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
        // 대비 강화 (S커브)
        const contrast = 1.8;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        const enhanced = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
        // 임계값 이진화 (어두운 텍스트 → 검정, 나머지 → 흰색)
        const binary = enhanced < 160 ? 0 : 255;
        d[i] = d[i+1] = d[i+2] = binary;
        d[i+3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl); // 실패시 원본 사용
    img.src = dataUrl;
  });
}

// 볼링 점수표 파싱: 레인번호/에버리지/합계 제거 후 게임점수만 추출
function extractBowlingScores(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];

  for (const line of lines) {
    // 헤더/타이틀 줄 스킵 (한글만 있거나 레인/플레이어명 포함)
    if (/레인|플레이어|에버리지|점수표|1G|2G|3G|총점/.test(line)) continue;

    // 소수점 숫자 제거 (에버리지: 225.33 등)
    const noDecimal = line.replace(/\d+\.\d+/g, '');

    // 숫자 추출 (2~3자리 정수만)
    const allNums = [];
    const re = /\b(\d{2,3})\b/g;
    let m;
    while ((m = re.exec(noDecimal)) !== null) {
      const n = parseInt(m[1]);
      // 레인번호(1~20) 제외, 볼링점수 범위(50~300)만
      if (n >= 50 && n <= 300) allNums.push(n);
    }

    if (allNums.length < 3) continue;

    // 마지막 숫자가 앞 3개의 합이면 합계열 → 제외
    // 예: [225, 194, 257, 676] → 676 = 225+194+257 이므로 676 제외
    let g1, g2, g3;
    if (allNums.length >= 4) {
      const last = allNums[allNums.length - 1];
      const sumFirst3 = allNums[allNums.length - 4] + allNums[allNums.length - 3] + allNums[allNums.length - 2];
      if (Math.abs(last - sumFirst3) <= 2) {
        // 마지막이 합계 → 앞 3개가 게임점수
        [g1, g2, g3] = allNums.slice(allNums.length - 4, allNums.length - 1);
      } else {
        [g1, g2, g3] = allNums.slice(0, 3);
      }
    } else {
      [g1, g2, g3] = allNums;
    }

    if (!g1 || !g2 || !g3) continue;
    rows.push({ name: '', g1, g2, g3, total: g1 + g2 + g3 });
  }

  // 한 줄 파싱 실패 시 → 전체에서 3개씩 묶기 (fallback)
  if (rows.length === 0) {
    const noDecimal = text.replace(/\d+\.\d+/g, '');
    const allNums = [];
    const re = /\b(\d{2,3})\b/g;
    let m;
    while ((m = re.exec(noDecimal)) !== null) {
      const n = parseInt(m[1]);
      if (n >= 50 && n <= 300) allNums.push(n);
    }
    for (let i = 0; i + 2 < allNums.length; i += 3) {
      const [g1, g2, g3] = allNums.slice(i, i + 3);
      rows.push({ name: '', g1, g2, g3, total: g1 + g2 + g3 });
    }
  }

  return rows;
}

async function recognizeScores(dataUrl) {
  const loading = document.getElementById('loading');
  const progressMsg = document.getElementById('ocrProgressMsg');
  const setMsg = m => { if(progressMsg) progressMsg.textContent = m; };
  loading.classList.add('show');
  document.getElementById('scoreEditor').classList.remove('show');

  const apiKey = getApiKey();

  try {
    if (apiKey) {
      // ── Claude Vision 모드 ──
      setMsg('🤖 Claude AI로 점수표 분석 중...');
      const base64 = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
              { type: 'text', text: `볼링 점수표 이미지에서 선수별 점수를 추출해줘.
JSON 배열만 출력. 마크다운, 설명 절대 없이.
[{"name":"이름","g1":숫자,"g2":숫자,"g3":숫자,"total":숫자}]
규칙:
- name: 표에 있는 한국어 이름 그대로 (동그라미/표시 무시)
- g1/g2/g3: 1게임/2게임/3게임 점수 (2~3자리 정수)
- total: g1+g2+g3 합계
- 레인번호(한자리 숫자), 에버리지(소수점), 합계열은 제외
- 점수가 0이거나 읽기 어려우면 0으로` }
            ]
          }]
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'API 오류 ' + response.status);
      }

      const result = await response.json();
      const raw = result.content?.map(c => c.text || '').join('').trim();
      let rows = [];
      try {
        rows = JSON.parse(raw.replace(/```json|```/g, '').trim());
        if (!Array.isArray(rows)) rows = [];
        rows = rows.filter(r => r && (r.g1 > 0 || r.g2 > 0 || r.g3 > 0));
      } catch(e) { rows = []; }

      // 인식된 이름을 회원 목록과 자동 매칭 (유사도 기반)
      const appData = loadData();
      const memberNames = Object.keys(appData.members || BASE_PLAYERS);
      rows = rows.map(row => {
        if (!row.name) return row;
        // 완전일치
        if (memberNames.includes(row.name)) return row;
        // 부분일치: 인식된 이름이 회원명에 포함되거나 반대
        const matched = memberNames.find(m =>
          m.includes(row.name) || row.name.includes(m) ||
          // 글자 2개 이상 겹치는지 확인
          [...row.name].filter(c => m.includes(c)).length >= 2
        );
        return { ...row, name: matched || row.name };
      });

      const scores = rows.length > 0 ? rows : [{name:'',g1:0,g2:0,g3:0,total:0}];
      renderScoreEditor(scores);
      if (rows.length > 0) toast('✅ ' + rows.length + '명 AI 인식 완료! 이름을 확인해주세요.');
      else toast('AI 인식 실패. 직접 입력해주세요.', 'error');

    } else {
      // ── Tesseract 폴백 모드 ──
      setMsg('이미지 전처리 중...');
      const processedUrl = await preprocessImage(dataUrl);
      setMsg('점수 인식 중... (처음엔 30초 정도 소요)');
      const { data: { text } } = await Tesseract.recognize(processedUrl, 'kor+eng', {
        logger: m => { if(m.status === 'recognizing text') setMsg('인식 중... ' + Math.round(m.progress*100) + '%'); },
        tessedit_pageseg_mode: '4',
      });
      console.log('[OCR 원문]', text);
      const rows = extractBowlingScores(text);
      const scores = rows.length > 0 ? rows : [{name:'',g1:0,g2:0,g3:0,total:0}];
      renderScoreEditor(scores);
      if (rows.length > 0) toast('✅ ' + rows.length + '개 행 추출! 이름을 선택해주세요.');
      else toast('자동 추출 실패. API 키를 설정하거나 직접 입력해주세요.', 'error');
    }
  } catch(err) {
    console.error(err);
    toast('인식 실패: ' + err.message, 'error');
    renderScoreEditor([{name:'',g1:0,g2:0,g3:0,total:0}]);
  } finally {
    loading.classList.remove('show');
  }
}
