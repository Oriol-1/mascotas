/* Interacciones de la landing Affinity Mascotas. */
(() => {
  'use strict';

  /* Aperturas provisionales. Los widgets futuros usarán data-widget-trigger y
     reemplazarán solo el diálogo correspondiente cuando estén operativos. */
  document.querySelectorAll('[data-contact-dialog]').forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.contactDialog);
    dialog.showModal();
    if (dialog.id === 'call-dialog') dialog.querySelector('input').focus();
  }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  const callbackForm = document.querySelector('#callback-form');
  const callbackName = document.querySelector('#callback-name');
  const callbackPhone = document.querySelector('#callback-phone');
  const callbackStatus = document.querySelector('#callback-status');
  const whatsapp = document.querySelector('.whatsapp');
  const contactDialog = document.querySelector('#contact-dialog');
  const slider = document.querySelector('.hero-grid');

  if (slider) {
    const slides = [...slider.querySelectorAll('.hero-slide')];
    const status = slider.querySelector('#hero-image-status');
    const choices = [...slider.querySelectorAll('[data-pet-slide]')];
    const title = slider.querySelector('#hero-photo-title');
    const count = slider.querySelector('.hero-photo-count');
    let active = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    const showSlide = index => {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === active);
        slide.setAttribute('aria-hidden', String(i !== active));
      });
      choices.forEach(choice => choice.setAttribute('aria-pressed', String(Number(choice.dataset.petSlide) === active)));
      const current = slides[active];
      if (title) title.textContent = current.dataset.title;
      if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      if (status) status.textContent = `Imagen ${active + 1} de ${slides.length}: ${current.classList.contains('dog') ? 'perro' : 'gato'}. ${current.dataset.title}`;
    };
    choices.forEach(choice => choice.addEventListener('click', () => showSlide(Number(choice.dataset.petSlide))));
    slider.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => {
      showSlide(active + (button.dataset.direction === 'next' ? 1 : -1));
    }));
    slider.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(active + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
  }

  callbackForm?.addEventListener('submit', event => {
    event.preventDefault();
    const name = callbackName.value.trim().replace(/\s+/g, ' ');
    if (name.length < 3 || !name.includes(' ')) {
      callbackName.setAttribute('aria-invalid', 'true');
      callbackStatus.dataset.state = 'error';
      callbackStatus.textContent = 'Escribe tu nombre y al menos un apellido.';
      callbackName.focus();
      return;
    }
    const phone = callbackPhone.value.replace(/[\s().-]/g, '');
    if (!/^\+?\d{9,15}$/.test(phone)) {
      callbackPhone.setAttribute('aria-invalid', 'true');
      callbackStatus.dataset.state = 'error';
      callbackStatus.textContent = 'Revisa el teléfono: necesitamos entre 9 y 15 cifras, con prefijo si es de fuera de España.';
      callbackPhone.focus();
      return;
    }
    callbackName.removeAttribute('aria-invalid');
    callbackPhone.removeAttribute('aria-invalid');
    callbackStatus.dataset.state = 'pending';
    callbackStatus.textContent = 'La solicitud de llamada todavía no está disponible. No se ha enviado tu teléfono.';
  });

  callbackName?.addEventListener('input', () => {
    callbackName.removeAttribute('aria-invalid');
    callbackStatus.textContent = '';
    callbackStatus.dataset.state = 'idle';
  });

  callbackPhone?.addEventListener('input', () => {
    callbackPhone.removeAttribute('aria-invalid');
    callbackStatus.textContent = '';
    callbackStatus.dataset.state = 'idle';
  });

  whatsapp?.addEventListener('click', event => {
    event.preventDefault();
    contactDialog?.showModal();
  });

  document.querySelector('#close-contact')?.addEventListener('click', () => contactDialog?.close());
})();

/* V25 · Mejoras del slider: puntos con progreso, autoplay con pausa,
   gesto de deslizar y transición del rótulo. No sustituye la lógica
   existente: se apoya en los botones ya presentes. */
(function(){
  const grid = document.querySelector('#inicio .hero-grid');
  if(!grid) return;

  const slides  = [...grid.querySelectorAll('.hero-slide')];
  const nav     = grid.querySelector('.hero-photo-navigation');
  const visual  = grid.querySelector('.hero-visual');
  const label   = grid.querySelector('.hero-photo-label');
  const nextBtn = grid.querySelector('[data-direction="next"]');
  const prevBtn = grid.querySelector('[data-direction="prev"]');
  const picks   = [...grid.querySelectorAll('[data-pet-slide]')];
  if(slides.length < 2 || !nav || !nextBtn) return;

  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  const DELAY = 7000;

  /* --- Puntos de navegación --- */
  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  dots.setAttribute('role','tablist');
  dots.setAttribute('aria-label','Seleccionar imagen');
  slides.forEach((slide,i)=>{
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-dot';
    dot.dataset.dot = i;
    dot.setAttribute('aria-label', `Ver imagen ${i+1} de ${slides.length}`);
    dot.innerHTML = '<span aria-hidden="true"></span>';
    dot.addEventListener('click', ()=>{
      if(picks[i]) picks[i].click();
      else if(i > current()) nextBtn.click();
      else prevBtn.click();
      restart();
    });
    dots.appendChild(dot);
  });
  nav.insertBefore(dots, nextBtn.previousElementSibling || nextBtn);

  const current = ()=> Math.max(0, slides.findIndex(s=>s.classList.contains('is-active')));

  function paint(){
    const active = current();
    [...dots.children].forEach((dot,i)=>{
      const on = i === active;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-current', String(on));
      dot.classList.remove('is-playing');
      if(on && playing && !reduced.matches){
        void dot.offsetWidth;            /* reinicia la animación */
        dot.classList.add('is-playing');
      }
    });
    if(label){
      label.classList.add('is-changing');
      setTimeout(()=>label.classList.remove('is-changing'), 430);
    }
  }

  /* --- Autoplay con pausa --- */
  let timer = null;
  let playing = !reduced.matches;

  function start(){
    stop();
    if(!playing) return;
    timer = setInterval(()=>nextBtn.click(), DELAY);
  }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }
  function restart(){ if(playing) start(); }

  const pause = ()=>{
    stop();
    [...dots.children].forEach(d=>d.classList.remove('is-playing'));
  };
  const resume = ()=>{
    if(grid.contains(document.activeElement)) return;
    if(visual?.matches(':hover') || nav.matches(':hover')) return;
    start(); paint();
  };
  [visual, nav].forEach(el=>{
    if(!el) return;
    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
  });
  grid.addEventListener('focusin', pause);
  grid.addEventListener('focusout', ()=>setTimeout(resume, 0));
  document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : restart());
  reduced.addEventListener?.('change', ()=>{ playing = !reduced.matches; playing ? start() : stop(); paint(); });

  /* --- Gesto de deslizar --- */
  if(visual && window.PointerEvent){
    let x0 = null;
    visual.addEventListener('pointerdown', e=>{
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      x0 = e.clientX;
      visual.classList.add('is-dragging');
    });
    const end = e=>{
      visual.classList.remove('is-dragging');
      if(x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if(Math.abs(dx) < 45) return;
      (dx < 0 ? nextBtn : prevBtn).click();
      restart();
    };
    visual.addEventListener('pointerup', end);
    visual.addEventListener('pointercancel', ()=>{ x0 = null; visual.classList.remove('is-dragging'); });
  }

  /* --- Sincronizar puntos con el estado real --- */
  const observer = new MutationObserver(paint);
  slides.forEach(s=>observer.observe(s, {attributes:true, attributeFilter:['class']}));

  /* Reiniciar el contador al usar flechas o el selector */
  [nextBtn, prevBtn, ...picks].forEach(b=>b.addEventListener('click', restart));

  paint();
  start();
})();

/* V26 · Ajustador de encuadre. Solo se activa añadiendo ?encuadre=1
   a la URL; en la web publicada no se carga nada visible.
   Arrastra sobre la foto (o usa las flechas) para colocar el punto
   focal y copia los valores al bloque de estilos. */
(function(){
  if(!/[?&]encuadre=1/.test(location.search)) return;
  const visual = document.querySelector('#inicio .hero-visual');
  if(!visual) return;

  const active = ()=> visual.querySelector('.hero-slide.is-active');
  const clamp = n => Math.min(100, Math.max(0, Math.round(n)));
  document.body.classList.add('is-tuning');

  const box = document.createElement('div');
  box.className = 'focus-tuner';
  box.innerHTML = '<h4>ENCUADRE</h4><code id="ft-out"></code>' +
                  '<button type="button" id="ft-copy">Copiar valores</button>' +
                  '<p>Arrastra sobre la foto o usa las flechas del teclado. ' +
                  'Pega el resultado en el bloque <b>v26-encuadre</b>.</p>';
  document.body.appendChild(box);
  const out = box.querySelector('#ft-out');

  function read(el){
    const s = getComputedStyle(el);
    return {
      x: parseFloat(s.getPropertyValue('--focal-x')) || 50,
      y: parseFloat(s.getPropertyValue('--focal-y')) || 35
    };
  }
  function paint(){
    const el = active(); if(!el) return;
    const {x,y} = read(el);
    const name = el.classList.contains('cat') ? 'cat' : 'dog';
    out.textContent = `#inicio .hero-slide.${name}{--focal-x:${x}%;--focal-y:${y}%}`;
  }
  function move(dx,dy){
    const el = active(); if(!el) return;
    const {x,y} = read(el);
    el.style.setProperty('--focal-x', clamp(x+dx)+'%');
    el.style.setProperty('--focal-y', clamp(y+dy)+'%');
    paint();
  }

  let last = null;
  visual.addEventListener('pointerdown', e=>{ last = {x:e.clientX, y:e.clientY}; e.preventDefault(); });
  window.addEventListener('pointermove', e=>{
    if(!last) return;
    move((last.x - e.clientX)/6, (last.y - e.clientY)/6);
    last = {x:e.clientX, y:e.clientY};
  });
  window.addEventListener('pointerup', ()=>{ last = null; });
  window.addEventListener('keydown', e=>{
    const step = e.shiftKey ? 5 : 1;
    if(e.key === 'ArrowUp')    { move(0,-step); e.preventDefault(); }
    if(e.key === 'ArrowDown')  { move(0, step); e.preventDefault(); }
    if(e.key === 'ArrowLeft')  { move(-step,0); e.preventDefault(); }
    if(e.key === 'ArrowRight') { move( step,0); e.preventDefault(); }
  }, true);
  box.querySelector('#ft-copy').addEventListener('click', ()=>{
    navigator.clipboard?.writeText(out.textContent);
    const b = box.querySelector('#ft-copy');
    b.textContent = 'Copiado ✓';
    setTimeout(()=>b.textContent = 'Copiar valores', 1400);
  });

  new MutationObserver(paint).observe(visual, {subtree:true, attributes:true, attributeFilter:['class']});
  paint();
})();

/* Añade el antetítulo del bloque de ayuda para que todas las secciones
   compartan la misma estructura. Cambia el texto si prefieres otro. */
(function(){
  const head = document.querySelector('.contact-heading');
  if(!head || head.querySelector('.kicker')) return;
  const k = document.createElement('div');
  k.className = 'kicker';
  k.textContent = 'Atención personalizada';
  head.insertBefore(k, head.firstElementChild);
})();

/* V29 · Estado de la cabecera al desplazar y aparición progresiva */
(function(){
  /* El paseo de perro y gato solo se anima mientras está en cuadro */
  const paseo = document.querySelector('.paseo');
  if(paseo){
    if('IntersectionObserver' in window){
      new IntersectionObserver(
        ([e]) => paseo.classList.toggle('en-pantalla', e.isIntersecting),
        {rootMargin:'150px 0px'}
      ).observe(paseo);
    } else {
      paseo.classList.add('en-pantalla');
    }
  }

  const onScroll = () => document.body.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  if(!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.contact-heading, .contact-card, .coverage-head, .limits-intro, .reimbursement, .coverage-group, .condition, ' +
    '.how-copy, .step-card, .discounts-copy, .access-card'
  );
  const phase = new Map();
  targets.forEach(el => {
    el.classList.add('reveal');
    const group = el.parentElement;
    const index = phase.get(group) || 0;
    phase.set(group, index + 1);
    el.style.setProperty('--reveal-delay', Math.min(index, 5) * .09 + 's');
  });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      io.unobserve(el);
      // Al acabar se retiran las clases para no bloquear el hover
      const done = event => {
        if(event.target !== el) return; // ignora animaciones de elementos hijos
        el.removeEventListener('animationend', done);
        el.classList.add('is-done');
      };
      el.addEventListener('animationend', done);
    });
  }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
  targets.forEach(el => io.observe(el));
})();

(function(){
  const lane=document.querySelector('.paseo');
  if(!lane) return;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const cards=Array.from(document.querySelectorAll('.contact-card'));
  const pets=Array.from(lane.querySelectorAll('.paseo-animal')).map(svg=>({
    svg,cat:svg.dataset.kind==='gato',legs:Array.from(svg.querySelectorAll('.pet-leg')),
    body:svg.querySelector('.pet-body'),head:svg.querySelector('.pet-head'),
    tail:svg.querySelector('.pet-tail'),eye:svg.querySelector('.pet-eye'),
    shadow:svg.querySelector('.pet-shadow'),ear:svg.querySelector('.pet-ear'),
    cycle:svg.dataset.kind==='gato'?.88:.78,stride:svg.dataset.kind==='gato'?32:36,
    width:0,scale:1,x:0,time:0,vx:0,targetX:null,facing:svg.dataset.kind==='gato'?-1:1,
    gait:1,look:0,sit:0,
    // Juego: juguete propio, cercania al juguete, zarpazo y meneo de cola
    suyo:svg.dataset.kind==='gato'?'contact-dialog':'chat-help-dialog',
    juego:0,zarpa:0,wag:0,espera:Math.random()*.8,
    // Alcance hacia arriba: estiran el cuello y saltan a por la pelota en alto
    alza:0,salto:0,saltoV:0,esperaSalto:0,
    // Solo el perro devuelve la pelota: la lleva en la boca hasta donde la lanzaste
    trae:null,esperaTrae:0
  }));
  let visible=false,frame=0,last=0,laneWidth=0;
  const pi=Math.PI;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  // ---- Juguetes arrastrables ----
  const capa=lane.parentElement.querySelector('.juguetes');
  const suelo=9;                      // las patas apoyan 9 px por encima del borde del carril
  let capaAlto=0,arrastrado=null,posado=null,elegido=null;
  const juguetes=capa?Array.from(capa.querySelectorAll('.juguete')).map(el=>({
    el,cuerpo:el.querySelector('.juguete-cuerpo'),cara:el.querySelector('.juguete-cara'),
    sombra:el.querySelector('.juguete-sombra'),clave:el.dataset.juguete,
    x:0,y:0,vx:0,vy:0,lado:48,giro:0,cogido:false,puntero:null,
    asaX:0,asaY:0,movido:false,ultX:0,ultY:0,ultT:0,desplazado:false,
    golpe:0,cayendo:false,portada:false,lanzada:false,origen:0
  })):[];
  // Techo de juego: por encima quedan las tarjetas, y solo se pasa al caer desde un icono
  const techoJuego=()=>Math.max(60,Math.min(capaAlto-suelo,window.innerWidth<=820?130:170));
  const porClave=clave=>juguetes.find(j=>j.clave===clave)||null;
  function dibujaJuguete(j){
    j.el.style.transform=`translate3d(${j.x}px,${-(j.y+suelo)}px,0)`;
    if(j.cara)j.cara.style.setProperty('--giro',j.giro.toFixed(1)+'deg');
    // Se estira al caer y se aplasta al rebotar
    const estira=j.cogido?0:clamp(Math.abs(j.vy)/1100,0,.16)*(j.y>2?1:0);
    const sx=(1+j.golpe*.3)*(1-estira*.75),sy=(1-j.golpe*.32)*(1+estira);
    j.cuerpo.style.setProperty('--sx',sx.toFixed(3));
    j.cuerpo.style.setProperty('--sy',sy.toFixed(3));
    if(j.sombra){
      const s=j.sombra.style;
      s.setProperty('--sombra-y',j.y.toFixed(1)+'px');
      s.setProperty('--sombra-s',clamp(1-j.y/300,.34,1).toFixed(3));
      s.setProperty('--sombra-o',clamp(.32-j.y/850,.05,.32).toFixed(3));
    }
  }
  function colocaJuguetes(){
    if(!juguetes.length)return;
    capaAlto=capa.clientHeight;
    const r1=lane.getBoundingClientRect();
    juguetes.forEach(j=>{j.lado=j.el.offsetWidth||46;});
    // Cada juguete bajo su tarjeta; si las tarjetas se apilan (movil) se reparten a lo ancho
    const centros=juguetes.map(j=>{
      const tarjeta=tarjetaDe(j.clave);
      if(!tarjeta)return laneWidth*.5;
      const r2=tarjeta.getBoundingClientRect();
      return r2.left-r1.left+r2.width/2;
    });
    const ancho=juguetes.length?juguetes[0].lado:46;
    let juntos=false;
    for(let a=0;a<centros.length&&!juntos;a++)
      for(let b=a+1;b<centros.length;b++)
        if(Math.abs(centros[a]-centros[b])<ancho*1.5){juntos=true;break;}
    juguetes.forEach((j,i)=>{
      if(j.movido){j.x=clamp(j.x,0,Math.max(0,laneWidth-j.lado));}
      else{
        const centro=juntos?laneWidth*(i+1)/(juguetes.length+1):centros[i];
        j.x=clamp(centro-j.lado/2,4,Math.max(4,laneWidth-j.lado-4));
      }
      j.y=clamp(j.y,0,Math.max(0,techoJuego()-j.lado));
      dibujaJuguete(j);
    });
  }
  function fisicaJuguetes(dt){
    juguetes.forEach(j=>{
      const maxX=Math.max(0,laneWidth-j.lado),maxY=Math.max(0,techoJuego()-j.lado);
      j.golpe+=(0-j.golpe)*Math.min(1,dt*9);
      if(j.portada)return;
      if(!j.cogido){
        j.vy-=1500*dt;
        j.y+=j.vy*dt;
        j.x+=j.vx*dt;
        if(j.y<=0){
          const impacto=-j.vy;
          j.y=0;
          j.vy=j.vy<-45?-j.vy*.45:0;
          j.vx*=Math.pow(.32,dt);
          if(Math.abs(j.vx)<4)j.vx=0;
          if(impacto>90)j.golpe=Math.max(j.golpe,clamp(impacto/620,.18,1));
          if(j.cayendo){j.cayendo=false;j.el.classList.remove('esta-cayendo');}
        }else{
          j.vx*=Math.pow(.6,dt);
          // Solo frena contra el techo si va subiendo: una caida desde el icono entra libre
          if(j.y>maxY&&j.vy>0){j.y=maxY;j.vy=0;}
        }
        if(j.x<0){j.x=0;j.vx=Math.abs(j.vx)*.45;}
        else if(j.x>maxX){j.x=maxX;j.vx=-Math.abs(j.vx)*.45;}
        if(j.y>1)j.giro+=j.vx*dt*1.5;
        else j.giro*=Math.pow(.05,dt);
      }
    });
    chocanEntreSi();
    juguetes.forEach(dibujaJuguete);
  }
  // Las pelotas no se atraviesan: se separan y se reparten el impulso
  function chocanEntreSi(){
    for(let a=0;a<juguetes.length;a++){
      for(let b=a+1;b<juguetes.length;b++){
        const A=juguetes[a],B=juguetes[b];
        const dx=(B.x+B.lado/2)-(A.x+A.lado/2),dy=(B.y+B.lado/2)-(A.y+A.lado/2);
        const minimo=(A.lado+B.lado)/2,d=Math.hypot(dx,dy);
        if(d<=0||d>=minimo)continue;
        const nx=dx/d,ny=dy/d,solape=minimo-d;
        // Una pelota en la mano o en la boca no se aparta: solo empuja
        const pa=(A.cogido||A.portada)?0:1,pb=(B.cogido||B.portada)?0:1,total=pa+pb;
        if(!total)continue;
        A.x-=nx*solape*(pa/total);A.y=Math.max(0,A.y-ny*solape*(pa/total));
        B.x+=nx*solape*(pb/total);B.y=Math.max(0,B.y+ny*solape*(pb/total));
        const rel=(B.vx-A.vx)*nx+(B.vy-A.vy)*ny;
        if(rel<0){
          const impulso=-rel*.62;
          if(pa){A.vx-=impulso*nx;A.vy-=impulso*ny;}
          if(pb){B.vx+=impulso*nx;B.vy+=impulso*ny;}
          A.giro-=impulso*.18;B.giro+=impulso*.18;
        }
        [A,B].forEach(j=>{j.x=clamp(j.x,0,Math.max(0,laneWidth-j.lado));});
      }
    }
  }
  function size(){
    const old=laneWidth;laneWidth=lane.clientWidth;
    pets.forEach((p,i)=>{
      p.width=p.svg.getBoundingClientRect().width;p.scale=p.width/200;
      if(!old){p.x=laneWidth*(i ? .74:.12);p.time=i*.43;}
      else p.x=p.x/old*laneWidth;
      // Escena quieta: de pie, sin zancada ni gestos
      if(reduce.matches){p.gait=0;p.sit=0;p.look=0;p.alza=0;p.salto=0;p.juego=0;p.zarpa=0;p.trae=null;}
      pose(p);
    });
    colocaJuguetes();
  }
  function pose(p){
    const {cycle,stride}=p;
    const phase=p.time/cycle,step=phase*4*pi;
    const breath=Math.sin(p.time*2.1)*.12*(1-p.gait);
    const bob=(Math.cos(step)*.62+Math.cos(step*2+.35)*.1)*p.gait+breath;
    const weight=Math.sin(step)*p.gait;
    const pitch=weight*(p.cat ? .42 : .58);
    const surge=Math.sin(phase*2*pi)*.34*p.gait+p.zarpa*5.2;
    p.svg.style.transform=`translate3d(${p.x}px,${-p.salto}px,0)${p.facing<0?' scaleX(-1)':''}`;
    p.body.setAttribute('transform',`translate(${surge} ${bob+p.sit*3.2-p.alza*1.6}) rotate(${pitch-p.sit*(p.cat?5.2:4.4)-p.alza*7} 124 64)`);
    const glance=-p.look*(p.cat?9.2:8.2);
    p.head.setAttribute('transform',`translate(${surge*.55-p.look*.9} ${bob*.62-p.look*3.4-p.sit*1.2+p.zarpa*2.6-p.alza*4.4}) rotate(${glance-pitch*.72-p.zarpa*7-p.alza*17+Math.sin(phase*2*pi+.5)*(p.cat ? .38 : .55)*p.gait} 139 48)`);
    if(p.ear)p.ear.setAttribute('transform',`rotate(${Math.sin(phase*4*pi+.8)*1.35} 141 31)`);
    // Four staggered contacts. During stance the paw moves backwards exactly
    // as fast as the animal advances; swing matches velocity and acceleration at both contacts.
    const offsets=p.cat?[.5,.75,0,.25]:[.5,.77,0,.27];
    p.legs.forEach((leg,i)=>{
      const hind=i%2===0, far=i<2, f=(phase+offsets[i])%1;
      const stance=.64, hipX=hind?(p.cat?65:65):(p.cat?125:128);
      const hipY=(hind?(p.cat?68:63):(p.cat?64:59))+bob+p.sit*(hind?8.5:2.2);
      const reach=stride*stance,ground=90;
      let footX,footY;
      if(f<stance){
        footX=hipX+reach/2-stride*f;
        const plant=Math.min(f/.08,(stance-f)/.1,1);
        footY=ground-Math.max(0,1-plant)*.35;
      }
      else{const u=(f-stance)/(1-stance),ease=u*u*u*(10+u*(-15+6*u));
        footX=hipX-reach/2-stride*(1-stance)*u+stride*ease;
        const lift=Math.sin(pi*u);
        footY=ground-(p.cat?7.2:8.4)*lift*lift*(.72+.28*lift);
      }
      const neutralX=hipX+(hind?-3.5:3.5)+(far?-1.8:1.8);
      footX=neutralX+(footX-neutralX)*p.gait;
      footY=ground+(footY-ground)*p.gait;
      const seatedX=hipX+(hind?(p.cat?-13:-15):4)+(far?-1.4:1.4);
      footX+=(seatedX-footX)*p.sit;
      const l1=p.cat?(hind?16:17):(hind?18:19),l2=p.cat?17:19;
      const dx=footX-hipX,dy=footY-hipY,dist=Math.min(Math.hypot(dx,dy),l1+l2-.01);
      const angle=Math.atan2(dy,dx)+(hind?-1:1)*Math.acos(Math.max(-1,Math.min(1,(l1*l1+dist*dist-l2*l2)/(2*l1*dist))));
      const kx=hipX+l1*Math.cos(angle),ky=hipY+l1*Math.sin(angle);
      // Tapered thigh, softly rounded joint, narrow ankle and compact paw.
      const thigh=p.cat?(hind?4.7:3.3):(hind?6:4.2);
      const joint=p.cat?2.5:3,ankle=p.cat?1.6:2, toe=p.cat?4.2:5;
      leg.setAttribute('d',`M${hipX-thigh} ${hipY-2}
        Q${hipX-thigh-1} ${hipY+8} ${kx-joint} ${ky}
        Q${kx-joint} ${ky+3} ${footX-ankle} ${footY-3}
        Q${footX-ankle-1} ${footY} ${footX} ${footY}
        L${footX+toe} ${footY} Q${footX+toe+1.5} ${footY-1.5} ${footX+toe-1} ${footY-3}
        L${footX+ankle} ${footY-4} Q${kx+joint} ${ky+3} ${kx+joint} ${ky}
        Q${hipX+thigh} ${hipY+7} ${hipX+thigh} ${hipY-2} Z`);
    });
    const vaiven=(Math.sin(phase*2*pi*.72)+Math.sin(phase*2*pi*1.43+.8)*.28)*(p.look>.5&&p.juego<.2?0.26:1);
    const sway=vaiven*(1-p.juego*.7)+Math.sin(p.wag*(p.cat?7.4:10.6))*1.7*p.juego;
    p.tail.setAttribute('d',p.cat
      ?`M55 ${65+bob+p.sit*5} C34 ${63+bob+p.sit*6} 30 ${38+sway*2.8+p.sit*5} 22 ${27+sway*4+p.sit*3} Q14 ${17+sway*5.2+p.sit*2} 12 ${29+sway*3.6+p.sit*2}`
      :`M57 ${53+bob+p.sit*4} C42 ${49+bob+p.sit*5} 34 ${36+sway*3.4+p.sit*4} 22 ${35+sway*5.2+p.sit*3}`);
    const compression=(1+Math.cos(step))*.5;
    // La sombra no sube con el salto: se queda en el suelo y se cierra
    const vuelo=p.scale?p.salto/p.scale:0,lejos=clamp(p.salto/70,0,1);
    p.shadow.setAttribute('transform',`translate(0 ${vuelo.toFixed(2)})`);
    p.shadow.setAttribute('rx',String((59+compression*3)*(1-lejos*.34)));
    p.shadow.setAttribute('ry',String((2.65+compression*.45)*(1-lejos*.34)));
    p.shadow.style.opacity=String((.1+compression*.05)*(1-lejos*.55));
    const blink=(p.time+(p.cat?1.7:0))%5.7;
    p.eye.setAttribute('ry',blink>5.5?Math.max(.18,1.6*Math.abs(blink-5.6)/.1):1.6);
  }
  function objetivos(){
    if(!juguetes.length)return;
    const clave=arrastrado||posado||elegido;
    const comun=clave?porClave(clave):null;
    pets.forEach(p=>{
      const j=p.trae?p.trae.j:(comun||porClave(p.suyo));
      p.juguete=j;
      if(!j){p.targetX=null;return;}
      if(p.trae){
        // La pelota va en la boca: el destino se mide desde el hocico
        const haciaDerecha=(p.x+p.width/2)<=p.trae.destino;
        const morro=haciaDerecha?.85:.15;
        p.targetX=clamp(p.trae.destino-morro*p.width,-p.width*.18,laneWidth-p.width*.82);
        return;
      }
      const centro=j.x+j.lado/2;
      // Si comparten juguete, el perro se pone a la izquierda y el gato a la derecha
      const izquierda=comun?!p.cat:(p.x+p.width/2)<=centro;
      const hocico=izquierda?.78:.22;
      p.targetX=clamp(centro-hocico*p.width,-p.width*.18,laneWidth-p.width*.82);
    });
  }
  // Altura a la que llega el hocico estando de pie
  const alcance=p=>(p.width/2)*(p.cat?.45:.52);
  const hocicoX=p=>p.x+p.width*(p.facing<0?.15:.85);
  // El perro recoge la pelota lanzada y la devuelve al punto desde donde la soltaste
  function acarrea(p,dt){
    if(p.cat)return false;                     // el gato no la devuelve
    p.esperaTrae-=dt;
    if(p.trae){
      const j=p.trae.j;
      if(j.cogido){p.trae=null;j.portada=false;return false;}
      // La pelota viaja en la boca
      j.x=clamp(hocicoX(p)-j.lado/2,0,Math.max(0,laneWidth-j.lado));
      j.y=Math.max(0,alcance(p)*.78+p.salto-j.lado/2);
      j.vx=0;j.vy=0;
      j.giro+=p.vx*dt*.5;
      dibujaJuguete(j);
      if(Math.abs(hocicoX(p)-p.trae.destino)<18&&Math.abs(p.vx)<24){
        j.portada=false;
        j.vx=p.vx*.15;j.vy=-20;
        p.trae=null;
        p.esperaTrae=1.4;
      }
      return true;
    }
    const j=p.juguete;
    if(!j||!j.lanzada||j.cogido||j.portada||p.esperaTrae>0)return false;
    // Solo la recoge cuando ya esta parada y la tiene junto al hocico
    if(j.y>6||Math.abs(j.vx)>26)return false;
    if(Math.abs(hocicoX(p)-(j.x+j.lado/2))>p.width*.2||Math.abs(p.vx)>30)return false;
    j.lanzada=false;
    j.portada=true;
    p.trae={j,destino:clamp(j.origen,j.lado,Math.max(j.lado,laneWidth-j.lado))};
    return true;
  }
  function juega(p,dt){
    const j=p.juguete;
    // El salto sigue su curso aunque se quede sin juguete
    p.saltoV-=1750*dt;
    p.salto=Math.max(0,p.salto+p.saltoV*dt);
    if(p.salto<=0)p.saltoV=0;
    p.esperaSalto-=dt;
    if(!j){
      p.juego+=(0-p.juego)*Math.min(1,dt*4);
      p.zarpa+=(0-p.zarpa)*Math.min(1,dt*6);
      p.alza+=(0-p.alza)*Math.min(1,dt*5);
      return false;
    }
    if(p.trae){
      // Con la pelota en la boca: trota contento, sin zarpazos
      p.juego+=(1-p.juego)*Math.min(1,dt*4);
      p.zarpa+=(0-p.zarpa)*Math.min(1,dt*7);
      p.alza+=(0-p.alza)*Math.min(1,dt*6);
      p.wag+=dt;
      return false;
    }
    const centro=j.x+j.lado/2,hocico=p.x+p.width*(p.facing<0?.22:.78);
    const cerca=Math.abs(hocico-centro)<p.width*.42&&Math.abs(p.vx)<26;
    p.juego+=(Number(cerca)-p.juego)*Math.min(1,dt*(cerca?5:3));
    p.zarpa+=(0-p.zarpa)*Math.min(1,dt*7);
    p.wag+=dt;
    p.espera-=dt;

    // ---- Pelota en alto: estiran el cuello y saltan a por ella ----
    const tope=alcance(p),altura=j.y+j.lado/2;
    const arriba=cerca?clamp((altura-tope*.5)/(tope*1.1),0,1):0;
    p.alza+=(arriba-p.alza)*Math.min(1,dt*(arriba>p.alza?6:4));
    const aptoSalto=cerca&&p.salto<=0&&p.esperaSalto<=0&&altura>tope*.75&&altura<tope+96;
    if(aptoSalto){
      p.saltoV=clamp((altura-tope)*7.4+120,120,330);
      p.salto=.1;
      p.esperaSalto=.75+Math.random()*.6;
    }
    // Cabezazo en el aire: alcanza la pelota y la manda hacia abajo
    if(p.salto>2&&!j.cogido&&Math.abs(hocico-centro)<p.width*.26&&Math.abs(altura-(tope+p.salto))<22){
      const dir=Math.sign(centro-hocico)||(p.cat?-1:1);
      j.vx=clamp(j.vx+dir*150,-460,460);
      j.vy=Math.min(j.vy,-120);
      j.giro+=dir*26;
      p.zarpa=1;
      p.espera=Math.max(p.espera,.4);
    }

    // Zarpazo: solo si el juguete esta a su alcance, en el suelo y libre
    if(cerca&&!j.cogido&&p.espera<=0&&j.y<34&&p.salto<=0&&Math.abs(hocico-centro)<p.width*.3){
      // Cerca de un borde, el zarpazo lo devuelve hacia dentro: el juguete no se queda encallado
      let dir=Math.sign(centro-hocico)||(p.cat?-1:1);
      const margen=Math.max(60,laneWidth*.1);
      if(j.x<margen)dir=1;
      else if(j.x>laneWidth-j.lado-margen)dir=-1;
      // En carriles estrechos (movil) el zarpazo es mas suave
      const fuerza=clamp(laneWidth/1200,.55,1);
      j.vx=clamp(j.vx+dir*(150+Math.random()*180)*fuerza,-460,460);
      j.vy=Math.max(j.vy,0)+(190+Math.random()*150)*fuerza;
      j.giro+=dir*30;
      p.zarpa=1;
      p.espera=.7+Math.random()*.7;
    }
    return cerca;
  }
  function tick(now){
    frame=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    fisicaJuguetes(dt);
    objetivos();
    pets.forEach(p=>{
      const speed=(p.stride/p.cycle)*p.scale;
      const runSpeed=Math.min(230,Math.max(150,laneWidth*.16));
      let desired=p.cat?-speed:speed,arrived=false;
      if(p.targetX!==null){
        const delta=p.targetX-p.x;
        if(Math.abs(delta)<1.2&&Math.abs(p.vx)<7){p.x=p.targetX;p.vx=0;desired=0;arrived=true;}
        else desired=Math.sign(delta)*Math.min(runSpeed,Math.max(32,Math.sqrt(Math.abs(delta)*520)));
      }
      const acceleration=(p.targetX===null?170:390)*dt;
      p.vx+=Math.max(-acceleration,Math.min(acceleration,desired-p.vx));
      if(Math.abs(p.vx)>.8)p.facing=Math.sign(p.vx);
      p.x+=p.vx*dt;
      if(p.targetX!==null&&(p.targetX-p.x)*desired<0){p.x=p.targetX;p.vx=0;arrived=true;}
      if(arrived){
        const j=p.juguete;
        p.facing=j?(Math.sign((j.x+j.lado/2)-(p.x+p.width/2))||(p.cat?-1:1)):(p.cat?-1:1);
      }
      if(p.targetX===null){
        if(p.x>laneWidth+8)p.x=-p.width-8;
        if(p.x < -p.width-8)p.x=laneWidth+8;
      }
      const moving=Math.abs(p.vx)>3&&!arrived;
      acarrea(p,dt);
      const jugando=juega(p,dt);
      p.gait+=(Number(moving)-p.gait)*Math.min(1,dt*(moving?7:4.5));
      p.look+=(Number(p.targetX!==null&&!moving)-p.look)*Math.min(1,dt*4.2);
      // Jugando se quedan de pie; solo se sientan cuando el juguete descansa lejos
      p.sit+=(Number(p.targetX!==null&&!moving&&!jugando)-p.sit)*Math.min(1,dt*3.4);
      p.time+=dt*Math.max(.18,Math.min(2.25,Math.abs(p.vx)/speed));
      pose(p);
    });
    frame=requestAnimationFrame(tick);
  }
  let presentado=false;
  function presenta(){
    if(presentado||!juguetes.length)return;
    presentado=true;
    const j=porClave('chat-help-dialog')||juguetes[0];
    const bote=fuerza=>{if(!j.cogido){j.vy=fuerza;j.vx=(Math.random()-.5)*40;}};
    setTimeout(()=>bote(430),420);
    setTimeout(()=>bote(300),1080);
  }
  function sync(){
    const run=visible&&!document.hidden&&!reduce.matches;
    if(run&&!frame){last=0;frame=requestAnimationFrame(tick);presenta();}
    if(!run&&frame){cancelAnimationFrame(frame);frame=0;last=0;}
  }
  if('IntersectionObserver' in window)new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();}).observe(lane);
  else visible=true;
  if('ResizeObserver' in window)new ResizeObserver(size).observe(lane);
  else window.addEventListener('resize',size,{passive:true});
  document.addEventListener('visibilitychange',sync);
  reduce.addEventListener('change',()=>{size();sync();});
  function tarjetaDe(clave){
    return cards.find(c=>c.querySelector('[data-contact-dialog="'+clave+'"]'))||null;
  }
  function claveDe(card){
    const boton=card.querySelector('[data-contact-dialog]');
    return boton?boton.dataset.contactDialog:null;
  }
  // En movil las tarjetas se apilan y la caida cruzaria toda la columna: alli no se suelta
  const anchoEstrecho=()=>window.innerWidth<=820;
  // La pelota desaparece del suelo y cae desde el icono de la tarjeta señalada
  function sueltaDesdeIcono(clave){
    if(anchoEstrecho())return;
    const j=porClave(clave),tarjeta=tarjetaDe(clave);
    if(!j||!tarjeta||j.cogido||j.cayendo)return;
    if(j.y>6||Math.abs(j.vx)>20)return;      // si ya esta en juego, no se reinicia
    const icono=tarjeta.querySelector('.contact-icon');
    if(!icono)return;
    const rc=capa.getBoundingClientRect(),ri=icono.getBoundingClientRect();
    const alturaSuelo=capaAlto-suelo;
    const altura=alturaSuelo-(ri.top-rc.top+ri.height/2+j.lado/2);
    if(altura<j.lado)return;                 // el icono no queda por encima: nada que soltar
    j.x=clamp(ri.left-rc.left+ri.width/2-j.lado/2,0,Math.max(0,laneWidth-j.lado));
    j.y=altura;
    j.vx=(Math.random()-.5)*70;
    j.vy=0;
    j.giro=0;
    j.movido=true;
    j.cayendo=true;
    j.el.classList.add('esta-cayendo','esta-brotando');
    setTimeout(()=>j.el.classList.remove('esta-brotando'),280);
    icono.classList.remove('suelta-pelota');
    void icono.offsetWidth;
    icono.classList.add('suelta-pelota');
    dibujaJuguete(j);
  }
  function marcaActivo(){
    const clave=arrastrado||posado||elegido;
    juguetes.forEach(j=>j.el.classList.toggle('es-activo',j.clave===clave));
  }
  // Si no hay juguetes, se mantiene el comportamiento anterior: acudir a la tarjeta
  function gather(card){
    const laneRect=lane.getBoundingClientRect(),cardRect=card.getBoundingClientRect();
    const center=cardRect.left-laneRect.left+cardRect.width/2;
    const dog=pets.find(p=>!p.cat),cat=pets.find(p=>p.cat),gap=Math.max(10,laneWidth*.012);
    const total=dog.width+cat.width+gap;
    const start=Math.max(6,Math.min(laneWidth-total-6,center-total/2));
    dog.targetX=start;
    cat.targetX=start+dog.width+gap;
  }
  function release(){pets.forEach(p=>{p.targetX=null;});}
  cards.forEach(card=>{
    const clave=claveDe(card);
    const entra=()=>{
      if(!juguetes.length||!porClave(clave)){gather(card);return;}
      posado=clave;marcaActivo();sueltaDesdeIcono(clave);sync();
    };
    const sale=()=>{
      if(!juguetes.length||!porClave(clave)){release();return;}
      if(posado===clave)posado=null;
      marcaActivo();
    };
    const icono=card.querySelector('.contact-icon');
    if(icono)icono.addEventListener('animationend',()=>icono.classList.remove('suelta-pelota'));
    card.addEventListener('mouseenter',entra);
    card.addEventListener('mouseleave',sale);
    card.addEventListener('focusin',entra);
    card.addEventListener('focusout',e=>{if(!card.contains(e.relatedTarget))sale();});
    // Al elegir una seccion, los dos se quedan jugando con su icono
    card.addEventListener('click',()=>{
      if(!juguetes.length||!porClave(clave))return;
      elegido=elegido===clave?null:clave;
      marcaActivo();
      if(elegido)sueltaDesdeIcono(clave);
      sync();
    });
  });

  // ---- Arrastre de los juguetes ----
  juguetes.forEach(j=>{
    const local=e=>{
      const r=capa.getBoundingClientRect();
      return {x:e.clientX-r.left,y:e.clientY-r.top};
    };
    const suelta=()=>{
      if(!j.cogido)return;
      j.cogido=false;j.puntero=null;
      j.el.classList.remove('is-held');
      if(arrastrado===j.clave)arrastrado=null;
      // Un lanzamiento de verdad: el perro ira a buscarla y la traera aqui
      if(j.desplazado&&Math.hypot(j.vx,j.vy)>170){
        j.lanzada=true;
        j.origen=clamp(j.x+j.lado/2,j.lado,Math.max(j.lado,laneWidth-j.lado));
      }
      marcaActivo();
    };
    j.el.addEventListener('pointerdown',e=>{
      if(j.cogido||e.button>0)return;
      e.preventDefault();
      const pt=local(e),alto=techoJuego()-j.lado;
      j.cogido=true;j.puntero=e.pointerId;j.movido=true;j.desplazado=false;
      j.vx=0;j.vy=0;j.lanzada=false;j.portada=false;
      pets.forEach(p=>{if(p.trae&&p.trae.j===j)p.trae=null;});
      j.asaX=pt.x-j.x;
      j.asaY=pt.y-(alto-j.y);
      j.ultX=j.x;j.ultY=j.y;j.ultT=e.timeStamp;
      arrastrado=j.clave;
      j.el.classList.add('is-held');
      try{j.el.setPointerCapture(e.pointerId);}catch(err){}
      marcaActivo();sync();
    });
    j.el.addEventListener('pointermove',e=>{
      if(!j.cogido||e.pointerId!==j.puntero)return;
      e.preventDefault();
      const pt=local(e),alto=Math.max(0,techoJuego()-j.lado);
      const x=clamp(pt.x-j.asaX,0,Math.max(0,laneWidth-j.lado));
      const y=clamp(alto-(pt.y-j.asaY),0,alto);
      if(Math.abs(x-j.x)>3||Math.abs(y-j.y)>3)j.desplazado=true;
      const dt=Math.max(16,e.timeStamp-j.ultT)/1000;
      j.vx=clamp((x-j.ultX)/dt,-900,900);
      j.vy=clamp((y-j.ultY)/dt,-900,900);
      j.x=x;j.y=y;j.ultX=x;j.ultY=y;j.ultT=e.timeStamp;
      dibujaJuguete(j);
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(tipo=>{
      j.el.addEventListener(tipo,e=>{if(e.pointerId===j.puntero)suelta();});
    });
    // Un toque sin arrastre lo lanza hacia arriba
    j.el.addEventListener('click',e=>{
      e.preventDefault();
      if(j.desplazado){j.desplazado=false;return;}
      j.vy=Math.max(j.vy,0)+320;
      j.vx=clamp(j.vx+(Math.random()-.5)*160,-320,320);
      sync();
    });
    // Accesible con teclado: flechas para moverlo
    j.el.addEventListener('keydown',e=>{
      const paso=e.shiftKey?36:14;
      let dx=0,dy=0;
      if(e.key==='ArrowLeft')dx=-paso;
      else if(e.key==='ArrowRight')dx=paso;
      else if(e.key==='ArrowUp')dy=paso;
      else if(e.key==='ArrowDown')dy=-paso;
      else return;
      e.preventDefault();
      j.movido=true;j.vx=0;j.vy=0;
      j.x=clamp(j.x+dx,0,Math.max(0,laneWidth-j.lado));
      j.y=clamp(j.y+dy,0,Math.max(0,techoJuego()-j.lado));
      dibujaJuguete(j);
      sync();
    });
    j.el.addEventListener('focus',()=>{arrastrado=j.clave;marcaActivo();sync();});
    j.el.addEventListener('blur',()=>{if(arrastrado===j.clave&&!j.cogido)arrastrado=null;marcaActivo();});
  });

  size();sync();
})();

/* Patita lateral: indica el progreso y se desvanece al terminar el scroll. */
(() => {
  const indicator = document.querySelector('.scroll-paw-indicator');
  if (!indicator || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const trail = indicator.querySelector('.scroll-paw-trail');
  const icon = indicator.querySelector('.scroll-paw-lead');
  let frame = 0;
  let idleTimer = 0;
  let lastPrintY = null;
  let foot = 1;
  let walking = false;

  const leavePrint = y => {
    const print = document.createElement('img');
    const mobile = window.innerWidth <= 820;
    foot *= -1;
    print.className = 'scroll-paw-print';
    print.src = icon.currentSrc || icon.src;
    print.alt = '';
    print.width = mobile ? 14 : 18;
    print.height = mobile ? 14 : 18;
    print.style.setProperty('--print-y', `${Math.round(y)}px`);
    print.style.setProperty('--print-x', `${foot * (mobile ? 8 : 12)}px`);
    print.style.setProperty('--print-turn', `${foot * 13}deg`);
    trail.appendChild(print);
    requestAnimationFrame(() => print.classList.add('is-visible'));
    setTimeout(() => print.classList.add('is-fading'), 1250);
    setTimeout(() => print.remove(), 1850);
  };

  const paint = () => {
    frame = 0;
    const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const progress = scrollable ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    const travel = Math.max(0, indicator.clientHeight - (icon?.offsetHeight || 32));
    const y = progress * travel;
    indicator.style.setProperty('--paw-y', `${Math.round(y)}px`);

    if (lastPrintY === null) lastPrintY = y;
    if (walking) {
      const step = window.innerWidth <= 820 ? 28 : 36;
      const direction = Math.sign(y - lastPrintY);
      let prints = 0;
      while (direction && Math.abs(y - lastPrintY) >= step && prints < 6) {
        lastPrintY += direction * step;
        leavePrint(lastPrintY);
        prints++;
      }
      if (prints === 6) lastPrintY = y;
      indicator.style.setProperty('--paw-x', `${foot * (window.innerWidth <= 820 ? 5 : 7)}px`);
      indicator.style.setProperty('--paw-turn', `${foot * 8}deg`);
    } else {
      lastPrintY = y;
    }
    walking = false;
  };

  const requestPaint = () => {
    if (!frame) frame = requestAnimationFrame(paint);
  };

  window.addEventListener('scroll', () => {
    document.body.classList.add('is-scrolling');
    walking = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => document.body.classList.remove('is-scrolling'), 900);
    requestPaint();
  }, {passive: true});
  window.addEventListener('resize', requestPaint, {passive: true});
  requestPaint();
})();

/* Precios: selector Perros/Gatos y detalle desplegable de cada modalidad. */
(() => {
  'use strict';
  const section = document.querySelector('#precios');
  if (!section) return;

  const notes = {
    perro: 'Cualquier raza de perro, incluidas las consideradas potencialmente peligrosas (PPP).',
    gato: 'Todas las razas de gato, con el mismo precio y las mismas coberturas.'
  };
  const words = { perro: 'perro', gato: 'gato' };
  const options = [...section.querySelectorAll('[data-pricing-pet]')];
  const note = section.querySelector('[data-pricing-pet-note]');
  const petWords = [...section.querySelectorAll('[data-pet-word]')];
  const petOnly = [...section.querySelectorAll('[data-pet-only]')];

  const showPet = pet => {
    options.forEach(option => option.setAttribute('aria-pressed', String(option.dataset.pricingPet === pet)));
    if (note) note.textContent = notes[pet];
    petWords.forEach(word => { word.textContent = words[pet]; });
    petOnly.forEach(item => { item.hidden = item.dataset.petOnly !== pet; });
  };
  options.forEach(option => option.addEventListener('click', () => showPet(option.dataset.pricingPet)));

  section.querySelectorAll('.plan-toggle').forEach(toggle => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    const closedLabel = toggle.querySelector('[data-label-closed]');
    const openLabel = toggle.querySelector('[data-label-open]');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      if (panel) panel.hidden = !open;
      if (closedLabel) closedLabel.hidden = open;
      if (openLabel) openLabel.hidden = !open;
    });
  });
})();

/* Coberturas: cada tarjeta muestra u oculta sus importes y ejemplos. */
(() => {
  'use strict';
  document.querySelectorAll('.group-amounts').forEach(button => {
    const group = document.getElementById(button.getAttribute('aria-controls'));
    const offLabel = button.querySelector('[data-amounts-off]');
    const onLabel = button.querySelector('[data-amounts-on]');
    if (!group) return;
    button.addEventListener('click', () => {
      const show = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(show));
      group.dataset.amounts = show ? 'visible' : 'hidden';
      if (offLabel) offLabel.hidden = show;
      if (onLabel) onLabel.hidden = !show;
    });
  });
})();
