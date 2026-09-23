// Camera poses follow content hand-offs and measured document geometry.
export const mix=(a,b,t)=>a+(b-a)*t;
export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const smooth=(start,end,value)=>{const t=clamp((value-start)/Math.max(1,end-start));return t*t*(3-2*t);};
export function composeScene(l,y){
  const {w,h,mobile,home}=l;
  const push=home?smooth(h*.05,l.introTop-h*.10,y):1;
  const reveal=smooth(22,82,push*100);
  const work=smooth(l.workTop-h*.8,l.workTop+h*.12,y);
  const workRead=smooth(l.workTop+h*.6,Math.max(l.workTop+h*1.5,l.workBottom-h*.9),y);
  const practice=Number.isFinite(l.practiceTop)?smooth(l.practiceTop-h*.9,l.practiceTop,y):0;
  const spread=Number.isFinite(l.practiceTop)?smooth(l.practiceTop,l.practiceTop+Math.max(h*.5,l.practiceHeight-h),y):0;
  const content=Number.isFinite(l.contentTop)?smooth(l.contentTop-h*.65,l.contentTop+h*.05,y):0;
  const burst=Number.isFinite(l.burstTop)?clamp((y-l.burstTop)/Math.max(1,l.burstHeight-h)):0;
  const burstEntry=Number.isFinite(l.burstTop)?smooth(l.burstTop-h*.7,l.burstTop,y):0;
  const finale=Number.isFinite(l.finaleTop)?clamp((y-l.finaleTop)/Math.max(1,l.finaleHeight-h)):0;
  const retire=smooth(55,95,burst*100);
  const closing=smooth(l.footerTop-h*.7,l.max,y);
  let x=mix(w*.52,w*(mobile?1.2:1.01),push);
  let cy=mix(l.heroTop+l.heroHeight*.44,h*.49,push);
  let side=mix(mobile?w*1.12:Math.min(w*.6,h*.88),h*(mobile?1.05:1.8),push);
  let opacity=mobile?mix(1,.23,push):1;
  if(home&&!mobile){
    // The gallery takes visual priority. Lift the same sphere out of the
    // reading area before the cards arrive, then bring it back for the burst.
    x=mix(x,w*.48,work);cy=mix(cy,-h*.31,work);side=mix(side,h*1.08,work);
    opacity=mix(opacity,.18,work);
    x=mix(x,w*.5,workRead);cy=mix(cy,h*.88,workRead);side=mix(side,h*.3,workRead);
    opacity=mix(opacity,.09,workRead);
    x=mix(x,w*.5,burstEntry);cy=mix(cy,h*.68,burstEntry);side=mix(side,h*.75,burstEntry);
    opacity=mix(opacity,.88,burstEntry);
    const bloom=smooth(8,82,burst*100);
    x=mix(x,w*.12,bloom);cy=mix(cy,h*.44,bloom);side=mix(side,h*1.2,bloom);
  }else if(home){
    x=mix(x,w*1.3,work);side=mix(side,h*.8,work);
    x=mix(x,w*.95,practice);side=mix(side,w*1.3,practice);opacity=mix(opacity,.28,practice);
    x=mix(x,w*1.3,content);
    x=mix(x,w*.52,burstEntry);cy=mix(cy,h*.44,burstEntry);
    side=mix(side,w*1.12,burstEntry);opacity=mix(opacity,.52,burstEntry);
    const bloom=smooth(8,82,burst*100);
    x=mix(x,w*.14,bloom);side=mix(side,w*1.45,bloom);
  }else{
    const isWork=l.route==='work',isContact=l.route==='contact';
    x=w*(isWork?.88:isContact?.85:1.01);cy=h*(isWork?.36:isContact?.62:.49);
    side=h*(isWork?1.05:isContact?1.35:1.42);
    x=mix(x,w*(isWork?1.18:1.12),work);
    cy=mix(cy,isWork?-h*.2:h*.49,work);
    side=mix(side,h*(isWork?.92:1.3),work);
    opacity=mobile?.26:mix(1,isWork?.16:.65,work);
    if(mobile){x=w*1.15;side=h*.85;}
  }
  x=mix(x,w*(mobile?1.22:1.06),closing);
  cy=mix(cy,h*.53,closing);side=mix(side,h*(mobile?.78:1.1),closing);
  opacity=mix(opacity,mobile?.22:.8,closing);
  // The visual interlude hands over to readable content; the finale owns colour.
  if(home)opacity*=1-retire;
  return{x,y:cy,side,opacity,push,reveal,work,workRead,practice,spread,content,closing,burst,burstEntry,finale};
}
