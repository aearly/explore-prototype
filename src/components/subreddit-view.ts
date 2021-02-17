import {LitElement, html, customElement, property, css} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {getImageUrl} from './explore-page';
import {ListingData, Post} from './types';

@customElement('subreddit-view')
export class SubredditView extends LitElement {
  @property({attribute: true, type: String})
  subreddit: string | undefined;
  @property({attribute: true, type: Object})
  data: ListingData | undefined;

  constructor() {
    super();
    if (this.subreddit) {
      this.makeQuery();
    }
  }

  attributeChangedCallback(name: string, prev: any, curr: any) {
    if (name === 'subreddit') {
      if (prev !== curr) {
        this.subreddit = curr as string;
        this.makeQuery();
      }
    }
  }

  private async makeQuery() {
    this.data = undefined;
    if (!this.subreddit) return;
    const resp = await fetch(
      `https://www.reddit.com/r/${this.subreddit}.json`,
      {
        mode: 'cors',
      }
    );
    const body = await resp.json();
    this.data = body.data;
    console.log(this.data?.children.map((c) => c.data.title));
  }
  static get styles() {
    return css`
      .posts {
        background-color: white;
        color: black;
      }

      .post {
        display: block;
        text-decoration: none;
        color: inherit;
      }

      .post-top {
        display: flex;
        flex-direction: row;
        padding: 12px 16px 0px;
      }

      .sr-icon {
        width: 32px;
        height: 32px;
        flex: none;
        margin-right: 4px;
        border-radius: 50px;
        border: 1px solid rgba(0, 0, 0, 0.2);
      }
      .sr {
        flex: auto;
        font-size: 14px;
        line-height: 1em;
      }
      .sr .author {
        color: grey;
        font-size: 12px;
        line-height: 1;
      }
      .join {
        background: transparent;
        color: black;
        border-radius: 50px;
        border: 1.5px solid black;
        flex: none;
        font-weight: bold;
        font-size: 17px;
        line-height: 1em;
        text-align: center;
        text-indent: -3px;
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .post-title {
        padding: 8px 16px;
        font-weight: bold;
        font-size: 16px;
      }

      .media {
        display: block;
        width: 100%;
      }

      .selftext {
        padding: 8px 16px;
        font-size: 14px;
        max-width: 100%;
        word-break: break-word;
      }

      .post-bottom {
        padding: 12px 12px 16px;
      }

      .post-bottom img {
        display: inline-block;
        width: 305px;
      }
    `;
  }

  render() {
    if (!this.data) return null;
    console.log(this.data);
    return html`<div class="posts">
      ${this.data.children
        .filter((c) => !c.data.stickied)
        .map((c) => {
          const post: Post = c.data;
          const isImage = post.post_hint === 'image';
          const imgUrl = getImageUrl(post, isImage, true);
          return html`<a
            class="post"
            target="_blank"
            href="https://reddit.com/${post.id}"
          >
            <div class="post-top">
              <img class="sr-icon" />
              <div class="sr">
                r/${post.subreddit}<br /><span class="author"
                  >u/${post.author}</span
                >
              </div>
              <button class="join" title="join r/${post.subreddit}">+</button>
            </div>
            <div class="post-title">
              ${unsafeHTML(post.title)}
            </div>
            ${post.selftext_html
              ? html`<div class="selftext">
                  ${unsafeHTML(post.selftext)}
                </div>`
              : ''}
            ${imgUrl ? unsafeHTML(`<img class="media" src=${imgUrl} />`) : ''}
            <div class="post-bottom">
              <img src="fake-post-meta.png" />
            </div>
          </a>`;
        })}
    </div>`;
  }
}
