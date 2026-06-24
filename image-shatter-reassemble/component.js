(() => {
  class ImageShatterReassemble extends HTMLElement {
    static observedAttributes = ["src", "pieces", "trigger", "duration", "distance"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.reassembleTimer = 0;
    }

    connectedCallback() {
      this.render();
    }

    disconnectedCallback() {
      clearTimeout(this.reassembleTimer);
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      clearTimeout(this.reassembleTimer);
      const pieceCount = Math.max(4, Number(this.getAttribute("pieces")) || 36);
      const columns = Math.ceil(Math.sqrt(pieceCount));
      const rows = Math.ceil(pieceCount / columns);
      const duration = Math.max(150, Number(this.getAttribute("duration")) || 850);
      const distance = Math.max(20, Number(this.getAttribute("distance")) || 170);
      const pieces = Array.from({ length: columns * rows }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const angle = Math.atan2(row - (rows - 1) / 2, column - (columns - 1) / 2);
        const variance = 0.65 + ((index * 47) % 50) / 100;
        const x = Math.cos(angle) * distance * variance;
        const y = Math.sin(angle) * distance * variance;
        const rotate = ((index * 73) % 100 - 50) * 1.8;
        return `<span style="--c:${column};--r:${row};--x:${x}px;--y:${y}px;--rotate:${rotate}deg;--delay:${(index % 7) * 16}ms"></span>`;
      }).join("");
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position:relative; display:block; width:100%; max-width:1200px;
            height:clamp(360px,58.333vw,700px); overflow:hidden;
            border-radius:24px; background:#dfe7ed; border:1px solid #7dff8a;
            box-sizing:border-box; contain:layout paint style;
          }
          * { box-sizing:border-box; }
          .frame { position:relative; width:100%; height:100%; overflow:hidden; cursor:pointer; }
          .image {
            position:absolute; left:12%; right:12%; top:9%; bottom:9%; overflow:visible;
            filter:drop-shadow(0 25px 32px #29405245);
          }
          .image span {
            position:absolute; width:calc(100% / ${columns} + .5px); height:calc(100% / ${rows} + .5px);
            left:calc(var(--c) * 100% / ${columns}); top:calc(var(--r) * 100% / ${rows});
            background-size:${columns * 100}% ${rows * 100}%;
            background-position:calc(var(--c) * 100% / ${columns - 1 || 1}) calc(var(--r) * 100% / ${rows - 1 || 1});
            transition:transform ${duration}ms cubic-bezier(.2,.75,.2,1),opacity ${duration * 0.65}ms ease;
            transition-delay:var(--delay); will-change:transform,opacity;
          }
          .shattered .image span { transform:translate3d(var(--x),var(--y),0) rotate(var(--rotate)) scale(.72); opacity:0; }
          .hint {
            position:absolute; right:18px; bottom:18px; padding:8px 12px; border-radius:999px;
            color:#152432; background:#ffffffb5; backdrop-filter:blur(8px);
            font:700 12px/1 system-ui,sans-serif; pointer-events:none;
          }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #7dff8a; border-radius:999px; color:#7dff8a; background:#07140acc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            .image { left:7%; right:7%; top:15%; bottom:15%; }
          }
          @media (prefers-reduced-motion:reduce) { .image span { transition-duration:.01ms; } }
        </style>
        <div class="frame" part="frame"><div class="image">${pieces}</div><span class="hint">Tap to shatter</span></div>
        <span class="type-label">Interactive</span>`;
      this.frame = this.shadowRoot.querySelector(".frame");
      const src = this.getAttribute("src") || "https://picsum.photos/seed/shatter-image/1200/800";
      this.shadowRoot.querySelectorAll(".image span").forEach((piece) => {
        piece.style.backgroundImage = `url(${JSON.stringify(src)})`;
      });
      const trigger = this.getAttribute("trigger") || "click";
      if (trigger === "hover") {
        this.frame.addEventListener("pointerenter", () => this.setShattered(true));
        this.frame.addEventListener("pointerleave", () => this.setShattered(false));
      } else {
        this.frame.addEventListener("click", () => this.shatterAndReturn());
        if (trigger === "auto") this.shatterAndReturn();
      }
    }

    setShattered(value) {
      this.frame?.classList.toggle("shattered", value);
    }

    shatterAndReturn() {
      this.setShattered(true);
      clearTimeout(this.reassembleTimer);
      this.reassembleTimer = setTimeout(() => this.setShattered(false), Math.max(600, Number(this.getAttribute("duration")) || 850) + 650);
    }
  }

  if (!customElements.get("image-shatter-reassemble")) {
    customElements.define("image-shatter-reassemble", ImageShatterReassemble);
  }
})();
