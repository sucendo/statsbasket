(() => {
  'use strict';

  const svg = document.getElementById('tacticalBoard');
  const boardPage = document.querySelector('.board-page');
  const boardLegend = document.querySelector('.legend');
  const drawingsLayer = document.getElementById('drawings');
  const playName = document.getElementById('playName');
  const undoBtn = document.getElementById('undoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const halfBtn = document.getElementById('halfCourtBtn');
  const fullBtn = document.getElementById('fullCourtBtn');
  const hint = document.getElementById('toolHint');
  const toolButtons = [...document.querySelectorAll('[data-tool]')];
  const pieceEls = [...svg.querySelectorAll('.piece')];

  const primaryTools = document.getElementById('primaryTools');
  const mobileSideDock = document.getElementById('mobileSideDock');
  const mobileDockTools = document.getElementById('mobileDockTools');
  const mobileDockActions = document.getElementById('mobileDockActions');
  const mobileLaunch = document.getElementById('mobileLaunch');
  const mobileLaunchBtn = document.getElementById('mobileLaunchBtn');
  const mobileAppControls = document.getElementById('mobileAppControls');
  const mobileOptionsBtn = document.getElementById('mobileOptionsBtn');
  const mobileLibraryBtn = document.getElementById('mobileLibraryBtn');
  const mobileQuickUndoBtn = document.getElementById('mobileQuickUndoBtn');
  const mobileQuickResetBtn = document.getElementById('mobileQuickResetBtn');
  const mobileOptionsPanel = document.getElementById('mobileOptionsPanel');
  const mobileOptionsClose = document.getElementById('mobileOptionsClose');
  const mobilePlayName = document.getElementById('mobilePlayName');
  const mobileHalfCourtBtn = document.getElementById('mobileHalfCourtBtn');
  const mobileFullCourtBtn = document.getElementById('mobileFullCourtBtn');
  const mobileUndoBtn = document.getElementById('mobileUndoBtn');
  const mobileResetBtn = document.getElementById('mobileResetBtn');
  const mobileClearBtn = document.getElementById('mobileClearBtn');
  const mobileResetStepsBtn = document.getElementById('mobileResetStepsBtn');
  const mobileExportBtn = document.getElementById('mobileExportBtn');
  const mobileSavePlayBtn = document.getElementById('mobileSavePlayBtn');
  const mobileExportPlayBtn = document.getElementById('mobileExportPlayBtn');
  const mobileImportPlayBtn = document.getElementById('mobileImportPlayBtn');
  const mobileExportLibraryBtn = document.getElementById('mobileExportLibraryBtn');
  const mobileImportLibraryBtn = document.getElementById('mobileImportLibraryBtn');
  const mobileImportPlayInput = document.getElementById('mobileImportPlayInput');
  const mobileImportLibraryInput = document.getElementById('mobileImportLibraryInput');
  const playLibraryList = document.getElementById('playLibraryList');
  const mobilePlayLibrarySection = document.getElementById('mobilePlayLibrarySection');
  const mobileAttackColor = document.getElementById('mobileAttackColor');
  const mobileDefenseColor = document.getElementById('mobileDefenseColor');
  const mobileStepColorSwatch = document.getElementById('mobileStepColorSwatch');
  const mobilePlayBtn = document.getElementById('mobilePlayBtn');
  const mobilePauseBtn = document.getElementById('mobilePauseBtn');
  const mobileStopBtn = document.getElementById('mobileStopBtn');
  const mobilePlaybackStatus = document.getElementById('mobilePlaybackStatus');
  const mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
  const mobileDockModeBtn = document.getElementById('mobileDockModeBtn');
  const mobileResetControlsBtn = document.getElementById('mobileResetControlsBtn');
  const mobileExitMenuBtn = document.getElementById('mobileExitMenuBtn');
  const mobileToast = document.getElementById('mobileToast');

  const desktopPlayBtn = document.getElementById('desktopPlayBtn');
  const desktopPauseBtn = document.getElementById('desktopPauseBtn');
  const desktopStopBtn = document.getElementById('desktopStopBtn');
  const desktopPlaybackStatus = document.getElementById('desktopPlaybackStatus');
  const desktopAttackColor = document.getElementById('desktopAttackColor');
  const desktopDefenseColor = document.getElementById('desktopDefenseColor');
  const desktopClearStepsBtn = document.getElementById('desktopClearStepsBtn');
  const desktopSavePlayBtn = document.getElementById('desktopSavePlayBtn');
  const desktopExportPlayBtn = document.getElementById('desktopExportPlayBtn');
  const desktopImportPlayBtn = document.getElementById('desktopImportPlayBtn');
  const desktopExportLibraryBtn = document.getElementById('desktopExportLibraryBtn');
  const desktopImportLibraryBtn = document.getElementById('desktopImportLibraryBtn');
  const desktopPlayLibraryList = document.getElementById('desktopPlayLibraryList');

  const STORAGE_KEY = 'statsbasket.pizarra.v2';
  const LIBRARY_KEY = 'statsbasket.pizarra.library.v1';
  const MOBILE_POS_PREFIX = 'statsbasket.pizarra.mobile.pos.';
  const MOBILE_DOCK_FLOAT_KEY = 'statsbasket.pizarra.mobile.dockFloating';
  const isMobileBoard = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) ||
    (window.matchMedia('(pointer:coarse)').matches && Math.min(screen.width,screen.height) <= 700);

  function mobileModeFromViewport(){
    return window.innerHeight >= window.innerWidth ? 'half' : 'full';
  }

  const defaults = {
    half: {
      a1:[975,375], a2:[1080,165], a3:[1080,585], a4:[1230,250], a5:[1230,500],
      d1:[1040,375], d2:[1140,205], d3:[1140,545], d4:[1290,305], d5:[1290,445],
      ball:[915,420]
    },
    full: {
      a1:[330,375], a2:[460,165], a3:[460,585], a4:[590,260], a5:[590,490],
      d1:[820,375], d2:[955,180], d3:[955,570], d4:[1110,270], d5:[1110,480],
      ball:[270,420]
    }
  };

  const freshBoard = mode => ({
    pieces:Object.fromEntries(Object.entries(defaults[mode]).map(([id,p]) => [id,{x:p[0],y:p[1]}])),
    drawings:[]
  });

  const state = {
    view:'half',
    tool:'move',
    boards:{half:freshBoard('half'),full:freshBoard('full')},
    playName:'',
    colors:{attack:'#df1c31',defense:'#004f7c',step:'#16a34a',stepText:'#ffffff'}
  };

  let undoStack = [];
  let interaction = null;
  let previewPath = null;
  const playback = {
    running:false,
    paused:false,
    raf:0,
    phaseIndex:0,
    phaseStart:0,
    phaseElapsed:0,
    phases:[],
    snapshot:null,
    positions:null
  };

  function clone(value){ return JSON.parse(JSON.stringify(value)); }

  function load(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if(!saved || typeof saved !== 'object') return;
      if(saved.view === 'half' || saved.view === 'full') state.view = saved.view;
      state.playName = String(saved.playName || '');
      if(saved.colors && typeof saved.colors === 'object'){
        if(/^#[0-9a-f]{6}$/i.test(saved.colors.attack || '')) state.colors.attack=saved.colors.attack;
        if(/^#[0-9a-f]{6}$/i.test(saved.colors.defense || '')) state.colors.defense=saved.colors.defense;
      }
      ['half','full'].forEach(mode => {
        const src = saved.boards?.[mode];
        if(!src) return;
        const next = freshBoard(mode);
        Object.keys(next.pieces).forEach(id => {
          if(Number.isFinite(src.pieces?.[id]?.x) && Number.isFinite(src.pieces?.[id]?.y)){
            next.pieces[id] = {x:Number(src.pieces[id].x),y:Number(src.pieces[id].y)};
          }
        });
        next.drawings = [];
        if(Array.isArray(src.drawings)){
          let inferredPhase=1;
          src.drawings.filter(validDrawing).forEach(raw=>{
            const normalized=normalizeDrawing(raw);
            if(normalized.type==='step'){
              inferredPhase=Math.max(1,Number(normalized.n)||inferredPhase);
            }else if(!Number.isFinite(Number(raw.phase))){
              normalized.phase=inferredPhase;
            }
            next.drawings.push(normalized);
          });
        }
        state.boards[mode] = next;
      });
    }catch(_){}
  }

  function save(){
    try{
      state.playName = playName.value.trim();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        view:state.view,
        playName:state.playName,
        colors:{attack:state.colors.attack,defense:state.colors.defense},
        boards:state.boards
      }));
    }catch(_){}
  }

  function validPoint(p){
    return p && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y));
  }

  function validDrawing(d){
    if(!d || !['arrow','pass','dribble','screen','shot','step'].includes(d.type)) return false;
    if(d.type === 'step'){
      return [d.x,d.y,d.n].every(v => Number.isFinite(Number(v)));
    }
    if(['arrow','pass','dribble','screen','shot'].includes(d.type) && Array.isArray(d.points) && d.points.length >= 2){
      return d.points.every(validPoint);
    }
    return [d.x1,d.y1,d.x2,d.y2].every(v => Number.isFinite(Number(v)));
  }

  function normalizeDrawing(d){
    if(d.type === 'step'){
      return {
        id:String(d.id || ('d'+Date.now())),
        type:'step',
        x:Number(d.x),y:Number(d.y),n:Number(d.n)
      };
    }
    const type=['pass','dribble','screen','shot'].includes(d.type) ? d.type : 'arrow';
    const normalized={
      id:String(d.id || ('d'+Date.now())),
      type,
      x1:Number(d.x1),y1:Number(d.y1),x2:Number(d.x2),y2:Number(d.y2),
      phase:Math.max(1,Number(d.phase)||1)
    };
    if(typeof d.pieceId === 'string') normalized.pieceId=d.pieceId;
    if(typeof d.fromId === 'string') normalized.fromId=d.fromId;
    if(typeof d.toId === 'string') normalized.toId=d.toId;
    if(['arrow','pass','dribble','screen','shot'].includes(type) && Array.isArray(d.points) && d.points.length >= 2){
      normalized.points=d.points.filter(validPoint).map(p=>({x:Number(p.x),y:Number(p.y)}));
      if(normalized.points.length >= 2){
        normalized.x1=normalized.points[0].x;
        normalized.y1=normalized.points[0].y;
        const last=normalized.points[normalized.points.length-1];
        normalized.x2=last.x;
        normalized.y2=last.y;
      }
    }
    return normalized;
  }


  function normalizePlayData(raw){
    const src=(raw && raw.play && typeof raw.play==='object') ? raw.play : raw;
    if(!src || typeof src!=='object') throw new Error('Formato de jugada no válido');

    const result={
      version:1,
      view:(src.view==='full' ? 'full' : 'half'),
      playName:String(src.playName || src.name || '').slice(0,60),
      colors:{
        attack:/^#[0-9a-f]{6}$/i.test(src.colors?.attack || '') ? src.colors.attack : '#df1c31',
        defense:/^#[0-9a-f]{6}$/i.test(src.colors?.defense || '') ? src.colors.defense : '#004f7c'
      },
      boards:{half:freshBoard('half'),full:freshBoard('full')}
    };

    ['half','full'].forEach(mode=>{
      const source=src.boards?.[mode];
      if(!source) return;
      const next=freshBoard(mode);

      Object.keys(next.pieces).forEach(id=>{
        const p=source.pieces?.[id];
        if(Number.isFinite(Number(p?.x)) && Number.isFinite(Number(p?.y))){
          next.pieces[id]={x:Number(p.x),y:Number(p.y)};
        }
      });

      next.drawings=[];
      if(Array.isArray(source.drawings)){
        let inferredPhase=1;
        source.drawings.filter(validDrawing).forEach(rawDrawing=>{
          const d=normalizeDrawing(rawDrawing);
          if(d.type==='step'){
            inferredPhase=Math.max(1,Number(d.n)||inferredPhase);
          }else if(!Number.isFinite(Number(rawDrawing.phase))){
            d.phase=inferredPhase;
          }
          next.drawings.push(d);
        });
      }

      result.boards[mode]=next;
    });

    return result;
  }

  function currentPlayData(){
    state.playName=playName.value.trim();
    return {
      version:1,
      view:state.view,
      playName:state.playName,
      colors:{attack:state.colors.attack,defense:state.colors.defense},
      boards:clone(state.boards)
    };
  }

  function applyPlayData(raw,{orient=true}={}){
    const play=normalizePlayData(raw);
    if(playback.running) stopPlayback(true);

    state.boards=clone(play.boards);
    state.playName=play.playName;
    state.colors.attack=play.colors.attack;
    state.colors.defense=play.colors.defense;

    playName.value=state.playName;
    if(mobilePlayName) mobilePlayName.value=state.playName;

    applyBoardColors();
    undoStack=[];
    setView(play.view,{ignoreMobileLock:isMobileBoard});
    updateUndo();
    render();
    save();

    if(isMobileBoard && orient){
      enterMobilePresentation(play.view,{ensureFullscreen:false});
    }
    return play;
  }

  function makeLibraryId(){
    try{
      if(globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    }catch(_){}
    return 'play-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);
  }

  function readPlayLibrary(){
    try{
      const parsed=JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter(entry=>entry && typeof entry==='object' && entry.play) : [];
    }catch(_){
      return [];
    }
  }

  function writePlayLibrary(entries){
    try{
      localStorage.setItem(LIBRARY_KEY,JSON.stringify(entries));
      return true;
    }catch(_){
      showMobileToast('No se ha podido guardar la biblioteca en este dispositivo.');
      return false;
    }
  }

  function safeFileName(value,fallback='jugada'){
    const text=String(value || fallback)
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9_-]+/gi,'-')
      .replace(/^-+|-+$/g,'');
    return text || fallback;
  }

  function downloadJson(data,fileName){
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
  }

  function formatLibraryDate(value){
    const date=new Date(value);
    if(Number.isNaN(date.getTime())) return '';
    try{
      return new Intl.DateTimeFormat('es-ES',{
        day:'2-digit',month:'2-digit',year:'2-digit',
        hour:'2-digit',minute:'2-digit'
      }).format(date);
    }catch(_){
      return date.toLocaleString();
    }
  }

  function renderPlayLibrary(){
    const containers=[playLibraryList,desktopPlayLibraryList].filter(Boolean);
    if(!containers.length) return;
    containers.forEach(container=>container.replaceChildren());

    const entries=readPlayLibrary().sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
    if(!entries.length){
      containers.forEach(container=>{
        const empty=document.createElement('div');
        empty.className='play-library-empty';
        empty.textContent='Todavía no hay jugadas guardadas.';
        container.appendChild(empty);
      });
      return;
    }

    entries.forEach(entry=>{
      let play;
      try{ play=normalizePlayData(entry.play); }catch(_){ return; }

      const item=document.createElement('article');
      item.className='play-library-item';
      item.dataset.libraryId=entry.id;

      const head=document.createElement('div');
      head.className='play-library-item-head';

      const title=document.createElement('strong');
      title.textContent=entry.name || play.playName || 'Jugada sin nombre';

      const meta=document.createElement('span');
      meta.textContent=(play.view==='full' ? 'Pista completa' : 'Media pista')+
        (entry.updatedAt ? ' · '+formatLibraryDate(entry.updatedAt) : '');

      head.append(title,meta);

      const actions=document.createElement('div');
      actions.className='play-library-item-actions';

      [
        ['load','Cargar'],
        ['duplicate','Duplicar'],
        ['export','Exportar'],
        ['delete','Eliminar']
      ].forEach(([action,label])=>{
        const button=document.createElement('button');
        button.type='button';
        button.dataset.libraryAction=action;
        button.dataset.libraryId=entry.id;
        button.textContent=label;
        if(action==='delete') button.classList.add('danger');
        actions.appendChild(button);
      });

      item.append(head,actions);
      containers.forEach(container=>container.appendChild(item.cloneNode(true)));
    });
  }

  function saveCurrentToLibrary(){
    save();
    const entries=readPlayLibrary();
    let name=playName.value.trim();

    if(!name){
      name='Jugada '+(entries.length+1);
      playName.value=name;
      if(mobilePlayName) mobilePlayName.value=name;
      save();
    }

    const existing=entries.find(entry=>String(entry.name||'').trim().toLowerCase()===name.toLowerCase());
    const now=new Date().toISOString();
    const entry={
      id:existing?.id || makeLibraryId(),
      name,
      createdAt:existing?.createdAt || now,
      updatedAt:now,
      play:currentPlayData()
    };

    const next=existing
      ? entries.map(item=>item.id===existing.id ? entry : item)
      : [entry,...entries];

    if(writePlayLibrary(next)){
      renderPlayLibrary();
      showMobileToast(existing ? 'Jugada actualizada en la biblioteca.' : 'Jugada guardada en la biblioteca.');
    }
  }

  function exportCurrentPlay(){
    const play=currentPlayData();
    const name=play.playName || 'jugada-statsbasket';
    downloadJson({
      format:'statsbasket-play',
      version:1,
      exportedAt:new Date().toISOString(),
      play
    },safeFileName(name,'jugada-statsbasket')+'.json');
  }

  async function importPlayFile(file){
    const text=await file.text();
    const parsed=JSON.parse(text);
    const play=normalizePlayData(parsed);

    const entries=readPlayLibrary();
    const now=new Date().toISOString();
    const name=play.playName || file.name.replace(/\.json$/i,'') || 'Jugada importada';
    play.playName=name;

    applyPlayData(play);

    const entry={
      id:makeLibraryId(),
      name,
      createdAt:now,
      updatedAt:now,
      play
    };

    writePlayLibrary([entry,...entries]);
    renderPlayLibrary();
    showMobileToast('Jugada importada y cargada.');
  }

  function exportLibrary(){
    const entries=readPlayLibrary();
    if(!entries.length){
      showMobileToast('No hay jugadas guardadas para exportar.');
      return;
    }
    downloadJson({
      format:'statsbasket-play-library',
      version:1,
      exportedAt:new Date().toISOString(),
      entries
    },'statsbasket-biblioteca-jugadas.json');
  }

  async function importLibraryFile(file){
    const text=await file.text();
    const parsed=JSON.parse(text);
    const sourceEntries=Array.isArray(parsed) ? parsed : parsed?.entries;
    if(!Array.isArray(sourceEntries)) throw new Error('Formato de biblioteca no válido');

    const current=readPlayLibrary();
    const imported=[];

    sourceEntries.forEach(source=>{
      try{
        const play=normalizePlayData(source.play || source);
        const now=new Date().toISOString();
        imported.push({
          id:makeLibraryId(),
          name:String(source.name || play.playName || 'Jugada importada').slice(0,60),
          createdAt:source.createdAt || now,
          updatedAt:source.updatedAt || now,
          play
        });
      }catch(_){}
    });

    if(!imported.length) throw new Error('No se han encontrado jugadas válidas');
    writePlayLibrary([...imported,...current]);
    renderPlayLibrary();
    showMobileToast(imported.length+' jugada'+(imported.length===1?' importada.':'s importadas.'));
  }

  function nextStepNumber(){
    const nums=board().drawings.filter(d=>d.type==='step').map(d=>Number(d.n)||0);
    return (nums.length ? Math.max(...nums) : 0) + 1;
  }

  function currentPhase(){
    const nums=board().drawings.filter(d=>d.type==='step').map(d=>Number(d.n)||0);
    return nums.length ? Math.max(...nums) : 1;
  }

  function plannedPlayerPositions(beforePhase=currentPhase()){
    const positions=clone(board().pieces);
    board().drawings.forEach(d=>{
      if(d.type==='step') return;
      const phase=Math.max(1,Number(d.phase)||1);
      if(phase>=beforePhase || !d.pieceId || !positions[d.pieceId]) return;
      positions[d.pieceId]={x:Number(d.x2),y:Number(d.y2)};
    });
    return positions;
  }

  function nearestPlayer(pos,maxDistance=92,phase=currentPhase()){
    let best=null,bestDistance=maxDistance;
    const positions=plannedPlayerPositions(phase);
    Object.entries(positions).forEach(([id,p])=>{
      if(id==='ball') return;
      const distance=Math.hypot(p.x-pos.x,p.y-pos.y);
      if(distance<bestDistance){
        bestDistance=distance;
        best=id;
      }
    });
    return best;
  }

  function hexRgb(hex){
    const m=String(hex||'').match(/^#([0-9a-f]{6})$/i);
    if(!m) return {r:0,g:0,b:0};
    const n=parseInt(m[1],16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }

  function colorDistance(a,b){
    const A=hexRgb(a),B=hexRgb(b);
    const dr=A.r-B.r,dg=A.g-B.g,db=A.b-B.b;
    return Math.sqrt(dr*dr+dg*dg+db*db);
  }

  function readableText(hex){
    const {r,g,b}=hexRgb(hex);
    const lum=(0.299*r+0.587*g+0.114*b);
    return lum>155 ? '#10202a' : '#ffffff';
  }

  function pickStepColor(attack,defense){
    const palette=['#16a34a','#7c3aed','#f4c430','#0891b2','#d946ef','#111827','#ea580c','#0f766e'];
    let best=palette[0],bestScore=-1;
    palette.forEach(color=>{
      const score=Math.min(colorDistance(color,attack),colorDistance(color,defense));
      if(score>bestScore){bestScore=score;best=color;}
    });
    return best;
  }

  function applyBoardColors(){
    state.colors.step=pickStepColor(state.colors.attack,state.colors.defense);
    state.colors.stepText=readableText(state.colors.step);
    const root=document.documentElement;
    root.style.setProperty('--attack-color',state.colors.attack);
    root.style.setProperty('--defense-color',state.colors.defense);
    root.style.setProperty('--step-color',state.colors.step);
    root.style.setProperty('--step-text',state.colors.stepText);
    if(mobileAttackColor) mobileAttackColor.value=state.colors.attack;
    if(mobileDefenseColor) mobileDefenseColor.value=state.colors.defense;
    if(desktopAttackColor) desktopAttackColor.value=state.colors.attack;
    if(desktopDefenseColor) desktopDefenseColor.value=state.colors.defense;
    if(mobileStepColorSwatch) mobileStepColorSwatch.style.background=state.colors.step;
  }

  function board(){ return state.boards[state.view]; }

  function pushUndo(){
    undoStack.push(clone(board()));
    if(undoStack.length > 40) undoStack.shift();
    updateUndo();
  }

  function updateUndo(){
    const disabled = undoStack.length === 0;
    undoBtn.disabled = disabled;
    if(mobileUndoBtn) mobileUndoBtn.disabled = disabled;
    if(mobileQuickUndoBtn) mobileQuickUndoBtn.disabled = disabled;
  }

  function setView(mode,{ignoreMobileLock=false}={}){
    if(mode !== 'half' && mode !== 'full') return;
    if(isMobileBoard && !ignoreMobileLock) mode=mobileModeFromViewport();
    if(playback.running) stopPlayback(true);
    state.view = mode;
    undoStack = [];
    updateUndo();
    if(mode === 'half'){
      svg.setAttribute('viewBox','700 0 700 750');
      svg.classList.remove('full-court');
    }else{
      svg.setAttribute('viewBox','0 0 1400 750');
      svg.classList.add('full-court');
    }
    halfBtn.classList.toggle('active-view',mode === 'half');
    fullBtn.classList.toggle('active-view',mode === 'full');
    halfBtn.setAttribute('aria-pressed',mode === 'half' ? 'true':'false');
    fullBtn.setAttribute('aria-pressed',mode === 'full' ? 'true':'false');
    document.body.classList.toggle('view-half',mode === 'half');
    document.body.classList.toggle('view-full',mode === 'full');
    if(isMobileBoard) placeMobileDock();
    syncMobileViewButtons();
    render();
    save();
  }

  function setTool(tool){
    if(!['move','arrow','dribble','pass','screen','shot','step','erase'].includes(tool)) return;
    state.tool = tool;
    toolButtons.forEach(btn => {
      const active = btn.dataset.tool === tool;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active ? 'true':'false');
    });
    svg.classList.toggle('drawing-tool',['arrow','dribble','pass','screen','shot'].includes(tool));
    const messages = {
      move:'Mover: arrastra jugadores y balón.',
      arrow:'Movimiento: línea continua con flecha.',
      dribble:'Bote: movimiento con balón en zigzag.',
      pass:'Pase: línea discontinua con flecha.',
      screen:'Bloqueo: arrastra para colocar un bloqueo terminado en T.',
      shot:'Tiro: dibuja con el dedo la trayectoria del lanzamiento.',
      step:'Paso: toca la pista para numerar la secuencia 1, 2, 3…',
      erase:'Borrador: toca cualquier trazo o paso para eliminarlo.'
    };
    hint.textContent = messages[tool];
  }

  function renderPieces(){
    const b = board();
    pieceEls.forEach(el => {
      const p = b.pieces[el.dataset.piece];
      if(p) el.setAttribute('transform',`translate(${p.x} ${p.y})`);
    });
  }

  function zigzagPath(x1,y1,x2,y2){
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
    if(len<2) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const px=-dy/len,py=dx/len;
    const spacing=20,amp=7,steps=Math.max(2,Math.floor(len/spacing));
    let path=`M ${x1} ${y1}`;
    for(let i=1;i<steps;i++){
      const t=i/steps;
      const offset=(i%2?1:-1)*amp;
      const x=x1+dx*t+px*offset;
      const y=y1+dy*t+py*offset;
      path+=` L ${x} ${y}`;
    }
    return path+` L ${x2} ${y2}`;
  }

  function drawingPoints(d){
    if(Array.isArray(d.points) && d.points.length >= 2) return d.points;
    return [{x:d.x1,y:d.y1},{x:d.x2,y:d.y2}];
  }

  function smoothPath(points){
    if(!points?.length) return '';
    if(points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if(points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    let d=`M ${points[0].x} ${points[0].y}`;
    for(let i=1;i<points.length-1;i++){
      const p=points[i],n=points[i+1];
      const mx=(p.x+n.x)/2,my=(p.y+n.y)/2;
      d+=` Q ${p.x} ${p.y} ${mx} ${my}`;
    }
    const last=points[points.length-1];
    d+=` L ${last.x} ${last.y}`;
    return d;
  }

  function polylineLength(points){
    let len=0;
    for(let i=1;i<points.length;i++) len+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
    return len;
  }

  function dribblePath(points){
    if(!points || points.length < 2) return '';
    const out=[points[0]];
    let flip=1;
    const amp=6;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i];
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      const px=-dy/len,py=dx/len;
      if(i<points.length-1){
        out.push({x:b.x+px*amp*flip,y:b.y+py*amp*flip});
        flip*=-1;
      }else{
        out.push({x:b.x,y:b.y});
      }
    }
    return smoothPath(out);
  }

  function screenCap(d){
    const pts=drawingPoints(d);
    const end=pts[pts.length-1] || {x:d.x2,y:d.y2};
    const prev=pts[pts.length-2] || {x:d.x1,y:d.y1};
    const dx=end.x-prev.x,dy=end.y-prev.y,len=Math.hypot(dx,dy)||1;
    const px=-dy/len,py=dx/len,half=22;
    return {
      x1:end.x+px*half,y1:end.y+py*half,
      x2:end.x-px*half,y2:end.y-py*half
    };
  }

  function drawingElement(d,preview=false){
    const ns='http://www.w3.org/2000/svg';

    if(d.type === 'step'){
      const g=document.createElementNS(ns,'g');
      g.setAttribute('class',`step-marker${preview?' preview':''}`);
      if(!preview){
        g.dataset.drawingId=d.id;
        g.dataset.phase=String(d.n || 1);
      }
      const circle=document.createElementNS(ns,'circle');
      circle.setAttribute('cx',d.x);circle.setAttribute('cy',d.y);circle.setAttribute('r','24');
      const text=document.createElementNS(ns,'text');
      text.setAttribute('x',d.x);text.setAttribute('y',d.y);
      text.textContent=String(d.n);
      g.append(circle,text);
      return g;
    }

    if(d.type === 'screen'){
      const g=document.createElementNS(ns,'g');
      g.setAttribute('class',`screen-drawing${preview?' preview':''}`);
      if(!preview){
        g.dataset.drawingId=d.id;
        g.dataset.phase=String(d.phase || 1);
      }
      const path=document.createElementNS(ns,'path');
      path.setAttribute('d',smoothPath(drawingPoints(d)));
      path.setAttribute('class','draw-path screen');
      const cap=screenCap(d);
      const line=document.createElementNS(ns,'line');
      line.setAttribute('x1',cap.x1);line.setAttribute('y1',cap.y1);
      line.setAttribute('x2',cap.x2);line.setAttribute('y2',cap.y2);
      line.setAttribute('class','screen-cap');
      g.append(path,line);
      return g;
    }

    const path=document.createElementNS(ns,'path');
    const pts=drawingPoints(d);
    const pathData=d.type === 'dribble' ? dribblePath(pts) : smoothPath(pts);
    path.setAttribute('d',pathData);
    path.setAttribute('class',`draw-path ${d.type === 'pass' ? 'pass' : d.type === 'dribble' ? 'dribble' : d.type === 'shot' ? 'shot' : 'move'}${preview?' preview':''}`);
    if(!preview){
      path.dataset.drawingId=d.id;
      path.dataset.phase=String(d.phase || 1);
    }
    return path;
  }

  function updatePreviewElement(el,d){
    if(!el) return;
    if(d.type === 'screen'){
      const path=el.querySelector('path');
      const line=el.querySelector('line');
      path?.setAttribute('d',smoothPath(drawingPoints(d)));
      const cap=screenCap(d);
      if(line){
        line.setAttribute('x1',cap.x1);line.setAttribute('y1',cap.y1);
        line.setAttribute('x2',cap.x2);line.setAttribute('y2',cap.y2);
      }
      return;
    }
    const pts=drawingPoints(d);
    const pathData=d.type === 'dribble' ? dribblePath(pts) : smoothPath(pts);
    el.setAttribute('d',pathData);
  }

  function renderDrawings(){
    drawingsLayer.replaceChildren();
    board().drawings.forEach(d => drawingsLayer.appendChild(drawingElement(d)));
  }

  function render(){
    renderPieces();
    renderDrawings();
  }

  function svgPoint(evt){
    const point = svg.createSVGPoint();
    point.x = evt.clientX;
    point.y = evt.clientY;
    const matrix = svg.getScreenCTM();
    if(!matrix) return {x:0,y:0};
    const p = point.matrixTransform(matrix.inverse());
    return {x:p.x,y:p.y};
  }

  function limits(){
    return state.view === 'half'
      ? {minX:735,maxX:1365,minY:45,maxY:705}
      : {minX:45,maxX:1355,minY:45,maxY:705};
  }

  function clampPiece(pos){
    const l = limits();
    return {
      x:Math.max(l.minX,Math.min(l.maxX,pos.x)),
      y:Math.max(l.minY,Math.min(l.maxY,pos.y))
    };
  }

  pieceEls.forEach(el => {
    el.addEventListener('pointerdown',evt => {
      if(playback.running || state.tool !== 'move') return;
      evt.preventDefault();
      const id = el.dataset.piece;
      const p = board().pieces[id];
      if(!p) return;
      const q = svgPoint(evt);
      pushUndo();
      interaction = {
        kind:'piece',
        id,
        pointerId:evt.pointerId,
        dx:q.x-p.x,
        dy:q.y-p.y
      };
      el.classList.add('dragging');
      try{ svg.setPointerCapture(evt.pointerId); }catch(_){}
    });

    el.addEventListener('keydown',evt => {
      if(state.tool !== 'move') return;
      const step = evt.shiftKey ? 4 : 12;
      let dx=0,dy=0;
      if(evt.key === 'ArrowLeft') dx=-step;
      else if(evt.key === 'ArrowRight') dx=step;
      else if(evt.key === 'ArrowUp') dy=-step;
      else if(evt.key === 'ArrowDown') dy=step;
      else return;
      evt.preventDefault();
      pushUndo();
      const id = el.dataset.piece;
      const p = board().pieces[id];
      board().pieces[id] = clampPiece({x:p.x+dx,y:p.y+dy});
      renderPieces();
      save();
    });
  });

  svg.addEventListener('pointerdown',evt => {
    if(playback.running) return;
    if(state.tool === 'erase'){
      const path = evt.target.closest?.('[data-drawing-id]');
      if(path){
        evt.preventDefault();
        pushUndo();
        const id = path.dataset.drawingId;
        board().drawings = board().drawings.filter(d => d.id !== id);
        renderDrawings();
        save();
      }
      return;
    }

    if(state.tool === 'step'){
      const existingStep=evt.target.closest?.('.step-marker[data-drawing-id]');
      if(existingStep){
        evt.preventDefault();
        const id=existingStep.dataset.drawingId;
        const drawing=board().drawings.find(d=>d.id===id && d.type==='step');
        if(drawing){
          pushUndo();
          const maxStep=Math.max(1,...board().drawings.filter(d=>d.type==='step').map(d=>Number(d.n)||1));
          const previousNumber=Number(drawing.n)||1;
          const nextNumber=previousNumber>1 ? previousNumber-1 : maxStep;
          drawing.n=nextNumber;
          board().drawings.forEach(d=>{
            if(d.type!=='step' && Number(d.phase)===previousNumber) d.phase=nextNumber;
          });
          renderDrawings();
          save();
        }
        return;
      }

      evt.preventDefault();
      const p=svgPoint(evt);
      pushUndo();
      board().drawings.push({
        id:'d'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
        type:'step',x:p.x,y:p.y,n:nextStepNumber()
      });
      renderDrawings();
      save();
      return;
    }

    if(!['arrow','dribble','pass','screen','shot'].includes(state.tool)) return;
    evt.preventDefault();
    const p = svgPoint(evt);
    pushUndo();
    interaction = {
      kind:'draw',
      pointerId:evt.pointerId,
      type:state.tool,
      x1:p.x,y1:p.y,x2:p.x,y2:p.y,
      phase:currentPhase(),
      pieceId:['arrow','dribble','screen'].includes(state.tool) ? nearestPlayer(p) : null,
      fromId:['pass','shot'].includes(state.tool) ? nearestPlayer(p) : null,
      points:['arrow','dribble','pass','screen','shot'].includes(state.tool) ? [{x:p.x,y:p.y}] : null
    };
    previewPath = drawingElement(interaction,true);
    drawingsLayer.appendChild(previewPath);
    try{ svg.setPointerCapture(evt.pointerId); }catch(_){}
  });

  svg.addEventListener('pointermove',evt => {
    if(!interaction || evt.pointerId !== interaction.pointerId) return;
    evt.preventDefault();
    const p = svgPoint(evt);
    if(interaction.kind === 'piece'){
      board().pieces[interaction.id] = clampPiece({x:p.x-interaction.dx,y:p.y-interaction.dy});
      renderPieces();
    }else if(interaction.kind === 'draw'){
      interaction.x2=p.x;
      interaction.y2=p.y;
      if(Array.isArray(interaction.points)){
        const last=interaction.points[interaction.points.length-1];
        if(!last || Math.hypot(p.x-last.x,p.y-last.y) >= 7){
          interaction.points.push({x:p.x,y:p.y});
        }
      }
      updatePreviewElement(previewPath,interaction);
    }
  });

  function finishInteraction(evt){
    if(!interaction || evt.pointerId !== interaction.pointerId) return;
    if(interaction.kind === 'piece'){
      const el = svg.querySelector(`[data-piece="${interaction.id}"]`);
      el?.classList.remove('dragging');
      save();
    }else if(interaction.kind === 'draw'){
      previewPath?.remove();
      previewPath=null;
      const traced=Array.isArray(interaction.points) ? interaction.points : null;
      if(traced && traced.length){
        const last=traced[traced.length-1];
        if(Math.hypot(interaction.x2-last.x,interaction.y2-last.y) >= 2) traced.push({x:interaction.x2,y:interaction.y2});
      }
      const length=traced ? polylineLength(traced) : Math.hypot(interaction.x2-interaction.x1,interaction.y2-interaction.y1);
      if(length >= 18){
        const drawing={
          id:'d'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
          type:interaction.type,
          x1:interaction.x1,y1:interaction.y1,
          x2:interaction.x2,y2:interaction.y2,
          phase:interaction.phase || 1
        };
        if(interaction.pieceId) drawing.pieceId=interaction.pieceId;
        if(interaction.fromId) drawing.fromId=interaction.fromId;
        if(interaction.type==='pass'){
          const toId=nearestPlayer({x:interaction.x2,y:interaction.y2});
          if(toId) drawing.toId=toId;
        }
        if(traced && traced.length >= 2) drawing.points=traced;
        drawing.phase=spatialPhaseForDrawing(drawing) || drawing.phase;
        board().drawings.push(drawing);
        renderDrawings();
        save();
      }else{
        undoStack.pop();
        updateUndo();
      }
    }
    interaction=null;
    try{ svg.releasePointerCapture(evt.pointerId); }catch(_){}
  }

  svg.addEventListener('pointerup',finishInteraction);
  svg.addEventListener('pointercancel',finishInteraction);

  toolButtons.forEach(btn => btn.addEventListener('click',() => setTool(btn.dataset.tool)));

  halfBtn.addEventListener('click',() => setView('half'));
  fullBtn.addEventListener('click',() => setView('full'));

  undoBtn.addEventListener('click',() => {
    if(!undoStack.length) return;
    state.boards[state.view] = undoStack.pop();
    updateUndo();
    render();
    save();
  });

  resetBtn.addEventListener('click',() => {
    pushUndo();
    board().pieces = freshBoard(state.view).pieces;
    renderPieces();
    save();
  });

  clearBtn.addEventListener('click',() => {
    if(!board().drawings.some(d=>d.type!=='step')) return;
    if(playback.running) stopPlayback(true);
    pushUndo();
    board().drawings = board().drawings.filter(d=>d.type==='step');
    renderDrawings();
    save();
    setPlaybackStatus('Trazos borrados; los pasos se conservan.');
  });

  playName.addEventListener('input',() => {
    if(mobilePlayName && mobilePlayName.value !== playName.value) mobilePlayName.value = playName.value;
    save();
  });


  function playbackPoints(d){
    return drawingPoints(d);
  }

  function distancePointToSegment(p,a,b){
    const dx=b.x-a.x,dy=b.y-a.y;
    const len2=dx*dx+dy*dy;
    if(!len2) return Math.hypot(p.x-a.x,p.y-a.y);
    const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len2));
    const x=a.x+t*dx,y=a.y+t*dy;
    return Math.hypot(p.x-x,p.y-y);
  }

  function distanceStepToDrawing(step,d){
    const points=playbackPoints(d);
    if(!points?.length) return Infinity;
    if(points.length===1) return Math.hypot(step.x-points[0].x,step.y-points[0].y);
    let best=Infinity;
    for(let i=1;i<points.length;i++){
      best=Math.min(best,distancePointToSegment(step,points[i-1],points[i]));
    }
    return best;
  }

  function spatialPhaseForDrawing(d,maxDistance=210){
    const steps=board().drawings.filter(item=>item.type==='step');
    if(!steps.length) return null;
    let best=null,bestDistance=maxDistance;
    steps.forEach(step=>{
      const distance=distanceStepToDrawing(step,d);
      if(distance<bestDistance){
        bestDistance=distance;
        best=Math.max(1,Number(step.n)||1);
      }
    });
    return best;
  }

  function pointAtPolyline(points,t){
    if(!points?.length) return {x:0,y:0};
    if(points.length===1) return {x:points[0].x,y:points[0].y};
    const lengths=[];
    let total=0;
    for(let i=1;i<points.length;i++){
      const len=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
      lengths.push(len);
      total+=len;
    }
    if(total<=0) return {x:points[points.length-1].x,y:points[points.length-1].y};
    let target=Math.max(0,Math.min(1,t))*total;
    for(let i=0;i<lengths.length;i++){
      if(target<=lengths[i] || i===lengths.length-1){
        const a=points[i],b=points[i+1];
        const local=lengths[i] ? target/lengths[i] : 1;
        return {x:a.x+(b.x-a.x)*local,y:a.y+(b.y-a.y)*local};
      }
      target-=lengths[i];
    }
    return {x:points[points.length-1].x,y:points[points.length-1].y};
  }

  function movePieceDom(id,pos){
    const el=svg.querySelector('[data-piece="'+id+'"]');
    if(el) el.setAttribute('transform','translate('+pos.x+' '+pos.y+')');
    if(playback.positions && id) playback.positions[id]={x:pos.x,y:pos.y};
  }

  function nearestInPositions(pos,positions,maxDistance=110){
    let best=null,bestDistance=maxDistance;
    Object.entries(positions).forEach(([id,p])=>{
      if(id==='ball') return;
      const distance=Math.hypot(p.x-pos.x,p.y-pos.y);
      if(distance<bestDistance){
        bestDistance=distance;
        best=id;
      }
    });
    return best;
  }

  function playbackPhases(){
    const raw=board().drawings
      .filter(d=>d.type!=='step')
      .map((d,index)=>({
        d:{...d},
        index,
        phase:spatialPhaseForDrawing(d) || Math.max(1,Number(d.phase)||1)
      }));
    const numbers=[...new Set(raw.map(a=>a.phase))].sort((a,b)=>a-b);
    const predicted=clone(board().pieces);

    return numbers.map(number=>{
      const actions=raw.filter(a=>a.phase===number).sort((a,b)=>a.index-b.index);
      const phaseStart=clone(predicted);

      actions.forEach(action=>{
        const d=action.d;
        if(['arrow','dribble','screen'].includes(d.type) && !d.pieceId){
          d.pieceId=nearestInPositions({x:d.x1,y:d.y1},phaseStart);
        }
        if(d.type==='pass'){
          if(!d.fromId) d.fromId=nearestInPositions({x:d.x1,y:d.y1},phaseStart);
          if(!d.toId) d.toId=nearestInPositions({x:d.x2,y:d.y2},phaseStart);
        }else if(d.type==='shot' && !d.fromId){
          d.fromId=nearestInPositions({x:d.x1,y:d.y1},phaseStart);
        }
      });

      actions.forEach(({d})=>{
        if(['arrow','dribble','screen'].includes(d.type) && d.pieceId && predicted[d.pieceId]){
          predicted[d.pieceId]={x:Number(d.x2),y:Number(d.y2)};
        }
      });

      return {number,actions};
    });
  }

  function syncPauseButton(button){
    if(!button) return;
    button.disabled=!playback.running;
    const icon=button.querySelector('span:first-child');
    const label=button.querySelector('span:last-child');
    if(icon && label){
      icon.textContent=playback.paused ? '▶' : 'Ⅱ';
      label.textContent=playback.paused ? 'Continuar' : 'Pausa';
    }else{
      button.textContent=playback.paused ? '▶ Continuar' : 'Ⅱ Pausa';
    }
  }

  function updatePlaybackControls(){
    [mobilePlayBtn,desktopPlayBtn].forEach(button=>{
      if(button) button.disabled=playback.running && !playback.paused;
    });
    syncPauseButton(mobilePauseBtn);
    syncPauseButton(desktopPauseBtn);
    [mobileStopBtn,desktopStopBtn].forEach(button=>{
      if(button) button.disabled=!playback.running;
    });
  }

  function setPlaybackStatus(text){
    if(mobilePlaybackStatus) mobilePlaybackStatus.textContent=text;
    if(desktopPlaybackStatus) desktopPlaybackStatus.textContent=text;
  }

  function highlightPlaybackPhase(number){
    drawingsLayer.querySelectorAll('[data-phase]').forEach(el=>{
      el.classList.toggle('playback-active',Number(el.dataset.phase)===Number(number));
    });
  }

  function clearPlaybackHighlight(){
    drawingsLayer.querySelectorAll('.playback-active').forEach(el=>el.classList.remove('playback-active'));
  }

  function actionDuration(d){
    const length=polylineLength(playbackPoints(d));
    if(d.type==='pass') return Math.max(420,Math.min(1500,length*2.5));
    if(d.type==='shot') return Math.max(520,Math.min(1700,length*2.8));
    if(d.type==='dribble') return Math.max(650,Math.min(2400,length*4.1));
    return Math.max(750,Math.min(2600,length*4.0));
  }

  function phaseTiming(phase){
    const ballActions=phase.actions.filter(({d})=>['dribble','pass','shot'].includes(d.type));
    const ballSegments=[];
    let ballTotal=0;
    ballActions.forEach(action=>{
      const duration=actionDuration(action.d);
      ballSegments.push({action,start:ballTotal,end:ballTotal+duration,duration});
      ballTotal+=duration;
    });

    let playerDuration=0;
    phase.actions.forEach(({d})=>{
      if(['arrow','screen'].includes(d.type)){
        playerDuration=Math.max(playerDuration,actionDuration(d));
      }
    });

    return {
      ballSegments,
      ballTotal,
      duration:Math.max(900,playerDuration,ballTotal)
    };
  }

  function animateBallSequence(timing,elapsed){
    if(!timing.ballSegments.length) return;

    const clamped=Math.max(0,Math.min(timing.ballTotal,elapsed));
    let active=timing.ballSegments[timing.ballSegments.length-1];

    for(const segment of timing.ballSegments){
      if(clamped<=segment.end){
        active=segment;
        break;
      }
    }

    // Mantener el balón en el final de la última acción ya completada.
    for(const segment of timing.ballSegments){
      if(clamped>=segment.end){
        const d=segment.action.d;
        if(d.type==='dribble'){
          const end=pointAtPolyline(playbackPoints(d),1);
          movePieceDom('ball',{x:end.x+24,y:end.y+24});
        }else{
          movePieceDom('ball',pointAtPolyline(playbackPoints(d),1));
        }
      }
    }

    if(clamped<active.start || clamped>active.end) return;

    const d=active.action.d;
    const localT=active.duration ? Math.max(0,Math.min(1,(clamped-active.start)/active.duration)) : 1;
    const pos=pointAtPolyline(playbackPoints(d),localT);

    if(d.type==='dribble'){
      if(d.pieceId) movePieceDom(d.pieceId,pos);
      const bounce=24+Math.abs(Math.sin(localT*Math.PI*10))*11;
      movePieceDom('ball',{x:pos.x+24,y:pos.y+bounce});
    }else{
      movePieceDom('ball',pos);
    }
  }

  function animatePlaybackPhase(now){
    if(!playback.running || playback.paused) return;
    const phase=playback.phases[playback.phaseIndex];
    if(!phase){
      finishPlayback();
      return;
    }
    if(!playback.phaseStart) playback.phaseStart=now-playback.phaseElapsed;

    const timing=phaseTiming(phase);
    const duration=timing.duration;
    const elapsed=now-playback.phaseStart;
    playback.phaseElapsed=elapsed;
    const t=Math.min(1,elapsed/duration);

    // Todos los movimientos simultáneos del mismo Paso/Evento
    // empiezan y terminan juntos. Una trayectoria más larga implica
    // mayor velocidad, no que el jugador termine antes y espere parado.
    phase.actions.forEach(({d})=>{
      if((d.type==='arrow' || d.type==='screen') && d.pieceId){
        movePieceDom(d.pieceId,pointAtPolyline(playbackPoints(d),t));
      }
    });

    // El balón solo puede ejecutar una acción cada vez: bote, pase o tiro.
    animateBallSequence(timing,elapsed);

    if(t>=1){
      playback.phaseIndex+=1;
      playback.phaseStart=0;
      playback.phaseElapsed=0;
      const next=playback.phases[playback.phaseIndex];
      if(next){
        highlightPlaybackPhase(next.number);
        setPlaybackStatus('Paso '+next.number+' · '+(playback.phaseIndex+1)+' de '+playback.phases.length);
      }
    }
    playback.raf=requestAnimationFrame(animatePlaybackPhase);
  }

  function startPlayback(){
    if(playback.running) stopPlayback(true);
    const phases=playbackPhases();
    if(!phases.length){
      showMobileToast('Dibuja primero algún movimiento, bote, pase, bloqueo o tiro.');
      setPlaybackStatus('No hay trazos para representar.');
      return;
    }
    playback.running=true;
    playback.paused=false;
    playback.phaseIndex=0;
    playback.phaseStart=0;
    playback.phaseElapsed=0;
    playback.phases=phases;
    playback.snapshot=clone(board().pieces);
    playback.positions=clone(board().pieces);
    document.body.classList.add('playback-running');
    highlightPlaybackPhase(phases[0].number);
    setPlaybackStatus('Paso '+phases[0].number+' · 1 de '+phases.length);
    updatePlaybackControls();
    playback.raf=requestAnimationFrame(animatePlaybackPhase);
  }

  function togglePlaybackPause(){
    if(!playback.running) return;
    if(playback.paused){
      playback.paused=false;
      playback.phaseStart=performance.now()-playback.phaseElapsed;
      setPlaybackStatus('Paso '+playback.phases[playback.phaseIndex].number+' · reproducción');
      playback.raf=requestAnimationFrame(animatePlaybackPhase);
    }else{
      playback.paused=true;
      cancelAnimationFrame(playback.raf);
      setPlaybackStatus('Pausa · Paso '+playback.phases[playback.phaseIndex].number);
    }
    updatePlaybackControls();
  }

  function stopPlayback(restore=true){
    if(!playback.running && !playback.snapshot) return;
    cancelAnimationFrame(playback.raf);
    playback.running=false;
    playback.paused=false;
    playback.phaseStart=0;
    playback.phaseElapsed=0;
    playback.phaseIndex=0;
    document.body.classList.remove('playback-running');
    clearPlaybackHighlight();
    if(restore) renderPieces();
    playback.phases=[];
    playback.snapshot=null;
    playback.positions=null;
    updatePlaybackControls();
    setPlaybackStatus('Representación detenida.');
  }

  function finishPlayback(){
    cancelAnimationFrame(playback.raf);
    playback.running=false;
    playback.paused=false;
    document.body.classList.remove('playback-running');
    clearPlaybackHighlight();
    renderPieces();
    playback.phases=[];
    playback.snapshot=null;
    playback.positions=null;
    playback.phaseIndex=0;
    playback.phaseStart=0;
    playback.phaseElapsed=0;
    updatePlaybackControls();
    setPlaybackStatus('Representación finalizada. Pulsa Representar para repetir.');
  }

  function exportPng(){
    const cloneSvg = svg.cloneNode(true);
    cloneSvg.removeAttribute('class');
    cloneSvg.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
    cloneSvg.querySelectorAll('[aria-label]').forEach(el => el.removeAttribute('aria-label'));
    const vb = state.view === 'half' ? [700,0,700,750] : [0,0,1400,750];
    cloneSvg.setAttribute('viewBox',vb.join(' '));
    cloneSvg.setAttribute('xmlns','http://www.w3.org/2000/svg');
    cloneSvg.setAttribute('width',String(vb[2]));
    cloneSvg.setAttribute('height',String(vb[3]));

    const style = document.createElementNS('http://www.w3.org/2000/svg','style');
    style.textContent = `
      .piece circle{stroke:#fff;stroke-width:6}.piece text{fill:#fff;font-family:Arial,sans-serif;font-size:38px;font-weight:700;text-anchor:middle;dominant-baseline:middle}
      .attack-piece circle{fill:${state.colors.attack}}.defense-piece circle{fill:${state.colors.defense}}.ball-piece circle{fill:#ff8a20;stroke:#fff3dd}.ball-piece path{fill:none;stroke:#8a4200;stroke-width:4}
      .draw-path{fill:none;stroke-linecap:round;stroke-linejoin:round}.draw-path.move{stroke:#ff6700;stroke-width:5;marker-end:url(#arrowOrange)}.draw-path.pass{stroke:#fff;stroke-width:4;stroke-dasharray:12 10;marker-end:url(#arrowWhite)}.draw-path.dribble{stroke:#ffd34f;stroke-width:4;marker-end:url(#arrowYellow)}.draw-path.shot{stroke:#f472b6;stroke-width:4;stroke-dasharray:5 9;marker-end:url(#arrowShot)}.draw-path.screen,.screen-cap{stroke:#68dcff;stroke-width:5;fill:none;stroke-linecap:round}.step-marker circle{fill:${state.colors.step};stroke:#fff;stroke-width:4}.step-marker text{fill:${state.colors.stepText};font-family:Arial,sans-serif;font-size:27px;font-weight:700;text-anchor:middle;dominant-baseline:middle}
    `;
    cloneSvg.insertBefore(style,cloneSvg.firstChild);

    const xml = new XMLSerializer().serializeToString(cloneSvg);
    const blob = new Blob([xml],{type:'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = vb[2]*scale;
      canvas.height = vb[3]*scale;
      const ctx = canvas.getContext('2d');
      if(!ctx){URL.revokeObjectURL(url);return}
      ctx.scale(scale,scale);
      ctx.drawImage(image,0,0,vb[2],vb[3]);
      URL.revokeObjectURL(url);
      canvas.toBlob(png => {
        if(!png) return;
        const a=document.createElement('a');
        const safe=(playName.value.trim()||'jugada-statsbasket').replace(/[^a-z0-9áéíóúüñ_-]+/gi,'-').replace(/^-+|-+$/g,'');
        const pngUrl=URL.createObjectURL(png);
        a.href=pngUrl;
        a.download=safe+'.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(()=>URL.revokeObjectURL(pngUrl),1000);
      },'image/png');
    };
    image.onerror=()=>URL.revokeObjectURL(url);
    image.src=url;
  }

  exportBtn.addEventListener('click',exportPng);

  function syncMobileViewButtons(){
    if(!mobileHalfCourtBtn || !mobileFullCourtBtn) return;
    const half = state.view === 'half';
    mobileHalfCourtBtn.classList.toggle('active-view',half);
    mobileFullCourtBtn.classList.toggle('active-view',!half);
    mobileHalfCourtBtn.setAttribute('aria-pressed',half ? 'true':'false');
    mobileFullCourtBtn.setAttribute('aria-pressed',half ? 'false':'true');
  }

  let toastTimer = 0;
  function showMobileToast(message){
    if(!mobileToast) return;
    mobileToast.textContent = message;
    mobileToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => mobileToast.classList.remove('show'),2600);
  }

  async function requestFullscreen(){
    if(document.fullscreenElement) return true;
    const root = document.documentElement;
    const fn = root.requestFullscreen || root.webkitRequestFullscreen;
    if(!fn) return false;
    try{
      await fn.call(root,{navigationUI:'hide'});
      return true;
    }catch(_){
      try{
        await fn.call(root);
        return true;
      }catch(__){
        return false;
      }
    }
  }

  async function requestMobileOrientation(mode){
    if(!isMobileBoard) return false;
    const orientation = mode === 'half' ? 'portrait' : 'landscape';
    if(!screen.orientation?.lock) return false;
    try{
      await screen.orientation.lock(orientation);
      return true;
    }catch(_){
      return false;
    }
  }

  async function enterMobilePresentation(mode,{ensureFullscreen=true}={}){
    if(!isMobileBoard) return;
    let fullscreenOk = !!document.fullscreenElement;
    if(ensureFullscreen) fullscreenOk = await requestFullscreen();
    const orientationOk = await requestMobileOrientation(mode);
    if(!fullscreenOk && !orientationOk){
      showMobileToast(mode === 'half'
        ? 'Gira el móvil a vertical si tu navegador no cambia la orientación automáticamente.'
        : 'Gira el móvil a horizontal si tu navegador no cambia la orientación automáticamente.');
    }
  }

  function closeMobileOptions(){
    if(!mobileOptionsPanel) return;
    mobileOptionsPanel.classList.remove('open');
    mobileOptionsPanel.setAttribute('aria-hidden','true');
    mobileOptionsBtn?.setAttribute('aria-expanded','false');
  }

  function openMobileOptions(){
    if(!mobileOptionsPanel) return;
    mobileOptionsPanel.classList.add('open');
    mobileOptionsPanel.setAttribute('aria-hidden','false');
    mobileOptionsBtn?.setAttribute('aria-expanded','true');
    restoreDraggable(mobileOptionsPanel);
  }

  function toggleMobileOptions(){
    if(mobileOptionsPanel?.classList.contains('open')) closeMobileOptions();
    else openMobileOptions();
  }

  function positionKey(el){
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    return MOBILE_POS_PREFIX + el.id + '.' + orientation;
  }

  function clampFloating(el,left,top){
    const rect = el.getBoundingClientRect();
    const pad = 6;
    return {
      left:Math.max(pad,Math.min(window.innerWidth-rect.width-pad,left)),
      top:Math.max(pad,Math.min(window.innerHeight-rect.height-pad,top))
    };
  }

  function saveDraggable(el){
    if(!el?.id) return;
    const rect = el.getBoundingClientRect();
    try{
      localStorage.setItem(positionKey(el),JSON.stringify({left:rect.left,top:rect.top}));
    }catch(_){}
  }

  function restoreDraggable(el){
    if(!isMobileBoard || !el?.id) return;
    let saved=null;
    try{ saved=JSON.parse(localStorage.getItem(positionKey(el)) || 'null'); }catch(_){}
    if(!saved || !Number.isFinite(saved.left) || !Number.isFinite(saved.top)){
      el.style.removeProperty('left');
      el.style.removeProperty('top');
      el.style.removeProperty('right');
      el.style.removeProperty('bottom');
      el.style.removeProperty('transform');
      return;
    }
    requestAnimationFrame(() => {
      const pos=clampFloating(el,saved.left,saved.top);
      el.style.left=pos.left+'px';
      el.style.top=pos.top+'px';
      el.style.right='auto';
      el.style.bottom='auto';
      el.style.transform='none';
    });
  }

  function makeDraggable(el){
    if(!el) return;
    const handle=el.querySelector('[data-drag-handle]');
    if(!handle) return;
    let drag=null;

    handle.addEventListener('pointerdown',evt => {
      if(!isMobileBoard) return;
      if(el===mobileSideDock && !document.body.classList.contains('dock-floating')) return;
      evt.preventDefault();
      evt.stopPropagation();
      const rect=el.getBoundingClientRect();
      el.style.left=rect.left+'px';
      el.style.top=rect.top+'px';
      el.style.right='auto';
      el.style.bottom='auto';
      el.style.transform='none';
      drag={pointerId:evt.pointerId,dx:evt.clientX-rect.left,dy:evt.clientY-rect.top};
      try{handle.setPointerCapture(evt.pointerId);}catch(_){}
    });

    handle.addEventListener('pointermove',evt => {
      if(!drag || evt.pointerId!==drag.pointerId) return;
      evt.preventDefault();
      const pos=clampFloating(el,evt.clientX-drag.dx,evt.clientY-drag.dy);
      el.style.left=pos.left+'px';
      el.style.top=pos.top+'px';
    });

    const finish=evt => {
      if(!drag || evt.pointerId!==drag.pointerId) return;
      saveDraggable(el);
      drag=null;
      try{handle.releasePointerCapture(evt.pointerId);}catch(_){}
    };
    handle.addEventListener('pointerup',finish);
    handle.addEventListener('pointercancel',finish);
  }

  function dockIsFloating(){
    try{return localStorage.getItem(MOBILE_DOCK_FLOAT_KEY)==='1';}catch(_){return false;}
  }

  function placeMobileDock(){
    if(!isMobileBoard || !mobileSideDock) return;
    const integratedHalf=state.view==='half' && !document.body.classList.contains('dock-floating');

    if(integratedHalf && boardPage && boardLegend){
      if(mobileSideDock.parentElement!==boardPage || mobileSideDock.nextElementSibling!==boardLegend){
        boardPage.insertBefore(mobileSideDock,boardLegend);
      }
      mobileSideDock.classList.add('half-integrated');
    }else{
      if(mobileSideDock.parentElement!==document.body){
        document.body.insertBefore(mobileSideDock,mobileOptionsPanel || mobileToast || null);
      }
      mobileSideDock.classList.remove('half-integrated');
    }
  }

  function applyDockMode(floating=dockIsFloating()){
    document.body.classList.toggle('dock-floating',!!floating);
    if(mobileDockModeBtn) mobileDockModeBtn.textContent=floating ? '▥ Acoplar panel' : '▣ Panel flotante';
    if(!mobileSideDock) return;

    mobileSideDock.style.removeProperty('left');
    mobileSideDock.style.removeProperty('top');
    mobileSideDock.style.removeProperty('right');
    mobileSideDock.style.removeProperty('bottom');
    mobileSideDock.style.removeProperty('transform');

    placeMobileDock();

    if(floating){
      restoreDraggable(mobileSideDock);
    }
  }

  function resetMobileControlPositions(){
    try{
      Object.keys(localStorage)
        .filter(key => key.startsWith(MOBILE_POS_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    }catch(_){}
    [mobileSideDock,mobileOptionsPanel].forEach(el => {
      if(!el) return;
      el.style.removeProperty('left');
      el.style.removeProperty('top');
      el.style.removeProperty('right');
      el.style.removeProperty('bottom');
      el.style.removeProperty('transform');
    });
    applyDockMode();
    showMobileToast('Controles restablecidos.');
  }

  async function exitToStatsBasket(){
    try{
      if(screen.orientation?.unlock) screen.orientation.unlock();
    }catch(_){}
    try{
      if(document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    }catch(_){}
    window.location.href='./';
  }

  function updateFullscreenLabel(){
    if(!mobileFullscreenBtn) return;
    mobileFullscreenBtn.textContent = document.fullscreenElement ? '⛶ Salir de pantalla completa' : '⛶ Pantalla completa';
  }

  function setupMobileBoard(){
    if(!isMobileBoard) return;
    document.body.classList.add('mobile-board-mode');

    if(mobileDockTools && primaryTools && primaryTools.parentElement !== mobileDockTools){
      mobileDockTools.appendChild(primaryTools);
    }
    if(mobileDockActions && mobileAppControls && mobileAppControls.parentElement !== mobileDockActions){
      mobileDockActions.appendChild(mobileAppControls);
    }

    makeDraggable(mobileSideDock);
    makeDraggable(mobileOptionsPanel);

    if(mobilePlayName) mobilePlayName.value=playName.value;
    syncMobileViewButtons();
    applyDockMode();
    placeMobileDock();

    const lockedMode=mobileModeFromViewport();
    setView(lockedMode,{ignoreMobileLock:true});

    const launchText=mobileLaunch?.querySelector('.mobile-launch-card span');
    if(launchText){
      launchText.textContent=lockedMode==='half'
        ? 'Se abrirá a pantalla completa en media pista vertical.'
        : 'Se abrirá a pantalla completa en pista completa horizontal.';
    }

    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if(document.fullscreenElement || standalone){
      enterMobilePresentation(lockedMode,{ensureFullscreen:false});
    }else{
      mobileLaunch?.classList.add('active');
      mobileLaunch?.setAttribute('aria-hidden','false');
    }
  }

  mobileLaunchBtn?.addEventListener('click',async() => {
    const lockedMode=mobileModeFromViewport();
    setView(lockedMode,{ignoreMobileLock:true});
    await enterMobilePresentation(lockedMode);
    mobileLaunch?.classList.remove('active');
    mobileLaunch?.setAttribute('aria-hidden','true');
  });

  mobileOptionsBtn?.addEventListener('click',evt => {
    evt.stopPropagation();
    toggleMobileOptions();
  });

  mobileLibraryBtn?.addEventListener('click',evt => {
    evt.stopPropagation();
    openMobileOptions();
    requestAnimationFrame(() => {
      mobilePlayLibrarySection?.scrollIntoView({block:'start',behavior:'smooth'});
    });
  });

  mobileOptionsClose?.addEventListener('click',closeMobileOptions);

  document.addEventListener('pointerdown',evt => {
    if(!mobileOptionsPanel?.classList.contains('open')) return;
    const target=evt.target;
    if(mobileOptionsPanel.contains(target) || mobileOptionsBtn?.contains(target) || mobileLibraryBtn?.contains(target)) return;
    closeMobileOptions();
  });

  mobileQuickUndoBtn?.addEventListener('click',() => undoBtn.click());
  mobileQuickResetBtn?.addEventListener('click',() => resetBtn.click());
  mobileExitMenuBtn?.addEventListener('click',exitToStatsBasket);

  mobileHalfCourtBtn?.addEventListener('click',() => {
    showMobileToast('En móvil la vista está ligada a la orientación: vertical = media pista.');
  });

  mobileFullCourtBtn?.addEventListener('click',() => {
    showMobileToast('En móvil la vista está ligada a la orientación: horizontal = pista completa.');
  });

  halfBtn.addEventListener('click',() => {
    if(isMobileBoard) enterMobilePresentation('half',{ensureFullscreen:false});
  });
  fullBtn.addEventListener('click',() => {
    if(isMobileBoard) enterMobilePresentation('full',{ensureFullscreen:false});
  });

  mobileUndoBtn?.addEventListener('click',() => undoBtn.click());
  mobileResetBtn?.addEventListener('click',() => resetBtn.click());
  mobileClearBtn?.addEventListener('click',() => {
    if(!board().drawings.some(d=>d.type!=='step')) return;
    if(playback.running) stopPlayback(true);
    pushUndo();
    board().drawings=board().drawings.filter(d=>d.type==='step');
    renderDrawings();
    save();
    setPlaybackStatus('Trazos borrados; los pasos se conservan.');
  });
  mobileResetStepsBtn?.addEventListener('click',() => {
    if(!board().drawings.some(d=>d.type==='step')) return;
    if(playback.running) stopPlayback(true);
    pushUndo();
    board().drawings=board().drawings.filter(d=>d.type!=='step');
    renderDrawings();
    save();
    setPlaybackStatus('Pasos borrados; los trazos se conservan.');
  });
  mobileExportBtn?.addEventListener('click',() => exportBtn.click());

  mobilePlayBtn?.addEventListener('click',() => {
    closeMobileOptions();
    startPlayback();
  });
  mobilePauseBtn?.addEventListener('click',togglePlaybackPause);
  mobileStopBtn?.addEventListener('click',() => stopPlayback(true));


  mobileSavePlayBtn?.addEventListener('click',saveCurrentToLibrary);
  mobileExportPlayBtn?.addEventListener('click',exportCurrentPlay);
  mobileImportPlayBtn?.addEventListener('click',()=>mobileImportPlayInput?.click());
  mobileExportLibraryBtn?.addEventListener('click',exportLibrary);
  mobileImportLibraryBtn?.addEventListener('click',()=>mobileImportLibraryInput?.click());

  mobileImportPlayInput?.addEventListener('change',async()=>{
    const file=mobileImportPlayInput.files?.[0];
    mobileImportPlayInput.value='';
    if(!file) return;
    try{
      await importPlayFile(file);
      closeMobileOptions();
    }catch(_){
      showMobileToast('El archivo no contiene una jugada válida de StatsBasket.');
    }
  });

  mobileImportLibraryInput?.addEventListener('change',async()=>{
    const file=mobileImportLibraryInput.files?.[0];
    mobileImportLibraryInput.value='';
    if(!file) return;
    try{
      await importLibraryFile(file);
    }catch(_){
      showMobileToast('No se ha podido importar esa biblioteca.');
    }
  });

  function handleLibraryListClick(evt){
    const button=evt.target.closest?.('[data-library-action]');
    if(!button) return;

    const entries=readPlayLibrary();
    const entry=entries.find(item=>item.id===button.dataset.libraryId);
    if(!entry) return;

    const action=button.dataset.libraryAction;

    if(action==='load'){
      try{
        applyPlayData(entry.play);
        closeMobileOptions();
        showMobileToast('Jugada cargada: '+entry.name);
      }catch(_){
        showMobileToast('No se ha podido cargar esa jugada.');
      }
      return;
    }

    if(action==='duplicate'){
      try{
        const play=normalizePlayData(entry.play);
        const name=(entry.name || play.playName || 'Jugada')+' (copia)';
        play.playName=name;
        const now=new Date().toISOString();
        const duplicate={
          id:makeLibraryId(),
          name,
          createdAt:now,
          updatedAt:now,
          play
        };
        writePlayLibrary([duplicate,...entries]);
        renderPlayLibrary();
        showMobileToast('Jugada duplicada.');
      }catch(_){}
      return;
    }

    if(action==='export'){
      try{
        const play=normalizePlayData(entry.play);
        downloadJson({
          format:'statsbasket-play',
          version:1,
          exportedAt:new Date().toISOString(),
          play
        },safeFileName(entry.name || play.playName,'jugada-statsbasket')+'.json');
      }catch(_){}
      return;
    }

    if(action==='delete'){
      const ok=window.confirm('¿Eliminar la jugada "'+(entry.name || 'sin nombre')+'"?');
      if(!ok) return;
      writePlayLibrary(entries.filter(item=>item.id!==entry.id));
      renderPlayLibrary();
      showMobileToast('Jugada eliminada.');
    }
  }

  playLibraryList?.addEventListener('click',handleLibraryListClick);
  desktopPlayLibraryList?.addEventListener('click',handleLibraryListClick);

  desktopPlayBtn?.addEventListener('click',startPlayback);
  desktopPauseBtn?.addEventListener('click',togglePlaybackPause);
  desktopStopBtn?.addEventListener('click',() => stopPlayback(true));

  desktopClearStepsBtn?.addEventListener('click',() => {
    if(!board().drawings.some(d=>d.type==='step')) return;
    if(playback.running) stopPlayback(true);
    pushUndo();
    board().drawings=board().drawings.filter(d=>d.type!=='step');
    renderDrawings();
    save();
    setPlaybackStatus('Pasos borrados; los trazos se conservan.');
  });

  desktopSavePlayBtn?.addEventListener('click',saveCurrentToLibrary);
  desktopExportPlayBtn?.addEventListener('click',exportCurrentPlay);
  desktopImportPlayBtn?.addEventListener('click',()=>mobileImportPlayInput?.click());
  desktopExportLibraryBtn?.addEventListener('click',exportLibrary);
  desktopImportLibraryBtn?.addEventListener('click',()=>mobileImportLibraryInput?.click());

  desktopAttackColor?.addEventListener('input',() => {
    state.colors.attack=desktopAttackColor.value;
    applyBoardColors();
    save();
  });

  desktopDefenseColor?.addEventListener('input',() => {
    state.colors.defense=desktopDefenseColor.value;
    applyBoardColors();
    save();
  });

  mobileAttackColor?.addEventListener('input',() => {
    state.colors.attack=mobileAttackColor.value;
    applyBoardColors();
    save();
  });

  mobileDefenseColor?.addEventListener('input',() => {
    state.colors.defense=mobileDefenseColor.value;
    applyBoardColors();
    save();
  });

  mobilePlayName?.addEventListener('input',() => {
    playName.value=mobilePlayName.value;
    save();
  });

  mobileFullscreenBtn?.addEventListener('click',async() => {
    if(document.fullscreenElement){
      try{ await document.exitFullscreen(); }catch(_){}
    }else{
      await enterMobilePresentation(state.view);
    }
    updateFullscreenLabel();
  });

  mobileDockModeBtn?.addEventListener('click',() => {
    const next=!document.body.classList.contains('dock-floating');
    try{localStorage.setItem(MOBILE_DOCK_FLOAT_KEY,next?'1':'0');}catch(_){}
    applyDockMode(next);
    showMobileToast(next ? 'Panel flotante activado.' : 'Panel acoplado al lateral.');
  });

  mobileResetControlsBtn?.addEventListener('click',resetMobileControlPositions);

  document.addEventListener('fullscreenchange',updateFullscreenLabel);

  let resizeTimer=0;
  window.addEventListener('resize',() => {
    if(!isMobileBoard) return;
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(() => {
      const lockedMode=mobileModeFromViewport();
      if(state.view!==lockedMode) setView(lockedMode,{ignoreMobileLock:true});
      placeMobileDock();
      if(document.body.classList.contains('dock-floating')) restoreDraggable(mobileSideDock);
      if(mobileOptionsPanel?.classList.contains('open')) restoreDraggable(mobileOptionsPanel);
    },180);
  });

  window.addEventListener('orientationchange',() => {
    if(!isMobileBoard) return;
    setTimeout(() => {
      const lockedMode=mobileModeFromViewport();
      if(state.view!==lockedMode) setView(lockedMode,{ignoreMobileLock:true});
      placeMobileDock();
      if(document.body.classList.contains('dock-floating')) restoreDraggable(mobileSideDock);
      if(mobileOptionsPanel?.classList.contains('open')) restoreDraggable(mobileOptionsPanel);
    },260);
  });

  load();
  playName.value = state.playName;
  applyBoardColors();
  setTool('move');
  setView(isMobileBoard ? mobileModeFromViewport() : state.view,{ignoreMobileLock:isMobileBoard});
  updateUndo();
  updatePlaybackControls();
  renderPlayLibrary();
  setupMobileBoard();
})();