import {LitElement, html, customElement, property, query} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {classMap} from 'lit-html/directives/class-map';
import {GRID_GRANULARITY, ListingData, Post} from './types';
import './subreddit-view';
import './community-spotlight';
import './tile-text';

import exploreStyles from './explore-styles';
import {getAspectRatio, getImageUrl, isGallery, isVideo} from './helpers';

@customElement('explore-page')
export class ExplorePage extends LitElement {
  @property({attribute: true, type: String})
  subreddit: string | undefined;

  @property({attribute: true, type: String})
  multi: string | undefined;

  @property({attribute: true, type: String})
  postId: string | undefined;

  @property({attribute: true, type: Object})
  data: ListingData | undefined;
  pending = false;
  posts: Post[];
  afterId: string | undefined;

  observer: IntersectionObserver | undefined;

  @property({attribute: true, type: Boolean})
  showtitle = false;

  @property({attribute: true, type: Boolean})
  showsubreddit = false;

  @property({attribute: true, type: Boolean})
  showshim = false;

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

  attributeChangedCallback(name: string, old: unknown, current: unknown) {
    console.log(arguments);
    if (name === 'multi' && old !== current) {
      this.multi = current as string;
      if (this.multi) {
        this.posts = [];
        this.afterId = undefined;
        this.subreddit = undefined;
        this.makeQuery();
      }
      return;
    }
    if (name === 'subreddit' && old !== current) {
      this.subreddit = current as string;
      if (this.subreddit) {
        this.posts = [];
        this.afterId = undefined;
        this.multi = undefined;
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
    if (!this.multi) return;
    if (this.pending) return;
    this.data = undefined;
    console.log(this.multi);
    this.pending = true;
    const resp = await fetch(
      `https://www.reddit.com/r/${this.multi}.json?after=${this.afterId ?? ''}`,
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
    return this.posts.map((post, index) => {
      const imgUrl = getImageUrl(post);
      const isMedia = !!imgUrl;

      if (index % 25 === 5) {
        return html`<a
          class="post-tile span5 post-tile-large"
          href="#!r/${post.subreddit}"
        >
          <community-spotlight
            subreddit=${post.subreddit}
          ></community-spotlight>
        </a>`;
      }
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

    return html`<a
      href="#!r/${post.subreddit}"
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
      ${this.showshim
        ? html`<tile-text .post=${post} isImage></tile-text>`
        : ''}
      ${isGallery(post)
        ? html`<img class="gallery-icon" src="gallery.png" />`
        : ''}
      ${isVideo(post) ? html`<img class="video-icon" src="video.png" />` : ''}
    </a>`;
  }

  _renderTextTile(post: Post) {
    const isLarge =
      post.ups > this.largeKarmaThreshold || post.title.length > 100;
    return html`<a
      href="#!r/${post.subreddit}"
      class=${classMap({
        'post-tile': true,
        span6: !!post.selftext,
        span4: !post.selftext,
        'post-tile-large': isLarge,
        'post-text-only': true,
      })}
    >
      <tile-text .post=${post} .isimage=${false}></tile-text>
    </a>`;
  }

  _renderText(post: Post, isImage = false) {
    return html`<tile-text .post=${post} .isimage=${isImage} />`;
  }
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}
