import{n as e,t}from"./HomePage.astro_astro_type_script_index_0_lang.Dijh5v_0.js";import{A as n,B as r,C as i,D as a,E as o,F as s,G as c,H as l,I as u,J as d,K as f,L as p,M as m,N as h,O as g,P as ee,Q as _,R as v,S as y,T as b,W as te,X as x,Y as S,Z as C,_ as ne,a as re,b as ie,c as ae,d as oe,f as se,g as ce,i as le,j as ue,k as w,l as de,m as fe,n as pe,o as me,p as he,q as T,r as ge,s as E,t as _e,u as ve,v as ye,w as D,x as be,y as O,z as k}from"./quality.qZky8W6t.js";var A=(e,t,n)=>({deep:new O(e),mid:new O(t),glow:new O(n)}),j={amber:A(`#0b0604`,`#3d1707`,`#d0601a`),dusk:A(`#090504`,`#2a0f07`,`#9a3c12`),ember:A(`#120403`,`#520f05`,`#ec4a1c`),frost:A(`#03070c`,`#132233`,`#7c9db6`),gold:A(`#0b0805`,`#3a280c`,`#e2ac45`),noir:A(`#080504`,`#1f0e08`,`#7d3412`)},M={flacon:{x:0,y:-.05,z:0,scale:1,tilt:0},pumpkin:{x:0,y:-3.6,z:-1,scale:0,frost:0},palette:`amber`,spices:0,patch:0,fall:1,frost:0,snow:0,glow:1,cameraZ:7},N={x:.2,y:-4.2,z:-2,scale:.4,tilt:.4},P=e=>({...M,...e,flacon:{...M.flacon,...e.flacon},pumpkin:{...M.pumpkin,...e.pumpkin}}),xe={hero:P({flacon:{x:0,y:-.05,z:0,scale:1.1,tilt:0},spices:1,patch:.35}),manifesto:P({flacon:{x:.55,y:.1,z:-1.2,scale:.85,tilt:.28},palette:`dusk`,spices:.5,glow:.85}),"story-intro":P({flacon:N,pumpkin:{x:-.35,y:-2.2,z:-1,scale:.55},palette:`dusk`,patch:.6}),october:P({flacon:N,pumpkin:{x:0,y:-.62,z:0,scale:.95},palette:`amber`,patch:1,fall:1.3,cameraZ:6.6}),ember:P({flacon:N,pumpkin:{x:0,y:-.6,z:.6,scale:1.05},palette:`ember`,patch:1,fall:.9,glow:1.45,cameraZ:6.2}),frost:P({flacon:N,pumpkin:{x:0,y:-.66,z:-.4,scale:.9,frost:1},palette:`frost`,patch:1,fall:.22,frost:1,snow:1,glow:.55,cameraZ:7.4}),forever:P({flacon:{x:.6,y:-.1,z:.2,scale:.72,tilt:0},pumpkin:{x:-.6,y:-.45,z:0,scale:.72,frost:.25},palette:`gold`,patch:.7,fall:.75,frost:.15,snow:.15,glow:1.2}),epilogue:P({flacon:{x:0,y:0,z:-.5,scale:.9},pumpkin:{x:-1.1,y:-1.6,z:-2,scale:.5},palette:`gold`,patch:.5,fall:.9}),elixir:P({flacon:{x:0,y:-.22,z:.4,scale:.9},palette:`amber`,spices:1,glow:1.3}),marquee:P({flacon:{x:-.55,y:.1,z:-.5,scale:.85,tilt:-.3},palette:`ember`,spices:.7}),stats:P({flacon:{x:.6,y:.15,z:-1.4,scale:.75,tilt:.2},palette:`noir`}),ritual:P({flacon:{x:-.62,y:.2,z:-1.6,scale:.7,tilt:-.2},palette:`dusk`}),reserve:P({flacon:{x:.62,y:-.1,z:-1.2,scale:.8,tilt:.15},palette:`gold`,spices:.6}),faq:P({flacon:{x:-.7,y:0,z:-2.2,scale:.6,tilt:-.25},palette:`noir`,glow:.8}),footer:P({flacon:{x:.32,y:-.1,z:.3,scale:.8},pumpkin:{x:-.36,y:-.5,z:0,scale:.72},palette:`amber`,spices:1,patch:1,glow:1.2})},Se=e=>e*e*(3-2*e),F=(e,t,n)=>e+(t-e)*n;function Ce(e,t,n){let r=(e,t)=>{let r={...e};for(let i of Object.keys(e))r[i]=F(e[i],t[i],n);return r};return{flacon:r(e.flacon,t.flacon),pumpkin:r(e.pumpkin,t.pumpkin),palette:n<.5?e.palette:t.palette,spices:F(e.spices,t.spices,n),patch:F(e.patch,t.patch,n),fall:F(e.fall,t.fall,n),frost:F(e.frost,t.frost,n),snow:F(e.snow,t.snow,n),glow:F(e.glow,t.glow,n),cameraZ:F(e.cameraZ,t.cameraZ,n)}}var we=class{anchors=[];deep=new O;mid=new O;glowColor=new O;measure(){let e=window.scrollY;this.anchors=Array.from(document.querySelectorAll(`[data-scene]`)).map(t=>{let n=t.getBoundingClientRect(),r=xe[t.dataset.scene??``];return r?{center:n.top+e+n.height/2,state:r}:null}).filter(e=>e!==null).sort((e,t)=>e.center-t.center)}resolve(e,t){let n=e+t/2,r=this.anchors[0];if(!r)return M;let i=r,a=r;for(let e of this.anchors){if(e.center<=n&&(i=e),e.center>n){a=e;break}a=e}let o=a.center-i.center,s=o>0?(n-i.center)/o:0,c=Se(Math.min(1,Math.max(0,(s-.15)/.7))),l=j[i.state.palette],u=j[a.state.palette];return this.deep.copy(l.deep).lerp(u.deep,c),this.mid.copy(l.mid).lerp(u.mid,c),this.glowColor.copy(l.glow).lerp(u.glow,c),Ce(i.state,a.state,c)}},Te=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`,Ee=`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform float uGlow;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uHighlight;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotate * p * 2.02;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uAspect;
    vec2 p = uv * 2.2;
    float t = uTime * 0.035;

    // Domain-warped smoke drifting upwards as the page scrolls.
    vec2 q = vec2(fbm(p + vec2(0.0, t - uScroll * 1.6)), fbm(p + vec2(5.2, 1.3 - t)));
    vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t), fbm(p + 3.5 * q + vec2(8.3, 2.8) - t));
    float smoke = fbm(p + 3.0 * r);

    float halo = smoothstep(1.25, 0.0, length(uv - uPointer * 0.08 - vec2(0.0, 0.06)));
    vec3 color = mix(uDeep, uMid, clamp(smoke * smoke * 1.9, 0.0, 1.0));
    color = mix(color, uHighlight, clamp(pow(smoke, 3.5) * 1.1 * halo * uGlow, 0.0, 0.8));
    color += uHighlight * halo * halo * 0.05 * uGlow;
    color *= 0.4 + 0.6 * smoothstep(1.4, 0.1, length(uv));
    // Deepen the shadows so the scene reads as candle-lit noir.
    color = pow(color, vec3(1.3)) * 1.1;

    gl_FragColor = vec4(color, 1.0);
  }
`,De=class{mesh;constructor(){let e=new c({vertexShader:Te,fragmentShader:Ee,depthWrite:!1,depthTest:!1,uniforms:{uTime:{value:0},uScroll:{value:0},uGlow:{value:1},uAspect:{value:1},uPointer:{value:new x},uDeep:{value:new O},uMid:{value:new O},uHighlight:{value:new O}}});this.mesh=new n(new p(2,2),e),this.mesh.frustumCulled=!1,this.mesh.renderOrder=-10}get uniforms(){return this.mesh.material.uniforms}};function Oe(){let e=document.createElement(`canvas`);e.width=512,e.height=640;let t=e.getContext(`2d`),n=new ne(e);if(n.colorSpace=l,n.anisotropy=4,!t)return n;let r=()=>{let e=t.createLinearGradient(0,0,512,640);e.addColorStop(0,`#f6dc9c`),e.addColorStop(.5,`#c9993f`),e.addColorStop(1,`#f1d38c`),t.fillStyle=`#0d0907`,t.fillRect(0,0,512,640),t.strokeStyle=e,t.lineWidth=3,t.strokeRect(18,18,476,604),t.lineWidth=1,t.strokeRect(30,30,452,580),t.fillStyle=e,t.textAlign=`center`,t.textBaseline=`middle`,t.font=`400 26px "IBM Plex Mono", monospace`,t.fillText(`V E S P E R I N E`,256,92),t.font=`400 128px Anton, Impact, sans-serif`,t.fillText(`PUMPKIN`,256,236),t.fillText(`SPICE`,256,368),t.font=`italic 300 70px "Cormorant Garamond", serif`,t.fillText(`Nº 31`,256,470),t.font=`400 18px "IBM Plex Mono", monospace`,t.fillText(`EXTRAIT D'AUTOMNE · 50 ML`,256,556),n.needsUpdate=!0};return r(),document.fonts?.ready.then(r),n}var I=10,L=.56,R=.3,z=[[0,-1.3],[.44,-1.3],[.53,-1.26],[.56,-1.16],[.56,.42],[.52,.6],[.38,.8],[.22,.94],[.17,1.02],[.17,1.12],[.21,1.15],[.21,1.2],[0,1.2]],ke=`
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`,Ae=`
  uniform float uTime;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    float facing = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
    // Light pools in the core of the volume; edges fall into deep amber.
    vec3 deep = vec3(0.03, 0.004, 0.0);
    vec3 core = vec3(0.62, 0.13, 0.008);
    float depth = smoothstep(-1.3, ${R.toFixed(2)}, vLocal.y);
    float caustic = sin(vLocal.y * 14.0 + uTime * 1.3 + sin(vLocal.x * 9.0 + uTime) * 1.5) * 0.5 + 0.5;
    float glow = pow(facing, 4.0);
    vec3 color = mix(deep, core, glow * (0.35 + 0.65 * depth));
    // Hot honeyed core and slow caustic bands.
    color += vec3(0.85, 0.36, 0.05) * pow(facing, 12.0) * 0.4 * depth;
    color += core * caustic * glow * 0.14;
    color *= 0.7 + 0.35 * uGlow;
    // Meniscus glint at the surface.
    color += vec3(1.0, 0.8, 0.5) * smoothstep(${.26.toFixed(2)}, ${R.toFixed(2)}, vLocal.y) * 0.6;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`,B=70,je=class{group=new b;flakes;flakeData=[];liquidMaterial;matrix=new w;quaternion=new k;euler=new i;scaleVec=new C;tmp=new C;constructor(){let e=z.map(([e,t])=>new x(e,t)),t=new m({color:new O(`#ffd9a8`),metalness:.1,roughness:.03,transparent:!0,opacity:.12,clearcoat:1,clearcoatRoughness:.02,specularIntensity:1,iridescence:.35,iridescenceIOR:1.6,envMapIntensity:1.3,flatShading:!0,depthWrite:!1}),r=new n(new g(e,I),t);r.rotation.y=Math.PI/I,r.renderOrder=2;let i=z.filter(([,e])=>e<R).map(([e,t])=>new x(Math.max(0,e*.88),t*.94));i.push(new x(L*.88,R),new x(0,R)),this.liquidMaterial=new c({vertexShader:ke,fragmentShader:Ae,uniforms:{uTime:{value:0},uGlow:{value:1}}});let o=new n(new g(i,I),this.liquidMaterial);o.rotation.y=Math.PI/I;let s=new h({color:new O(`#e2b55a`),metalness:1,roughness:.22,envMapIntensity:1.4}),l=new n(new be(.27,.27,.12,48),s);l.position.y=1.24;let u=new n(le(8,48),s);u.scale.setScalar(.36),u.position.y=1.5;let f=new ye([new C(0,1.68,0),new C(.02,1.8,0),new C(.09,1.88,.02),new C(.17,1.9,.03)]),_=new n(new d(f,24,.035,10,!1),s),v=Oe(),y=new n(new p(.5,.625),new h({map:v,metalness:.45,roughness:.35,side:2}));y.position.set(0,-.42,L*Math.cos(Math.PI/I)+.006),this.flakes=new a(new ee(.018,0),s,B);for(let e=0;e<B;e+=1){let e=Math.sqrt(Math.random())*.4,t=Math.random()*Math.PI*2;this.flakeData.push({base:new C(Math.cos(t)*e,-1.15+Math.random()*1.35,Math.sin(t)*e),speed:.2+Math.random()*.5,phase:Math.random()*Math.PI*2})}this.group.add(o,this.flakes,r,y,l,u,_)}update(e,t){this.flakeData.forEach((t,n)=>{let r=e*t.speed+t.phase;this.tmp.set(t.base.x+Math.sin(r)*.05,t.base.y+Math.sin(r*.7)*.08,t.base.z+Math.cos(r)*.05),this.euler.set(r,r*1.3,r*.6),this.quaternion.setFromEuler(this.euler),this.scaleVec.setScalar(.6+.4*Math.sin(r*2.1)),this.matrix.compose(this.tmp,this.quaternion,this.scaleVec),this.flakes.setMatrixAt(n,this.matrix)}),this.flakes.instanceMatrix.needsUpdate=!0;let n=this.liquidMaterial.uniforms;n.uTime&&(n.uTime.value=e),n.uGlow&&(n.uGlow.value=t)}},V=[`#d8601b`,`#ece0c8`,`#9fb3ad`,`#e0a03a`,`#b8471a`],Me=new O(`#c4d4e2`),H=new O(`#ffffff`),U=[{x:-.8,y:-1.25,z:-1.4,size:.55,shape:.85,variety:1},{x:.8,y:-1.2,z:-1.7,size:.62,shape:.8,variety:2},{x:-.52,y:-1.55,z:-3.1,size:.46,shape:1.2,variety:3},{x:.5,y:-1.65,z:-3.4,size:.5,shape:1,variety:0},{x:-.95,y:.95,z:-4.4,size:.42,shape:1,variety:4},{x:.92,y:1.05,z:-4.1,size:.36,shape:1.1,variety:1},{x:.1,y:-1.95,z:-5,size:.62,shape:.9,variety:4},{x:-.25,y:1.45,z:-6,size:.4,shape:1,variety:3},{x:.68,y:-.2,z:-6.4,size:.44,shape:1.05,variety:2}],Ne=e=>{let t=Math.min(1,Math.max(0,e));return t*t*(3-2*t)},Pe=class{group=new b;skin;bodies;stems;matrix=new w;quaternion=new k;euler=new i;position=new C;scale=new C;constructor(){this.skin=new m({color:H.clone(),roughness:.5,clearcoat:.35,clearcoatRoughness:.4,sheen:.5,sheenRoughness:.45,sheenColor:new O(`#ffcf9a`),envMapIntensity:.8,vertexColors:!0});let e=new h({color:new O(`#5a4522`),roughness:.92,vertexColors:!0}),t=ae(new f(.01,6,4));this.bodies=new a(t,this.skin,U.length),this.stems=new a(t,e,U.length);let n=new O;U.forEach((e,t)=>{this.bodies.setColorAt(t,n.set(V[e.variety]??V[0]))}),this.bodies.frustumCulled=!1,this.stems.frustumCulled=!1,this.group.add(this.bodies,this.stems)}adopt(e){let t=e.get(`Body`),n=e.get(`Stem`);t&&n&&(this.bodies.geometry=t,this.stems.geometry=n)}update(e,t,n,r,i){this.group.visible=t>.01,this.group.visible&&(this.skin.color.copy(H).lerp(Me,n),this.skin.roughness=.5+n*.35,U.forEach((n,a)=>{let o=Ne((t-a/U.length*.5)/.5),s=(i-n.z)/i;this.position.set(n.x*r*s,n.y+(1-o)*-1.2+Math.sin(e*.5+a)*.04,n.z),this.euler.set(Math.sin(e*.3+a)*.08,a*1.7+e*.08,Math.cos(e*.25+a)*.06),this.quaternion.setFromEuler(this.euler);let c=Math.max(1e-4,n.size*o);this.scale.set(c,c*n.shape,c),this.matrix.compose(this.position,this.quaternion,this.scale),this.bodies.setMatrixAt(a,this.matrix),this.stems.setMatrixAt(a,this.matrix)}),this.bodies.instanceMatrix.needsUpdate=!0,this.stems.instanceMatrix.needsUpdate=!0)}},W={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},G=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Fe=new s(-1,1,1,-1,0,1),Ie=new class extends ce{constructor(){super(),this.setAttribute(`position`,new D([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new D([0,2,0,0,2,0],2))}},K=class{constructor(e){this._mesh=new n(Ie,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Fe)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},q=class extends G{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof c?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=S.clone(e.uniforms),this.material=new c({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new K(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},J=class extends G{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},Le=class extends G{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},Re=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new x);this._width=n.width,this._height=n.height,t=new _(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:o}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new q(W),this.copyPass.material.blending=0,this.timer=new T}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}J!==void 0&&(r instanceof J?n=!0:r instanceof Le&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new x);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},Y={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},ze=class extends G{constructor(){super(),this.isOutputPass=!0,this.uniforms=S.clone(Y.uniforms),this.material=new r({name:Y.name,uniforms:this.uniforms,vertexShader:Y.vertexShader,fragmentShader:Y.fragmentShader}),this._fsQuad=new K(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ie.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Be=class extends G{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new O}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},Ve={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new O(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},X=class e extends G{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new x(256,256):new x(e.x,e.y),this.clearColor=new O(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new _(i,a,{type:o,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new _(i,a,{type:o,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new _(i,a,{type:o,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let s=Ve;this.highPassUniforms=S.clone(s.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new c({uniforms:this.highPassUniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new x(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let u=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=u,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=S.clone(W.uniforms),this.blendMaterial=new c({uniforms:this.copyUniforms,vertexShader:W.vertexShader,fragmentShader:W.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new O,this._oldClearAlpha=1,this._basic=new ue,this._fsQuad=new K(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new x(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new c({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new x(.5,.5)},direction:{value:new x(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new c({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};X.BlurDirectionX=new x(1,0),X.BlurDirectionY=new x(0,1);var He={uniforms:{tDiffuse:{value:null},uTime:{value:0},uFrost:{value:0},uAberration:{value:.0012}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uFrost;
    uniform float uAberration;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 dir = vUv - 0.5;
      float amount = uAberration * (0.4 + length(dir) * 2.0);
      vec3 color;
      color.r = texture2D(tDiffuse, vUv + dir * amount).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - dir * amount).b;

      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      vec3 cold = vec3(luma) * vec3(0.86, 0.95, 1.08);
      color = mix(color, cold, uFrost * 0.65);

      color += (rand(vUv * 1000.0 + fract(uTime)) - 0.5) * 0.045;
      gl_FragColor = vec4(color, 1.0);
    }
  `},Ue=class{composer;bloom;finish;constructor(e,t,n,r){this.composer=new Re(e),this.composer.addPass(new Be(t,n)),this.bloom=r?new X(new x(256,256),.35,.55,.86):null,this.bloom&&this.composer.addPass(this.bloom),this.composer.addPass(new ze),this.finish=new q(He),this.composer.addPass(this.finish)}get sceneTarget(){return this.composer.readBuffer}setSize(e,t,n){this.composer.setPixelRatio(n),this.composer.setSize(e,t),this.bloom?.resolution.set(e/2,t/2)}render(e,t,n){this.bloom&&(this.bloom.strength=.18+t*.22);let r=this.finish.uniforms;r.uTime&&(r.uTime.value=e),r.uFrost&&(r.uFrost.value=n),this.composer.render()}dispose(){this.composer.dispose()}},We=35,Ge=1/40,Z=.75,Q=()=>new Promise(e=>setTimeout(e,0)),$=(e,t,n,r)=>e+(t-e)*(1-Math.exp(-n*r)),Ke=class{renderer;scene=new te;camera=new u(We,1,.1,60);timer=new T;director=new we;quality;postfx;backdrop=new De;flacon;pumpkin=new ge;spices=new pe;patch=new Pe;leaves;dust;key=new y(`#ffe2b8`,1.4);rim=new v(`#ff7a2a`,14,20,1.6);ambient=new fe(`#2a1408`,.35);smoothed={x:0,y:0,velocity:0};pixelRatio;halfWidth=2;slowFrames=0;flaconSpin=0;spiceAmount=0;patchAmount=0;reducedMotion;onResize=()=>this.resize();constructor({canvas:e,reducedMotion:t}){this.reducedMotion=t,this.quality=_e(),this.pixelRatio=this.quality.maxDpr,this.renderer=new he({canvas:e,antialias:this.pixelRatio<1.5,powerPreference:`high-performance`,alpha:!1,stencil:!1}),this.renderer.outputColorSpace=l,this.renderer.toneMapping=7,this.renderer.toneMappingExposure=.9,this.scene.environmentIntensity=.55,this.flacon=new je,this.leaves=new re(this.quality.leaves),this.dust=new me(this.quality.dust,this.pixelRatio),this.flacon.group.add(this.spices.group),this.key.position.set(3,5,4),this.rim.position.set(-2.5,1.5,-2.5),this.scene.add(this.backdrop.mesh,this.flacon.group,this.pumpkin.group,this.patch.group,this.leaves.mesh,this.dust.points,this.key,this.rim,this.ambient),this.postfx=new Ue(this.renderer,this.scene,this.camera,this.quality.bloom),this.camera.position.set(0,0,7),this.resize(),window.addEventListener(`resize`,this.onResize,{passive:!0})}measure(){this.director.measure()}async warmUp(){await Q();let e=new se(this.renderer);this.scene.environment=e.fromScene(new oe,.04).texture,e.dispose(),await Q(),this.director.measure(),this.renderer.setRenderTarget(this.postfx.sceneTarget);let t=this.renderer.compileAsync(this.scene,this.camera);this.renderer.setRenderTarget(null),await t,await Q(),this.frame()}start(){this.timer.connect(document),this.timer.reset(),this.renderer.setAnimationLoop(e=>this.frame(e)),this.loadModels()}async loadModels(){try{let[e,t]=await Promise.all([E(ve),E(de)]);this.pumpkin.adopt(e),this.patch.adopt(e),this.spices.adopt(t)}catch(e){console.warn(`3D models unavailable, keeping the procedural stand-ins.`,e)}}dispose(){this.renderer.setAnimationLoop(null),this.timer.dispose(),window.removeEventListener(`resize`,this.onResize),this.postfx.dispose(),this.renderer.dispose()}resize(){let e=window.innerWidth,t=window.innerHeight;this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setPixelRatio(this.pixelRatio),this.renderer.setSize(e,t,!1),this.postfx.setSize(e,t,this.pixelRatio),this.dust.setPixelRatio(this.pixelRatio);let n=Math.tan(We*Math.PI/360)*this.camera.position.z;this.halfWidth=n*this.camera.aspect,this.leaves.setBounds(this.halfWidth);let r=this.backdrop.uniforms.uAspect;r&&(r.value=this.camera.aspect),this.director.measure()}adapt(e){this.slowFrames=e>Ge?this.slowFrames+1:Math.max(0,this.slowFrames-1),this.slowFrames>90&&this.pixelRatio>Z&&(this.pixelRatio=Math.max(Z,this.pixelRatio-.25),this.slowFrames=0,this.resize())}frame(n){this.timer.update(n);let r=Math.min(this.timer.getDelta(),.1),i=this.reducedMotion?.25:1,a=this.timer.getElapsed()*i;this.adapt(r);let o=this.director.resolve(window.scrollY,window.innerHeight),s=this.smoothed;s.x=$(s.x,this.reducedMotion?0:t.x,2.5,r),s.y=$(s.y,this.reducedMotion?0:t.y,2.5,r),s.velocity=$(s.velocity,e.velocity,4,r),this.camera.position.x=$(this.camera.position.x,s.x*.45,3,r),this.camera.position.y=$(this.camera.position.y,s.y*.3,3,r),this.camera.position.z=$(this.camera.position.z,o.cameraZ,2,r),this.camera.lookAt(0,0,0);let c=o.flacon,l=this.flacon.group,u=this.camera.aspect<.8,d=u?.5+this.camera.aspect*.3:Math.min(1,.55+this.camera.aspect*.45),f=u?1.4:1;l.position.set($(l.position.x,c.x*f*this.halfWidth,3,r),$(l.position.y,c.y*2.4,3,r),$(l.position.z,c.z,3,r)),l.scale.setScalar($(l.scale.x,Math.max(1e-4,c.scale*d),3,r)),this.flaconSpin+=r*i*(.32+Math.min(Math.abs(s.velocity)*.04,2)),l.rotation.set($(l.rotation.x,s.y*-.12,3,r),this.flaconSpin+s.x*.4,$(l.rotation.z,c.tilt+Math.sin(a*.6)*.04,3,r)),l.position.y+=Math.sin(a*.9)*.04,l.visible=l.scale.x>.01,this.flacon.update(a,o.glow),this.spiceAmount=$(this.spiceAmount,o.spices,2.5,r),this.spices.update(a,this.spiceAmount);let p=o.pumpkin,m=this.pumpkin.group;m.position.set($(m.position.x,p.x*f*this.halfWidth,2.5,r),$(m.position.y,p.y*2.4,2.5,r),$(m.position.z,p.z,2.5,r)),m.scale.setScalar($(m.scale.x,Math.max(1e-4,p.scale*d),2.5,r)),m.rotation.y+=r*i*.18,m.rotation.x=Math.sin(a*.5)*.06+s.y*-.1,m.visible=m.scale.x>.01,this.pumpkin.setFrost(p.frost),this.patchAmount=$(this.patchAmount,o.patch,1.6,r),this.patch.update(a,this.patchAmount,o.frost,this.halfWidth,this.camera.position.z);let h=this.backdrop.uniforms;h.uTime&&(h.uTime.value=a),h.uScroll&&(h.uScroll.value=e.progress),h.uGlow&&(h.uGlow.value=o.glow),(h.uPointer?.value)?.set(s.x,s.y),(h.uDeep?.value)?.copy(this.director.deep),(h.uMid?.value)?.copy(this.director.mid),(h.uHighlight?.value)?.copy(this.director.glowColor),this.rim.color.copy(this.director.glowColor),this.rim.intensity=6+12*o.glow,this.key.intensity=.9+.7*o.glow;let g=Math.max(-3,Math.min(3,s.velocity*.08))+s.x*.6;this.leaves.update(r*i,o.fall,g,o.frost,this.director.deep,this.director.glowColor),this.dust.update(r*i,a,o.snow,1+Math.min(Math.abs(s.velocity)*.05,3)),this.postfx.render(a,o.glow,o.frost*.6)}};function qe(){try{return!!document.createElement(`canvas`).getContext(`webgl2`)}catch{return!1}}async function Je(e,t){if(!qe())return null;let n=new Ke({canvas:e,reducedMotion:t});return e.addEventListener(`webglcontextlost`,t=>{t.preventDefault(),e.classList.remove(`is-ready`),n.dispose()}),await n.warmUp(),n.start(),e.classList.add(`is-ready`),n}export{Je as mountExperience};
//# sourceMappingURL=webgl.BJh-2Qyc.js.map