(() => {
  const defaults = Array.from(
    { length: 8 },
    (_, index) => `https://picsum.photos/seed/marquee-${index + 1}/700/500`
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

  class HorizontalInfiniteMarquee extends HTMLElement {
    static observedAttributes = ["images", "speed", "gap", "direction"];

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
      const speed = Math.max(5, Number(this.getAttribute("speed")) || 28);
      const gap = Math.max(0, Number(this.getAttribute("gap")) || 18);
      const reverse = this.getAttribute("direction") === "right";
      const cards = images
        .map((src, index) => `<img src="${escapeAttribute(src)}" alt="Gallery image ${index + 1}" loading="lazy">`)
        .join("");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position:relative; display:block; width:100%; max-width:1200px;
            height:clamp(360px,58.333vw,700px); overflow:hidden;
            border-radius:24px; background:#f1efe9; contain:layout paint style;
            border:1px solid #39e7ff; box-sizing:border-box; --gap:${gap}px; --speed:${speed}s;
          }
          * { box-sizing:border-box; }
          .frame {
            width:100%; height:100%; display:flex; align-items:center; overflow:hidden;
            mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent);
          }
          .track {
            display:flex; gap:var(--gap); width:max-content;
            animation:scroll var(--speed) linear infinite ${reverse ? "reverse" : "normal"};
            will-change:transform;
          }
          .set { display:flex; gap:var(--gap); flex:none; }
          img {
            width:clamp(210px,31vw,390px); aspect-ratio:7/5; object-fit:cover;
            display:block; border-radius:22px; box-shadow:0 20px 50px #16202d24;
          }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #39e7ff; border-radius:999px; color:#39e7ff; background:#07131dcc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @keyframes scroll { to { transform:translateX(calc(-50% - var(--gap)/2)); } }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            img { width:260px; border-radius:16px; }
          }
          @media (prefers-reduced-motion:reduce) { .track { animation-play-state:paused; } }
        </style>
        <div class="frame" part="frame">
          <div class="track"><div class="set">${cards}</div><div class="set" aria-hidden="true">${cards}</div></div>
        </div>
        <span class="type-label">Non-Interactive</span>`;
    }
  }

  if (!customElements.get("horizontal-infinite-marquee")) {
    customElements.define("horizontal-infinite-marquee", HorizontalInfiniteMarquee);
  }
})();
