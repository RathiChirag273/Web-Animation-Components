(() => {
  const defaults = Array.from(
    { length: 7 },
    (_, index) => `https://picsum.photos/seed/cover-flow-${index + 1}/700/900`
  );
  const escapeAttribute = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  class CoverFlowGallery extends HTMLElement {
    static observedAttributes = ["images", "active", "autoplay", "interval"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.active = 0;
      this.timer = 0;
      this.dragStart = null;
      this.resizeObserver = new ResizeObserver(() => this.update());
    }

    get images() {
      try {
        const value = JSON.parse(this.getAttribute("images") || "null");
        return Array.isArray(value) && value.length ? value : defaults;
      } catch {
        return defaults;
      }
    }

    connectedCallback() {
      this.render();
      this.resizeObserver.observe(this);
    }

    disconnectedCallback() {
      clearInterval(this.timer);
      this.resizeObserver.disconnect();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      clearInterval(this.timer);
      const images = this.images;
      this.active = Math.min(images.length - 1, Math.max(0, Number(this.getAttribute("active")) || this.active));
      const slides = images
        .map((src, index) => `<button class="slide" data-index="${index}" aria-label="Show image ${index + 1}"><img src="${escapeAttribute(src)}" alt="Gallery image ${index + 1}" loading="lazy"></button>`)
        .join("");
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position:relative; display:block; width:100%; max-width:1200px;
            height:clamp(360px,58.333vw,700px); overflow:hidden;
            border-radius:24px; background:radial-gradient(circle at 50% 35%,#31364a,#11131b 70%);
            border:1px solid #7dff8a; box-sizing:border-box; contain:layout paint style; color:white;
          }
          * { box-sizing:border-box; }
          .frame { position:relative; width:100%; height:100%; overflow:hidden; touch-action:pan-y; perspective:1100px; }
          .stage { position:absolute; inset:7% 0 15%; transform-style:preserve-3d; }
          .slide {
            position:absolute; left:50%; top:50%; width:clamp(180px,27vw,310px); aspect-ratio:7/9;
            padding:0; border:0; border-radius:20px; overflow:hidden; background:#222;
            box-shadow:0 28px 65px #0009; transition:transform .65s cubic-bezier(.2,.75,.2,1),opacity .45s;
            will-change:transform; cursor:pointer;
          }
          img { width:100%; height:100%; object-fit:cover; display:block; pointer-events:none; }
          .controls {
            position:absolute; left:50%; bottom:5%; transform:translateX(-50%);
            display:flex; align-items:center; gap:10px;
          }
          .nav {
            width:42px; height:42px; border:1px solid #ffffff45; border-radius:50%;
            background:#ffffff14; color:white; cursor:pointer; font:20px/1 system-ui;
            backdrop-filter:blur(8px);
          }
          .count { min-width:66px; text-align:center; font:600 12px/1 system-ui; letter-spacing:.12em; }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #7dff8a; border-radius:999px; color:#7dff8a; background:#07140acc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            .slide { width:190px; border-radius:15px; }
            .stage { inset:4% 0 18%; }
          }
          @media (prefers-reduced-motion:reduce) { .slide { transition:none; } }
        </style>
        <div class="frame" part="frame">
          <div class="stage">${slides}</div>
          <div class="controls">
            <button class="nav prev" aria-label="Previous image">&#8592;</button>
            <span class="count"></span>
            <button class="nav next" aria-label="Next image">&#8594;</button>
          </div>
        </div>
        <span class="type-label">Interactive</span>`;
      this.frame = this.shadowRoot.querySelector(".frame");
      this.slides = [...this.shadowRoot.querySelectorAll(".slide")];
      this.count = this.shadowRoot.querySelector(".count");
      this.shadowRoot.querySelector(".prev").addEventListener("click", () => this.move(-1));
      this.shadowRoot.querySelector(".next").addEventListener("click", () => this.move(1));
      this.slides.forEach((slide) => slide.addEventListener("click", () => {
        this.active = Number(slide.dataset.index);
        this.update();
      }));
      this.frame.addEventListener("pointerdown", (event) => { this.dragStart = event.clientX; });
      this.frame.addEventListener("pointerup", (event) => {
        if (this.dragStart === null) return;
        const delta = event.clientX - this.dragStart;
        if (Math.abs(delta) > 35) this.move(delta > 0 ? -1 : 1);
        this.dragStart = null;
      });
      this.update();
      if (this.getAttribute("autoplay") === "true" && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.timer = setInterval(() => this.move(1), Math.max(1200, Number(this.getAttribute("interval")) || 3200));
      }
    }

    move(amount) {
      this.active = (this.active + amount + this.slides.length) % this.slides.length;
      this.update();
    }

    update() {
      this.slides.forEach((slide, index) => {
        let offset = index - this.active;
        const half = this.slides.length / 2;
        if (offset > half) offset -= this.slides.length;
        if (offset < -half) offset += this.slides.length;
        const abs = Math.abs(offset);
        const x = offset * Math.min(this.clientWidth * 0.19, 210);
        const z = -abs * 170;
        const rotate = offset * -34;
        const scale = Math.max(0.72, 1 - abs * 0.12);
        slide.style.transform = `translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
        slide.style.opacity = abs > 3 ? "0" : String(Math.max(0.25, 1 - abs * 0.17));
        slide.style.zIndex = String(100 - abs);
        slide.tabIndex = index === this.active ? 0 : -1;
      });
      this.count.textContent = `${this.active + 1} / ${this.slides.length}`;
    }
  }

  if (!customElements.get("cover-flow-gallery")) {
    customElements.define("cover-flow-gallery", CoverFlowGallery);
  }
})();
