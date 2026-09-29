/* =========================================================
   MOCK CONTENT — edit everything here (Part 2)
   ========================================================= */
const MOCK = {
  user: { name: "Mary", zip: "06002" },
  brand: { name: "Cigna Healthcare", ai: "Cigna AI" },
  plans: [
    { id:"localplus", label:"Local+" },
    { id:"oap",       label:"OAP" },
    { id:"ppo",       label:"PPO" },
    { id:"hmo",       label:"HMO" },
    { id:"unsure",    label:"Not sure / I don’t know", full:true }
  ],
  facility: {
    index:1, name:"Orthopedic Associates CT",
    addressLines:["460 Farmington,","West Hartford, CT 06002"],
    phone:"(860) 123-4567", specialties:"Primary Care, +2",
    plans:"Open Access Plus, PPO, +2", distance:"1.2 mi"
  },
  providers: [
    { id:1, category:"Primary Care Provider", name:"Dr. Lisa Sanchez, MD",
      address:"460 Farmington, West Hartford, CT 06002", distance:"1.2 mi",
      specialties:"Primary Care, +2", initials:"LS", map:{x:42,y:52} },
    { id:2, category:"Primary Care Provider", name:"Dr. James Okafor, MD",
      address:"88 Main St, Bloomfield, CT 06002", distance:"2.1 mi",
      specialties:"Primary Care, Internal Medicine", initials:"JO", map:{x:15,y:70} },
    { id:3, category:"Primary Care Provider", name:"Dr. Priya Raman, DO",
      address:"1290 Blue Hills Ave, Hartford, CT 06112", distance:"3.4 mi",
      specialties:"Family Medicine, +1", initials:"PR", map:{x:66,y:24} },
    { id:4, category:"Primary Care Provider", name:"Dr. Ellen Cho, MD",
      address:"55 Park Rd, West Hartford, CT 06119", distance:"3.9 mi",
      specialties:"Primary Care", initials:"EC", map:{x:20,y:18} },
    { id:5, category:"Primary Care Provider", name:"Dr. Marcus Bell, MD",
      address:"705 North Main, Windsor, CT 06095", distance:"4.6 mi",
      specialties:"Primary Care, Geriatrics", initials:"MB", map:{x:93,y:45} }
  ]
};

/* The scripted scenario (Part 2). Each step = one insertion into the chat. */
const FLOW = [
  { id:"greet", type:"ai",
    text:`Hi ${MOCK.user.name}, I’m your healthcare assistant. I can help you with finding the right provider within your health insurance plan.\n\nLet’s start with your zipcode.`,
    anno:{ title:"Greeting + scoping", body:"The assistant frames its capability (provider search within the member’s plan) and asks for the first slot: location." } },
  { id:"zip", type:"user", text:`My zipcode is ${MOCK.user.zip}`,
    anno:{ title:"User provides location", body:"Zip becomes the geo filter for the network lookup. Free-text entry; no component needed." } },
  { id:"plan-select", type:"component", component:"selectTile",
    anno:{ title:"Plan disambiguation", body:"The assistant can’t resolve network status without a plan. Instead of asking an open question, it renders a Select Tile group — constrained input, single tap.", comp:"Select Tile" } },
  { id:"plan-confirm", type:"ai", waitFor:"plan",
    text:()=>`You picked ${state.planLabel}. I’ll use the plan information, your location and look for the PCP speciality to find in-network providers.\n\nHere are a few in-network options to start:`,
    anno:{ title:"Confirmation + handoff", body:"The assistant echoes the selection (plan), states the retrieval strategy (plan + location + specialty), then hands off to the results component." } },
  { id:"results", type:"component", component:"results",
    anno:{ title:"In-network results", body:"Provider cards rendered from the mock provider objects. The List/Map segmented toggle switches presentation without re-fetching — same data, two views.", comp:"Results container" } },
  { id:"care-check", type:"component", component:"careCheck",
    anno:{ title:"Outcome check", body:"A lightweight satisfaction probe closes the loop: 'Were you able to find the care you are looking for?' Yes/No feeds the Takeaways tab and analytics." } }
];

/* =========================================================
   COMPONENT LIBRARY (Part 1) — each returns a DOM node from a data object
   ========================================================= */
const Components = {

  /* 1 — Select Tile */
  selectTile({prompt, category, options, onSelect}) {
    const el = div("c-select");
    el.innerHTML = `<div class="prompt">${prompt}</div>
      <div class="body"><div class="cat">${category}</div>
      <div class="tile-grid" role="radiogroup" aria-label="${category}"></div></div>`;
    const grid = el.querySelector(".tile-grid");
    options.forEach(opt=>{
      const b = document.createElement("button");
      b.className = "tile" + (opt.full ? " full" : "");
      b.setAttribute("role","radio");
      b.setAttribute("aria-checked","false");
      b.innerHTML = `<span class="radio"></span><span>${opt.label}</span>`;
      b.onclick = ()=>{
        if (el.dataset.done) return;
        el.dataset.done = "1";
        grid.querySelectorAll(".tile").forEach(t=>{t.setAttribute("aria-checked","false");t.setAttribute("disabled","")});
        b.removeAttribute("disabled");
        b.setAttribute("aria-checked","true");
        onSelect(opt);
      };
      grid.appendChild(b);
    });
    return el;
  },

  /* 2 — Provider Card */
  providerCard(p, {showCategory=true}={}) {
    const el = div("p-card");
    el.innerHTML = `
      ${showCategory?`<div class="cat">${p.category}</div>`:""}
      <div class="row">
        <div class="avatar">${p.initials}</div>
        <div>
          <div class="name">${p.name}</div>
          <div class="addr">${p.address}</div>
        </div>
      </div>
      <div class="meta"><span class="dist">${p.distance}</span><span>Specialties: ${p.specialties}</span></div>
      <div class="cta-wrap"><button class="cta">View provider details</button></div>`;
    el.querySelector(".cta").onclick = ()=>alert(`(Prototype) Provider detail page for ${p.name}`);
    return el;
  },

  /* 2b — Facility Card (variant) */
  facilityCard(f) {
    const el = div("p-card facility");
    el.innerHTML = `
      <div class="cat numbered"><span>${f.index}. Facility Name</span><span class="kebab">⋯</span></div>
      <div class="row">
        <div class="ficon"><i class="ph ph-hospital"></i></div>
        <div>
          <div class="name"><a href="#" onclick="return false">${f.name}</a></div>
          <div class="lines">${f.addressLines.join("<br>")}<br>
            Phone: ${f.phone}<br>
            Specialties: ${f.specialties}<br>
            Plan: ${f.plans}
          </div>
        </div>
      </div>
      <div class="meta"><span class="dist">${f.distance}</span><span class="view-plans" role="button">View plans</span></div>
      <div class="cta-wrap"><button class="cta">Log in to myCigna</button></div>`;
    el.querySelector(".cta").onclick = ()=>alert(`(Prototype) myCigna login for ${f.name}`);
    return el;
  },

  /* 3 — Results container: List view + Map view */
  results({providers}) {
    const el = div("results");
    el.innerHTML = `
      <div class="seg" role="tablist" aria-label="Results view">
        <button role="tab" aria-selected="true" data-v="list">List view</button>
        <button role="tab" aria-selected="false" data-v="map">Map view</button>
      </div>
      <div class="view"></div>`;
    const view = el.querySelector(".view");
    const tabs = el.querySelectorAll(".seg button");
    let active = 0;

    function renderList(){
      view.innerHTML = "";
      const wrap = div("list-wrap");
      providers.forEach(p=>wrap.appendChild(Components.providerCard(p)));
      view.appendChild(wrap);
    }
    function renderMap(){
      view.innerHTML = "";
      const wrap = div("map-wrap");
      wrap.innerHTML = `
        <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect width="100" height="100" fill="#ecebe8"/>
          <path d="M62 0 Q70 20 78 28 T 84 60 Q88 80 82 100 L100 100 L100 0 Z" fill="#cfe0ee"/>
          <path d="M30 62 q6 -4 10 2 t 12 4 q4 4 -2 8 t -14 0 q-8 -6 -6 -14" fill="#d8e6d4"/>
          <g stroke="#ffffff" stroke-width="1.6" fill="none">
            <path d="M0 30 H70"/><path d="M0 55 H62"/><path d="M0 80 H70"/>
            <path d="M22 0 V100"/><path d="M48 0 V100"/>
            <path d="M0 10 Q40 14 70 40 T 100 78"/>
          </g>
          <g stroke="#ffffff" stroke-width="0.8" fill="none" opacity=".8">
            <path d="M10 0 V100"/><path d="M34 0 V100"/><path d="M0 42 H60"/><path d="M0 68 H55"/>
          </g>
        </svg>
        <div class="zoom"><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button></div>
        <div class="pin you" style="left:50%;top:56%" title="You are here"></div>
        <div class="map-card"></div>
        <span class="map-attr">Map data © prototype</span>`;
      const cardHolder = wrap.querySelector(".map-card");
      let pins = [];
      function selectPin(p){
        pins.forEach(x=>x.el.classList.toggle("active", x.p.id===p.id));
        cardHolder.innerHTML = "";
        const c = Components.providerCard(p);
        c.querySelector(".cat").textContent = `${p.id}. ${p.category}`;
        cardHolder.appendChild(c);
      }
      providers.forEach(p=>{
        const pin = div("pin");
        pin.textContent = p.id;
        pin.style.left = p.map.x+"%"; pin.style.top = p.map.y+"%";
        pin.setAttribute("role","button");
        pin.setAttribute("aria-label",`Show ${p.name}`);
        pin.onclick = ()=>selectPin(p);
        wrap.appendChild(pin);
        pins.push({p, el:pin});
      });
      view.appendChild(wrap);
      selectPin(providers[0]);
    }
    tabs.forEach((t,i)=>t.onclick=()=>{
      active=i;
      tabs.forEach((x,j)=>x.setAttribute("aria-selected", j===i ? "true":"false"));
      tabs.forEach((x,j)=>x.classList.toggle("active", j===i));
      i===0?renderList():renderMap();
      setCompAnno(i===0?"Provider Card":"Results container");
    });
    tabs[0].classList.add("active");
    renderList();
    return el;
  },

  /* Inline outcome check */
  careCheck() {
    const el = div("care-check");
    el.innerHTML = `<span>Were you able to find the care you are looking for?</span>
      <span class="yn"><button><i class="ph ph-thumbs-up"></i> Yes</button><button><i class="ph ph-thumbs-down"></i> No</button></span>`;
    el.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      el.querySelector(".yn").innerHTML = `<em style="font-size:13px;color:#777">Thanks — noted.</em>`;
    });
    return el;
  }
};

/* =========================================================
   FLOW ENGINE
   ========================================================= */
const chat = document.getElementById("chat");
const state = { step:0, planLabel:null, auto:false };
function div(c){const d=document.createElement("div");d.className=c;return d;}
function scrollDown(){chat.scrollTop = chat.scrollHeight;}

function brandHeader(){
  const h = div("brand-row");
  h.innerHTML = `<span class="brand-chip">cigna</span><span class="brand-name">${MOCK.brand.name}</span>
    <span class="fb"><button aria-label="Helpful"><i class="ph ph-thumbs-up"></i></button><button aria-label="Not helpful"><i class="ph ph-thumbs-down"></i></button></span>`;
  return h;
}

function addAI(text){
  const m = div("msg ai");
  m.innerHTML = `<div class="who"><span class="spark">✦</span>${MOCK.brand.ai}</div><div class="bubble"></div>`;
  m.querySelector(".bubble").textContent = text;
  chat.appendChild(m); scrollDown();
}
function addUser(text){
  const m = div("msg user");
  const b = div("bubble"); b.textContent = text;
  m.appendChild(b); chat.appendChild(m); scrollDown();
}
function addComponent(node, {branded=true}={}){
  const m = div("msg ai");
  if (branded) m.appendChild(brandHeader());
  m.appendChild(node);
  chat.appendChild(m); scrollDown();
}
function showTyping(cb){
  const t = div("typing");
  t.innerHTML = `<span class="spark">✦</span><span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chat.appendChild(t); scrollDown();
  setTimeout(()=>{ t.remove(); cb(); }, 700);
}

function runStep(i){
  if (i >= FLOW.length) return;
  state.step = i;
  highlightAnnoStep(i);
  const s = FLOW[i];

  const proceed = ()=>{ if(state.auto || FLOW[i+1] && FLOW[i+1].type!=="user") advance(i); };

  if (s.type === "ai"){
    showTyping(()=>{
      addAI(typeof s.text === "function" ? s.text() : s.text);
      advance(i);
    });
  } else if (s.type === "user"){
    setTimeout(()=>{ addUser(s.text); advance(i); }, state.auto ? 900 : 500);
  } else if (s.type === "component"){
    if (s.component === "selectTile"){
      showTyping(()=>{
        addComponent(Components.selectTile({
          prompt:`Please select a plan in ${MOCK.user.zip}`,
          category:"Medical Plans",
          options:MOCK.plans,
          onSelect:(opt)=>{ state.planLabel = opt.label; setCompAnno("Select Tile"); advance(i); }
        }));
        setCompAnno("Select Tile");
        // waits for user selection — advance happens in onSelect
      });
    } else if (s.component === "results"){
      showTyping(()=>{
        addComponent(Components.results({providers:MOCK.providers}));
        setCompAnno("Provider Card");
        advance(i);
      });
    } else if (s.component === "careCheck"){
      setTimeout(()=>{ addComponent(Components.careCheck(), {branded:false}); }, 400);
    }
  }
}
function advance(i){ setTimeout(()=>runStep(i+1), state.auto ? 1100 : 800); }

function restartFlow(){
  chat.innerHTML = ""; state.planLabel = null; state.step = 0;
  runStep(0);
}
function toggleAuto(){
  state.auto = !state.auto;
  document.getElementById("autoBtn").classList.toggle("active", state.auto);
  document.getElementById("autoBtn").textContent = state.auto ? "⏸ Auto-play on" : "▶ Auto-play";
}

/* =========================================================
   DEVICE + ANNOTATION SIDEBAR (Bonus)
   ========================================================= */
function setDevice(kind){
  const d = document.getElementById("device");
  d.className = "device " + kind;
  document.getElementById("devMobile").classList.toggle("active", kind==="mobile");
  document.getElementById("devDesktop").classList.toggle("active", kind==="desktop");
  document.getElementById("composerInput").placeholder = kind==="mobile" ? "This is a single line of text" : "Ask anything...";
  restartFlow();
}
function toggleAnno(){
  document.getElementById("anno").classList.toggle("hidden");
  document.getElementById("annoBtn").classList.toggle("active");
}

const COMP_DOCS = [
  { name:"Select Tile", what:"Constrained single-select input rendered inside an assistant turn.",
    data:"<code>{prompt, category, options[{id,label,full?}], onSelect}</code>",
    notes:["Radio semantics (role=radiogroup / radio) for accessibility","Locks after selection — the chat transcript stays truthful","Full-width tile variant for escape hatches ('Not sure')"] },
  { name:"Provider Card", what:"Single provider result: identity, proximity, specialties, one CTA.",
    data:"<code>{category, name, address, distance, specialties, initials}</code>",
    notes:["Category header row doubles as the map-pin label in map view","Address truncates with ellipsis at narrow widths","One CTA only — 'View provider details' keeps decision cost low"] },
  { name:"Results container", what:"Wrapper for N provider cards with a List ⇄ Map segmented toggle.",
    data:"<code>{providers:[ProviderCard data + map:{x,y}]}</code>",
    notes:["Same objects power both views — no re-fetch on toggle","Mobile: vertical card stack; desktop: horizontal snap-scroll row","Map pins are numbered; tapping a pin swaps the anchored card"] }
];

let annoTab = "flow";
function setAnnoTab(t){
  annoTab = t;
  document.getElementById("tabFlow").classList.toggle("active", t==="flow");
  document.getElementById("tabComp").classList.toggle("active", t==="comp");
  renderAnno();
}
function renderAnno(){
  const body = document.getElementById("annoBody");
  body.innerHTML = "";
  if (annoTab === "flow"){
    FLOW.forEach((s,i)=>{
      const el = div("anno-step" + (i===state.step ? " current":""));
      el.id = "anno-step-"+i;
      el.innerHTML = `<div class="t"><span class="n">${String(i+1).padStart(2,"0")}</span>${s.anno.title}</div>
        ${s.anno.body}${s.anno.comp?`<span class="comp-tag">Component: ${s.anno.comp}</span>`:""}`;
      body.appendChild(el);
    });
  } else {
    COMP_DOCS.forEach(c=>{
      const el = div("anno-comp" + (c.name===state.activeComp ? " current":""));
      el.innerHTML = `<h3>${c.name}</h3>${c.what}<br><br><strong>Data object:</strong> ${c.data}
        <ul>${c.notes.map(n=>`<li>${n}</li>`).join("")}</ul>`;
      body.appendChild(el);
    });
  }
}
function highlightAnnoStep(i){ if(annoTab==="flow") renderAnno(); }
function setCompAnno(name){ state.activeComp = name; if(annoTab==="comp") renderAnno(); }

/* =========================================================
   COMPONENT SET VIEW (library canvas)
   ========================================================= */
function setView(v){
  const lib = document.getElementById("libCanvas");
  const dev = document.getElementById("device");
  const devGroup = document.getElementById("deviceGroup");
  const isLib = v === "library";
  lib.hidden = !isLib;
  dev.style.display = isLib ? "none" : "flex";
  devGroup.style.visibility = isLib ? "hidden" : "visible";
  document.getElementById("viewFlow").classList.toggle("active", !isLib);
  document.getElementById("viewLib").classList.toggle("active", isLib);
  if (isLib && !lib.dataset.built) buildLibrary();
}

function libItem(title, desc, node){
  const it = div("lib-item");
  it.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
  const spec = div("lib-specimen");
  spec.appendChild(node);
  it.appendChild(spec);
  return it;
}
function libSection(title){
  const s = div("lib-section");
  const h = document.createElement("h2");
  h.textContent = title;
  s.appendChild(h);
  return s;
}
function buildLibrary(){
  const lib = document.getElementById("libCanvas");
  lib.dataset.built = "1";

  /* 1 — Components */
  const comps = libSection("1 · Components");
  comps.appendChild(libItem("Card 1 — Provider",
    "Individual provider result: identity, proximity, specialties, single CTA.",
    Components.providerCard(MOCK.providers[0])));
  comps.appendChild(libItem("Card 2 — Facility",
    "Facility result: numbered header with overflow menu, linked facility name, phone, plan line with View plans, myCigna login CTA.",
    Components.facilityCard(MOCK.facility)));
  comps.appendChild(libItem("Feedback Buttons",
    "Outcome check rendered after results: Yes/No pills with thumbs.",
    Components.careCheck()));
  const brand = div(""); brand.appendChild(brandHeader());
  comps.appendChild(libItem("Brand Row",
    "Branded response header: logo chip, brand name, per-response thumbs feedback.",
    brand));
  lib.appendChild(comps);

  /* 2 — Patterns */
  const pats = libSection("2 · Patterns");
  pats.appendChild(libItem("Select Tile",
    "Constrained single-select group inside an assistant turn; locks after selection.",
    Components.selectTile({
      prompt:`Please select a plan in ${MOCK.user.zip}`,
      category:"Medical Plans",
      options:MOCK.plans,
      onSelect:()=>{}
    })));
  const listOnly = Components.results({providers:MOCK.providers});
  pats.appendChild(libItem("List View",
    "Results container in list state — N provider cards, horizontal snap-scroll on desktop.",
    listOnly));
  const mapOnly = Components.results({providers:MOCK.providers});
  mapOnly.querySelectorAll(".seg button")[1].click();
  pats.appendChild(libItem("Map View",
    "Results container in map state — numbered pins, you-are-here marker, anchored card swaps on pin tap.",
    mapOnly));
  lib.appendChild(pats);
}

/* boot */
renderAnno();
runStep(0);
