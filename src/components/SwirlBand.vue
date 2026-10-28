<script setup>
// Фирменные мятные разводы на чёрном (как на обложке «Будини»):
// полосы, искажённые SVG-турбулентностью. Анимация медленно сдвигает полосы.
import { useId } from 'vue'

const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
</script>

<template>
  <div class="swirl" aria-hidden="true">
    <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern :id="`p-${id}`" width="64" height="400" patternUnits="userSpaceOnUse">
          <rect width="64" height="400" fill="#020406" />
          <rect x="4" width="24" height="400" fill="#3ABBB0" />
          <rect x="9" width="7" height="400" fill="#9BE6D8" opacity="0.5" />
        </pattern>
        <filter :id="`f-${id}`" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0028 0.006" numOctaves="2" seed="11" />
          <feDisplacementMap in="SourceGraphic" scale="150" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <g :filter="`url(#f-${id})`">
        <rect class="swirl__stripes" x="-500" y="-300" width="2200" height="1000" :fill="`url(#p-${id})`" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.swirl {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.swirl svg {
  width: 100%;
  height: 100%;
}

.swirl__stripes {
  transform-box: view-box;
  transform-origin: 600px 200px;
  transform: rotate(-18deg);
  animation: drift 26s linear infinite;
}

@keyframes drift {
  from {
    transform: rotate(-18deg) translateX(0);
  }
  to {
    transform: rotate(-18deg) translateX(128px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .swirl__stripes {
    animation: none;
  }
}
</style>
