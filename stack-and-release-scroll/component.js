(() => {
  const defaults = Array.from(
    { length: 6 },
    (_, index) => `https://picsum.photos/seed/stack-${index + 1}/700/900`
  );
  const escapeAttribute = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  class StackAndReleaseScroll extends HTMLElement {
    static observedAttributes = ["images", "spread", "rotation"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.update = this.update.bind(this);
      this.resizeObserver = new ResizeObserver(this.update);
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
      addEventListener("scroll", this.update, { passive: true });
      this.resizeObserver.observe(this);
      this.update();
    }

    disconnectedCallback() {
      removeEventListener("scroll", this.update);
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
            border-radius:24px; background:linear-gradient(140deg,#f7d54a,#ff835c);
            border:1px solid #7dff8a; box-sizing:border-box; contain:layout paint style;
          }
          * { box-sizing:border-box; }
          .frame { position:relative; width:100%; height:100%; overflow:hidden; }
          .label {
            position:absolute; z-index:100; left:clamp(16px,4vw,48px); top:clamp(16px,4vw,48px);
            color:#301914; font:800 clamp(20px,4vw,48px)/.95 system-ui,sans-serif;
            letter-spacing:-.06em; max-width:7ch; text-transform:uppercase;
          }
          img {
            position:absolute; left:50%; top:54%; width:clamp(150px,22vw,270px); aspect-ratio:7/9;
            object-fit:cover; border:clamp(4px,.7vw,9px) solid white; border-radius:18px;
            box-shadow:0 22px 50px #481a1642; transform-origin:50% 90%;
            will-change:transform; transition:transform .08s linear;
          }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #7dff8a; border-radius:999px; color:#7dff8a; background:#07140acc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            img { width:150px; border-radius:13px; }
          }
          @media (prefers-reduced-motion:reduce) { img { transition:none; } }
        </style>
        <div class="frame" part="frame"><span class="label">Scroll to release</span>${cards}</div>
        <span class="type-label">Interactive</span>`;
      this.cards = [...this.shadowRoot.querySelectorAll("img")];
      this.update();
    }

    update() {
      if (!this.cards?.length) return;
      const rect = this.getBoundingClientRect();
      const viewport = innerHeight || document.documentElement.clientHeight;
      const rawProgress = (viewport * 0.82 - rect.top) / (viewport * 0.64 + rect.height * 0.45);
      const progress = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 1
        : Math.max(0, Math.min(1, rawProgress));
      const spread = Math.max(20, Number(this.getAttribute("spread")) || Math.min(this.clientWidth * 0.7, 720));
      const rotation = Math.max(0, Number(this.getAttribute("rotation")) || 28);
      const center = (this.cards.length - 1) / 2;
      this.cards.forEach((card, index) => {
        const normalized = center ? (index - center) / center : 0;
        const x = normalized * spread * progress;
        const y = Math.abs(normalized) * 55 * progress - index * 2 * (1 - progress);
        const angle = normalized * rotation * progress + (index - center) * 1.4 * (1 - progress);
        const scale = 1 - Math.abs(normalized) * 0.12 * progress;
        card.style.zIndex = String(index + 1);
        card.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) rotate(${angle}deg) scale(${scale})`;
      });
    }
  }

  if (!customElements.get("stack-and-release-scroll")) {
    customElements.define("stack-and-release-scroll", StackAndReleaseScroll);
  }
})();
