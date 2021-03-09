import {css, unsafeCSS} from 'lit-element';
import {GRID_GRANULARITY} from './types';

export default () => css`
  :host {
    --tile-size: 156px;
    --gradient-1: linear-gradient(97.51deg, #ff4400 -7.08%, #ffb330 116.57%);
    --gradient-2: linear-gradient(89.94deg, #c274f0 0%, #f14fb0 100%);
    --gradient-3: linear-gradient(
      89.94deg,
      #51b9ff 0%,
      #7785ff 52.6%,
      #b279ff 73.96%,
      #ff81ed 100%
    );
    --gradient-4: linear-gradient(97.51deg, #048de9 -7.08%, #0fc0d2 116.57%);
    --gradient-5: linear-gradient(71.53deg, #c30d47 20.89%, #fe4301 121.62%);
    --gradient-6: linear-gradient(91.64deg, #f5441f -10.49%, #fc7519 109.75%);
    --gradient-7: linear-gradient(91.64deg, #5b3dc1 -10.49%, #aa48c0 109.75%);
    --gradient-8: linear-gradient(91.64deg, #3353b8 -10.49%, #685cfc 109.75%);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: calc((var(--tile-size) + 16px) / ${GRID_GRANULARITY});
    background-color: #fff;
    padding: 8px;
    /* grid-gap: 16px; */
    grid-auto-flow: dense;
  }

  .post-tile {
    display: block;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    border-radius: 16px;
    margin: 8px;
    color: white;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);

    grid-row-end: span 4;
  }

  .post-tile-text {
    display: flex;
    flex-direction: column;
    padding: 16px;
    font-size: 12px;
    line-height: 17px;
    text-overflow: ellipsis;
    margin: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .shim {
    background-color: rgba(0, 0, 0, 0.25);
  }

  .post-text-only .post-tile-text {
    box-shadow: unset;
    background-color: transparent;
  }

  .loader {
    grid-column-end: span 2;
  }

  .post-tile-image {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: top center;
    /* height: var(--tile-size); */
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .post-text-only {
    background-image: var(--gradient-1);
  }

  .post-tile:nth-child(8n).post-text-only {
    background-image: var(--gradient-2);
  }
  .post-tile:nth-child(8n + 1).post-text-only {
    background-image: var(--gradient-3);
  }
  .post-tile:nth-child(8n + 2).post-text-only {
    background-image: var(--gradient-4);
  }
  .post-tile:nth-child(8n + 3).post-text-only {
    background-image: var(--gradient-5);
  }
  .post-tile:nth-child(8n + 4).post-text-only {
    background-image: var(--gradient-6);
  }
  .post-tile:nth-child(8n + 5).post-text-only {
    background-image: var(--gradient-7);
  }
  .post-tile:nth-child(8n + 6).post-text-only {
    background-image: var(--gradient-8);
  }

  .hidden {
    display: none;
  }

  .subreddit {
    font-weight: normal;
    line-height: 1.2em;
    margin-top: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: none;
  }

  .post-text-only .post-tile-text .post-tile-title {
    text-shadow: none;
  }

  .spacer {
    flex: auto;
  }

  .gallery-icon {
    position: absolute;
    top: 10px;
    right: 6px;
    width: 28px;
    height: 28px;
  }
  .video-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 18px;
  }

  .post-tile-title {
    margin: 0;
    font-weight: 600;
    flex: none;
    vertical-align: bottom;
  }

  .post-tile-body {
    margin-top: 8px;
    font-weight: normal;
  }

  .post-tile-large {
    grid-column-end: span 2;
    /* grid-row-end: span 16; */
  }
  ${unsafeCSS(
    range(GRID_GRANULARITY * 4 + 1)
      .map(
        (num) => `
    .span${num} {
      grid-row-end: span ${num};
    }
  `
      )
      .join('\n')
  )}

  .md a {
    color: inherit;
  }
`;

function range(num: number): number[] {
  const arr = Array(num);
  for (var i = 0; i < num; i++) arr[i] = i;
  return arr;
}
