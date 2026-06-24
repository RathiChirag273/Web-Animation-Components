(() => {
  class PixelatedImageReveal extends HTMLElement {
    static observedAttributes = ["src", "trigger", "duration", "pixel-size"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.canvas = null;
      this.context = null;
      this.image = new Image();
      this.image.decoding = "async";
      this.progress = 0;
      this.raf = 0;
      this.resizeObserver = new ResizeObserver(() => this.draw());
      this.intersectionObserver = null;
    }

    connectedCallback() {
      this.render();
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      this.resizeObserver.disconnect();
      this.intersectionObserver?.disconnect();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      cancelAnimationFrame(this.raf);
      this.resizeObserver.disconnect();
      this.intersectionObserver?.disconnect();
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position:relative; display:block; width:100%; max-width:1200px;
            height:clamp(360px,58.333vw,700px); overflow:hidden;
            border-radius:24px; background:#0b0c0e; border:1px solid #7dff8a;
            box-sizing:border-box; contain:layout paint style;
          }
          * { box-sizing:border-box; }
          .frame { position:relative; width:100%; height:100%; overflow:hidden; cursor:pointer; }
          canvas { width:100%; height:100%; display:block; }
          .hint {
            position:absolute; right:18px; bottom:18px; padding:8px 12px;
            border:1px solid #ffffff30; border-radius:999px; color:white;
            background:#0007; backdrop-filter:blur(8px); font:600 12px/1 system-ui,sans-serif;
            pointer-events:none; transition:opacity .25s;
          }
          .frame.revealed .hint { opacity:0; }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #7dff8a; border-radius:999px; color:#7dff8a; background:#07140acc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @media (max-width:640px) { :host { height:420px; border-radius:18px; } }
        </style>
        <div class="frame" part="frame">
          <canvas aria-label="Pixelated image reveal"></canvas>
          <span class="hint">Reveal image</span>
        </div>
        <span class="type-label">Interactive</span>`;

      this.frame = this.shadowRoot.querySelector(".frame");
      this.canvas = this.shadowRoot.querySelector("canvas");
      this.context = this.canvas.getContext("2d");
      this.resizeObserver.observe(this);
      this.progress = 0;
      this.image.onload = () => {
        this.draw();
        this.bindTrigger();
      };
      this.image.src = this.getAttribute("src") || "https://picsum.photos/seed/pixel-reveal/1200/800";
    }

    bindTrigger() {
      const trigger = this.getAttribute("trigger") || "hover";
      if (trigger === "auto") {
        this.animateTo(1);
      } else if (trigger === "visible") {
        this.intersectionObserver = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) this.animateTo(1);
        }, { threshold: 0.45 });
        this.intersectionObserver.observe(this);
      } else if (trigger === "click") {
        this.frame.addEventListener("click", () => this.animateTo(this.progress > 0.5 ? 0 : 1));
      } else {
        this.frame.addEventListener("pointerenter", () => this.animateTo(1));
        this.frame.addEventListener("pointerleave", () => this.animateTo(0));
        this.frame.addEventListener("click", () => this.animateTo(this.progress > 0.5 ? 0 : 1));
      }
    }

    animateTo(target) {
      cancelAnimationFrame(this.raf);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.progress = target;
        this.draw();
        return;
      }
      const start = this.progress;
      const duration = Math.max(100, Number(this.getAttribute("duration")) || 900);
      const startTime = performance.now();
      const step = (time) => {
        const elapsed = Math.min(1, (time - startTime) / duration);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        this.progress = start + (target - start) * eased;
        this.draw();
        if (elapsed < 1) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }

    draw() {
      if (!this.context || !this.image.complete || !this.image.naturalWidth) return;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(this.clientWidth * ratio));
      const height = Math.max(1, Math.round(this.clientHeight * ratio));
      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
      }
      const maxPixel = Math.max(2, Number(this.getAttribute("pixel-size")) || 48);
      const block = Math.max(1, Math.round(maxPixel * (1 - this.progress) * ratio));
      const smallWidth = Math.max(1, Math.ceil(width / block));
      const smallHeight = Math.max(1, Math.ceil(height / block));
      const temp = document.createElement("canvas");
      temp.width = smallWidth;
      temp.height = smallHeight;
      const tempContext = temp.getContext("2d");
      const imageRatio = this.image.naturalWidth / this.image.naturalHeight;
      const frameRatio = width / height;
      let sourceWidth = this.image.naturalWidth;
      let sourceHeight = this.image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;
      if (imageRatio > frameRatio) {
        sourceWidth = this.image.naturalHeight * frameRatio;
        sourceX = (this.image.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = this.image.naturalWidth / frameRatio;
        sourceY = (this.image.naturalHeight - sourceHeight) / 2;
      }
      tempContext.drawImage(this.image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, smallWidth, smallHeight);
      this.context.imageSmoothingEnabled = false;
      this.context.clearRect(0, 0, width, height);
      this.context.drawImage(temp, 0, 0, width, height);
      this.frame.classList.toggle("revealed", this.progress > 0.75);
    }
  }

  if (!customElements.get("pixelated-image-reveal")) {
    customElements.define("pixelated-image-reveal", PixelatedImageReveal);
  }
})();
