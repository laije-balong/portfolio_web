function u(s,t){return Math.random()*(t-s)+s}function j(s,t){return Math.floor(Math.random()*(t-s+1))+s}function X(s,t,e){return Math.min(e,Math.max(t,s))}function Z(s){return(Math.sin((s-.25)*Math.PI*2)+1)/2}function U(s,t,e,l,h=100){return s>=-h&&s<=e+h&&t>=-h&&t<=l+h}function C(s,t,e,l){const h=(l-90)*Math.PI/180;return{x:s+e*Math.cos(h),y:t+e*Math.sin(h)}}function Y(s,t,e,l,h,d){const m=C(s,t,e,h),f=C(s,t,e,d),_=C(s,t,l,d),b=C(s,t,l,h),w=d-h>180?1:0;return[`M ${m.x} ${m.y}`,`A ${e} ${e} 0 ${w} 1 ${f.x} ${f.y}`,`L ${_.x} ${_.y}`,`A ${l} ${l} 0 ${w} 0 ${b.x} ${b.y}`,"Z"].join(" ")}function N(s="id"){return`${s}-${Date.now()}-${Math.floor(Math.random()*1e6)}`}const O=Math.PI*2;function q(s,t){const e=j(3,5),l=12,h=4,d=l+h,m=Array.from({length:e},($,n)=>({baseHeight:u(30,80),amplitude:u(10,20),frequency:u(3e-4,.001),phase:u(0,O),x:n*d})),f=e*d-h,_=`dbg-${t}`,b=`dbf-${t}`;s.innerHTML=`
    <defs>
      <linearGradient id="${_}" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%"   stop-color="#0074D9" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#00D9FF" stop-opacity="0.7"/>
      </linearGradient>
      <filter id="${b}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Glass container -->
    <rect
      class="db-glass"
      x="-8"
      y="-100"
      width="${f+16}"
      height="120"
      rx="4"
      fill="rgba(255,255,255,0.04)"
      stroke="rgba(255,255,255,0.08)"
      stroke-width="0.5"
    />

    <!-- Bar group -->
    <g class="db-bars">
      ${m.map(($,n)=>`
        <g class="db-bar-group" data-i="${n}">
          <!-- Main bar -->
          <rect
            class="db-bar"
            x="${$.x}"
            y="0"
            width="${l}"
            height="${$.baseHeight}"
            rx="2"
            fill="url(#${_})"
            transform="scale(1,-1)"
          />
          <!-- Highlight strip -->
          <rect
            class="db-highlight"
            x="${$.x}"
            y="${-($.baseHeight*.2+1)}"
            width="${l}"
            height="${Math.max($.baseHeight*.2,4)}"
            rx="2"
            fill="white"
            opacity="0.18"
            transform="scale(1,-1)"
          />
        </g>
      `).join("")}
    </g>

    <!-- Baseline -->
    <line
      x1="-4" y1="0"
      x2="${f+4}" y2="0"
      stroke="rgba(255,255,255,0.15)"
      stroke-width="0.5"
    />
  `;const w=Array.from(s.querySelectorAll(".db-bar")),v=Array.from(s.querySelectorAll(".db-highlight"));function F($){for(let n=0;n<e;n++){const y=m[n],a=y.baseHeight+y.amplitude*Math.sin(y.frequency*$+y.phase),c=Math.max(a*.2,4);w[n].setAttribute("height",a),v[n].setAttribute("y",-a),v[n].setAttribute("height",c)}}function S(){s.innerHTML=""}return{update:F,destroy:S}}function K(s,t){const h=u(20,40),d=u(.02,.04),m=u(1e-4,3e-4),f=`tlg-${t}`,_=`tla-${t}`,b=`tlgl-${t}`;s.innerHTML=`
    <defs>
      <linearGradient id="${f}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#00D9FF" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#0074D9" stop-opacity="0.7"/>
      </linearGradient>
      <linearGradient id="${_}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#00D9FF" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#00D9FF" stop-opacity="0"/>
      </linearGradient>
      <filter id="${b}">
        <feGaussianBlur stdDeviation="1.5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Area fill under curve -->
    <path class="tl-area" fill="url(#${_})"/>

    <!-- Main curve stroke -->
    <path
      class="tl-line"
      fill="none"
      stroke="url(#${f})"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      filter="url(#${b})"
    />

    <!-- Arrow at end -->
    <path
      class="tl-arrow"
      fill="#00D9FF"
      opacity="0.75"
    />
  `;const w=s.querySelector(".tl-line"),v=s.querySelector(".tl-area"),F=s.querySelector(".tl-arrow");function S(o){return Array.from({length:12},(i,r)=>{const p=r/11*150;return{x:p,y:h*Math.sin(d*p-m*o)}})}function $(o){if(o.length<2)return"";let i=`M ${o[0].x.toFixed(2)} ${o[0].y.toFixed(2)}`;for(let r=1;r<o.length;r++){const p=o[r-1],x=o[r],g=x.x-p.x,M=p.x+g/3,T=p.y,I=p.x+2*g/3,L=x.y;i+=` C ${M.toFixed(2)} ${T.toFixed(2)} ${I.toFixed(2)} ${L.toFixed(2)} ${x.x.toFixed(2)} ${x.y.toFixed(2)}`}return i}function n(o,i){const r=o.at(-1),p=o[0];return`${i} L ${r.x.toFixed(2)} 0 L ${p.x.toFixed(2)} 0 Z`}function y(o){const i=o.at(-1),r=o.at(-2),p=i.x-r.x,x=i.y-r.y,g=Math.atan2(x,p),M=10,T=.4,I=i.x-M*Math.cos(g-T),L=i.y-M*Math.sin(g-T),P=i.x-M*Math.cos(g+T),W=i.y-M*Math.sin(g+T);return`M ${i.x.toFixed(2)} ${i.y.toFixed(2)} L ${I.toFixed(2)} ${L.toFixed(2)} L ${P.toFixed(2)} ${W.toFixed(2)} Z`}function a(o){const i=S(o),r=$(i);w.setAttribute("d",r),v.setAttribute("d",n(i,r)),F.setAttribute("d",y(i))}function c(){s.innerHTML=""}return{update:a,destroy:c}}const E=[["#00D9FF","#0074D9"],["#8b5cf6","#6d28d9"],["#10b981","#059669"],["#f59e0b","#d97706"],["#ef4444","#dc2626"]];function J(s,t){const e=u(30,50),l=e*.6,h=j(3,5),d=4e3,m=u(3e-4,8e-4);function f(){const i=Array.from({length:h},()=>u(.05,1)),r=i.reduce((p,x)=>p+x,0);return i.map(p=>p/r)}const _=Array.from({length:h},(i,r)=>({colorFrom:E[r%E.length][0],colorTo:E[r%E.length][1],rotSpeed:u(5e-5,2e-4)*(Math.random()<.5?1:-1),fromState:f()[r]??1/h,toState:f()[r]??1/h,currentVal:1/h,cycleStart:0}));let b=f(),w=f(),v=0;const F=_.map((i,r)=>`dcg-${t}-${r}`),S=_.map((i,r)=>`
    <radialGradient id="${F[r]}" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${i.colorFrom}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${i.colorTo}"   stop-opacity="0.6"/>
    </radialGradient>
  `).join(""),$=_.map((i,r)=>`
    <path
      class="dc-seg"
      data-i="${r}"
      fill="url(#${F[r]})"
      stroke="rgba(255,255,255,0.15)"
      stroke-width="0.8"
    />
  `).join("");s.innerHTML=`
    <defs>${S}</defs>
    <g class="dc-rotor">
      ${$}
    </g>
    <!-- Central pulsing dot -->
    <circle class="dc-center" cx="0" cy="0" r="3" fill="#f59e0b" opacity="0.9"/>
    <circle class="dc-halo"   cx="0" cy="0" r="12"
      fill="rgba(245,158,11,0.08)"
      stroke="rgba(245,158,11,0.2)"
      stroke-width="0.5"
    />
  `,s.querySelector(".dc-rotor");const n=Array.from(s.querySelectorAll(".dc-seg")),y=s.querySelector(".dc-halo");function a(i,r){let p=r;for(let x=0;x<h;x++){const g=i[x]*360,M=p+g;n[x].setAttribute("d",Y(0,0,e,l,p,M)),p=M}}function c(i){const r=m*i%360,x=(i-v)%d/d,g=Z(x),M=b.map((L,P)=>L+(w[P]-L)*g);g>.98&&i-v>d*.98&&(b=w.slice(),w=f(),v=i),a(M,r);const T=.08+.1*(.5+.5*Math.sin(i*.0031));y.setAttribute("fill",`rgba(245,158,11,${T.toFixed(3)})`);const I=12+4*(.5+.5*Math.sin(i*.0031));y.setAttribute("r",I.toFixed(2))}function o(){s.innerHTML=""}return{update:c,destroy:o}}function Q(s,t){const l=u(40,60),h=`rcg-${t}`,d=`rcf-${t}`,m=Array.from({length:5},()=>({baseValue:u(.6,.95),amplitude:u(.05,.15),frequency:u(4e-4,8e-4),phase:u(0,O)})),f=m.map((a,c)=>c/5*O-Math.PI/2);function _(a,c){const o=m[a];return X(o.baseValue+o.amplitude*Math.sin(o.frequency*c+o.phase),0,1)}function b(a){return a.map((c,o)=>{const i=c*l,r=Math.cos(f[o])*i,p=Math.sin(f[o])*i;return`${r.toFixed(2)},${p.toFixed(2)}`}).join(" ")}function w(a){return f.map(c=>{const o=a*l;return`${(Math.cos(c)*o).toFixed(2)},${(Math.sin(c)*o).toFixed(2)}`}).join(" ")}const v=f.map(a=>{const c=(Math.cos(a)*l).toFixed(2),o=(Math.sin(a)*l).toFixed(2);return`<line x1="0" y1="0" x2="${c}" y2="${o}" stroke="rgba(139,92,246,0.15)" stroke-width="0.5"/>`}).join(""),F=f.map((a,c)=>{const o=(Math.cos(a)*l).toFixed(2),i=(Math.sin(a)*l).toFixed(2),r=(c*.2).toFixed(1);return`
      <circle
        class="rc-dot"
        cx="${o}" cy="${i}"
        r="3"
        fill="#8b5cf6"
        opacity="0.8"
      >
        <animate
          attributeName="r"
          values="3;5;3"
          dur="2s"
          begin="${r}s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0.4;0.8"
          dur="2s"
          begin="${r}s"
          repeatCount="indefinite"
        />
      </circle>
    `}).join("");s.innerHTML=`
    <defs>
      <radialGradient id="${h}" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="#8b5cf6" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.05"/>
      </radialGradient>
      <filter id="${d}">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Spokes -->
    <g class="rc-spokes">${v}</g>

    <!-- Concentric level rings -->
    ${[1/3,2/3,1].map((a,c)=>`
      <polygon
        class="rc-level"
        points="${w(a)}"
        fill="none"
        stroke="rgba(139,92,246,${.12+c*.05})"
        stroke-width="0.5"
      />
    `).join("")}

    <!-- Main data polygon (filled) -->
    <polygon
      class="rc-poly"
      fill="url(#${h})"
      stroke="#8b5cf6"
      stroke-width="1.5"
      stroke-linejoin="round"
      filter="url(#${d})"
    />

    <!-- Vertex dots -->
    <g class="rc-dots">${F}</g>
  `;const S=s.querySelector(".rc-poly"),$=Array.from(s.querySelectorAll(".rc-dot"));function n(a){const c=m.map((o,i)=>_(i,a));S.setAttribute("points",b(c)),c.forEach((o,i)=>{const r=o*l,p=(Math.cos(f[i])*r).toFixed(2),x=(Math.sin(f[i])*r).toFixed(2);$[i]?.setAttribute("cx",p),$[i]?.setAttribute("cy",x)})}function y(){s.innerHTML=""}return{update:n,destroy:y}}const A="#f59e0b",k=[{shape:"triangle",radius:35,speed:8e-4,phase:0,size:12,isElliptical:!0,ellipseRatio:1.2},{shape:"square",radius:45,speed:6e-4,phase:Math.PI/2,size:10,isElliptical:!0,ellipseRatio:1.3},{shape:"rectangle",radius:28,speed:.001,phase:Math.PI,size:{w:14,h:6},isElliptical:!1},{shape:"diamond",radius:40,speed:7e-4,phase:1.5*Math.PI,size:11,isElliptical:!1}];function tt(s,t){const e=`nch-${t}`,l=`ncg-${t}`;let h=[],d=u(800,1500),m=0;s.innerHTML=`
    <defs>
      <radialGradient id="${e}" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="${A}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${A}" stop-opacity="0"/>
      </radialGradient>
      <filter id="${l}">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Connections layer (drawn below satellites) -->
    <g class="nc-connections"></g>

    <!-- Orbital paths (subtle ellipses) -->
    ${k.map((n,y)=>{const a=n.isElliptical?n.radius*n.ellipseRatio:n.radius,c=n.radius;return`<ellipse cx="0" cy="0" rx="${a}" ry="${c}"
        fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>`}).join("")}

    <!-- Satellite shapes -->
    <g class="nc-satellites">
      ${k.map((n,y)=>`
        <g class="nc-sat" data-i="${y}">
          ${st(n)}
        </g>
      `).join("")}
    </g>

    <!-- Core halo -->
    <circle class="nc-halo" cx="0" cy="0" r="15" fill="url(#${e})" opacity="0.8"/>

    <!-- Core -->
    <circle
      class="nc-core" cx="0" cy="0" r="6"
      fill="${A}" opacity="0.9"
      filter="url(#${l})"
    >
      <animate attributeName="r"
        values="5;7;5" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity"
        values="0.9;0.6;0.9" dur="3s" repeatCount="indefinite"/>
    </circle>
  `;const f=s.querySelector(".nc-connections"),_=Array.from(s.querySelectorAll(".nc-sat")),b=s.querySelector(".nc-halo");function w(n,y){const a=n.phase+n.speed*y,c=n.isElliptical?n.radius*n.ellipseRatio:n.radius,o=n.radius;return{x:Math.cos(a)*c,y:Math.sin(a)*o,angle:a}}function v(n,y){if(n-m<d||(m=n,d=u(800,1500),Math.random()>=.3))return;const a=Math.random()<.5?"core":"satellite",c=Math.floor(Math.random()*k.length),o=Math.floor(Math.random()*k.length);h.push({id:N("conn"),fromIdx:a==="core"?-1:c,toIdx:o,startTime:n,duration:600,type:a})}function F(n,y){h=h.filter(a=>n-a.startTime<a.duration),f.innerHTML=h.map(a=>{const c=n-a.startTime;c/a.duration;let o;c<200?o=Math.pow(c/200,.3):c>a.duration-400?o=(a.duration-c)/400:o=1,o=Math.max(0,Math.min(1,o))*.7;const i=a.fromIdx===-1?{x:0,y:0}:y[a.fromIdx],r=y[a.toIdx];return!i||!r?"":`<line
        x1="${i.x.toFixed(2)}" y1="${i.y.toFixed(2)}"
        x2="${r.x.toFixed(2)}"   y2="${r.y.toFixed(2)}"
        stroke="${A}"
        stroke-width="0.5"
        opacity="${o.toFixed(3)}"
      />`}).join("")}function S(n){const y=k.map(c=>w(c,n));y.forEach((c,o)=>{const i=_[o];if(!i)return;const r=i.firstElementChild;r&&r.setAttribute("transform",`translate(${c.x.toFixed(2)},${c.y.toFixed(2)}) rotate(${(c.angle*180/Math.PI).toFixed(2)})`);const p=h.some(M=>M.fromIdx===o||M.toIdx===o),x=A,g=i.querySelector("path, rect");g&&(g.setAttribute("fill",p?A:"rgba(245,158,11,0.12)"),g.setAttribute("stroke",x))}),v(n),F(n,y);const a=15+3*Math.sin(n*33e-5);b?.setAttribute("r",a.toFixed(2))}function $(){s.innerHTML=""}return{update:S,destroy:$}}function st(s,t,e){switch(s.shape){case"triangle":return et(s);case"square":return z(s);case"rectangle":return it(s);case"diamond":return ot(s);default:return z(s)}}function et(s){const t=s.size,e=t*(Math.sqrt(3)/2);return`<path
    d="M ${`0,${-(e*2/3)} ${t/2},${e/3} ${-t/2},${e/3}`.split(" ").map(h=>h.split(",")).map(([h,d])=>`${h} ${d}`).join(" L ")} Z"
    fill="rgba(245,158,11,0.12)"
    stroke="${A}"
    stroke-width="1"
    transform="translate(0,0)"
  />`}function z(s){const t=s.size;return`<rect
    x="${-t/2}" y="${-t/2}"
    width="${t}" height="${t}"
    rx="2"
    fill="rgba(245,158,11,0.12)"
    stroke="${A}"
    stroke-width="1"
    transform="translate(0,0)"
  />`}function it(s){const{w:t=14,h:e=6}=typeof s.size=="object"?s.size:{w:s.size,h:s.size*.5};return`<rect
    x="${-t/2}" y="${-e/2}"
    width="${t}" height="${e}"
    rx="2"
    fill="rgba(245,158,11,0.12)"
    stroke="${A}"
    stroke-width="1"
    transform="translate(0,0)"
  />`}function ot(s){const t=s.size;return`<path
    d="M 0 ${-t/2} L ${t/2} 0 L 0 ${t/2} L ${-t/2} 0 Z"
    fill="rgba(245,158,11,0.12)"
    stroke="${A}"
    stroke-width="1"
    transform="translate(0,0)"
  />`}const V=["dataBars","trendLine","donutChart","radarChart","nucleusCluster"],rt="http://www.w3.org/2000/svg",R={chaos:.3,analysis:.02,clarity:.002};class at{constructor(t,e,l,h){this.id=N("particle"),this.vw=t,this.vh=e,this.phase=l,this.x=u(0,t),this.y=u(0,e);const d=R[l]??R.chaos;this.vx=u(-d,d),this.vy=u(-d,d),this.rotation=u(0,360),this.omega=u(-5e-4,5e-4),this.opacity=u(.3,.8),this.baseOpacity=this.opacity,this.type=V[Math.floor(Math.random()*V.length)],this.timeOutOfViewport=0,this._destroyed=!1,this._group=document.createElementNS(rt,"g"),this._group.setAttribute("class",`particle particle--${this.type}`),this._group.setAttribute("data-id",this.id),h.appendChild(this._group),this._visual=this._createVisual(),this._applyTransform()}_createVisual(){switch(this.type){case"dataBars":return q(this._group,this.id);case"trendLine":return K(this._group,this.id);case"donutChart":return J(this._group,this.id);case"radarChart":return Q(this._group,this.id);case"nucleusCluster":return tt(this._group,this.id);default:return q(this._group,this.id)}}_applyTransform(){this._group.setAttribute("transform",`translate(${this.x.toFixed(2)},${this.y.toFixed(2)}) rotate(${this.rotation.toFixed(2)})`),this._group.setAttribute("opacity",this.opacity.toFixed(3))}update(t,e){if(this._destroyed)return;this.x+=this.vx*t,this.y+=this.vy*t,this.rotation+=this.omega*t,this.x<-100&&(this.x=this.vw+100),this.x>this.vw+100&&(this.x=-100),this.y<-100&&(this.y=this.vh+100),this.y>this.vh+100&&(this.y=-100),U(this.x,this.y,this.vw,this.vh,100)?this.timeOutOfViewport=0:this.timeOutOfViewport+=t,this._applyTransform(),this._visual?.update(e)}shouldDestroy(){return this.timeOutOfViewport>5e3}destroy(){this._destroyed||(this._destroyed=!0,this._visual?.destroy(),this._group?.remove(),this._group=null,this._visual=null)}transitionToPhase(t){this.phase=t,t==="analysis"?(this.vx*=.4,this.vy*=.4,this.omega*=.7,this.opacity=u(.4,.7),this.baseOpacity=this.opacity):t==="clarity"&&(this.vx*=.1,this.vy*=.1,this.omega*=.5,this.opacity=u(.6,.9),this.baseOpacity=this.opacity)}resize(t,e){this.x=this.x/this.vw*t,this.y=this.y/this.vh*e,this.vw=t,this.vh=e}}function nt(s,t){let e;return(...l)=>{clearTimeout(e),e=setTimeout(()=>s(...l),t)}}const G=45,D=25,H=768;class ct{constructor(t){this._svg=t,this._particles=[],this._phase="chaos",this._phaseStart=Date.now(),this._rafId=null,this._lastTime=Date.now(),this._phaseLabel=null,this._running=!1,this._vw=window.innerWidth,this._vh=window.innerHeight,this._maxParticles=this._vw<H?D:G}setPhaseLabel(t){this._phaseLabel=t}init(){this._vw=window.innerWidth,this._vh=window.innerHeight,this._maxParticles=this._vw<H?D:G,this._phaseStart=Date.now(),this._phase="chaos",this._particles.forEach(e=>e.destroy()),this._particles=[];const t=this._maxParticles;for(let e=0;e<t;e++)this._spawnParticle();this._svg.setAttribute("width",this._vw),this._svg.setAttribute("height",this._vh),this._svg.setAttribute("viewBox",`0 0 ${this._vw} ${this._vh}`),this._onResize=nt(this._handleResize.bind(this),200),window.addEventListener("resize",this._onResize),this._running=!0,this._lastTime=Date.now(),this._tick()}destroy(){for(this._running=!1,this._rafId&&(cancelAnimationFrame(this._rafId),this._rafId=null),this._particles.forEach(t=>t.destroy()),this._particles=[],window.removeEventListener("resize",this._onResize);this._svg.firstChild;)this._svg.firstChild.remove()}_tick(){if(!this._running)return;const t=Date.now(),e=Math.min(t-this._lastTime,64);this._lastTime=t,this._update(e,t),this._rafId=requestAnimationFrame(this._tick.bind(this))}_update(t,e){const l=e-this._phaseStart;this._phase==="chaos"&&l>3e3?this._transitionToPhase("analysis"):this._phase==="analysis"&&l>8e3&&this._transitionToPhase("clarity");for(const d of this._particles)d.update(t,e);for(this._particles.filter(d=>d.shouldDestroy()).forEach(d=>d.destroy()),this._particles=this._particles.filter(d=>!d.shouldDestroy()&&!d._destroyed);this._particles.length<this._maxParticles;)this._spawnParticle()}_spawnParticle(){const t=new at(this._vw,this._vh,this._phase,this._svg);this._particles.push(t)}_transitionToPhase(t){this._phase=t,this._phaseStart=Date.now();for(const e of this._particles)e.transitionToPhase(t);this._phaseLabel&&(this._phaseLabel.textContent=t)}_handleResize(){const t=window.innerWidth,e=window.innerHeight;this._maxParticles=t<H?D:G,this._svg.setAttribute("width",t),this._svg.setAttribute("height",e),this._svg.setAttribute("viewBox",`0 0 ${t} ${e}`);for(const l of this._particles)l.resize(t,e);for(this._vw=t,this._vh=e;this._particles.length>this._maxParticles;)this._particles.pop().destroy()}}const B=document.getElementById("particle-canvas"),lt=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(B&&!lt){const s=new ct(B);s.init(),document.addEventListener("astro:before-swap",()=>s.destroy(),{once:!0}),window.addEventListener("beforeunload",()=>s.destroy(),{once:!0})}
