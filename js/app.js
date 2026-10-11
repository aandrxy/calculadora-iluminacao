/* =============================================================
   Calculadora de Iluminação — lógica
   Referências de elementos, cálculo dos 3 modos (lâmpadas, lux,
   projeto completo), painel técnico, leiaute sugerido, projeto
   com vários ambientes e relatório para impressão/PDF.
   ============================================================= */

const areaInput = document.getElementById('areaInput');
const widthInput = document.getElementById('widthInput');
const lengthInput = document.getElementById('lengthInput');
const roomType = document.getElementById('roomType');
const customLuxRow = document.getElementById('customLuxRow');
const customLux = document.getElementById('customLux');
const lampLumens = document.getElementById('lampLumens');
const ledEfficacy = document.getElementById('ledEfficacy');
const lampPresets = document.getElementById('lampPresets');
const modeToggle = document.getElementById('modeToggle');
const areaFields = document.getElementById('areaFields');
const dimsFields = document.getElementById('dimsFields');
const calcModeToggle = document.getElementById('calcModeToggle');
const lampQtyRow = document.getElementById('lampQtyRow');
const lampQty = document.getElementById('lampQty');
const roomTypeLabel = document.getElementById('roomTypeLabel');
const statLabel1 = document.getElementById('statLabel1');
const statLabel2 = document.getElementById('statLabel2');
const fullFields = document.getElementById('fullFields');
const lampLumensField = document.getElementById('lampLumensField');
const colorTemp = document.getElementById('colorTemp');
const colorPreview = document.getElementById('colorPreview');
const cctKelvinLabel = document.getElementById('cctKelvinLabel');
const cctDescLabel = document.getElementById('cctDescLabel');
const cctPresets = document.getElementById('cctPresets');
const criSelect = document.getElementById('criSelect');
const criHint = document.getElementById('criHint');
const ceilingHeight = document.getElementById('ceilingHeight');
const lumPower = document.getElementById('lumPower');
const lumFlux = document.getElementById('lumFlux');
const reflCeiling = document.getElementById('reflCeiling');
const reflWall = document.getElementById('reflWall');
const reflFloor = document.getElementById('reflFloor');
const fatorUtil = document.getElementById('fatorUtil');
const fatorDepr = document.getElementById('fatorDepr');
const custoLum = document.getElementById('custoLum');
const custoInst = document.getElementById('custoInst');
const effWField = document.getElementById('effWField');
const fuHint = document.getElementById('fuHint');
const fuModeBadge = document.getElementById('fuModeBadge');
const resetFuBtn = document.getElementById('resetFuBtn');
const clearRoomsBtn = document.getElementById('clearRoomsBtn');
const voltageSelect = document.getElementById('voltageSelect');
const breakerInput = document.getElementById('breakerInput');
const usageHours = document.getElementById('usageHours');
const usageDays = document.getElementById('usageDays');
const tariffInput = document.getElementById('tariffInput');

const mainResult = document.getElementById('mainResult');
const subResult = document.getElementById('subResult');
const lampCount = document.getElementById('lampCount');
const wattTotal = document.getElementById('wattTotal');
const glowCircle = document.getElementById('glowCircle');
const bulbPath = document.getElementById('bulbPath');

const addRoomBtn = document.getElementById('addRoomBtn');
const globalProjectPanel = document.getElementById('globalProjectPanel');
const roomsList = document.getElementById('roomsList');
const globalTotalLamps = document.getElementById('globalTotalLamps');
const globalTotalCost = document.getElementById('globalTotalCost');
const globalTotalWatts = document.getElementById('globalTotalWatts');
const globalTotalConsumption = document.getElementById('globalTotalConsumption');

const techPanel = document.getElementById('techPanel');
const layoutPanel = document.getElementById('layoutPanel');
const headModeStat = document.getElementById('headModeStat');
const headRoomsStat = document.getElementById('headRoomsStat');

let mode = 'area';
let calcMode = 'lamps';
let savedRooms = [];
let userOverrodeFu = false;

/* ---------- Cor / Temperatura de cor (CCT) ---------- */

function kelvinToRgb(k){
  let temp = k / 100, r, g, b;

  if(temp <= 66){ r = 255; }
  else { r = 329.698727446 * Math.pow(temp - 60, -0.1332047592); }
  r = Math.min(255, Math.max(0, r));

  if(temp <= 66){ g = 99.4708025861 * Math.log(temp) - 161.1195681661; }
  else { g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492); }
  g = Math.min(255, Math.max(0, g));

  if(temp >= 66){ b = 255; }
  else if(temp <= 19){ b = 0; }
  else { b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307; }
  b = Math.min(255, Math.max(0, b));

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function cctLabel(k){
  if(k <= 3000) return 'Branco Quente';
  if(k <= 4200) return 'Branco Neutro';
  return 'Branco Frio';
}

function updateColorPreview(){
  const k = parseFloat(colorTemp.value) || 4000;
  const rgb = kelvinToRgb(k);
  colorPreview.style.backgroundColor = rgb;
  colorPreview.style.boxShadow = '0 12px 26px ' + rgb.replace('rgb', 'rgba').replace(')', ', 0.32)');
  cctKelvinLabel.textContent = k + ' K';
  cctDescLabel.textContent = cctLabel(k);
  [...cctPresets.children].forEach(b => b.classList.toggle('active', parseFloat(b.dataset.k) === k));
}

cctPresets.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  colorTemp.value = btn.dataset.k;
  updateColorPreview();
  calc();
});
colorTemp.addEventListener('input', () => {
  updateColorPreview();
  calc();
});

function getRecommendedCri(){
  const opt = roomType.options[roomType.selectedIndex];
  return parseFloat(opt && opt.dataset.cri) || 80;
}

function updateCriHint(){
  const rec = getRecommendedCri();
  const chosen = parseFloat(criSelect.value) || 80;
  if(chosen < rec){
    criHint.innerHTML = 'Recomendado IRC ≥ ' + rec + ' para este ambiente <span class="badge warn">Abaixo do recomendado</span>';
  } else {
    criHint.innerHTML = 'Recomendado IRC ≥ ' + rec + ' para este ambiente <span class="badge good">OK</span>';
  }
}
criSelect.addEventListener('change', () => { updateCriHint(); calc(); });

calcModeToggle.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  calcMode = btn.dataset.calcmode;
  [...calcModeToggle.children].forEach(b => b.classList.toggle('active', b === btn));

  lampQtyRow.style.display = calcMode === 'lux' ? '' : 'none';
  fullFields.style.display = calcMode === 'full' ? '' : 'none';
  lampLumensField.style.display = calcMode === 'full' ? 'none' : '';
  effWField.style.display = calcMode === 'lamps' ? '' : 'none';

  roomTypeLabel.textContent = calcMode === 'lux' ? 'Tipo de ambiente (referência)' : 'Tipo de ambiente';

  if(calcMode === 'lux'){
    statLabel1.textContent = 'Total de lúmens instalados';
    statLabel2.textContent = 'Comparado à referência';
    headModeStat.textContent = 'Lux Resultante';
  } else if(calcMode === 'full'){
    statLabel1.textContent = 'Potência instalada';
    statLabel2.textContent = 'Custo total estimado';
    headModeStat.textContent = 'Projeto Completo';
  } else {
    statLabel1.textContent = 'Lâmpadas necessárias';
    statLabel2.textContent = 'Potência total estimada';
    headModeStat.textContent = 'Lâmpadas';
  }
  if(calcMode === 'full' && !userOverrodeFu) autoCalculateFu();
  calc();
});

modeToggle.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  mode = btn.dataset.mode;
  [...modeToggle.children].forEach(b => b.classList.toggle('active', b === btn));
  areaFields.style.display = mode === 'area' ? '' : 'none';
  dimsFields.style.display = mode === 'dims' ? '' : 'none';
  if(!userOverrodeFu) autoCalculateFu();
  calc();
});

roomType.addEventListener('change', () => {
  customLuxRow.style.display = roomType.value === 'custom' ? '' : 'none';
  updateCriHint();
  calc();
});

lampPresets.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  lampLumens.value = btn.dataset.lm;
  [...lampPresets.children].forEach(b => b.classList.toggle('active', b === btn));
  calc();
});

function setFuOverride(overridden){
  userOverrodeFu = overridden;
  fuModeBadge.textContent = overridden ? '(Manual)' : '(Auto)';
  fuModeBadge.style.color = overridden ? 'var(--warn)' : 'var(--teal)';
  resetFuBtn.style.display = overridden ? '' : 'none';
  if(overridden){
    fuHint.textContent = 'Fu definido manualmente — não é recalculado ao mudar dimensões, pé-direito ou refletâncias. Clique em "Voltar para cálculo automático" para religar o auto-cálculo.';
  }
}

fatorUtil.addEventListener('input', () => {
  setFuOverride(true);
  calc();
});

resetFuBtn.addEventListener('click', () => {
  setFuOverride(false);
  autoCalculateFu();
  calc();
});

[areaInput, widthInput, lengthInput, customLux, lampLumens, ledEfficacy, lampQty, lumPower, lumFlux, fatorDepr, custoLum, custoInst, ceilingHeight, breakerInput, usageHours, usageDays, tariffInput].forEach(el => {
  el.addEventListener('input', () => {
    if(el === lampLumens){
      [...lampPresets.children].forEach(b => b.classList.toggle('active', b.dataset.lm === lampLumens.value));
    }
    if(el === widthInput || el === lengthInput || el === ceilingHeight || el === areaInput) {
      if(!userOverrodeFu) autoCalculateFu();
    }
    calc();
  });
});
voltageSelect.addEventListener('change', calc);

[reflCeiling, reflWall, reflFloor].forEach(el => {
  el.addEventListener('change', () => {
    if(!userOverrodeFu) autoCalculateFu();
    calc();
  });
});

function getArea(){
  if(mode === 'area'){
    return parseFloat(areaInput.value) || 0;
  } else {
    const w = parseFloat(widthInput.value) || 0;
    const l = parseFloat(lengthInput.value) || 0;
    return w * l;
  }
}

function getLux(){
  if(roomType.value === 'custom'){
    return parseFloat(customLux.value) || 0;
  }
  return parseFloat(roomType.value) || 0;
}

function autoCalculateFu() {
  const h = parseFloat(ceilingHeight.value) || 0;
  let w = parseFloat(widthInput.value) || 0;
  let l = parseFloat(lengthInput.value) || 0;
  let squareAssumed = false;

  if(mode === 'area' && (w <= 0 || l <= 0)){
    const area = parseFloat(areaInput.value) || 0;
    if(area > 0){
      w = l = Math.sqrt(area);
      squareAssumed = true;
    }
  }

  if (w > 0 && l > 0 && h > 0) {
    const K = (w * l) / (h * (w + l));
    // Curva base de Fu por Índice do Recinto (K), calibrada para a combinação de
    // referência de refletâncias teto/parede/piso = 70%/50%/20% (cenário "claro" comum
    // nas tabelas de fator de utilização).
    let baseFu = 0.15;
    if (K >= 5.0) baseFu = 0.65;
    else if (K >= 4.0) baseFu = 0.61;
    else if (K >= 3.0) baseFu = 0.56;
    else if (K >= 2.5) baseFu = 0.52;
    else if (K >= 2.0) baseFu = 0.47;
    else if (K >= 1.5) baseFu = 0.40;
    else if (K >= 1.25) baseFu = 0.35;
    else if (K >= 1.0) baseFu = 0.30;
    else if (K >= 0.8) baseFu = 0.25;
    else if (K >= 0.6) baseFu = 0.20;

    // Ajuste pela refletância das superfícies: teto e parede pesam mais na
    // interreflexão do que o piso. Um cômodo mais claro empurra o Fu para cima;
    // um cômodo mais escuro absorve luz e empurra o Fu para baixo.
    const rCeil = parseFloat(reflCeiling.value) || 70;
    const rWall = parseFloat(reflWall.value) || 50;
    const rFloor = parseFloat(reflFloor.value) || 20;
    const REF_SCORE = 70 * 0.5 + 50 * 0.4 + 20 * 0.1; // = 57, cenário de referência
    const score = rCeil * 0.5 + rWall * 0.4 + rFloor * 0.1;
    const reflFactor = Math.sqrt(score / REF_SCORE);
    const estimatedFu = Math.min(0.75, Math.max(0.10, baseFu * reflFactor));

    fatorUtil.value = estimatedFu.toFixed(2);
    const baseMsg = squareAssumed
      ? 'Fu estimado via Índice do Recinto (K), assumindo cômodo quadrado a partir da área (use Largura × Comprimento para maior precisão)'
      : 'Fu calculado via Índice do Recinto (K), a partir de largura, comprimento e pé direito';
    fuHint.textContent = baseMsg + ', ajustado pelas refletâncias informadas (teto ' + rCeil + '% · parede ' + rWall + '% · piso ' + rFloor + '%). Editar o campo trava o auto-cálculo.';
  } else {
    fuHint.textContent = 'Informe a área (ou largura/comprimento) e o pé direito para calcular o Fu automaticamente.';
  }
}

let currentOutput = { qty: 0, watts: 0, cost: 0, label: '', kwhMes: 0, custoMes: 0 };

function calc(){
  if(calcMode === 'lamps'){
    calcLamps();
  } else if(calcMode === 'lux'){
    calcLux();
  } else {
    calcFull();
  }
  updateTechPanel();
  updateLayoutPanel();
}

function calcLamps(){
  const area = getArea();
  const lux = getLux();
  const lm = parseFloat(lampLumens.value) || 0;
  const efficacy = parseFloat(ledEfficacy.value) || 90;

  const totalLumens = area * lux;

  if(area <= 0 || lux <= 0){
    mainResult.innerHTML = '0 <span>lúmens necessários</span>';
    subResult.textContent = 'Preencha os campos acima';
    lampCount.textContent = '–';
    wattTotal.textContent = '–';
    setGlow(0);
    currentOutput = { qty: 0, watts: 0, cost: 0, label: roomLabel(), kwhMes: 0, custoMes: 0 };
    return;
  }

  mainResult.innerHTML = Math.round(totalLumens).toLocaleString('pt-BR') + ' <span>lúmens necessários</span>';
  subResult.textContent = area.toFixed(1).replace('.',',') + ' m² × ' + lux + ' lx';

  if(lm > 0){
    const nLamps = Math.ceil(totalLumens / lm);
    lampCount.textContent = nLamps + (nLamps === 1 ? ' lâmpada' : ' lâmpadas');

    const estWattsPerLamp = lm / efficacy;
    const totalWatts = Math.round(nLamps * estWattsPerLamp);
    wattTotal.textContent = '~' + totalWatts + ' W';

    setGlow(Math.min(nLamps / 6, 1));
    currentOutput = { qty: nLamps, watts: totalWatts, cost: 0, label: roomLabel(), kwhMes: 0, custoMes: 0 };
  } else {
    lampCount.textContent = '–';
    wattTotal.textContent = '–';
    setGlow(0.3);
    currentOutput = { qty: 0, watts: 0, cost: 0, label: roomLabel(), kwhMes: 0, custoMes: 0 };
  }
}

function calcLux(){
  const area = getArea();
  const lm = parseFloat(lampLumens.value) || 0;
  const qty = parseFloat(lampQty.value) || 0;
  const refLux = getLux();

  if(area <= 0 || lm <= 0 || qty <= 0){
    mainResult.innerHTML = '0 <span>lx resultante</span>';
    subResult.textContent = 'Preencha os campos acima';
    lampCount.textContent = '–';
    wattTotal.textContent = '–';
    setGlow(0);
    currentOutput = { qty: 0, watts: 0, cost: 0, label: roomLabel(), kwhMes: 0, custoMes: 0 };
    return;
  }

  const totalLumens = lm * qty;
  const resultLux = totalLumens / area;

  mainResult.innerHTML = Math.round(resultLux).toLocaleString('pt-BR') + ' <span>lx resultante</span>';
  subResult.textContent = (qty + ' × ' + lm + ' lm) ÷ ' + area.toFixed(1).replace('.',',') + ' m²');

  lampCount.textContent = Math.round(totalLumens).toLocaleString('pt-BR') + ' lm';

  let totalWatts = Math.round((lm / 90) * qty);
  if(refLux > 0){
    const ratio = resultLux / refLux;
    let verdict;
    if(ratio < 0.85) verdict = 'abaixo do recomendado (' + refLux + ' lx)';
    else if(ratio > 1.3) verdict = 'acima do recomendado (' + refLux + ' lx)';
    else verdict = 'dentro do recomendado (' + refLux + ' lx)';
    wattTotal.textContent = verdict;
  } else {
    wattTotal.textContent = '–';
  }

  setGlow(Math.min(resultLux / (refLux || resultLux || 1), 1.2));
  currentOutput = { qty: qty, watts: totalWatts, cost: 0, label: roomLabel() + ` (${Math.round(resultLux)} lx)`, kwhMes: 0, custoMes: 0 };
}

function calcFull(){
  const area = getArea();
  const E = getLux();
  const flux = parseFloat(lumFlux.value) || 0;
  const power = parseFloat(lumPower.value) || 0;
  const fu = parseFloat(fatorUtil.value) || 0;
  const fd = parseFloat(fatorDepr.value) || 0;
  const cLum = parseFloat(custoLum.value) || 0;
  const cInst = parseFloat(custoInst.value) || 0;
  const ct = colorTemp.value;

  if(area <= 0 || E <= 0 || flux <= 0 || fu <= 0 || fd <= 0){
    mainResult.innerHTML = '0 <span>luminárias</span>';
    subResult.textContent = 'Preencha os campos acima';
    lampCount.textContent = '–';
    wattTotal.textContent = '–';
    setGlow(0);
    currentOutput = { qty: 0, watts: 0, cost: 0, label: roomLabel(), kwhMes: 0, custoMes: 0 };
    return;
  }

  const N = Math.ceil((E * area) / (flux * fu * fd));
  const potenciaTotal = N * power;
  const wPerM2 = area > 0 ? potenciaTotal / area : 0;
  const custoTotal = N * (cLum + cInst);
  const custoPorM2 = area > 0 ? custoTotal / area : 0;

  mainResult.innerHTML = N + ' <span>luminárias (' + ct + 'K)</span>';
  subResult.textContent = '(' + E + ' lx × ' + area.toFixed(1).replace('.',',') + ' m²) ÷ (' + flux + ' lm × ' + fu.toFixed(2) + ' × ' + fd.toFixed(2) + ')';

  lampCount.textContent = Math.round(potenciaTotal).toLocaleString('pt-BR') + ' W (' + wPerM2.toFixed(1).replace('.',',') + ' W/m²)';
  wattTotal.textContent = 'R$ ' + custoTotal.toLocaleString('pt-BR', {minimumFractionDigits:0, maximumFractionDigits:0}) + ' (R$ ' + custoPorM2.toFixed(2).replace('.',',') + '/m²)';

  setGlow(Math.min(N / 10, 1));
  currentOutput = { qty: N, watts: potenciaTotal, cost: custoTotal, label: roomLabel() + ` [${ct}K]`, kwhMes: 0, custoMes: 0 };
}

function setGlow(intensity){
  const r = 18 + intensity * 14;
  glowCircle.setAttribute('r', r);
  glowCircle.setAttribute('opacity', 0.35 + intensity * 0.65);
  bulbPath.setAttribute('stroke', intensity > 0.05 ? '#e3a03a' : '#c7cbda');
}

function roomLabel(){
  const selectLabel = roomType.options[roomType.selectedIndex].text.split(' (')[0];
  if(roomType.value === 'custom'){
    return 'Personalizado (' + (customLux.value || 0) + ' lx)';
  }
  return selectLabel;
}

/* ---------- Detalhes técnicos (DPI, elétrico, consumo) ---------- */

function updateTechPanel(){
  if(calcMode !== 'full' || currentOutput.watts <= 0){
    techPanel.style.display = 'none';
    currentOutput.kwhMes = 0;
    currentOutput.custoMes = 0;
    return;
  }
  techPanel.style.display = '';

  const P = currentOutput.watts;
  const area = getArea();
  const wPerM2 = area > 0 ? P / area : 0;

  const dpiValueText = document.getElementById('dpiValueText');
  const dpiBadge = document.getElementById('dpiBadge');
  dpiValueText.textContent = wPerM2.toFixed(1).replace('.',',') + ' W/m²';
  dpiBadge.style.display = '';
  if(wPerM2 <= 8){ dpiBadge.textContent = 'Eficiente'; dpiBadge.className = 'badge good'; }
  else if(wPerM2 <= 14){ dpiBadge.textContent = 'Moderado'; dpiBadge.className = 'badge warn'; }
  else { dpiBadge.textContent = 'Alto consumo'; dpiBadge.className = 'badge bad'; }

  const voltage = parseFloat(voltageSelect.value) || 127;
  const breaker = parseFloat(breakerInput.value) || 10;
  const current = P / voltage;
  const maxLoad = breaker * voltage * 0.8;
  const circuits = Math.max(1, Math.ceil(P / maxLoad));
  document.getElementById('currentValue').textContent = current.toFixed(2).replace('.',',') + ' A';
  document.getElementById('circuitsValue').textContent = circuits + (circuits === 1 ? ' circuito' : ' circuitos') + ' (' + breaker + 'A)';

  const horas = parseFloat(usageHours.value) || 0;
  const dias = parseFloat(usageDays.value) || 0;
  const tarifa = parseFloat(tariffInput.value) || 0;
  const kwhMes = (P / 1000) * horas * dias;
  const custoMes = kwhMes * tarifa;
  document.getElementById('consumptionValue').textContent = kwhMes.toFixed(1).replace('.',',') + ' kWh · R$ ' + custoMes.toFixed(2).replace('.',',');

  currentOutput.kwhMes = kwhMes;
  currentOutput.custoMes = custoMes;
}

/* ---------- Leiaute sugerido de luminárias ---------- */

function suggestLayout(W, L, N){
  if(N <= 0 || W <= 0 || L <= 0) return null;
  let best = null;
  for(let cols = 1; cols <= N; cols++){
    const rows = Math.ceil(N / cols);
    const ratioTarget = W / L;
    const ratioGrid = cols / rows;
    const mismatch = Math.abs(Math.log(ratioGrid / ratioTarget));
    const excess = (rows * cols - N) * 0.06;
    const score = mismatch + excess;
    if(!best || score < best.score){
      best = { cols, rows, score, spacingX: W / cols, spacingY: L / rows, total: cols * rows };
    }
  }
  return best;
}

function renderLayoutSvg(W, L, layout){
  const svg = document.getElementById('layoutSvg');
  const maxW = 260, maxH = 170;
  const scale = Math.min(maxW / W, maxH / L);
  const rw = W * scale, rh = L * scale;
  const offX = (300 - rw) / 2, offY = (210 - rh) / 2;
  let dots = '';
  for(let r = 0; r < layout.rows; r++){
    for(let c = 0; c < layout.cols; c++){
      const cx = offX + (c + 0.5) * (rw / layout.cols);
      const cy = offY + (r + 0.5) * (rh / layout.rows);
      dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="#e3a03a" opacity="0.95"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="12" fill="#e3a03a" opacity="0.16"/>`;
    }
  }
  svg.innerHTML = `<rect x="${offX.toFixed(1)}" y="${offY.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="none" stroke="#7fb8da" stroke-width="1.5" rx="4"/>${dots}`;
}

function updateLayoutPanel(){
  const N = currentOutput.qty;
  let W = 0, L = 0, assumedSquare = false;
  if(mode === 'dims'){
    W = parseFloat(widthInput.value) || 0;
    L = parseFloat(lengthInput.value) || 0;
  } else {
    const area = getArea();
    if(area > 0){ W = L = Math.sqrt(area); assumedSquare = true; }
  }

  if(N <= 0 || W <= 0 || L <= 0){
    layoutPanel.style.display = 'none';
    return;
  }

  const layout = suggestLayout(W, L, N);
  layoutPanel.style.display = '';
  document.getElementById('layoutGrid').textContent = layout.rows + ' × ' + layout.cols + (layout.total > N ? ' (' + layout.total + ' pts)' : '');
  document.getElementById('layoutSpacing').textContent = layout.spacingX.toFixed(2).replace('.',',') + ' × ' + layout.spacingY.toFixed(2).replace('.',',') + ' m';
  renderLayoutSvg(W, L, layout);

  const badge = document.getElementById('layoutBadge');
  let note = 'Sugestão geométrica simplificada para orientar o posicionamento em planta' + (assumedSquare ? ' (assumindo cômodo quadrado a partir da área — use Largura × Comprimento para maior precisão)' : '') + '. Para projetos luminotécnicos precisos, utilize softwares de cálculo fotométrico.';

  if(calcMode === 'full'){
    const h = parseFloat(ceilingHeight.value) || 0;
    if(h > 0){
      const hm = Math.max(h - 0.75, 0.3);
      const scMax = 1.5;
      const maxSpacing = scMax * hm;
      const actualMax = Math.max(layout.spacingX, layout.spacingY);
      badge.style.display = '';
      if(actualMax <= maxSpacing){
        badge.textContent = 'Espaçamento OK';
        badge.className = 'badge good';
      } else {
        badge.textContent = 'Acima do recomendado';
        badge.className = 'badge warn';
      }
      note += ' Critério de espaçamento (SC=1.5): máx. ' + maxSpacing.toFixed(2).replace('.',',') + ' m para pé-direito útil de ' + hm.toFixed(2).replace('.',',') + ' m.';
    } else {
      badge.style.display = 'none';
    }
  } else {
    badge.style.display = 'none';
  }
  document.getElementById('layoutNote').textContent = note;
}

// Global project lists handlers
addRoomBtn.addEventListener('click', () => {
  const area = getArea();
  if (area <= 0 || currentOutput.qty <= 0) return;

  const extra = calcMode === 'full'
    ? { cct: colorTemp.value + 'K', cri: 'IRC ' + criSelect.value, kwhMes: currentOutput.kwhMes || 0, custoMes: currentOutput.custoMes || 0 }
    : { cct: '', cri: '', kwhMes: 0, custoMes: 0 };

  savedRooms.push({
    id: Date.now(),
    name: roomLabel() + ` (${area.toFixed(1)} m²)`,
    mode: calcMode === 'lamps' ? 'Qtd. Lâmpadas' : calcMode === 'lux' ? 'Avaliação Lux' : 'Projeto Completo',
    qty: currentOutput.qty,
    watts: currentOutput.watts,
    cost: currentOutput.cost,
    cct: extra.cct,
    cri: extra.cri,
    kwhMes: extra.kwhMes,
    custoMes: extra.custoMes
  });

  updateGlobalPanel();
});

function updateGlobalPanel() {
  headRoomsStat.textContent = savedRooms.length;

  if (savedRooms.length === 0) {
    globalProjectPanel.style.display = 'none';
    return;
  }

  globalProjectPanel.style.display = '';
  roomsList.innerHTML = '';

  let totalLamps = 0;
  let totalWatts = 0;
  let totalCost = 0;
  let totalKwh = 0;
  let totalCostMes = 0;

  savedRooms.forEach(room => {
    totalLamps += room.qty;
    totalWatts += room.watts;
    totalCost += room.cost;
    totalKwh += room.kwhMes || 0;
    totalCostMes += room.custoMes || 0;

    const tagLine = [room.cct, room.cri].filter(Boolean).join(' · ');
    const div = document.createElement('div');
    div.className = 'room-item';
    div.innerHTML = `
      <div class="room-item-info">
        <span class="room-item-title">${room.name}</span>
        <span class="room-item-sub">${room.mode} · Pts: <strong>${room.qty}</strong> · ~${Math.round(room.watts)}W ${room.cost > 0 ? '· R$ ' + room.cost.toLocaleString('pt-BR') : ''}</span>
        ${tagLine ? `<span class="room-item-sub">${tagLine}</span>` : ''}
      </div>
      <button class="room-item-remove" data-id="${room.id}" title="Remover">×</button>
    `;
    roomsList.appendChild(div);
  });

  globalTotalLamps.textContent = totalLamps;
  globalTotalWatts.textContent = Math.round(totalWatts) + ' W';
  globalTotalCost.textContent = 'R$ ' + totalCost.toLocaleString('pt-BR');

  const consumptionStat = document.getElementById('globalConsumptionStat');
  if(totalKwh > 0){
    consumptionStat.style.display = '';
    globalTotalConsumption.textContent = totalKwh.toFixed(1).replace('.',',') + ' kWh/mês · R$ ' + totalCostMes.toFixed(2).replace('.',',') + '/mês';
  } else {
    consumptionStat.style.display = 'none';
  }
}

roomsList.addEventListener('click', (e) => {
  if (e.target.classList.contains('room-item-remove')) {
    const id = parseFloat(e.target.dataset.id);
    savedRooms = savedRooms.filter(r => r.id !== id);
    updateGlobalPanel();
  }
});

clearRoomsBtn.addEventListener('click', () => {
  if(savedRooms.length === 0) return;
  if(confirm('Remover todos os ambientes salvos do projeto?')){
    savedRooms = [];
    updateGlobalPanel();
  }
});

const exportBtn = document.getElementById('exportBtn');
const printReport = document.getElementById('printReport');

function buildReport(){
  const now = new Date().toLocaleString('pt-BR');
  let title = 'Relatório Técnico de Luminotécnica';

  let singleRoomHtml = '';
  if (getArea() > 0) {
    const extraFullRows = calcMode === 'full' ? `
        <tr><td>Temperatura de Cor / IRC</td><td>${colorTemp.value}K (${cctDescLabel.textContent}) · IRC ${criSelect.value}</td></tr>
        <tr><td>Refletâncias (Teto/Parede/Piso)</td><td>${reflCeiling.value}% / ${reflWall.value}% / ${reflFloor.value}%</td></tr>
        <tr><td>Fator de Utilização / Depreciação</td><td>Fu ${parseFloat(fatorUtil.value || 0).toFixed(2)} · Fd ${parseFloat(fatorDepr.value || 0).toFixed(2)}</td></tr>
        ${currentOutput.kwhMes > 0 ? `<tr><td>Consumo Mensal Estimado</td><td>${currentOutput.kwhMes.toFixed(1).replace('.',',')} kWh · R$ ${currentOutput.custoMes.toFixed(2).replace('.',',')}</td></tr>` : ''}
        <tr><td>Corrente / Circuitos</td><td>${document.getElementById('currentValue').textContent} · ${document.getElementById('circuitsValue').textContent}</td></tr>
    ` : '';
    const layoutRow = layoutPanel.style.display !== 'none'
      ? `<tr><td>Distribuição Sugerida</td><td>${document.getElementById('layoutGrid').textContent} · Espaçamento ${document.getElementById('layoutSpacing').textContent}</td></tr>`
      : '';

    singleRoomHtml = `
      <h3>Cômodo Ativo na Calculadora</h3>
      <table>
        <tr><td>Ambiente e Área</td><td>${roomLabel()} (${getArea().toFixed(1).replace('.',',')} m²)</td></tr>
        <tr><td>Modo de Cálculo</td><td>${calcMode.toUpperCase()}</td></tr>
        <tr><td>Resultado Principal</td><td><strong>${mainResult.textContent}</strong></td></tr>
        <tr><td>Subfaturamento / Info</td><td>${subResult.textContent}</td></tr>
        <tr><td>Métricas Extrapoladas</td><td>${statLabel1.textContent}: ${lampCount.textContent} | ${statLabel2.textContent}: ${wattTotal.textContent}</td></tr>
        ${extraFullRows}
        ${layoutRow}
      </table>
    `;
  }

  let multiRoomHtml = '';
  if (savedRooms.length > 0) {
    let rows = savedRooms.map(r => `
      <tr>
        <td>${r.name}</td>
        <td>${r.mode}</td>
        <td>${r.qty}</td>
        <td>${Math.round(r.watts)} W</td>
        <td>${[r.cct, r.cri].filter(Boolean).join(' / ') || '–'}</td>
        <td>${r.kwhMes ? r.kwhMes.toFixed(1).replace('.',',') + ' kWh (R$ ' + r.custoMes.toFixed(2).replace('.',',') + ')' : '–'}</td>
        <td>${r.cost > 0 ? 'R$ ' + r.cost.toLocaleString('pt-BR') : '–'}</td>
      </tr>
    `).join('');

    let tLamps = savedRooms.reduce((a, b) => a + b.qty, 0);
    let tWatts = savedRooms.reduce((a, b) => a + b.watts, 0);
    let tCost = savedRooms.reduce((a, b) => a + b.cost, 0);
    let tKwh = savedRooms.reduce((a, b) => a + (b.kwhMes || 0), 0);
    let tCostMes = savedRooms.reduce((a, b) => a + (b.custoMes || 0), 0);

    multiRoomHtml = `
      <h3>Memorial do Projeto Consolidado (Múltiplos Ambientes)</h3>
      <table>
        <thead>
          <tr>
            <th>Ambiente</th>
            <th>Metodologia</th>
            <th>Qtd Ponto / Lâmpada</th>
            <th>Potência (W)</th>
            <th>CCT / IRC</th>
            <th>Consumo Mensal</th>
            <th>Custo Previsto</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="font-weight:bold; background:#eee;">
            <td>TOTAL DO PROJETO</td>
            <td>–</td>
            <td>${tLamps}</td>
            <td>${Math.round(tWatts)} W</td>
            <td>–</td>
            <td>${tKwh > 0 ? tKwh.toFixed(1).replace('.',',') + ' kWh (R$ ' + tCostMes.toFixed(2).replace('.',',') + ')' : '–'}</td>
            <td>R$ ${tCost.toLocaleString('pt-BR')}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  printReport.innerHTML = `
    <h2>${title}</h2>
    <div class="pr-date">Gerado de forma offline em ${now}</div>
    ${singleRoomHtml}
    ${multiRoomHtml}
  `;
}

exportBtn.addEventListener('click', () => {
  buildReport();
  window.print();
});

// Setup Inicial
updateColorPreview();
updateCriHint();
autoCalculateFu();
calc();
