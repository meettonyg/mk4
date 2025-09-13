var GMKB=function(v){"use strict";class k{constructor(e={}){this.state={components:{},sections:[],theme:"default",globalSettings:{},...e},this.listeners=new Set}getState(){return this.state}dispatch(e){switch(console.log("🔄 Action:",e.type,e.payload),e.type){case"SET_STATE":this.state={...this.state,...e.payload};break;case"ADD_COMPONENT":const o=e.payload;this.state.components[o.id]=o,this.addComponentToSection(o.id,o.sectionId);break;case"REMOVE_COMPONENT":const t=e.payload,i=this.state.components[t];i&&(this.removeComponentFromSection(t,i.sectionId),delete this.state.components[t]);break;case"UPDATE_COMPONENT":const{id:s,updates:d}=e.payload;this.state.components[s]&&(this.state.components[s]={...this.state.components[s],...d});break;case"ADD_SECTION":this.state.sections.push(e.payload);break;case"UPDATE_SECTIONS":this.state.sections=e.payload;break;case"SET_THEME":this.state.theme=e.payload;break;default:console.warn("Unknown action type:",e.type)}this.notify()}addComponentToSection(e,o){const t=this.state.sections.find(i=>i.section_id===o);t&&!t.components.includes(e)&&t.components.push(e)}removeComponentFromSection(e,o){const t=this.state.sections.find(i=>i.section_id===o);t&&(t.components=t.components.filter(i=>i!==e))}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){this.listeners.forEach(e=>e(this.state))}}class S{constructor(){this.events=new Map}on(e,o){return this.events.has(e)||this.events.set(e,new Set),this.events.get(e).add(o),()=>this.off(e,o)}off(e,o){this.events.has(e)&&this.events.get(e).delete(o)}emit(e,o){console.log("📢 Event:",e,o),this.events.has(e)&&this.events.get(e).forEach(t=>{try{t(o)}catch(i){console.error(`Error in ${e} handler:`,i)}})}once(e,o){const t=i=>{o(i),this.off(e,t)};return this.on(e,t)}}const g={},C={};function T(n,e,o=null){return g[n]=e,o&&(C[n]=o),console.log(`✅ Registered component: ${n}`),!0}function y(n){return n in g}function L(n){if(!y(n))return console.warn(`Component type "${n}" not found in registry`),D(n);const e=g[n];return typeof e=="object"&&e.render?e.render:e}function P(n){return C[n]||null}function D(n){return function(o){const t=o.data||o.props||{};let i="";switch(n){case"hero":i=`
          <div class="gmkb-hero">
            <h1>${t.title||t.full_name||"Guest Name"}</h1>
            ${t.subtitle?`<h2>${t.subtitle}</h2>`:""}
            ${t.description?`<p>${t.description}</p>`:""}
          </div>
        `;break;case"biography":i=`
          <div class="gmkb-biography">
            <h2>Biography</h2>
            <p>${t.biography||"No biography available."}</p>
          </div>
        `;break;case"topics":const d=t.topics||[];i=`
          <div class="gmkb-topics">
            <h2>Topics</h2>
            ${d.length>0?`<ul>${d.map(r=>`<li>${r}</li>`).join("")}</ul>`:"<p>No topics available.</p>"}
          </div>
        `;break;case"contact":i=`
          <div class="gmkb-contact">
            <h2>Contact</h2>
            ${t.email?`<p>Email: ${t.email}</p>`:""}
            ${t.phone?`<p>Phone: ${t.phone}</p>`:""}
            ${t.website?`<p>Website: ${t.website}</p>`:""}
          </div>
        `;break;case"cta":case"call-to-action":i=`
          <div class="gmkb-cta">
            <h2>${t.title||"Call to Action"}</h2>
            ${t.description?`<p>${t.description}</p>`:""}
            ${t.button_text?`<button class="btn btn-primary">${t.button_text}</button>`:""}
          </div>
        `;break;case"testimonials":const l=t.testimonials||[];i=`
          <div class="gmkb-testimonials">
            <h2>Testimonials</h2>
            ${l.length>0?l.map(r=>`
                <blockquote>
                  <p>${r.text||""}</p>
                  <cite>- ${r.author||"Anonymous"}</cite>
                </blockquote>
              `).join(""):"<p>No testimonials available.</p>"}
          </div>
        `;break;default:i=`
          <div class="gmkb-component gmkb-component--${n}">
            <h3>${n.charAt(0).toUpperCase()+n.slice(1)} Component</h3>
            <pre>${JSON.stringify(t,null,2)}</pre>
          </div>
        `}const s=document.createElement("div");return s.innerHTML=i,s.firstElementChild}}async function j(){return["hero","biography","topics","contact","cta","testimonials"].forEach(e=>{y(e)||T(e,D(e))}),console.log("✅ Component renderers loaded:",Object.keys(g)),g}typeof window<"u"&&(window.GMKBComponentRegistry={register:T,get:L,has:y,getSchema:P});const u={info:(...n)=>console.log("ℹ️",...n),warn:(...n)=>console.warn("⚠️",...n),error:(...n)=>console.error("❌",...n),success:(...n)=>console.log("✅",...n),debug:(...n)=>{var e;(e=window.gmkbData)!=null&&e.debugMode&&console.log("🐛",...n)}};class I{constructor(e,o="media-kit-preview"){if(this.stateManager=e,this.container=document.getElementById(o),!this.container){u.error(`Container #${o} not found`);return}const t=document.getElementById("empty-state"),i=document.getElementById("saved-components-container");t&&(t.style.display="none"),i&&(i.style.display="block"),this.unsubscribe=this.stateManager.subscribe(()=>this.render()),this.render()}render(){const e=this.stateManager.getState();u.debug("🎨 Rendering state:",e);const o=Object.keys(e.components).length>0,t=e.sections&&e.sections.length>0,i=document.getElementById("empty-state"),s=document.getElementById("saved-components-container");if(!o&&!t){i&&(i.style.display="block"),s&&(s.style.display="none"),this.renderEmptyState();return}i&&(i.style.display="none"),s&&(s.style.display="block"),this.container.innerHTML="",(this.container.id==="media-kit-preview"||this.container.id==="gmkb-preview-area")&&(this.container.className=`preview-area theme-${e.theme||"default"}`),t?this.renderSections(e):o&&this.renderComponentsDirectly(e)}renderSections(e){e.sections.forEach(o=>{const t=this.renderSection(o,e);t&&this.container.appendChild(t)})}renderSection(e,o){const t=document.createElement("div");t.className=`gmkb-section gmkb-section--${e.type||"full-width"}`,t.setAttribute("data-section-id",e.section_id);const i=document.createElement("div");return i.className="gmkb-section__content",e.components&&e.components.length>0?e.components.forEach(s=>{const d=o.components[s];if(d){const l=this.renderComponent(d);l&&i.appendChild(l)}}):i.innerHTML=`
        <div class="gmkb-section__empty" data-drop-zone="true">
          <p>Drop components here</p>
        </div>
      `,this.addSectionControls(t,e),t.appendChild(i),t}renderComponentsDirectly(e){Object.values(e.components).forEach(o=>{const t=this.renderComponent(o);t&&this.container.appendChild(t)})}renderComponent(e){const o=L(e.type);if(!o)return u.warn(`No renderer for component type: ${e.type}`),this.renderFallbackComponent(e);try{let t;if(typeof o=="function")t=o(e);else if(o.render)t=o.render(e);else throw new Error("Invalid renderer format");if(typeof t=="string"){const s=document.createElement("div");s.innerHTML=t,t=s.firstElementChild||s}const i=document.createElement("div");return i.className=`gmkb-component gmkb-component--${e.type}`,i.setAttribute("data-component-id",e.id),i.setAttribute("data-component-type",e.type),this.addComponentControls(i,e),i.appendChild(t),i}catch(t){return u.error(`Error rendering component ${e.id}:`,t),this.renderFallbackComponent(e)}}renderFallbackComponent(e){const o=document.createElement("div");return o.className=`gmkb-component gmkb-component--${e.type} gmkb-component--fallback`,o.setAttribute("data-component-id",e.id),o.innerHTML=`
      <div class="component-fallback">
        <h4>${e.type}</h4>
        <p>Component ID: ${e.id}</p>
      </div>
    `,this.addComponentControls(o,e),o}addComponentControls(e,o){const t=document.createElement("div");t.className="component-controls",t.innerHTML=`
      <button class="control-btn move-up" data-action="move-up" title="Move Up">↑</button>
      <button class="control-btn move-down" data-action="move-down" title="Move Down">↓</button>
      <button class="control-btn edit" data-action="edit" title="Edit">✏️</button>
      <button class="control-btn duplicate" data-action="duplicate" title="Duplicate">📋</button>
      <button class="control-btn delete" data-action="delete" title="Delete">🗑️</button>
    `,t.addEventListener("click",i=>{const s=i.target.dataset.action;s&&this.handleComponentAction(s,o.id)}),e.appendChild(t)}addSectionControls(e,o){const t=document.createElement("div");t.className="section-controls",t.innerHTML=`
      <button class="control-btn delete" data-action="delete-section" title="Delete Section">🗑️</button>
      <button class="control-btn settings" data-action="section-settings" title="Section Settings">⚙️</button>
    `,t.addEventListener("click",i=>{const s=i.target.dataset.action;s&&this.handleSectionAction(s,o.section_id)}),e.appendChild(t)}handleComponentAction(e,o){document.dispatchEvent(new CustomEvent("gmkb:component-action",{detail:{action:e,componentId:o}}))}handleSectionAction(e,o){document.dispatchEvent(new CustomEvent("gmkb:section-action",{detail:{action:e,sectionId:o}}))}renderEmptyState(){const e=document.getElementById("empty-state");if(e){const t=e.querySelector("#add-first-component"),i=e.querySelector("#add-first-section");t&&!t.hasAttribute("data-listener-attached")&&(t.addEventListener("click",()=>{document.dispatchEvent(new CustomEvent("gmkb:open-component-library"))}),t.setAttribute("data-listener-attached","true")),i&&!i.hasAttribute("data-listener-attached")&&(i.addEventListener("click",()=>{this.addSection()}),i.setAttribute("data-listener-attached","true"));return}this.container.innerHTML=`
      <div class="gmkb-empty-state">
        <h3>No components yet</h3>
        <p>Click "Add Component" to get started</p>
        <button id="empty-state-add-btn" class="btn btn-primary">Add Component</button>
      </div>
    `;const o=this.container.querySelector("#empty-state-add-btn");o&&o.addEventListener("click",()=>{document.dispatchEvent(new CustomEvent("gmkb:open-component-library"))})}addSection(){const o={section_id:`section_${Date.now()}`,type:"full_width",components:[]};this.stateManager.dispatch({type:"ADD_SECTION",payload:o})}destroy(){this.unsubscribe&&this.unsubscribe()}}class ${constructor(e,o,t){var i,s,d;this.ajaxUrl=e||((i=window.gmkbData)==null?void 0:i.ajaxUrl),this.nonce=o||((s=window.gmkbData)==null?void 0:s.nonce),this.postId=t||((d=window.gmkbData)==null?void 0:d.postId)}async save(e){var t;const o=new FormData;o.append("action","gmkb_save_media_kit"),o.append("nonce",this.nonce),o.append("post_id",this.postId),o.append("state",JSON.stringify(e));try{const i=await fetch(this.ajaxUrl,{method:"POST",body:o});if(!i.ok)throw new Error(`Save failed: ${i.statusText}`);const s=await i.json();if(!s.success)throw new Error(((t=s.data)==null?void 0:t.message)||"Save failed");return s.data}catch(i){throw console.error("Save failed:",i),i}}async load(){var o;const e=new FormData;e.append("action","gmkb_load_media_kit"),e.append("nonce",this.nonce),e.append("post_id",this.postId);try{const t=await fetch(this.ajaxUrl,{method:"POST",body:e});if(!t.ok)throw new Error(`Load failed: ${t.statusText}`);const i=await t.json();if(!i.success)throw new Error(((o=i.data)==null?void 0:o.message)||"Load failed");return i.data}catch(t){return console.error("Load failed:",t),null}}async loadComponent(e){var t;const o=new FormData;o.append("action","gmkb_load_component"),o.append("nonce",this.nonce),o.append("component_id",e),o.append("post_id",this.postId);try{const s=await(await fetch(this.ajaxUrl,{method:"POST",body:o})).json();if(!s.success)throw new Error(((t=s.data)==null?void 0:t.message)||"Load failed");return s.data}catch(i){return console.error("Component load failed:",i),null}}}let c,x,E,M;function p(n,e="info",o=3e3){const t=document.createElement("div");t.className=`toast toast--${e}`,t.textContent=n,document.body.appendChild(t),setTimeout(()=>{t.classList.add("toast--visible")},10),setTimeout(()=>{t.classList.remove("toast--visible"),setTimeout(()=>t.remove(),300)},o)}function U(n){p(n,"error",5e3)}async function B(){var n,e,o,t,i;u.info("🚀 Initializing Media Kit Builder v3.0");try{x=new S,E=new $((n=window.gmkbData)==null?void 0:n.ajaxUrl,(e=window.gmkbData)==null?void 0:e.nonce,(o=window.gmkbData)==null?void 0:o.postId),await j();const s=((t=window.gmkbData)==null?void 0:t.savedState)||((i=window.gmkbData)==null?void 0:i.saved_state)||{};s.components||(s.components={}),(!s.sections||!Array.isArray(s.sections))&&(s.sections=[],Object.keys(s.components).length>0&&(s.sections=[{section_id:`section_${Date.now()}`,type:"full_width",components:Object.keys(s.components)}])),c=new k(s);const d=["gmkb-sections-container","saved-components-container","media-kit-preview","gmkb-preview-area"];let l="media-kit-preview";for(const r of d)if(document.getElementById(r)){l=r,u.info(`Using container: ${r}`);break}M=new I(c,l),A(),q(),R(),window.GMKB={stateManager:c,eventBus:x,apiService:E,renderer:M,version:"3.0.0",addComponent:(r,m={})=>{const a=`${r}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,h={id:a,type:r,data:m,props:m},b=c.getState();if(b.sections.length===0){const f=`section_${Date.now()}`;c.dispatch({type:"ADD_SECTION",payload:{section_id:f,type:"full_width",components:[]}}),h.sectionId=f}else h.sectionId=b.sections[0].section_id;return c.dispatch({type:"ADD_COMPONENT",payload:h}),a},removeComponent:r=>{c.dispatch({type:"REMOVE_COMPONENT",payload:r})},save:()=>_(),getState:()=>c.getState()},u.success("Media Kit Builder initialized successfully"),document.dispatchEvent(new CustomEvent("gmkb:ready",{detail:{version:"3.0.0"}}))}catch(s){u.error("Initialization failed:",s),U("Failed to initialize Media Kit Builder")}}function A(){if(console.log("Setting up UI handlers..."),!document.getElementById("gmkb-toolbar")){console.warn("Toolbar not found, retrying..."),setTimeout(A,100);return}console.log("Toolbar found, attaching handlers..."),z();const e=document.getElementById("save-btn");e&&e.addEventListener("click",async()=>{await _()});const o=document.getElementById("add-component-btn")||document.getElementById("add-first-component")||document.querySelector('[data-action="add-component"]');o&&o.addEventListener("click",()=>{w()});const t=document.getElementById("add-section-btn")||document.getElementById("add-first-section")||document.getElementById("add-first-section-2")||document.querySelector('[data-action="add-section"]');t&&t.addEventListener("click",()=>{N()}),document.querySelectorAll("[data-action]").forEach(a=>{const h=a.dataset.action;h==="add-component"&&!a.hasEventListener?(a.addEventListener("click",()=>w()),a.hasEventListener=!0):h==="add-section"&&!a.hasEventListener&&(a.addEventListener("click",()=>N()),a.hasEventListener=!0)});const i=document.getElementById("global-theme-btn");i?(i.onclick=function(a){a.preventDefault(),console.log("Theme button clicked!"),W()},console.log("✓ Theme button handler attached (onclick)")):console.warn("Theme button not found");const s=document.getElementById("export-btn");s?(s.onclick=function(a){a.preventDefault(),console.log("Export button clicked!"),Q()},console.log("✓ Export button handler attached (onclick)")):console.warn("Export button not found");const d=document.getElementById("share-btn");d?(d.onclick=function(a){a.preventDefault(),console.log("Share button clicked!"),X()},console.log("✓ Share button handler attached (onclick)")):console.warn("Share button not found");const l=document.getElementById("undo-btn"),r=document.getElementById("redo-btn");l?(l.onclick=function(a){a.preventDefault(),console.log("Undo button clicked!"),p("Undo functionality coming soon","info")},console.log("✓ Undo button handler attached (onclick)")):console.warn("Undo button not found"),r?(r.onclick=function(a){a.preventDefault(),console.log("Redo button clicked!"),p("Redo functionality coming soon","info")},console.log("✓ Redo button handler attached (onclick)")):console.warn("Redo button not found");const m=document.querySelectorAll(".toolbar__preview-btn");m.length>0?(m.forEach(a=>{a.onclick=function(h){h.preventDefault();const b=this.dataset.preview||this.textContent.toLowerCase();console.log(`Device preview clicked: ${b}`);const f=document.querySelector(".preview__container");f?(f.classList.remove("preview__container--desktop","preview__container--tablet","preview__container--mobile"),b==="tablet"?f.classList.add("preview__container--tablet"):b==="mobile"&&f.classList.add("preview__container--mobile"),console.log(`Preview classes: ${f.className}`)):console.warn("Preview container not found"),m.forEach(Z=>Z.classList.remove("toolbar__preview-btn--active")),this.classList.add("toolbar__preview-btn--active")}}),console.log(`✓ ${m.length} device preview button handlers attached (onclick)`)):console.warn("No device preview buttons found")}function z(){const n=document.querySelectorAll(".sidebar__tab"),e=document.querySelectorAll(".tab-content");n.forEach(o=>{o.addEventListener("click",()=>{const t=o.dataset.tab;n.forEach(i=>i.classList.remove("sidebar__tab--active")),o.classList.add("sidebar__tab--active"),e.forEach(i=>{i.classList.remove("tab-content--active"),i.id===`${t}-tab`&&i.classList.add("tab-content--active")})})})}function q(){H(),document.addEventListener("gmkb:component-action",n=>{const{action:e,componentId:o}=n.detail;switch(e){case"delete":confirm("Delete this component?")&&c.dispatch({type:"REMOVE_COMPONENT",payload:o});break;case"duplicate":G(o);break;case"edit":J(o);break;case"move-up":O(o,-1);break;case"move-down":O(o,1);break}}),document.addEventListener("gmkb:section-action",n=>{const{action:e,sectionId:o}=n.detail;switch(e){case"delete-section":confirm("Delete this section and all its components?")&&K(o);break;case"section-settings":V(o);break}}),document.addEventListener("gmkb:open-component-library",w)}function H(){document.querySelectorAll('.component-item[draggable="true"]').forEach(e=>{e.addEventListener("dragstart",o=>{const t=e.dataset.component;o.dataTransfer.effectAllowed="copy",o.dataTransfer.setData("text/plain",t),o.dataTransfer.setData("application/json",JSON.stringify({type:"new-component",componentType:t})),e.classList.add("dragging")}),e.addEventListener("dragend",()=>{e.classList.remove("dragging")}),e.addEventListener("click",()=>{const o=e.dataset.component;window.GMKB.addComponent(o),p(`Added ${o} component`,"success")})});const n=document.getElementById("media-kit-preview")||document.getElementById("gmkb-sections-container");n&&(n.addEventListener("dragover",e=>{e.preventDefault(),e.dataTransfer.dropEffect="copy",n.classList.add("drag-over")}),n.addEventListener("dragleave",()=>{n.classList.remove("drag-over")}),n.addEventListener("drop",e=>{e.preventDefault(),n.classList.remove("drag-over");const o=e.dataTransfer.getData("text/plain");o&&(window.GMKB.addComponent(o),p(`Added ${o} component`,"success"))}))}function R(){let n;c.subscribe(()=>{clearTimeout(n),n=setTimeout(()=>{_(!0)},5e3)})}async function _(n=!1){const e=document.getElementById("save-btn");!n&&e&&(e.disabled=!0,e.textContent="Saving...");try{const o=c.getState();await E.save(o),n||p("Saved successfully","success"),u.success("State saved")}catch(o){u.error("Save failed:",o),n||p("Save failed","error")}finally{!n&&e&&(e.disabled=!1,e.textContent="Save")}}function w(){let n=document.getElementById("component-library-modal");n||(n=document.createElement("div"),n.id="component-library-modal",n.className="modal",n.innerHTML=`
      <div class="modal__content">
        <div class="modal__header">
          <h2 class="modal__title">Add Component</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body" id="component-library-list"></div>
      </div>
    `,document.body.appendChild(n),n.querySelector(".modal__close").addEventListener("click",()=>{n.classList.remove("modal--open")}),n.addEventListener("click",e=>{e.target===n&&n.classList.remove("modal--open")})),n.classList.add("modal--open"),F(),console.log("Component library modal opened")}function F(){var o;const n=document.getElementById("component-library-list");if(!n)return;const e=((o=window.gmkbData)==null?void 0:o.components)||[{type:"hero",name:"Hero",description:"Hero section with title and image"},{type:"biography",name:"Biography",description:"Professional biography"},{type:"topics",name:"Topics",description:"Speaking topics list"},{type:"contact",name:"Contact",description:"Contact information"},{type:"cta",name:"Call to Action",description:"CTA button section"},{type:"testimonials",name:"Testimonials",description:"Client testimonials"}];n.innerHTML=e.map(t=>`
    <div class="component-card" data-component-type="${t.type}">
      <h3>${t.name}</h3>
      <p>${t.description}</p>
      <button class="btn btn-primary add-component-btn" data-type="${t.type}">
        Add ${t.name}
      </button>
    </div>
  `).join(""),n.querySelectorAll(".add-component-btn").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.type;window.GMKB.addComponent(i);const s=document.getElementById("component-library-modal");s&&s.classList.remove("modal--open"),p(`Added ${i} component`,"success")})})}function N(n="full_width"){const o={section_id:`section_${Date.now()}`,type:n,components:[]};c.dispatch({type:"ADD_SECTION",payload:o}),p("Section added","success")}function K(n){const e=c.getState(),o=e.sections.filter(i=>i.section_id!==n),t=e.sections.find(i=>i.section_id===n);t&&t.components&&t.components.forEach(i=>{c.dispatch({type:"REMOVE_COMPONENT",payload:i})}),c.dispatch({type:"UPDATE_SECTIONS",payload:o})}function G(n){const o=c.getState().components[n];if(o){const t=`${o.type}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,i={...o,id:t,data:{...o.data}};c.dispatch({type:"ADD_COMPONENT",payload:i}),p("Component duplicated","success")}}function O(n,e){const o=c.getState(),t=o.components[n];if(!t||!t.sectionId)return;const i=o.sections.find(m=>m.section_id===t.sectionId);if(!i)return;const s=i.components.indexOf(n);if(s===-1)return;const d=s+e;if(d<0||d>=i.components.length)return;const l=[...i.components];[l[s],l[d]]=[l[d],l[s]];const r=o.sections.map(m=>m.section_id===i.section_id?{...m,components:l}:m);c.dispatch({type:"UPDATE_SECTIONS",payload:r})}function J(n){const e=c.getState().components[n];e&&(console.log("Edit component:",e),p("Component editor not yet implemented","info"))}function V(n){console.log("Edit section:",n),p("Section settings not yet implemented","info")}function W(){console.log("Opening advanced theme customizer..."),window.themeCustomizer&&typeof window.themeCustomizer.open=="function"?(window.themeCustomizer.open(),console.log("Advanced theme customizer opened")):window.openThemeSettings&&typeof window.openThemeSettings=="function"?(window.openThemeSettings(),console.log("Theme settings opened via alternative method")):(document.dispatchEvent(new CustomEvent("gmkb:open-theme-customizer",{detail:{source:"toolbar"}})),console.log("Dispatched open-theme-customizer event"),setTimeout(()=>{document.getElementById("theme-customizer-modal")||Y()},100))}function Y(){console.log("Opening simple theme modal as fallback...");const n=document.getElementById("theme-customizer-modal");n&&n.remove();let e=document.getElementById("gmkb-theme-modal");if(!e){e=document.createElement("div"),e.id="gmkb-theme-modal",e.className="modal",e.innerHTML=`
      <div class="modal__content">
        <div class="modal__header">
          <h2 class="modal__title">Customize Theme</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <div class="theme-palette">
            <div class="palette-option palette-option--blue palette-option--active" data-theme="blue"></div>
            <div class="palette-option palette-option--green" data-theme="green"></div>
            <div class="palette-option palette-option--purple" data-theme="purple"></div>
            <div class="palette-option palette-option--orange" data-theme="orange"></div>
            <div class="palette-option palette-option--pink" data-theme="pink"></div>
            <div class="palette-option palette-option--gray" data-theme="gray"></div>
          </div>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">Select a theme color above</p>
          <p style="color: #ef4444; font-size: 12px; margin-top: 10px;">Note: Advanced theme customizer is loading...</p>
        </div>
      </div>
    `,document.body.appendChild(e);const o=e.querySelector(".modal__close");o&&(o.onclick=function(t){t.preventDefault(),t.stopPropagation(),e.classList.remove("modal--open"),e.style.display="none"}),e.onclick=function(t){t.target===e&&(e.classList.remove("modal--open"),e.style.display="none")},e.querySelectorAll(".palette-option").forEach(t=>{t.onclick=function(i){i.preventDefault(),e.querySelectorAll(".palette-option").forEach(d=>{d.classList.remove("palette-option--active")}),this.classList.add("palette-option--active");const s=this.dataset.theme;console.log("Theme selected:",s),c&&c.dispatch({type:"SET_THEME",payload:s}),p(`Theme changed to ${s}`,"success")}})}e.classList.add("modal--open"),e.style.display="flex"}function Q(){console.log("Opening export modal...");const n=document.getElementById("export-modal");n&&n.remove();let e=document.getElementById("gmkb-export-modal");if(!e){e=document.createElement("div"),e.id="gmkb-export-modal",e.className="modal",e.innerHTML=`
      <div class="modal__content">
        <div class="modal__header">
          <h2 class="modal__title">Export Media Kit</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <div class="export-options">
            <div class="export-option" data-format="json">
              <div class="export-option__icon">📄</div>
              <div class="export-option__title">JSON</div>
              <div class="export-option__description">For backup and import</div>
            </div>
            <div class="export-option" data-format="html">
              <div class="export-option__icon">🌐</div>
              <div class="export-option__title">HTML</div>
              <div class="export-option__description">Static webpage (coming soon)</div>
            </div>
            <div class="export-option" data-format="pdf">
              <div class="export-option__icon">📑</div>
              <div class="export-option__title">PDF</div>
              <div class="export-option__description">Document format (coming soon)</div>
            </div>
            <div class="export-option" data-format="link">
              <div class="export-option__icon">🔗</div>
              <div class="export-option__title">Share Link</div>
              <div class="export-option__description">Get shareable link (coming soon)</div>
            </div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(e);const o=e.querySelector(".modal__close");o&&(o.onclick=function(t){t.preventDefault(),t.stopPropagation(),e.classList.remove("modal--open"),e.style.display="none"}),e.onclick=function(t){t.target===e&&(e.classList.remove("modal--open"),e.style.display="none")},e.querySelectorAll(".export-option").forEach(t=>{t.onclick=function(i){i.preventDefault();const s=this.dataset.format;if(s==="json"){if(!c){p("Export not ready","error");return}const d=c.getState(),l=JSON.stringify(d,null,2),r="data:application/json;charset=utf-8,"+encodeURIComponent(l),m=`media-kit-${Date.now()}.json`,a=document.createElement("a");a.setAttribute("href",r),a.setAttribute("download",m),a.click(),p("Media kit exported as JSON","success"),e.classList.remove("modal--open"),e.style.display="none"}else p(`${s.toUpperCase()} export coming soon`,"info")}})}e.classList.add("modal--open"),e.style.display="flex"}function X(){console.log("Opening share modal...");let n=document.getElementById("share-modal");n||(n=document.createElement("div"),n.id="share-modal",n.className="modal",n.innerHTML=`
      <div class="modal__content">
        <div class="modal__header">
          <h2 class="modal__title">Share Media Kit</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔗</div>
            <h3 style="color: #e2e8f0; margin-bottom: 10px;">Share Feature Coming Soon!</h3>
            <p style="color: #94a3b8; font-size: 14px;">You'll be able to generate shareable links, embed codes, and collaborate with team members.</p>
          </div>
        </div>
      </div>
    `,document.body.appendChild(n),n.querySelector(".modal__close").addEventListener("click",()=>{n.classList.remove("modal--open")}),n.addEventListener("click",e=>{e.target===n&&n.classList.remove("modal--open")})),n.classList.add("modal--open")}return document.readyState==="loading"?document.addEventListener("DOMContentLoaded",B):setTimeout(B,0),v.APIService=$,v.EventBus=S,v.Renderer=I,v.StateManager=k,v.logger=u,Object.defineProperty(v,Symbol.toStringTag,{value:"Module"}),v}({});
