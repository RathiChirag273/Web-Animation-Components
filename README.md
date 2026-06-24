# Portable Animation Components

Ten dependency-free Web Components for image galleries and smart-art layouts. Every component:

- Is a single standalone JavaScript file.
- Uses Shadow DOM so its layout and styles remain inside its own container.
- Fills its parent width up to `1200px`.
- Uses the same responsive height: `clamp(360px, 58.333vw, 700px)`.
- Switches to a phone-friendly `420px` height below `640px`.
- Supports `prefers-reduced-motion`.
- Includes default content, so it works immediately after being placed on a page.
- Shows a cyan `Non-Interactive` label or neon-green `Interactive` label.

## Basic Usage

Load the component script, then place its custom element wherever the animation should appear:

```html
<script src="/animations/infinity-waterfall/component.js" defer></script>

<infinity-waterfall
  columns="4"
  speed="24"
  images='["/images/one.jpg","/images/two.jpg","/images/three.jpg"]'>
</infinity-waterfall>
```

The custom element is the container. All generated markup, styles, controls, and animation behavior stay inside it.

## Components

| Component | Custom element | Main inputs |
| --- | --- | --- |
| Infinity Waterfall | `<infinity-waterfall>` | `images`, `columns`, `speed`, `gap`, `direction` |
| Horizontal Infinite Marquee | `<horizontal-infinite-marquee>` | `images`, `speed`, `gap`, `direction` |
| Wave Conveyor | `<wave-conveyor>` | `images`, `speed`, `wave-height`, `direction` |
| Pixelated Image Reveal | `<pixelated-image-reveal>` | `src`, `trigger`, `duration`, `pixel-size` |
| Magnetic Image Grid | `<magnetic-image-grid>` | `images`, `columns`, `strength`, `gap` |
| Cover-Flow Gallery | `<cover-flow-gallery>` | `images`, `active`, `autoplay`, `interval` |
| Stack-and-Release Scroll | `<stack-and-release-scroll>` | `images`, `spread`, `rotation` |
| Depth Carousel | `<depth-carousel>` | `images`, `speed`, `depth`, `direction` |
| Image Shatter and Reassemble | `<image-shatter-reassemble>` | `src`, `pieces`, `trigger`, `duration`, `distance` |
| Academic Milestone Showcase | `<academic-milestone-showcase>` | `bachelors-image`, `bachelors-title`, `bachelors-year`, `masters-image`, `masters-title`, `masters-year` |

`images` values are JSON-formatted HTML attributes. Numeric inputs are plain numbers without units.

Infinity Waterfall, Horizontal Infinite Marquee, Wave Conveyor, and Depth Carousel are non-interactive and continue moving during hover and touch. The remaining six components are interactive.

## Trigger Values

- Pixel reveal: `hover`, `click`, `visible`, or `auto`.
- Image shatter: `click`, `hover`, or `auto`.
- Waterfall direction: `up` or `down`.
- Marquee and wave direction: `left` or `right`.
- Depth carousel direction: default or `reverse`.

## Academic Milestone Data

```html
<academic-milestone-showcase
  bachelors-image="/degrees/bachelors.jpg"
  bachelors-title="Bachelor's Degree"
  bachelors-year="2022"
  masters-image="/degrees/masters.jpg"
  masters-title="Master's Degree"
  masters-year="2025">
</academic-milestone-showcase>
```

The bachelor's image is displayed in portrait orientation and the master's image in landscape orientation. Hover or focus enlarges a degree on laptops. Tap a degree to enlarge it on phones, then tap it again or tap the background to close it.

## Styling The Container

The host page can size or decorate the outer custom element:

```css
infinity-waterfall {
  max-width: 900px;
  margin-inline: auto;
  border-radius: 32px;
}
```

Each component also exposes its main internal wrapper as `part="frame"` for controlled advanced styling.
