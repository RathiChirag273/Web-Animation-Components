(() => {
  const defaults = Array.from(
    { length: 12 },
    (_, index) => `https://picsum.photos/seed/waterfall-${index + 1}/600/800`
  );

  const readImages = (element) => {
    try {
      const value = JSON.parse(element.getAttribute("images") || "null");
      return Array.isArray(value) && value.length ? value : defaults;
    } catch {
      return defaults;
    }
  };
  const escapeAttribute = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  class InfinityWaterfall extends HTMLElement {
    static observedAttributes = ["images", "columns", "speed", "gap", "direction"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      const images = readImages(this);
      const columns = Math.max(2, Number(this.getAttribute("columns")) || 4);
      const speed = Math.max(5, Number(this.getAttribute("speed")) || 24);
      const gap = Math.max(0, Number(this.getAttribute("gap")) || 12);
      const baseDirection = this.getAttribute("direction") === "up" ? "up" : "down";
      const columnMarkup = Array.from({ length: columns }, (_, columnIndex) => {
        const columnImages = images.filter((_, index) => index % columns === columnIndex);
        const usableImages = columnImages.length ? columnImages : images;
        const cards = usableImages
          .map((src, index) => `<img src="${escapeAttribute(src)}" alt="Gallery image ${index + 1}" loading="lazy">`)
          .join("");
        const direction = columnIndex % 2 === 0 ? baseDirection : baseDirection === "up" ? "down" : "up";
        const duration = speed + columnIndex * 2.5;
        return `
          <div class="column ${direction}" style="--duration:${duration}s">
            <div class="set">${cards}</div>
            <div class="set" aria-hidden="true">${cards}</div>
          </div>`;
      }).join("");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position:relative; display:block; width:100%; max-width:1200px;
            height:clamp(360px,58.333vw,700px); overflow:hidden;
            border-radius:24px; background:#0b1020; color:white;
            border:1px solid #39e7ff; box-sizing:border-box;
            contain:layout paint style; --gap:${gap}px;
          }
          * { box-sizing:border-box; }
          .frame {
            width:100%; height:100%; display:grid;
            grid-template-columns:repeat(${columns},minmax(0,1fr));
            gap:var(--gap); padding:var(--gap); overflow:hidden;
            mask-image:linear-gradient(transparent,black 8%,black 92%,transparent);
          }
          .column { display:flex; flex-direction:column; gap:var(--gap); min-width:0; will-change:transform; }
          .set { display:flex; flex-direction:column; gap:var(--gap); flex:none; }
          img {
            width:100%; aspect-ratio:3/4; display:block; object-fit:cover;
            border-radius:14px; background:#17203a;
          }
          .up { animation:up var(--duration) linear infinite; }
          .down { animation:down var(--duration) linear infinite; transform:translateY(calc(-50% - var(--gap)/2)); }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #39e7ff; border-radius:999px; color:#39e7ff; background:#07131dcc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @keyframes up { to { transform:translateY(calc(-50% - var(--gap)/2)); } }
          @keyframes down { to { transform:translateY(0); } }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            .frame { grid-template-columns:repeat(${Math.min(columns, 3)},minmax(0,1fr)); }
            .column:nth-child(n+4) { display:none; }
          }
          @media (prefers-reduced-motion:reduce) { .column { animation-play-state:paused; } }
        </style>
        <div class="frame" part="frame">${columnMarkup}</div>
        <span class="type-label">Non-Interactive</span>`;
    }
  }

  if (!customElements.get("infinity-waterfall")) {
    customElements.define("infinity-waterfall", InfinityWaterfall);
  }
})();
