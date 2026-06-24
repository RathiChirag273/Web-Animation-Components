(() => {
  const defaults = Array.from(
    { length: 8 },
    (_, index) => `https://picsum.photos/seed/depth-${index + 1}/700/900`
  );
  const escapeAttribute = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  class DepthCarousel extends HTMLElement {
    static observedAttributes = ["images", "speed", "depth", "direction"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.cards = [];
      this.phase = 0;
      this.lastTime = 0;
      this.raf = 0;
      this.tick = this.tick.bind(this);
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
      this.raf = requestAnimationFrame(this.tick);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      const cards = this.images
        .map((src, index) => `<img src="${escapeAttribute(src)}" alt="Gallery image ${index + 1}" loading="lazy">`)
        .join("");
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position:relative; display:block; width:100%; max-width:1200px;
            height:clamp(360px,58.333vw,700px); overflow:hidden;
            border-radius:24px; background:linear-gradient(#070b17,#15102b);
            border:1px solid #39e7ff; box-sizing:border-box; contain:layout paint style;
          }
          * { box-sizing:border-box; }
          .frame { position:relative; width:100%; height:100%; overflow:hidden; perspective:900px; }
          .frame::after {
            content:""; position:absolute; left:5%; right:5%; bottom:-20%; height:55%;
            background:radial-gradient(ellipse,#885dff45,transparent 65%); filter:blur(24px);
          }
          .stage { position:absolute; inset:0; transform-style:preserve-3d; }
          img {
            position:absolute; left:50%; top:50%; width:clamp(145px,21vw,260px); aspect-ratio:7/9;
            object-fit:cover; border-radius:18px; box-shadow:0 25px 60px #000a;
            will-change:transform,opacity; backface-visibility:hidden;
          }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #39e7ff; border-radius:999px; color:#39e7ff; background:#07131dcc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            img { width:145px; border-radius:13px; }
          }
        </style>
        <div class="frame" part="frame"><div class="stage">${cards}</div></div>
        <span class="type-label">Non-Interactive</span>`;
      this.frame = this.shadowRoot.querySelector(".frame");
      this.cards = [...this.shadowRoot.querySelectorAll("img")];
      this.positionCards();
    }

    tick(time) {
      if (!this.lastTime) this.lastTime = time;
      const elapsed = Math.min(50, time - this.lastTime);
      this.lastTime = time;
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const speed = Math.max(0.05, Number(this.getAttribute("speed")) || 0.22);
        const direction = this.getAttribute("direction") === "reverse" ? -1 : 1;
        this.phase += elapsed * speed * 0.001 * direction;
        this.positionCards();
      }
      this.raf = requestAnimationFrame(this.tick);
    }

    positionCards() {
      if (!this.cards.length) return;
      const depth = Math.max(250, Number(this.getAttribute("depth")) || 850);
      this.cards.forEach((card, index) => {
        const angle = this.phase + index / this.cards.length * Math.PI * 2;
        const z = Math.cos(angle) * depth / 2;
        const x = Math.sin(angle) * Math.min(this.clientWidth * 0.32, 360);
        const y = Math.sin(angle * 2) * Math.min(this.clientHeight * 0.06, 38);
        const scale = 0.72 + ((z + depth / 2) / depth) * 0.3;
        card.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${-Math.sin(angle) * 18}deg) scale(${scale})`;
        card.style.opacity = String(0.25 + ((z + depth / 2) / depth) * 0.75);
        card.style.zIndex = String(Math.round(z + depth));
      });
    }
  }

  if (!customElements.get("depth-carousel")) {
    customElements.define("depth-carousel", DepthCarousel);
  }
})();
