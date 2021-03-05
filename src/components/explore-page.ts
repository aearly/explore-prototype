import {LitElement, html, customElement, property, query} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {classMap} from 'lit-html/directives/class-map';
import {GRID_GRANULARITY, ListingData, Post} from './types';
import './subreddit-view';
import './tile-text';

import exploreStyles from './explore-styles';
import {
  firstMarkdownElem,
  getAspectRatio,
  getImageUrl,
  htmlDecode,
} from './helpers';

const TOPICS: Record<string, string> = {
  gaming:
    'gaming+halo+PS4+rpg+iosgaming+gamingsuggestions+computers+' +
    'ShouldIbuythisgame+MechanicalKeyboards+Monitors+hardwareswap+OpTicGaming+' +
    'DotA2+pcmasterrace+GirlGamers+gamecollecting+IndieGaming+Fallout+Games+' +
    'nintendo+SuggestALaptop+Steam+Competitiveoverwatch+wow+funny',
  music:
    'Music+Vaporwave+Guitar+MusicEd+WeAreTheMusicMakers+indieheads+Metal+' +
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
  pending = false;
  posts: Post[];
  afterId: string | undefined;

  observer: IntersectionObserver | undefined;

  @property({attribute: true, type: Boolean})
  showtitle = true;

  @property({attribute: true, type: Boolean})
  showsubreddit = true;

  @property({attribute: true, type: Boolean})
  showshim = true;

  largeKarmaThreshold = 20000;
  largeCommentThreshold = 100;

  @query('.loader')
  _loader: HTMLElement | undefined;
  loaderRegistered = false;

  constructor() {
    super();
    this.posts = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.makeQuery();
  }

  updated() {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          console.log({entries});
          if (!entries[0].isIntersecting) return;
          console.log(`load more ${this.afterId}`);
          this._loader && this.observer?.unobserve(this._loader);
          if (!this.pending) this.makeQuery();
        },
        {
          root: document.querySelector('main'),
          rootMargin: '100px',
        }
      );
    }
    if (this._loader && this.afterId) {
      setTimeout(() => {
        this._loader && this.observer?.observe(this._loader);
      }, 1000);
    }
  }

  static get styles() {
    return exploreStyles();
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
        this.posts = [];
        this.afterId = undefined;
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
    if (this.pending) return;
    this.data = undefined;
    console.log(this.topic);
    this.pending = true;
    const resp = await fetch(
      `https://www.reddit.com/r/${TOPICS[this.topic]}.json?after=${
        this.afterId ?? ''
      }`,
      {
        mode: 'cors',
      }
    );
    const body = await resp.json();
    this.pending = false;
    this.data = body.data;
    const posts = this.data?.children.map((c) => c.data) ?? [];
    console.log(posts);
    this.posts = this.posts.concat(
      posts.filter((post) => post.post_hint !== 'link')
    );
    this.afterId = body.data.after;
  }

  render() {
    if (this.subreddit) {
      return html`<subreddit-view
        subreddit=${this.subreddit}
      ></subreddit-view>`;
    }
    //if (!this.posts.length) return html`<div class="grid"></div>`;
    return html`
      <div class="grid">
        ${this._renderTiles()}
        ${this.posts.length === 0 ? '' : this._renderSpacers()}
      </div>
    `;
  }

  _renderTiles() {
    return this.posts.map((post) => {
      const imgUrl = getImageUrl(post);
      const isMedia = !!imgUrl;

      if (isMedia) return this._renderMediaTile(post);
      return this._renderTextTile(post);
    });
  }

  _renderSpacers() {
    return html`<div class="post-tile post-text-only span3"></div>
      <div class="post-tile post-text-only span2"></div>
      ${Array(4)
        .fill(1)
        .map(() => html`<div class="post-tile post-text-only span1"></div>`)}
      <div class="loader"></div>`;
  }
  _renderMediaTile(post: Post) {
    //const isLarge = post.title.length > 90;
    const isLarge =
      post.ups > this.largeKarmaThreshold || post.num_comments / post.ups > 0.1;
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
    const isLarge =
      post.ups > this.largeKarmaThreshold || post.title.length > 100;
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
    return html`<tile-text .post=${post} isImage=${isImage} />`;
  }
  _renderTextOld(post: Post, isImage = false) {
    const text =
      firstMarkdownElem(htmlDecode(post.selftext_html ?? '') ?? '') ?? '';
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

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}
