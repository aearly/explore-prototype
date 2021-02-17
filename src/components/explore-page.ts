import {LitElement, html, customElement, property, css} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {classMap} from 'lit-html/directives/class-map';
import {ListingData, Post} from './types';
import './subreddit-view';

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

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.makeQuery();
  }

  static get styles() {
    return css`
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-auto-rows: 125px;
        background-color: #fff;
        grid-gap: 2px;
        grid-auto-flow: dense;
      }

      .post-tile {
        overflow: hidden;
        position: relative;
        cursor: pointer;
      }

      .post-tile-text {
        padding: 4px;
        font-weight: bold;
        font-size: 10px;
        /*text-shadow: 0px 0px 5px rgba(0, 0, 0, 1) ;*/
        text-overflow: ellipsis;
        margin: 0;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        box-shadow: 0px 0px 20px 25px rgba(0, 0, 0, 0.3);
        background-color: rgba(0, 0, 0, 0.3);

        display: none;
      }
      .post-text-only .post-tile-text {
        box-shadow: unset;
        background-color: transparent;
      }

      .post-tile-image {
        background-repeat: no-repeat;
        background-size: cover;
        background-position: top center;
        height: 125px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .post-text-only .post-tile-gradient {
        background-image: linear-gradient(
          97.51deg,
          #ff4400 -7.08%,
          #ffb330 116.57%
        );
      }

      .post-tile:nth-child(3n).post-text-only .post-tile-gradient {
        background-image: linear-gradient(89.94deg, #c274f0 0%, #f14fb0 100%);
      }
      .post-tile:nth-child(3n + 2).post-text-only .post-tile-gradient {
        background: linear-gradient(
          89.94deg,
          #51b9ff 0%,
          #7785ff 52.6%,
          #b279ff 73.96%,
          #ff81ed 100%
        );
      }
      .post-text-only .post-tile-text {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        font-size: 12px;
        display: block;
      }

      .post-text-only .post-tile-text .post-tile-title {
        background: white;
        color: black;
        mix-blend-mode: screen;
      }

      .post-tile-title {
        margin: 0;
      }

      .post-tile-body {
        color: black;
        margin-top: 8px;
        font-weight: normal;
      }

      .post-tile-large {
        grid-column-end: span 2;
        grid-row-end: span 2;
      }
      .post-tile-large .post-tile-image {
        height: 252px;
      }
      .post-tile-large .post-tile-text {
        padding: 16px;
        font-size: 16px;
      }
    `;
  }

  onTileClick(subreddit: string) {
    this.subreddit = subreddit;
    this.topic = undefined;
  }

  attributeChangedCallback(name: string, old: unknown, current: unknown) {
    console.log(arguments);
    if (name === 'topic' && old !== current) {
      this.topic = current as string;
      this.subreddit = undefined;
      this.makeQuery();
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
      //const hasImage = !!post.thumbnail;
      const isImage = post.post_hint === 'image';
      const isLarge = post.title.length > 90;
      const text = post.selftext;
      const imgUrl = getImageUrl(post, isImage, isLarge);
      const imgStyles = {
        backgroundImage: `url('${imgUrl}')`,
      };
      return html`<div
        @click=${() => this.onTileClick(post.subreddit)}
        class=${classMap({
          'post-tile': true,
          'post-tile-large': isLarge,
          'post-text-only': !imgUrl,
        })}
      >
        ${imgUrl
          ? unsafeHTML(
              `<div class="post-tile-image" style="background-image: ${imgStyles.backgroundImage}" />`
            )
          : ''}
        <div class="post-tile-text">
          <div class="post-tile-gradient">
            <h3 class="post-tile-title">${post.title}</h3>
          </div>
          ${text?.length
            ? html`<div class="post-tile-body">
                ${text.slice(0, 200)}${text.length > 200 ? '...' : ''}
              </div>`
            : ''}
        </div>
      </div>`;
    });
  }
}

export function getImageUrl(post: Post, isImage: boolean, isLarge: boolean) {
  if (isImage) return post.url;
  const previews = post.preview?.images[0].resolutions ?? null;
  if (!previews) return '';
  const resolution = isLarge
    ? previews[2] ?? previews[1] ?? previews[0]
    : previews[1] ?? previews[0];
  return resolution.url;
}
