(() => {
  const defaults = Array.from(
    { length: 9 },
    (_, index) => `https://picsum.photos/seed/magnetic-${index + 1}/600/600`
  );
  const escapeAttribute = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  class MagneticImageGrid extends HTMLElement {
    static observedAttributes = ["images", "columns", "strength", "gap"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.onPointerMove = this.onPointerMove.bind(this);
      this.reset = this.reset.bind(this);
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
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      const columns = Math.max(2, Number(this.getAttribute("columns")) || 3);
      const gap = Math.max(4, Number(this.getAttribute("gap")) || 14);
      const cards = this.images
        .map((src, index) => `<div class="card"><img src="${escapeAttribute(src)}" alt="Gallery image ${index + 1}" loading="lazy"></div>`)
        .join("");
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position:relative; display:block; width:100%; max-width:1200px;
            height:clamp(360px,58.333vw,700px); overflow:hidden;
            border-radius:24px; background:#e7ff73; border:1px solid #7dff8a;
            box-sizing:border-box; contain:layout paint style;
          }
          * { box-sizing:border-box; }
          .frame {
            width:100%; height:100%; display:grid; grid-template-columns:repeat(${columns},1fr);
            gap:${gap}px; padding:clamp(14px,3vw,38px); overflow:hidden; touch-action:pan-y;
          }
          .card {
            min-width:0; min-height:0; border-radius:18px; overflow:hidden;
            transition:transform .16s ease-out; will-change:transform; box-shadow:0 12px 30px #28310b22;
          }
          img { width:100%; height:100%; display:block; object-fit:cover; pointer-events:none; user-select:none; }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #7dff8a; border-radius:999px; color:#7dff8a; background:#07140acc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            .frame { grid-template-columns:repeat(3,1fr); gap:8px; padding:12px; }
            .card { border-radius:10px; }
          }
          @media (prefers-reduced-motion:reduce) { .card { transition:none; } }
        </style>
        <div class="frame" part="frame">${cards}</div>
        <span class="type-label">Interactive</span>`;
      this.frame = this.shadowRoot.querySelector(".frame");
      this.cards = [...this.shadowRoot.querySelectorAll(".card")];
      this.frame.addEventListener("pointermove", this.onPointerMove);
      this.frame.addEventListener("pointerleave", this.reset);
    }

    onPointerMove(event) {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const strength = Math.max(0, Number(this.getAttribute("strength")) || 26);
      this.cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        const radius = Math.max(rect.width, rect.height) * 2.2;
        const pull = Math.max(0, 1 - distance / radius);
        const x = dx / Math.max(distance, 1) * strength * pull;
        const y = dy / Math.max(distance, 1) * strength * pull;
        card.style.transform = `translate3d(${x}px,${y}px,0) scale(${1 + pull * 0.045})`;
      });
    }

    reset() {
      this.cards?.forEach((card) => { card.style.transform = ""; });
    }
  }

  if (!customElements.get("magnetic-image-grid")) {
    customElements.define("magnetic-image-grid", MagneticImageGrid);
  }
})();
