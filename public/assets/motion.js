import {vertex,fragment} from './prism-water.js';
import {composeScene,smooth} from './camera-director.js';
import {setupTypography,activateGlyph,exitTypography} from './type-motion.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(pointer: coarse)');
let userPaused=false;
try{userPaused=localStorage.getItem('portfolio-motion')==='paused';}catch{}
let paused=reduced.matches||userPaused;
const control=document.createElement('button');
control.className='motion-toggle';control.type='button';document.body.append(control);
function updateControl(){
  control.textContent=paused?'○ MOTION OFF':'● MOTION ON';
  control.setAttribute('aria-label',paused?'开启页面动效':'暂停页面动效');
  control.setAttribute('aria-pressed',String(!paused));
  document.documentElement.classList.toggle('motion-paused',paused);
}
updateControl();

let frame=0,lastFrame=0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
class Droplet{
  constructor(parent){
    this.time=0;this.nextAuto=.8;this.lastTouch=-10;
    this.point={x:0,y:0};this.aim={x:0,y:0};this.visible=false;this.quality=1;
    this.contact={x:0,y:0,z:1,strength:0};this.touching=0;this.momentum={x:0,y:0};
    this.waves=Array.from({length:4},()=>({x:0,y:0,z:1,age:10,power:0}));
    this.host=document.createElement('div');this.host.className='water-host water-single';
    this.host.setAttribute('aria-hidden','true');
    this.object=document.createElement('div');this.object.className='water-object';
    this.canvas=document.createElement('canvas');this.object.append(this.canvas);this.host.append(this.object);
    for(let i=0;i<2;i++){const orbit=document.createElement('span');orbit.className='water-orbit';this.host.append(orbit);}
    parent.append(this.host);
    try{this.initialize();}catch(error){console.warn('Water rendering unavailable:',error.message);this.gl=null;}
    this.resize();

    this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.lost=true;this.object.classList.remove('is-rendered');});
    this.canvas.addEventListener('webglcontextrestored',()=>{try{this.initialize();this.lost=false;this.resize();start();}catch{this.gl=null;}});
  }
  initialize(){
    const gl=this.canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,depth:false,stencil:false});
    if(!gl)return;
    const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const log=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(log);}return s;};
    const v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,fragment);
    const program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    this.uniforms=Object.fromEntries(['time','pointer','momentum','contact','ripple','ripple2','ripple3','ripple4','powers','pixel'].map(name=>[name,gl.getUniformLocation(program,name)]));
    this.gl=gl;this.object.classList.add('is-rendered');
  }
  resize(displaySize=400){
    this.side=displaySize;
    const gl=this.gl;
    if(gl&&!this.lost){
      const cap=900;
      const size=Math.max(1,Math.round(Math.min(cap,this.side*Math.min(devicePixelRatio,coarse.matches?1.25:1.5))*this.quality));
      if(this.canvas.width!==size){this.canvas.width=this.canvas.height=size;gl.viewport(0,0,size,size);}
      this.paint();
    }
  }
  unproject(x,y){
    // Unproject the pointer onto the same 3D sphere as the shader.
    const length=Math.hypot(x,y,2.35),dx=x/length,dy=y/length,dz=-2.35/length;
    const b=3.2*dz,disc=b*b-9.24;
    if(disc<=0)return null;
    const t=-b-Math.sqrt(disc);
    return {x:dx*t,y:dy*t,z:3.2+dz*t};
  }
  pulse(x,y,power=1){
    const point=this.unproject(x,y);if(!point)return;
    this.waves.pop();this.waves.unshift({...point,age:0,power});this.lastTouch=this.time;
  }
  advance(dt){
    this.time+=dt;this.waves.forEach(w=>w.age+=dt);
    if(this.time>this.nextAuto&&this.time-this.lastTouch>3.5&&!this.touching){this.pulse(-.26+Math.sin(this.time*.61)*.18,.31,.3);this.nextAuto=this.time+6.8;}
    const response=1-Math.exp(-dt/ .075);
    this.point.x+=(this.aim.x-this.point.x)*response;this.point.y+=(this.aim.y-this.point.y)*response;
    const contact=this.unproject(this.point.x,this.point.y);
    if(contact)Object.assign(this.contact,contact);
    this.contact.strength+=(this.touching-this.contact.strength)*(1-Math.exp(-dt/(this.touching?.065:.24)));
    this.momentum.x*=Math.exp(-dt*5);this.momentum.y*=Math.exp(-dt*5);
    this.paint();
  }
  paint(){
    const gl=this.gl,u=this.uniforms;if(!gl||this.lost)return;
    gl.uniform1f(u.time,this.time);gl.uniform2f(u.pointer,this.point.x,this.point.y);
    gl.uniform2f(u.momentum,this.momentum.x,this.momentum.y);
    gl.uniform4f(u.contact,this.contact.x,this.contact.y,this.contact.z,this.contact.strength);
    this.waves.forEach((w,i)=>gl.uniform4f(u[['ripple','ripple2','ripple3','ripple4'][i]],w.x,w.y,w.z,w.age));
    gl.uniform4f(u.powers,...this.waves.map(w=>w.power));
    gl.uniform1f(u.pixel,2/this.canvas.width);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);
  }
}
// One persistent surface and one shared scene progression for the sphere and the content.
const stage=document.createElement('div');stage.className='water-stage';stage.setAttribute('aria-hidden','true');document.body.prepend(stage);
const water=new Droplet(stage);
let pose={x:innerWidth*.54,y:innerHeight*.46,side:600,opacity:1},layout={},cards=[],intro,hero,footer,content,practice,burst,finale,burstTiles=[];
let travel=null,layoutDirty=true,scrollDirty=true,renderBucket=0,resizeTimer;
let directedY=scrollY;
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);
const blend=(a,b,t)=>({...b,x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),side:mix(a.side,b.side,t),opacity:mix(a.opacity??1,b.opacity??1,t)});
function top(el){let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y;}
function setupPage(){
  hero=document.querySelector('.landing-hero');intro=document.querySelector(hero?'.introduction':'.page-intro,.case-intro');footer=document.querySelector('.site-footer');content=document.querySelector('.content-section');
  practice=document.querySelector('.practice-section');burst=document.querySelector('.burst-section');finale=document.querySelector('.finale-section');burstTiles=[...document.querySelectorAll('.burst-tile')];water.touching=0;
  document.body.dataset.scene=location.pathname.split('/')[1]||'home';
  document.documentElement.classList.add('orb-ready');
  if(!hero)intro?.classList.add('cinema-intro');
  setupTypography(document.querySelector('.page-shell'),paused);
  cards=[...document.querySelectorAll('.project-card')].map((el,i)=>({el,index:i,top:0}));
  layoutDirty=true;measure();
}
function measure(){
  const w=document.documentElement.clientWidth,h=innerHeight;
  document.documentElement.style.setProperty('--viewport-width',`${w}px`);
  const work=document.querySelector('.selected-section,.project-grid,.academic-foundations,.archive-section,.now-list,.direct-contact,.case-figure');
  layout={w,h,mobile:w<=700,home:!!hero,route:document.body.dataset.scene,heroTop:hero?top(hero):94,heroHeight:hero?.offsetHeight||h*.8,introTop:intro?top(intro):h,workTop:work?top(work):h,workBottom:work?top(work)+work.offsetHeight:h*3,practiceTop:practice?top(practice):Infinity,practiceHeight:practice?.offsetHeight||0,contentTop:content?top(content):Infinity,footerTop:top(footer),footerHeight:footer.offsetHeight,max:Math.max(1,document.documentElement.scrollHeight-h)};
  cards.forEach(card=>{card.top=top(card.el);});layoutDirty=false;scrollDirty=true;
  Object.assign(layout,{burstTop:burst?top(burst):Infinity,burstHeight:burst?.offsetHeight||0,finaleTop:finale?top(finale):Infinity,finaleHeight:finale?.offsetHeight||0});
}
function targetPose(){return composeScene(layout,paused?scrollY:directedY);}
function choreograph(scene){
  if(paused)return;
  const mobile=layout.mobile;
  if(hero){
    document.querySelectorAll('.landing-line').forEach((line,i)=>{
      const shift=smooth(i*5,78+i*5,scene.push*100);
      line.style.transform=`translate3d(${(i===1?1:-1)*shift*(mobile?35:120)}px,${-shift*(i===2?0:30+i*10)}px,0)`;
      line.style.opacity=String(1-smooth(24+i*25,86+i*25,scene.push*100));
    });
    document.querySelector('.landing-bottom').style.opacity=String(1-smooth(12,64,scene.push*100));
    intro.style.setProperty('--copy-reveal',scene.reveal);
    intro.style.setProperty('--copy-x',`${(1-scene.reveal)*(mobile?-18:-48)}px`);
    intro.style.setProperty('--copy-y',`${(1-scene.reveal)*40}px`);
  }
  document.querySelector('.selected-section')?.style.setProperty('--column-offset',`${mobile?0:110-scene.workRead*110}px`);
  if(burst){
    const p=scene.burst*100;
    burst.style.setProperty('--burst-title',String(1-smooth(8,34,p)));
    burst.style.setProperty('--burst-title-y',`${-smooth(8,40,p)*70}px`);
    burst.style.setProperty('--burst-caption',String(smooth(26,47,p)*(1-smooth(70,90,p))));
    // Fixed art direction: three depths fan out from one origin, then pass above.
    const destinations=[[-.39,-.31,.84,-13],[.07,-.36,.65,8],[.40,-.23,.86,12],[-.26,.04,1,-7],[.26,.02,1.06,6],[-.04,.31,.90,-4],[-.44,.35,.67,9],[.43,.38,.7,-10],[-.10,-.12,.6,-9],[.20,.34,.65,12],[-.40,-.04,.55,-14],[.34,-.43,.55,7]];
    burstTiles.forEach((el,i)=>{
      const [x,y,size,rotation]=destinations[i%destinations.length],entry=smooth(i%3*3,48+i%3*3,p),exit=smooth(57+i%3*3,100,p);
      const spread=1+exit*.9;
      el.style.setProperty('--bx',`${x*layout.w*entry*spread}px`);
      el.style.setProperty('--by',`${layout.h*(.83*(1-entry)+y*entry-exit*(1.25+(i%3)*.25))}px`);
      el.style.setProperty('--bs',String(mix(.22,size,entry)*(1+exit*.3)));
      el.style.setProperty('--br',`${rotation*entry+exit*rotation*.7}deg`);
      el.style.setProperty('--bo',String(smooth(0,12,p)*(1-smooth(84,100,p))));
      el.style.zIndex=String(Math.round(size*10));
    });
  }
  if(finale){
    const p=scene.finale*100,approach=smooth(0,42,p),growth=smooth(0,94,p);
    const cx=layout.w*(.5+.32*(1-approach)),cy=layout.h*(.5+.44*(1-approach));
    const angle=-55+225*smooth(0,100,p);
    const size=Math.max(layout.w,layout.h)*.32*Math.exp(growth*3.2)/1000;
    // Background and horizontal type share one rotating aperture. The shape itself
    // reveals the headline while its edges are still clearly inside the viewport.
    finale.querySelector('clipPath path').setAttribute('transform',`translate(${cx} ${cy}) rotate(${angle}) scale(${size}) translate(-500 -500)`);
    finale.style.setProperty('--finale-gradient-angle',`${120+angle*.38}deg`);
    finale.style.setProperty('--finale-text-x',`${layout.w*.12*(1-smooth(18,72,p))}px`);
    const detail=smooth(62,83,p);
    finale.style.setProperty('--finale-detail',String(detail));
    finale.style.setProperty('--finale-detail-y',`${(1-detail)*16}px`);
    finale.classList.toggle('is-readable',detail>.95);
  }
  if(content){content.style.setProperty('--result-rise',`${(1-scene.content)*55}px`);content.style.setProperty('--result-reveal',String(.4+scene.content*.6));}
  footer.style.setProperty('--closing-rise',`${(1-scene.closing)*(mobile?25:70)}px`);
  footer.style.setProperty('--closing-reveal',String(.35+.65*smooth(12,85,scene.closing*100)));
}
function place(now){
  const scene=targetPose();let next=scene;
  if(travel&&!paused){const t=clamp((now-travel.start)/760,0,1);next=blend(travel.from,next,ease(t));if(t===1)travel=null;}
  pose=next;
  const drift=paused?0:Math.sin(water.time*.65)*2;
  water.host.style.transform=`translate3d(${pose.x-pose.side/2}px,${pose.y-pose.side/2+drift}px,0) scale(${pose.side/640})`;
  water.host.style.opacity=String(pose.opacity);
  stage.dataset.shot=scene.finale>0?'colour-takeover':scene.content>.1?'result':scene.practice>.1?'practice':scene.burstEntry>.1?'burst':scene.workRead>.1?'gallery-reading':scene.work>.1?'gallery-handoff':scene.push>.92?'reading':scene.push>.01?'push':'establish';
  const bucket=Math.min(900,Math.max(120,Math.ceil(pose.side/120)*120));
  if(bucket!==renderBucket){renderBucket=bucket;water.resize(bucket);}
  if(scrollDirty){choreograph(scene);scrollDirty=false;}
}
const cursor=document.createElement('div');cursor.className='focus-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
const cursorState={x:0,y:0,tx:0,ty:0,vx:0,vy:0,scale:1,targetScale:1,visible:false};
function hideCursor(){cursorState.visible=false;cursor.style.opacity='0';}
function updateCursor(dt){
  if(!cursorState.visible)return;
  const s=cursorState,frequency=32,decay=Math.exp(-frequency*dt);
  // Exact critically damped spring: accelerate toward the tip, then settle without bounce.
  const dx=s.x-s.tx,dy=s.y-s.ty;
  const ax=s.vx+frequency*dx,ay=s.vy+frequency*dy;
  s.x=s.tx+(dx+ax*dt)*decay;s.y=s.ty+(dy+ay*dt)*decay;
  s.vx=(s.vx-frequency*ax*dt)*decay;s.vy=(s.vy-frequency*ay*dt)*decay;
  s.scale+=(s.targetScale-s.scale)*(1-Math.exp(-dt/.065));
  cursor.style.transform=`translate3d(${s.x-5}px,${s.y-5}px,0) scale(${s.scale})`;
}
addEventListener('pointermove',event=>{
  if(paused||coarse.matches||innerWidth<=700||event.pointerType==='touch'){hideCursor();return;}
  const s=cursorState;
  s.tx=event.clientX;s.ty=event.clientY;
  if(!s.visible){s.x=s.tx;s.y=s.ty;s.vx=s.vy=0;s.visible=true;cursor.style.opacity='1';}
  const interactive=event.target.closest('a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),summary,[role="button"],[role="link"],[contenteditable="true"],.type-glyph');
  s.targetScale=interactive?1.8:1;
},{passive:true});
document.addEventListener('pointerleave',hideCursor);addEventListener('blur',hideCursor);
let sampleTime=0,sampleFrames=0,slowSamples=0;
function tick(now){
  frame=0;if(paused||document.hidden)return;
  const elapsed=(now-lastFrame)/1000;lastFrame=now;const dt=clamp(elapsed,0,.05);
  if(Math.abs(scrollY-directedY)>.05){directedY+=(scrollY-directedY)*(1-Math.exp(-dt/.085));scrollDirty=true;}else directedY=scrollY;
  if(layoutDirty)measure();
  place(now);if(pose.opacity>.005)water.advance(dt);updateCursor(dt);
  sampleTime+=elapsed;sampleFrames++;
  if(sampleTime>=1.5){const fps=Math.round(sampleFrames/sampleTime);water.host.dataset.renderFps=String(fps);slowSamples=fps<48?slowSamples+1:0;
    if(slowSamples>=2&&water.quality>.65){water.quality=Math.max(.65,water.quality*.85);water.resize(renderBucket);slowSamples=0;}sampleTime=0;sampleFrames=0;}
  frame=requestAnimationFrame(tick);
}
function stop(){cancelAnimationFrame(frame);frame=0;sampleTime=0;sampleFrames=0;}
function start(){if(!frame&&!paused&&!document.hidden){lastFrame=performance.now();frame=requestAnimationFrame(tick);}}
function interact(event){
  if(paused)return;
  if(event.target.closest('a,button,input,nav,.project-card,.practice-card,.content-feature')||pose.opacity<.1){water.touching=0;return;}
  const box=water.host.getBoundingClientRect(),x=((event.clientX-box.left)/box.width-.5)*2,y=-((event.clientY-box.top)/box.height-.5)*2;
  if(!water.unproject(x,y)){water.touching=0;return;}
  const dx=x-water.aim.x,dy=y-water.aim.y,speed=Math.hypot(dx,dy);
  water.momentum.x=clamp(water.momentum.x+dx*3,-1,1);water.momentum.y=clamp(water.momentum.y+dy*3,-1,1);
  water.aim={x,y};water.touching=event.buttons?1.3:.8;
  if(event.type==='pointerdown'||(speed>.025&&water.time-water.lastTouch>.13))water.pulse(x,y,event.type==='pointerdown'?1.1:clamp(speed*3,.25,.7));
}
addEventListener('pointermove',interact,{passive:true});addEventListener('pointerdown',interact,{passive:true});
addEventListener('pointerup',()=>{if(water.touching){water.pulse(water.point.x,water.point.y,.85);water.touching=coarse.matches?0:.55;}},{passive:true});
addEventListener('pointercancel',()=>{water.touching=0;},{passive:true});
document.addEventListener('pointerleave',()=>{water.touching=0;});
let historyTimer;
addEventListener('scroll',()=>{scrollDirty=true;clearTimeout(historyTimer);historyTimer=setTimeout(()=>history.replaceState({...history.state,scroll:scrollY},''),160);},{passive:true});
addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{measure();if(paused)place(performance.now());},80);});
document.addEventListener('portfolio:layout',()=>{layoutDirty=true;});
new ResizeObserver(()=>{layoutDirty=true;}).observe(document.body);
function pause(value){paused=value;updateControl();hideCursor();if(paused){stop();travel=null;document.getAnimations().forEach(a=>a.cancel());}else{scrollDirty=true;start();}measure();place(performance.now());}
control.addEventListener('click',()=>{userPaused=!paused;try{localStorage.setItem('portfolio-motion',userPaused?'paused':'on');}catch{}pause(userPaused);});
reduced.addEventListener('change',()=>pause(reduced.matches||userPaused));
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
addEventListener('pagehide',stop);addEventListener('pageshow',start);
setupPage();place(performance.now());start();

// Same-origin navigation swaps page content while the one WebGL surface stays alive.
let navigation=null,renderedRoute=location.pathname+location.search;
const announcer=document.createElement('span');announcer.className='sr-only';announcer.setAttribute('role','status');document.body.append(announcer);
history.scrollRestoration='manual';
async function navigate(url,{pop=false,restore=0}={}){
  navigation?.abort();const request=new AbortController();navigation=request;
  try{
    const response=await fetch(url.href,{signal:request.signal,headers:{'Accept':'text/html'}});
    if(!response.ok)throw Error('Navigation unavailable');
    const parsed=new DOMParser().parseFromString(await response.text(),'text/html');
    if(request.signal.aborted)return;
    const replacement=parsed.querySelector('.page-shell');if(!replacement)throw Error('Unknown page');
    const outgoing=exitTypography(document.querySelector('.page-shell'),paused);
    if(outgoing.length)await Promise.race([
      Promise.allSettled(outgoing.map(animation=>animation.finished)),
      new Promise(resolve=>setTimeout(resolve,390))
    ]);
    if(request.signal.aborted){outgoing.forEach(animation=>animation.cancel());return;}
    if(!pop){history.replaceState({...history.state,scroll:scrollY},'');history.pushState({scroll:0},'',url.href);}
    const from={...pose};document.querySelector('.page-shell').replaceWith(replacement);document.title=parsed.title;renderedRoute=url.pathname+url.search;
    const metadata='meta[name="description"],meta[property^="og:"],link[rel="canonical"],script[type="application/ld+json"]';
    document.head.querySelectorAll(metadata).forEach(el=>el.remove());parsed.head.querySelectorAll(metadata).forEach(el=>document.head.append(el.cloneNode(true)));
    document.dispatchEvent(new Event('portfolio:page'));setupPage();
    const hash=!pop&&url.hash&&document.getElementById(decodeURIComponent(url.hash.slice(1)));
    scrollTo({top:hash?hash.getBoundingClientRect().top+scrollY:restore,behavior:'instant'});directedY=scrollY;measure();
    travel=paused?null:{from,start:performance.now()};place(performance.now());
    const main=document.querySelector('main');main.setAttribute('tabindex','-1');main.focus({preventScroll:true});announcer.textContent=document.title;
    if(!paused)main.animate([{opacity:.5},{opacity:1}],{duration:320,easing:'ease-out'});
    start();navigation=null;
  }catch(error){if(error.name!=='AbortError')location.assign(url.href);}
}
document.addEventListener('click',event=>{
  activateGlyph(event,paused);
  const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  const url=new URL(link.href);if(url.origin!==location.origin||!url.pathname.endsWith('/'))return;
  if(url.pathname===location.pathname&&url.search===location.search){
    if(!url.hash){
      event.preventDefault();
      if(location.hash){history.replaceState({...history.state,scroll:scrollY},'');history.pushState({scroll:0},'',url.href);}
      scrollTo({top:0,behavior:paused?'instant':'smooth'});
    }
    return;
  }
  event.preventDefault();navigate(url);
});
addEventListener('popstate',event=>{
  const url=new URL(location.href);
  if(renderedRoute===url.pathname+url.search){
    navigation?.abort();navigation=null;
    const anchor=url.hash&&document.getElementById(decodeURIComponent(url.hash.slice(1)));
    const y=event.state?.scroll??(anchor?top(anchor):0);
    scrollTo({top:y,behavior:'instant'});directedY=scrollY;scrollDirty=true;place(performance.now());
    return;
  }
  navigate(url,{pop:true,restore:event.state?.scroll||0});
});
