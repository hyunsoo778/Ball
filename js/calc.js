/* ════════════════════════════════════
 * Meet Ball - 계산 헬퍼 (핸디/벌금/통계)
 * ════════════════════════════════════ */

// ── 계산 헬퍼 ─────────────────────────────────────────────
function calcHandi(avg) { return Math.max(0, Math.min(50, Math.round(180 - avg))); }
function checkFine(g3, baseAvg, name='') {
  if(g3.length < 3) return 0;
  const female = name && isFemale(name);
  const gameAvg = g3.slice(0,3).reduce((a,b) => a+b, 0) / 3;
  const threshold = female ? 190 : 200;
  if(baseAvg >= threshold) {
    // 남자 에버 200↑ or 여자 에버 190↑ → 고정 기준점 미만이면 벌금
    return gameAvg < threshold ? 2000 : 0;
  } else {
    // 나머지 → 자기 직전 에버 못 치면 벌금
    return gameAvg < baseAvg ? 2000 : 0;
  }
}

function getPlayerStats() {
  const data = loadData();
  const members = data.members || BASE_PLAYERS;
  const stats = {};
  for(const round of data.rounds) {
    for(const sc of round.scores) {
      if(!stats[sc.name]) stats[sc.name] = { name:sc.name, rounds:[], totalPins:0, totalGames:0 };
      stats[sc.name].rounds.push({ label:round.label, date:round.date, g:sc.g, total:sc.total });
      stats[sc.name].totalPins += sc.total;
      stats[sc.name].totalGames += sc.g.length;
    }
  }
  for(const name in stats) {
    const s = stats[name];
    // 이전에버(BASE_PLAYERS)를 가상 1게임으로 포함해 누적에버 계산
    // 예) 정현수: (190 + 184+192+245 + ...) / (1 + 실제게임수)
    const prevAvg = BASE_PLAYERS[name] || members[name] || 0;
    const adjPins  = s.totalPins  + (prevAvg > 0 ? prevAvg : 0);
    const adjGames = s.totalGames + (prevAvg > 0 ? 1 : 0);
    s.avg = adjGames > 0 ? Math.round(adjPins / adjGames) : 0;
    s.baseAvg = members[name] || BASE_PLAYERS[name] || s.avg; // members(관리자 수정값) 우선
    s.handi = calcHandi(s.avg || s.baseAvg);
    s.attend = s.rounds.length;
    // 회차별 직전 누적에버(200 상한) 기준으로 벌금 정확 계산
    s.totalFine = data.rounds.reduce((acc, round, roundIdx) => {
      const sc = round.scores.find(x => x.name === name);
      if(!sc) return acc;
      const { avg: prevAvg } = getRoundAvgAndHandi(roundIdx, name);
      return acc + checkFine(sc.g, prevAvg, name);
    }, 0);
    s.bestTotal = s.rounds.length > 0 ? Math.max(...s.rounds.map(r => r.total)) : 0;
  }
  const currentMembers = data.members || BASE_PLAYERS;
  for(const name in stats) {
    // data.members에 없는 회원은 통계에서 제외 (삭제된 회원)
    if(!currentMembers.hasOwnProperty(name)) {
      delete stats[name];
    }
  }
  return stats;
}

// 회차별 직전 누적에버 기반 벌금/핸디 계산
// BASE_PLAYERS(이전에버)를 항상 가상 1게임으로 포함해서 계산
// 예) 2회차 직전에버(정현수): (190 + 184+192+245) / 4 = 202.75
function getRoundAvgAndHandi(roundIdx, name) {
  const data = loadData();
  const members = data.members || BASE_PLAYERS;
  // 이전에버를 초기 1게임으로 세팅
  const prevAvg = BASE_PLAYERS[name] || members[name] || 0;
  let cumPins  = prevAvg > 0 ? prevAvg : 0;
  let cumGames = prevAvg > 0 ? 1 : 0;
  // roundIdx 이전 회차 누적
  for(let i = 0; i < roundIdx; i++) {
    const sc = data.rounds[i].scores.find(x => x.name === name);
    if(sc) { cumPins += sc.total; cumGames += sc.g.length; }
  }
  if(cumGames > 0) {
    const avg = Math.round(cumPins / cumGames);
    return { avg, handi: calcHandi(avg) };
  }
  // BASE_PLAYERS에도 없는 완전 신규 회원
  return { avg: 180, handi: calcHandi(180) };
}

// 전체 벌금 데이터 계산 (회차별, 선수별)
function getAllFines() {
  const data = loadData();
  const payments = loadFinePayments();
  const extraFines = loadExtraFines();
  const finesByRound = []; // { roundId, label, date, fines: [{name, g, baseAvg, amount, paid}] }
  const finesByPlayer = {}; // name → { total, paid, unpaid, details }

  // 게임 벌금
  data.rounds.forEach((round, roundIdx) => {
    const roundFines = [];
    for(const sc of round.scores) {
      const { avg: baseAvg } = getRoundAvgAndHandi(roundIdx, sc.name);
      const fine = checkFine(sc.g, baseAvg, sc.name);
      if(fine > 0) {
        const payKey = `${round.id}__${sc.name}`;
        const paid = !!payments[payKey];
        roundFines.push({ name: sc.name, g: sc.g, baseAvg, amount: fine, paid });

        if(!finesByPlayer[sc.name]) finesByPlayer[sc.name] = { total:0, paid:0, unpaid:0, details:[] };
        finesByPlayer[sc.name].total += fine;
        if(paid) finesByPlayer[sc.name].paid += fine;
        else finesByPlayer[sc.name].unpaid += fine;
        finesByPlayer[sc.name].details.push({ roundId: round.id, label: round.label, date: round.date, g: sc.g, amount: fine, paid });
      }
    }
    if(roundFines.length > 0) {
      finesByRound.push({ roundId: round.id, label: round.label, date: round.date, fines: roundFines });
    }
  });

  // 추가벌금을 finesByRound에 포함
  // 추가벌금을 회차별로 그룹화
  const extraByRound = {};
  extraFines.forEach(ef => {
    const key = ef.roundLabel || '기타';
    if(!extraByRound[key]) extraByRound[key] = { label: key, date: ef.date || '', fines: [] };
    const info = EXTRA_FINE_TYPES[ef.type] || { label: ef.type, icon: '💸' };
    extraByRound[key].fines.push({
      name: ef.name,
      extra: true,
      icon: info.icon,
      label: info.label,
      amount: ef.amount,
      paid: !!ef.paid,
      efId: ef.id
    });
    // finesByPlayer에도 합산
    if(!finesByPlayer[ef.name]) finesByPlayer[ef.name] = { total:0, paid:0, unpaid:0, details:[] };
    finesByPlayer[ef.name].total += ef.amount;
    if(ef.paid) finesByPlayer[ef.name].paid += ef.amount;
    else finesByPlayer[ef.name].unpaid += ef.amount;
    finesByPlayer[ef.name].details.push({ label: key, date: ef.date||'', amount: ef.amount, paid: !!ef.paid, extra: true, icon: info.icon, efLabel: info.label });
  });

  // 추가벌금 회차를 finesByRound에 병합 (같은 회차면 합치기, 없으면 추가)
  Object.values(extraByRound).forEach(eg => {
    const existing = finesByRound.find(r => r.label === eg.label);
    if(existing) {
      existing.fines.push(...eg.fines);
    } else {
      finesByRound.push({ roundId: 'extra_'+eg.label, label: eg.label, date: eg.date, fines: eg.fines });
    }
  });

  return { finesByRound, finesByPlayer };
}
