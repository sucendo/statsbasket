(() => {
  'use strict';

  const svg = document.getElementById('tacticalBoard');
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
  const mobileLaunch = document.getElementById('mobileLaunch');
  const mobileLaunchBtn = document.getElementById('mobileLaunchBtn');
  const mobileAppControls = document.getElementById('mobileAppControls');
  const mobileOptionsBtn = document.getElementById('mobileOptionsBtn');
  const mobileExitBtn = document.getElementById('mobileExitBtn');
  const mobileOptionsPanel = document.getElementById('mobileOptionsPanel');
  const mobileOptionsClose = document.getElementById('mobileOptionsClose');
  const mobilePlayName = document.getElementById('mobilePlayName');
  const mobileHalfCourtBtn = document.getElementById('mobileHalfCourtBtn');
  const mobileFullCourtBtn = document.getElementById('mobileFullCourtBtn');
  const mobileUndoBtn = document.getElementById('mobileUndoBtn');
  const mobileResetBtn = document.getElementById('mobileResetBtn');
  const mobileClearBtn = document.getElementById('mobileClearBtn');
  const mobileExportBtn = document.getElementById('mobileExportBtn');
  const mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
  const mobileResetControlsBtn = document.getElementById('mobileResetControlsBtn');
  const mobileExitMenuBtn = document.getElementById('mobileExitMenuBtn');
  const mobileToast = document.getElementById('mobileToast');

  const STORAGE_KEY = 'statsbasket.pizarra.v2';
  const MOBILE_POS_PREFIX = 'statsbasket.pizarra.mobile.pos.';
  const isMobileBoard = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) ||
    (window.matchMedia('(pointer:coarse)').matches && Math.min(screen.width,screen.height) <= 700);

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
    playName:''
  };

  let undoStack = [];
  let interaction = null;
  let previewPath = null;

  function clone(value){ return JSON.parse(JSON.stringify(value)); }

  function load(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if(!saved || typeof saved !== 'object') return;
      if(saved.view === 'half' || saved.view === 'full') state.view = saved.view;
      state.playName = String(saved.playName || '');
      ['half','full'].forEach(mode => {
        const src = saved.boards?.[mode];
        if(!src) return;
        const next = freshBoard(mode);
        Object.keys(next.pieces).forEach(id => {
          if(Number.isFinite(src.pieces?.[id]?.x) && Number.isFinite(src.pieces?.[id]?.y)){
            next.pieces[id] = {x:Number(src.pieces[id].x),y:Number(src.pieces[id].y)};
          }
        });
        next.drawings = Array.isArray(src.drawings) ? src.drawings.filter(validDrawing).map(d => ({
          id:String(d.id || ('d'+Date.now())),
          type:d.type === 'pass' ? 'pass' : 'arrow',
          x1:Number(d.x1),y1:Number(d.y1),x2:Number(d.x2),y2:Number(d.y2)
        })) : [];
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
        boards:state.boards
      }));
    }catch(_){}
  }

  function validDrawing(d){
    return d && ['arrow','pass'].includes(d.type) &&
      [d.x1,d.y1,d.x2,d.y2].every(v => Number.isFinite(Number(v)));
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
  }

  function setView(mode){
    if(mode !== 'half' && mode !== 'full') return;
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
    syncMobileViewButtons();
    render();
    save();
  }

  function setTool(tool){
    if(!['move','arrow','pass','erase'].includes(tool)) return;
    state.tool = tool;
    toolButtons.forEach(btn => {
      const active = btn.dataset.tool === tool;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active ? 'true':'false');
    });
    svg.classList.toggle('drawing-tool',tool === 'arrow' || tool === 'pass');
    const messages = {
      move:'Modo mover: arrastra jugadores y balón.',
      arrow:'Movimiento: arrastra sobre la pista para dibujar una flecha.',
      pass:'Pase: arrastra para dibujar una línea discontinua.',
      erase:'Borrador: toca una flecha o pase para eliminarlo.'
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

  function drawingPath(d,preview=false){
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`);
    path.setAttribute('class',`draw-path ${d.type === 'pass' ? 'pass':'move'}${preview?' preview':''}`);
    if(!preview) path.dataset.drawingId = d.id;
    return path;
  }

  function renderDrawings(){
    drawingsLayer.replaceChildren();
    board().drawings.forEach(d => drawingsLayer.appendChild(drawingPath(d)));
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
      if(state.tool !== 'move') return;
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

    if(state.tool !== 'arrow' && state.tool !== 'pass') return;
    evt.preventDefault();
    const p = svgPoint(evt);
    pushUndo();
    interaction = {
      kind:'draw',
      pointerId:evt.pointerId,
      type:state.tool,
      x1:p.x,y1:p.y,x2:p.x,y2:p.y
    };
    previewPath = drawingPath(interaction,true);
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
      if(previewPath) previewPath.setAttribute('d',`M ${interaction.x1} ${interaction.y1} L ${p.x} ${p.y}`);
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
      const dx=interaction.x2-interaction.x1,dy=interaction.y2-interaction.y1;
      if(Math.hypot(dx,dy) >= 18){
        board().drawings.push({
          id:'d'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
          type:interaction.type,
          x1:interaction.x1,y1:interaction.y1,
          x2:interaction.x2,y2:interaction.y2
        });
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
    if(!board().drawings.length) return;
    pushUndo();
    board().drawings = [];
    renderDrawings();
    save();
  });

  playName.addEventListener('input',() => {
    if(mobilePlayName && mobilePlayName.value !== playName.value) mobilePlayName.value = playName.value;
    save();
  });

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
      .attack-piece circle{fill:#df1c31}.defense-piece circle{fill:#004f7c}.ball-piece circle{fill:#ff8a20;stroke:#fff3dd}.ball-piece path{fill:none;stroke:#8a4200;stroke-width:4}
      .draw-path{fill:none;stroke-linecap:round;stroke-linejoin:round}.draw-path.move{stroke:#ff6700;stroke-width:11;marker-end:url(#arrowOrange)}.draw-path.pass{stroke:#fff;stroke-width:9;stroke-dasharray:24 18;marker-end:url(#arrowWhite)}
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
    if(!saved || !Number.isFinite(saved.left) || !Number.isFinite(saved.top)) return;
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

  function resetMobileControlPositions(){
    try{
      Object.keys(localStorage)
        .filter(key => key.startsWith(MOBILE_POS_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    }catch(_){}
    [primaryTools,mobileAppControls,mobileOptionsPanel].forEach(el => {
      if(!el) return;
      el.style.removeProperty('left');
      el.style.removeProperty('top');
      el.style.removeProperty('right');
      el.style.removeProperty('bottom');
      el.style.removeProperty('transform');
    });
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

    makeDraggable(primaryTools);
    makeDraggable(mobileAppControls);
    makeDraggable(mobileOptionsPanel);

    if(mobilePlayName) mobilePlayName.value=playName.value;
    syncMobileViewButtons();
    restoreDraggable(primaryTools);
    restoreDraggable(mobileAppControls);

    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if(document.fullscreenElement || standalone){
      setView('full');
      enterMobilePresentation('full',{ensureFullscreen:false});
    }else{
      mobileLaunch?.classList.add('active');
      mobileLaunch?.setAttribute('aria-hidden','false');
    }
  }

  mobileLaunchBtn?.addEventListener('click',async() => {
    setView('full');
    await enterMobilePresentation('full');
    mobileLaunch?.classList.remove('active');
    mobileLaunch?.setAttribute('aria-hidden','true');
  });

  mobileOptionsBtn?.addEventListener('click',evt => {
    evt.stopPropagation();
    toggleMobileOptions();
  });
  mobileOptionsClose?.addEventListener('click',closeMobileOptions);

  mobileExitBtn?.addEventListener('click',exitToStatsBasket);
  mobileExitMenuBtn?.addEventListener('click',exitToStatsBasket);

  mobileHalfCourtBtn?.addEventListener('click',async() => {
    setView('half');
    closeMobileOptions();
    await enterMobilePresentation('half',{ensureFullscreen:!document.fullscreenElement});
  });

  mobileFullCourtBtn?.addEventListener('click',async() => {
    setView('full');
    closeMobileOptions();
    await enterMobilePresentation('full',{ensureFullscreen:!document.fullscreenElement});
  });

  halfBtn.addEventListener('click',() => {
    if(isMobileBoard) enterMobilePresentation('half',{ensureFullscreen:false});
  });
  fullBtn.addEventListener('click',() => {
    if(isMobileBoard) enterMobilePresentation('full',{ensureFullscreen:false});
  });

  mobileUndoBtn?.addEventListener('click',() => undoBtn.click());
  mobileResetBtn?.addEventListener('click',() => resetBtn.click());
  mobileClearBtn?.addEventListener('click',() => clearBtn.click());
  mobileExportBtn?.addEventListener('click',() => exportBtn.click());

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

  mobileResetControlsBtn?.addEventListener('click',resetMobileControlPositions);

  document.addEventListener('fullscreenchange',updateFullscreenLabel);

  let resizeTimer=0;
  window.addEventListener('resize',() => {
    if(!isMobileBoard) return;
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(() => {
      [primaryTools,mobileAppControls].forEach(restoreDraggable);
      if(mobileOptionsPanel?.classList.contains('open')) restoreDraggable(mobileOptionsPanel);
    },180);
  });

  window.addEventListener('orientationchange',() => {
    if(!isMobileBoard) return;
    setTimeout(() => {
      [primaryTools,mobileAppControls].forEach(restoreDraggable);
      if(mobileOptionsPanel?.classList.contains('open')) restoreDraggable(mobileOptionsPanel);
    },260);
  });

  load();
  playName.value = state.playName;
  setTool('move');
  setView(state.view);
  updateUndo();
  setupMobileBoard();
})();