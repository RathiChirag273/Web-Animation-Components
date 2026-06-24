(() => {
  const defaults = Array.from(
    { length: 9 },
    (_, index) => `https://picsum.photos/seed/wave-${index + 1}/600/760`
  );
  const escapeAttribute = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  class WaveConveyor extends HTMLElement {
    static observedAttributes = ["images", "speed", "wave-height", "direction"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.frame = null;
      this.cards = [];
      this.offset = 0;
      this.lastTime = 0;
      this.raf = 0;
      this.metrics = null;
      this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
      this.resizeObserver = new ResizeObserver(() => this.measure());
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
      this.resizeObserver.observe(this);
      this.raf = requestAnimationFrame(this.tick);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      this.resizeObserver.disconnect();
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
            border-radius:24px; background:linear-gradient(145deg,#110d25,#30205e);
            border:1px solid #39e7ff; box-sizing:border-box; contain:layout paint style;
          }
          * { box-sizing:border-box; }
          .frame { position:relative; width:100%; height:100%; overflow:hidden; }
          .frame::before {
            content:""; position:absolute; inset:20% -10%;
            background:radial-gradient(circle,#8b5cf633,transparent 65%); filter:blur(24px);
          }
          img {
            position:absolute; left:0; top:0; width:clamp(120px,18vw,220px);
            aspect-ratio:4/5; object-fit:cover; border-radius:18px;
            box-shadow:0 24px 55px #05030c80; will-change:transform; user-select:none;
          }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #39e7ff; border-radius:999px; color:#39e7ff; background:#07131dcc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            img { width:128px; border-radius:14px; }
          }
        </style>
        <div class="frame" part="frame">${cards}</div>
        <span class="type-label">Non-Interactive</span>`;
      this.frame = this.shadowRoot.querySelector(".frame");
      this.cards = [...this.shadowRoot.querySelectorAll("img")];
      this.metrics = null;
      this.measure();
    }

    tick(time) {
      if (!this.lastTime) this.lastTime = time;
      const elapsed = Math.min(100, time - this.lastTime);
      this.lastTime = time;
      if (!this.reducedMotion.matches) {
        const speed = Math.max(10, Number(this.getAttribute("speed")) || 55);
        const direction = this.getAttribute("direction") === "right" ? -1 : 1;
        this.offset += elapsed * speed * 0.001 * direction;
        this.positionCards();
      }
      this.raf = requestAnimationFrame(this.tick);
    }

    measure() {
      if (!this.frame || !this.cards.length) return;
      const width = this.frame.clientWidth;
      const height = this.frame.clientHeight;
      const cardWidth = this.cards[0].offsetWidth || 180;
      const cardHeight = this.cards[0].offsetHeight || cardWidth * 1.25;
      const spacing = cardWidth * 1.18;
      const amplitude = Math.min(height * 0.22, Number(this.getAttribute("wave-height")) || 110);
      this.metrics = {
        width,
        height,
        cardWidth,
        cardHeight,
        spacing,
        pathWidth: spacing * this.cards.length,
        amplitude
      };
      this.positionCards();
    }

    positionCards() {
      if (!this.metrics || !this.cards.length) return;
      const { width, height, cardWidth, cardHeight, spacing, pathWidth, amplitude } = this.metrics;
      this.cards.forEach((card, index) => {
        const x = ((index * spacing - this.offset) % pathWidth + pathWidth) % pathWidth - cardWidth;
        const phase = (x / Math.max(width, 1)) * Math.PI * 2;
        const y = height / 2 - cardHeight / 2 + Math.sin(phase) * amplitude;
        const centerDistance = Math.abs(x + cardWidth / 2 - width / 2) / Math.max(width / 2, 1);
        const scale = Math.max(0.76, 1.12 - centerDistance * 0.28);
        card.style.transform = `translate3d(${x}px,${y}px,0) rotate(${Math.cos(phase) * 5}deg) scale(${scale})`;
        card.style.zIndex = String(Math.round(scale * 100));
      });
    }
  }

  if (!customElements.get("wave-conveyor")) {
    customElements.define("wave-conveyor", WaveConveyor);
  }
})();
