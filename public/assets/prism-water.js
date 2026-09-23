// One analytic liquid surface: broad contact deformation, travelling capillary
// waves and a pearl studio environment. Broad pastel lights surround a neutral
// body; colour belongs to reflection, rather than a saturated rainbow stripe.
export const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
export const fragment=`
precision highp float;
varying vec2 uv;
uniform float time,pixel;
uniform vec2 pointer,momentum;
uniform vec4 contact,ripple,ripple2,ripple3,ripple4,powers;
vec4 wave(vec3 n,vec4 w,float power){
 if(w.w>4.3)return vec4(0.);
 float c=clamp(dot(n,w.xyz),-.9999,.9999);
 float d=acos(c),q=d-w.w*1.75;
 float envelope=exp(-q*q*8.-w.w*1.05)*.027*power*smoothstep(0.,.065,w.w);
 float phase=q*14.;
 vec3 tangent=-(w.xyz-c*n)/sqrt(max(.003,1.-c*c));
 return vec4(tangent*(14.*cos(phase)-16.*q*sin(phase))*envelope,sin(phase)*envelope);
}
vec4 surfaceWaves(vec3 n){
 return wave(n,ripple,powers.x)+wave(n,ripple2,powers.y)+wave(n,ripple3,powers.z)+wave(n,ripple4,powers.w);
}
vec3 spectrum(vec3 d){
 vec3 pearl=vec3(.87,.88,.85);
 float amber=exp(-pow((d.y-.65)*1.5,2.)-pow((d.x-.18)*.9,2.));
 float rose=exp(-pow((d.x+.78)*2.2,2.)-pow((d.y-.18)*1.05,2.));
 float ice=exp(-pow((d.y+.8)*3.0,2.)-pow((d.x-.3)*.9,2.));
 vec3 c=mix(pearl,vec3(.98,.78,.57),amber*.85);
 c=mix(c,vec3(.94,.65,.77),rose*.72);
 c=mix(c,vec3(.53,.80,.87),ice*.8);
 return c;
}
void main(){
 vec2 p=(uv-.5)*2.;
 vec3 ro=vec3(0.,0.,3.2),rd=normalize(vec3(p,-2.35));
 float force=contact.w;
 vec2 stretch=vec2(1.+.007*sin(time*1.2)+momentum.x*.026,1.+.008*sin(time*1.05+1.)+momentum.y*.026);
 vec3 axes=vec3(stretch,1./(stretch.x*stretch.y));
 vec3 origin=ro/axes,direction=rd/axes;
 float qa=dot(direction,direction),qb=dot(origin,direction);
 float disc=qb*qb-qa*(dot(origin,origin)-1.);
 // Sample the travelling surface wave at the silhouette, including rays that
 // narrowly miss it. This makes the white halo respond locally to arriving waves.
 if(disc<-.20)discard;
 float edgeEnergy=0.;
 if(disc<.22){
  vec3 edgePoint=ro+rd*(-qb/qa);
  vec3 edgeNormal=normalize(edgePoint/(axes*axes));
  vec4 edgeWaves=surfaceWaves(edgeNormal);
  edgeEnergy=clamp(length(edgeWaves.xyz)*.9+abs(edgeWaves.w)*14.,0.,.65)*(1.-smoothstep(.06,.22,disc));
 }
 float gap=max(0.,-disc)*.43;
 float haloWidth=.013+edgeEnergy*.024;
 float haloAlpha=exp(-gap/haloWidth)*(.20+edgeEnergy*.65);
 vec3 haloColor=vec3(.985,.995,1.);
 if(disc<=0.){gl_FragColor=vec4(haloColor*haloAlpha,haloAlpha);return;}
 vec3 pos=ro+rd*((-qb-sqrt(disc))/qa);
 vec3 base=normalize(pos/(axes*axes));
 vec4 waves=surfaceWaves(base);
 float c=clamp(dot(base,contact.xyz),-.9999,.9999);
 float angle=acos(c);
 vec3 tangent=-(contact.xyz-c*base)/sqrt(max(.003,1.-c*c));
 // A soft local depression follows the pointer and relaxes after it leaves.
 float dent=-.085*force*exp(-angle*angle*9.);
 vec3 gradient=tangent*(-18.*angle*dent);
 vec3 n=normalize(base-gradient-waves.xyz);
 vec3 view=-rd;
 float facing=max(dot(n,view),0.);
 vec3 reflected=reflect(rd,n);
 vec3 refracted=refract(rd,n,1./1.333);
 vec3 through=normalize(pos+refracted*1.45);
 vec3 field=normalize(vec3(n.x*.75+through.x*.25+pointer.x*.08,n.y*.8-through.y*.20,n.z));
 vec3 color=spectrum(field);
 // Large soft illumination preserves the rainbow; shadows retain chroma.
 float shade=.84+.16*max(0.,dot(n,normalize(vec3(-.4,.65,1.4))));
 color*=shade;
 float pearl=pow(facing,6.)*.18;
 color=mix(color,vec3(1.,.96,.89),pearl);
 float fresnel=pow(1.-facing,3.);
 color=mix(color,spectrum(reflected)*.86+vec3(.14),fresnel*.45);
 float softbox=exp(-pow((reflected.x+.45)*3.1,2.)-pow((reflected.y-.60)*3.5,2.));
 float ribbon=exp(-pow((reflected.y-.55-reflected.x*.18)*12.,2.))*smoothstep(.15,.8,reflected.z);
 color=mix(color,vec3(1.,.99,.96),softbox*.72+ribbon*.27);
 // The crest catches white light while the trough keeps a soft coloured shadow.
 color*=1.+clamp(waves.w*5.,-.10,.10);
 float liquidLight=clamp(max(waves.w,0.)*16.+length(waves.xyz)*.12+abs(dent)*.7,0.,.48);
 color=mix(color,haloColor,liquidLight);
 float rim=pow(1.-facing,5.);
 color=mix(color,haloColor,rim*(.44+edgeEnergy*.45));
 float alpha=smoothstep(0.,pixel*2.,disc);
 gl_FragColor=vec4(clamp(color,0.,1.)*alpha+haloColor*haloAlpha*(1.-alpha),alpha+haloAlpha*(1.-alpha));
}`;
