import {
  LitElement,
  html,
  customElement,
  property,
  css,
  unsafeCSS,
} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {classMap} from 'lit-html/directives/class-map';
import {ListingData, Post, PreviewImage} from './types';
import './subreddit-view';

const GRID_GRANULARITY = 4;

const TOPICS: Record<string, string> = {
  gaming:
    'gaming+halo+PS4+rpg+iosgaming+gamingsuggestions+computers+' +
    'ShouldIbuythisgame+MechanicalKeyboards+Monitors+hardwareswap+OpTicGaming+' +
    'DotA2+pcmasterrace+GirlGamers+gamecollecting+IndieGaming+Fallout+Games+' +
    'nintendo+SuggestALaptop+Steam+Competitiveoverwatch+wow+funny',
  music:
    '"Music+Vaporwave+Guitar+MusicEd+WeAreTheMusicMakers+indieheads+Metal+' +
    'LetsTalkMusic+DeepIntoYouTube+musictheory+Metalcore+CasualConversation+' +
    'ListeningHeads+AskReddit+woahdude+composer+poppunkers+anime+' +
    'ThisIsOurMusic+unpopularopinion+AdviceAnimals+BABYMETAL+gaming+EDM+technology"',
  sports:
    'sports+soccer+todayilearned+starcraft+baseball+esports+reddevils+AskReddit+' +
    'nfl+CFB+nba+hockey+leagueoflegends+ABraThatFits+funny+formula1+MMA+' +
    'Patriots+gaming+cordcutters+dogecoin+granturismo+Showerthoughts+unpopularopinion+MLS',
  beauty:
    'beauty+AsianBeauty+OldSchoolCool+funny+MUAontheCheap+makeupexchange+' +
    'KoreanBeauty+pics+Porsche+RandomActsofMakeup+MakeupAddiction+disney+' +
    'BeautyAddiction+BeautyBoxes+AskWomen+succulents+BeautyGuruChatter+' +
    'beautytalkph+houseplants+aww+ShinyPokemon+cats+gardening+FreeKarma4U+gaming',
};

@customElement('explore-page')
export class ExplorePage extends LitElement {
  @property({attribute: true, type: String})
  topic: string | undefined;

  @property({attribute: true, type: String})
  subreddit: string | undefined;

  @property({attribute: true, type: Object})
  data: ListingData | undefined;

  @property({attribute: true, type: Boolean})
  showtitle: boolean;

  @property({attribute: true, type: Boolean})
  showsubreddit: boolean;

  @property({attribute: true, type: Boolean})
  showshim: boolean;

  largeThreshold = 5000;

  constructor() {
    super();
    this.showtitle = true;
    this.showsubreddit = true;
    this.showshim = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.makeQuery();
  }

  static get styles() {
    return css`
      :host {
        --tile-size: 156px;
        --gradient-1: linear-gradient(
          97.51deg,
          #ff4400 -7.08%,
          #ffb330 116.57%
        );
        --gradient-2: linear-gradient(89.94deg, #c274f0 0%, #f14fb0 100%);
        --gradient-3: linear-gradient(
          89.94deg,
          #51b9ff 0%,
          #7785ff 52.6%,
          #b279ff 73.96%,
          #ff81ed 100%
        );
        --gradient-4: linear-gradient(
          97.51deg,
          #048de9 -7.08%,
          #0fc0d2 116.57%
        );
        --gradient-5: linear-gradient(
          71.53deg,
          #c30d47 20.89%,
          #fe4301 121.62%
        );
        --gradient-6: linear-gradient(
          91.64deg,
          #f5441f -10.49%,
          #fc7519 109.75%
        );
        --gradient-7: linear-gradient(
          91.64deg,
          #5b3dc1 -10.49%,
          #aa48c0 109.75%
        );
        --gradient-8: linear-gradient(
          91.64deg,
          #3353b8 -10.49%,
          #685cfc 109.75%
        );
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
        text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
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
        range(GRID_GRANULARITY * 4)
          .map(
            (num) => `
          .span${num} {
            grid-row-end: span ${num};
          }
        `
          )
          .join('\n')
      )}
    `;
  }

  onTileClick(subreddit: string) {
    this.subreddit = subreddit;
    this.setAttribute('topic', '');
  }

  attributeChangedCallback(name: string, old: unknown, current: unknown) {
    console.log(arguments);
    if (name === 'topic' && old !== current) {
      this.topic = current as string;
      if (this.topic) {
        this.subreddit = undefined;
        this.makeQuery();
      }
      return;
    }
    if (name.includes('show')) {
      // @ts-ignore
      this[name] = (current as string) === 'true';
      this.showshim = this.showsubreddit || this.showtitle;
    }
  }

  private async makeQuery() {
    if (!this.topic) return;
    this.data = undefined;
    console.log(this.topic);
    const resp = await fetch(
      `https://www.reddit.com/r/${TOPICS[this.topic]}.json`,
      {
        mode: 'cors',
      }
    );
    const body = await resp.json();
    this.data = body.data;
    console.log(this.data?.children.map((c) => c.data));
  }

  render() {
    if (this.subreddit) {
      return html`<subreddit-view
        subreddit=${this.subreddit}
      ></subreddit-view>`;
    }
    return html`
      <div class="grid">
        ${this._renderTiles()}
      </div>
    `;
  }

  _renderTiles() {
    return this.data?.children.map(({data: post}) => {
      const imgUrl = getImageUrl(post);
      const isMedia = !!imgUrl;

      if (isMedia) return this._renderMediaTile(post);
      return this._renderTextTile(post);
    });
  }
  _renderMediaTile(post: Post) {
    //const isLarge = post.title.length > 90;
    const isLarge = post.ups > this.largeThreshold;
    const imgUrl = getImageUrl(post);
    const imgStyles = {
      backgroundImage: `url('${imgUrl}')`,
    };

    const ratio = getAspectRatio(post);
    const rowSpan = Math.round(ratio * GRID_GRANULARITY) * (isLarge ? 2 : 1);
    const spanClass = `span${clamp(
      rowSpan,
      Math.round(GRID_GRANULARITY / 3),
      GRID_GRANULARITY * 2 * (isLarge ? 2 : 1)
    )}`;

    return html`<div
      @click=${() => this.onTileClick(post.subreddit)}
      class=${classMap({
        'post-tile': true,
        [spanClass]: true,
        'post-tile-large': isLarge,
      })}
    >
      ${imgUrl
        ? unsafeHTML(
            `<div class="post-tile-image" style="background-image: ${imgStyles.backgroundImage}" />`
          )
        : ''}
      ${this._renderText(post, true)}
    </div>`;
  }

  _renderTextTile(post: Post) {
    const isLarge = post.ups > this.largeThreshold;
    return html`<div
      @click=${() => this.onTileClick(post.subreddit)}
      class=${classMap({
        'post-tile': true,
        span6: true,
        'post-tile-large': isLarge,
        'post-text-only': true,
      })}
    >
      ${this._renderText(post, false)}
    </div>`;
  }

  _renderText(post: Post, isImage = false) {
    const text = htmlDecode(post.selftext_html ?? '') ?? '';
    return html`<div
      class=${classMap({
        'post-tile-text': true,
        shim: isImage && this.showshim,
      })}
    >
      <h3
        class=${classMap({
          'post-tile-title': true,
          hidden: isImage && !this.showtitle,
        })}
      >
        ${post.title}
      </h3>
      ${text?.length
        ? html`<div
            class=${classMap({
              'post-tile-body': true,
              hidden: isImage && !this.showtitle,
            })}
          >
            ${unsafeHTML(text.slice(0, 200))}
          </div>`
        : ''}
      <div class="spacer"></div>
      <div
        class=${classMap({
          subreddit: true,
          hidden: isImage && !this.showsubreddit,
        })}
      >
        r/${post.subreddit}
      </div>
    </div>`;
  }
}

function getAspectRatio(post: Post) {
  const image = getPreview(post);
  if (!image) return 1;
  return image.height / image.width;
}

export function getImageUrl(post: Post) {
  const isImage = post.post_hint === 'image';
  if (isImage) return post.url;
  return getPreview(post)?.url ?? '';
}

function getPreview(post: Post): PreviewImage | undefined {
  const isImage = post.post_hint === 'image';
  if (isImage) return post.preview?.images[0].source;

  const previews = post.preview?.images[0].resolutions;
  if (!previews) return;

  return post.preview?.images[0].source;
  /* const resolution = isLarge
    ? previews[2] ?? previews[1] ?? previews[0]
    : previews[1] ?? previews[0];
  return resolution; */
}

function htmlDecode(input: string) {
  var doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function range(num: number): number[] {
  const arr = Array(num);
  for (var i = 0; i < num; i++) arr[i] = i;
  return arr;
}
