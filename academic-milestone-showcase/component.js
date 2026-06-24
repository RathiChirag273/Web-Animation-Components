(() => {
  const escapeAttribute = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const escapeText = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const connectionAsset = new URL(
    "Screenshot 2026-06-12 011031.svg",
    document.currentScript?.src || document.baseURI
  ).href;

  class AcademicMilestoneShowcase extends HTMLElement {
    static observedAttributes = [
      "bachelors-image",
      "bachelors-title",
      "bachelors-year",
      "masters-image",
      "masters-title",
      "masters-year"
    ];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.active = null;
      this.connectionRaf = 0;
      this.trackConnection = this.trackConnection.bind(this);
    }

    connectedCallback() {
      this.render();
      this.connectionRaf = requestAnimationFrame(this.trackConnection);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.connectionRaf);
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      const bachelorsImage = escapeAttribute(
        this.getAttribute("bachelors-image") || "https://picsum.photos/seed/bachelors-degree/750/1000"
      );
      const mastersImage = escapeAttribute(
        this.getAttribute("masters-image") || "https://picsum.photos/seed/masters-degree/1200/750"
      );
      const bachelorsTitleRaw = this.getAttribute("bachelors-title") || "Bachelor's Degree";
      const bachelorsTitle = escapeText(bachelorsTitleRaw);
      const bachelorsYear = escapeText(this.getAttribute("bachelors-year") || "First Milestone");
      const mastersTitleRaw = this.getAttribute("masters-title") || "Master's Degree";
      const mastersTitle = escapeText(mastersTitleRaw);
      const mastersYear = escapeText(this.getAttribute("masters-year") || "Advanced Milestone");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position:relative; display:block; width:100%; max-width:1200px;
            height:clamp(360px,58.333vw,700px); overflow:hidden;
            border-radius:24px; background:#07120d; border:1px solid #7dff8a;
            box-sizing:border-box; contain:layout paint style; color:white;
          }
          * { box-sizing:border-box; }
          .frame {
            position:relative; width:100%; height:100%; overflow:hidden;
            background:
              radial-gradient(circle at 77% 24%,#7dff8a18,transparent 28%),
              radial-gradient(circle at 18% 78%,#62cfff13,transparent 30%),
              linear-gradient(145deg,#07120d,#0d1915 60%,#08110d);
          }
          .frame::before {
            content:""; position:absolute; inset:0; opacity:.22; pointer-events:none;
            background-image:radial-gradient(#caffd51e 1px,transparent 1px);
            background-size:25px 25px;
          }
          .heading {
            position:absolute; z-index:3; left:5%; top:7%; max-width:28%;
            color:#eaffed; font:800 clamp(19px,3vw,38px)/.95 system-ui,sans-serif;
            letter-spacing:-.05em; pointer-events:none;
          }
          .heading small {
            display:block; margin-bottom:9px; color:#7dff8a;
            font:700 9px/1 system-ui,sans-serif; letter-spacing:.18em; text-transform:uppercase;
          }
          .connection {
            position:absolute; z-index:2; left:0; top:0; width:1px; aspect-ratio:1884/690;
            transform-origin:0 0; will-change:left,top,width,transform;
            pointer-events:none; background:#a8ffb3; opacity:.76;
            -webkit-mask:url("${escapeAttribute(connectionAsset)}") center/contain no-repeat;
            mask:url("${escapeAttribute(connectionAsset)}") center/contain no-repeat;
            filter:drop-shadow(0 0 4px #7dff8a4d);
          }
          .degree {
            position:absolute; z-index:5; display:block; padding:0; border:0;
            background:#101814; border-radius:16px; cursor:zoom-in; color:white;
            box-shadow:0 24px 65px #000b,0 0 0 1px #dfffe524;
            transition:left .55s cubic-bezier(.2,.8,.2,1),top .55s cubic-bezier(.2,.8,.2,1),
              transform .55s cubic-bezier(.2,.8,.2,1),opacity .4s ease,filter .4s ease,
              box-shadow .4s ease;
            transform-origin:center; will-change:transform,left,top; isolation:isolate;
          }
          .degree::after {
            content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
            box-shadow:inset 0 0 0 1px #ffffff28;
          }
          .degree img {
            width:100%; height:100%; display:block; object-fit:contain; border-radius:inherit;
            background:#f2efe6; pointer-events:none; user-select:none;
          }
          .bachelors {
            left:12%; top:34%; width:25%; aspect-ratio:3/4;
            transform:rotate(-4deg); animation:float-bachelors 5.8s ease-in-out infinite;
          }
          .masters {
            left:42%; top:17%; width:51%; aspect-ratio:16/10;
            transform:rotate(2deg); animation:float-masters 6.6s ease-in-out infinite;
          }
          .caption {
            position:absolute; z-index:2; left:10px; right:10px; bottom:10px;
            display:flex; justify-content:space-between; align-items:flex-end; gap:8px;
            padding:9px 11px; border-radius:10px; color:#f5fff6; text-align:left;
            background:#06100bd6; backdrop-filter:blur(10px); pointer-events:none;
          }
          .caption strong { display:block; font:750 clamp(10px,1.4vw,14px)/1.1 system-ui,sans-serif; }
          .caption span { color:#a7c5ae; font:650 8px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase; }
          .frame.has-active .degree:not(.active) { opacity:.24; filter:blur(2px) saturate(.35); animation-play-state:paused; }
          .degree.active {
            z-index:30; left:50%; top:50%; animation:none; cursor:zoom-out;
            box-shadow:0 34px 90px #000d,0 0 0 1px #7dff8a,0 0 40px #7dff8a38;
          }
          .bachelors.active { transform:translate(-50%,-50%) scale(1.42); }
          .masters.active { transform:translate(-50%,-50%) scale(1.08); }
          .degree:focus-visible { outline:2px solid #7dff8a; outline-offset:5px; }
          .type-label {
            position:absolute; z-index:1000; left:12px; bottom:12px; padding:6px 10px;
            border:1px solid #7dff8a; border-radius:999px; color:#7dff8a; background:#07140acc;
            font:700 10px/1 system-ui,sans-serif; letter-spacing:.1em; text-transform:uppercase;
            pointer-events:none; backdrop-filter:blur(8px);
          }
          @keyframes float-bachelors {
            0%,100% { transform:translateY(0) rotate(-4deg); }
            50% { transform:translateY(-9px) rotate(-2.5deg); }
          }
          @keyframes float-masters {
            0%,100% { transform:translateY(0) rotate(2deg); }
            50% { transform:translateY(8px) rotate(.7deg); }
          }
          @media (hover:hover) {
            .degree:hover { animation:none; }
            .frame:has(.degree:hover) .degree:not(:hover) { opacity:.4; filter:saturate(.55); }
            .bachelors:not(.active):hover { z-index:30; transform:rotate(-1deg) scale(1.18); }
            .masters:not(.active):hover { z-index:30; transform:rotate(0) scale(1.08); }
          }
          @media (max-width:640px) {
            :host { height:420px; border-radius:18px; }
            .heading { left:6%; top:6%; max-width:42%; font-size:20px; }
            .bachelors { left:7%; top:38%; width:32%; }
            .masters { left:35%; top:19%; width:61%; }
            .caption { left:6px; right:6px; bottom:6px; padding:7px; }
            .caption span { display:none; }
            .bachelors.active { transform:translate(-50%,-50%) scale(1.52); }
            .masters.active { transform:translate(-50%,-50%) scale(1.18); }
          }
          @media (prefers-reduced-motion:reduce) {
            .degree { animation:none; transition-duration:.01ms; }
          }
        </style>
        <div class="frame" part="frame">
          <div class="heading"><small>Academic progression</small>Built one milestone at a time.</div>
          <div class="connection" aria-hidden="true"></div>
          <button class="degree bachelors" data-degree="bachelors" aria-label="Enlarge ${escapeAttribute(bachelorsTitleRaw)}">
            <img src="${bachelorsImage}" alt="${escapeAttribute(bachelorsTitleRaw)}">
            <span class="caption"><strong>${bachelorsTitle}</strong><span>${bachelorsYear}</span></span>
          </button>
          <button class="degree masters" data-degree="masters" aria-label="Enlarge ${escapeAttribute(mastersTitleRaw)}">
            <img src="${mastersImage}" alt="${escapeAttribute(mastersTitleRaw)}">
            <span class="caption"><strong>${mastersTitle}</strong><span>${mastersYear}</span></span>
          </button>
        </div>
        <span class="type-label">Interactive</span>`;

      this.frame = this.shadowRoot.querySelector(".frame");
      this.connection = this.shadowRoot.querySelector(".connection");
      this.cards = [...this.shadowRoot.querySelectorAll(".degree")];
      this.cards.forEach((card) => {
        card.addEventListener("click", (event) => {
          event.stopPropagation();
          this.setActive(this.active === card.dataset.degree ? null : card.dataset.degree);
        });
      });
      this.frame.addEventListener("click", () => this.setActive(null));
      this.updateConnection();
    }

    trackConnection() {
      this.updateConnection();
      this.connectionRaf = requestAnimationFrame(this.trackConnection);
    }

    updateConnection() {
      if (!this.frame || !this.connection || this.cards?.length !== 2) return;
      const frameRect = this.frame.getBoundingClientRect();
      const bachelorsRect = this.cards[0].getBoundingClientRect();
      const mastersRect = this.cards[1].getBoundingClientRect();
      if (!frameRect.width || !bachelorsRect.width || !mastersRect.width) return;

      const start = {
        x: bachelorsRect.left + bachelorsRect.width / 2 - frameRect.left,
        y: bachelorsRect.top + bachelorsRect.height / 2 - frameRect.top
      };
      const end = {
        x: mastersRect.left + mastersRect.width / 2 - frameRect.left,
        y: mastersRect.top + mastersRect.height / 2 - frameRect.top
      };

      // Visible line endpoints inside the source SVG, expressed as width-relative coordinates.
      const sourceStart = { x: 27 / 1884, y: 512 / 1884 };
      const sourceEnd = { x: 1828 / 1884, y: 367 / 1884 };
      const sourceDx = sourceEnd.x - sourceStart.x;
      const sourceDy = sourceEnd.y - sourceStart.y;
      const sourceLength = Math.hypot(sourceDx, sourceDy);
      const targetDx = end.x - start.x;
      const targetDy = end.y - start.y;
      const width = Math.hypot(targetDx, targetDy) / sourceLength;
      const rotation = Math.atan2(targetDy, targetDx) - Math.atan2(sourceDy, sourceDx);
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const rotatedStartX = (sourceStart.x * cos - sourceStart.y * sin) * width;
      const rotatedStartY = (sourceStart.x * sin + sourceStart.y * cos) * width;

      this.connection.style.left = `${start.x - rotatedStartX}px`;
      this.connection.style.top = `${start.y - rotatedStartY}px`;
      this.connection.style.width = `${width}px`;
      this.connection.style.transform = `rotate(${rotation}rad)`;
    }

    setActive(degree) {
      this.active = degree;
      this.frame?.classList.toggle("has-active", Boolean(degree));
      this.cards?.forEach((card) => card.classList.toggle("active", card.dataset.degree === degree));
    }
  }

  if (!customElements.get("academic-milestone-showcase")) {
    customElements.define("academic-milestone-showcase", AcademicMilestoneShowcase);
  }
})();
