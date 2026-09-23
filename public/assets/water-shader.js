// Analytic ray / ellipsoid intersection and analytic geodesic wave derivatives.
// No marching loop or six extra surface samples per fragment.
export const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
export const fragment = `
precision highp float;
varying vec2 uv;
uniform float time;
uniform vec2 pointer;
uniform vec4 ripple;
uniform vec4 ripple2;
uniform float pixel;
vec4 wave(vec3 n, vec4 w){
 if(w.w>4.8)return vec4(0.);
 float c=clamp(dot(n,w.xyz),-.9999,.9999);
 float d=acos(c), q=d-w.w*1.55;
 float envelope=exp(-q*q*26.-w.w*1.15)*.013*smoothstep(0.,.07,w.w);
 float phase=q*28.;
 float height=sin(phase)*envelope;
 float slope=(28.*cos(phase)-52.*q*sin(phase))*envelope;
 vec3 tangent=-(w.xyz-c*n)/sqrt(max(.002,1.-c*c));
 return vec4(tangent*slope,height);
}
vec3 environment(vec3 d){
 // Reflected studio panels are directional: their curvature reveals surface depth.
 vec3 c=mix(vec3(.23,.32,.42),vec3(.88,.89,.88),smoothstep(-.85,.65,d.y));
 c=mix(c,vec3(.98,.67,.48),exp(-pow((d.y-.12)*2.7,2.))*smoothstep(-.1,.85,d.x)*.7);
 c=mix(c,vec3(.40,.62,.79),exp(-pow((d.y+.35)*3.,2.))*(1.-smoothstep(-.8,.5,d.x))*.55);
 float key=pow(max(0.,dot(d,normalize(vec3(-.7,1.1,1.2)))),24.);
 float strip=pow(max(0.,dot(d,normalize(vec3(.95,.25,.65)))),55.);
 c+=vec3(1.1)*key+vec3(.8,.72,.64)*strip;
 return c;
}
void main(){
 vec2 p=(uv-.5)*2.;
 vec3 ro=vec3(0.,0.,3.2);
 vec3 rd=normalize(vec3(p,-2.35));
 // Small volume-preserving shape oscillation gives the silhouette a liquid response.
 vec2 stretch=vec2(1.+.004*sin(time*1.35),1.+.005*sin(time*1.12+1.));
 vec3 axes=vec3(stretch,1./(stretch.x*stretch.y));
 vec3 origin=ro/axes, direction=rd/axes;
 float qa=dot(direction,direction), qb=dot(origin,direction);
 float disc=qb*qb-qa*(dot(origin,origin)-1.);
 if(disc<=0.)discard;
 float dist=(-qb-sqrt(disc))/qa;
 vec3 pos=ro+rd*dist;
 vec3 base=normalize(pos/(axes*axes));
 vec4 displacement=wave(base,ripple)+wave(base,ripple2);
 vec3 n=normalize(base-displacement.xyz);
 vec3 view=-rd;
 float facing=max(dot(n,view),0.);

 vec3 reflection=environment(reflect(rd,n));
 reflection*=.66+.34*smoothstep(-.7,.4,n.y);
 vec3 refracted=refract(rd,n,1./1.333);
 float thickness=2.*max(0.,dot(-n,refracted));
 vec3 exitPoint=pos+refracted*thickness;
 vec3 exitNormal=normalize(exitPoint);
 vec3 outgoing=refract(refracted,-exitNormal,1.333);
 // A pale, chromatic environment is refracted through the full water volume.
 vec3 transmission=environment(normalize(outgoing+vec3(.001)))*.8+vec3(.23);
 vec3 tint=mix(vec3(.51,.72,.89),vec3(1.,.61,.70),smoothstep(-.8,.65,exitPoint.y-exitPoint.x*.35));
 tint=mix(tint,vec3(1.,.85,.48),smoothstep(-.05,.95,exitPoint.x+exitPoint.y*.85));
 tint=mix(tint,vec3(.93,.95,.91),exp(-dot(exitPoint.xy,exitPoint.xy)*3.5)*.6);
 transmission=mix(transmission,tint,.85)*exp(-vec3(.04,.015,.008)*thickness);
 vec3 color=mix(transmission,reflection,.05+.56*pow(1.-facing,2.2));
 // Low-amplitude thin film tint at grazing angles; no flat image overlay.
 vec3 film=.5+.5*cos(vec3(0.,2.1,4.2)+facing*8.+pos.y*1.4+time*.06);
 color+=film*pow(1.-facing,2.)*.14;
 vec3 key=normalize(vec3(-.65,.9,1.5)+vec3(pointer*.12,0.));
 float spec=pow(max(0.,dot(n,normalize(key+view))),55.);
 float broad=pow(max(0.,dot(n,normalize(key+view))),18.);
 color+=vec3(.98)*spec*.16+vec3(.055)*broad;
 vec3 r=reflect(rd,n);
 float panel=exp(-pow((r.x+.52)*13.,2.)-pow((r.y-.6)*3.2,6.))*smoothstep(.05,.6,r.z);
 color+=vec3(.95)*panel*.12;
 float arc=displacement.w;
 color+=vec3(.56,.77,1.)*abs(arc)*5.;
 float caustic=exp(-pow((facing-.34)*24.,2.))*(1.-smoothstep(-.7,.15,n.y));
 color+=vec3(.63,.82,.95)*caustic*.09;
 color=pow(clamp(color,0.,1.),vec3(.88));
 float alpha=smoothstep(0.,pixel*3.,disc);
 gl_FragColor=vec4(color*alpha,alpha);
}`;
