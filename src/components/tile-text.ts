import {LitElement, html, customElement, property, query} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {classMap} from 'lit-html/directives/class-map';
import {Post} from './types';
// @ts-ignore
import {clamp} from '../vendor/clampy';

import exploreStyles from './explore-styles';
import {firstMarkdownElem, htmlDecode} from './helpers';

@customElement('tile-text')
export class TileText extends LitElement {
  @property({attribute: true, type: Object})
  post: Post | undefined;

  @property({attribute: true, type: Boolean})
  isImage = false;

  @query('.post-tile-title')
  titleElem: HTMLElement | undefined;

  @query('.post-tile-body')
  bodyElem: HTMLElement | undefined;

  isClamped = false;

  static get styles() {
    return exploreStyles();
  }

  updated() {
    if (this.titleElem && !this.isClamped) {
      clamp(this.titleElem, {
        clamp: this.post?.selftext ? '3' : '5',
        lineHeight: 17,
      });
    }
    if (this.bodyElem && !this.isClamped) {
      clamp(this.bodyElem as HTMLElement, {
        clamp: '5',
        lineHeight: 17,
      });
      this.isClamped = true;
    }
  }

  render() {
    if (!this.post) return '';
    return this._renderText(this.post, this.isImage);
  }

  _renderText(post: Post, isImage = false) {
    const text =
      firstMarkdownElem(htmlDecode(post.selftext_html ?? '') ?? '') ?? '';
    return html`<div
      class=${classMap({
        'post-tile-text': true,
        shim: isImage,
      })}
    >
      <h3
        class=${classMap({
          'post-tile-title': true,
        })}
        title=${post.title}
      >
        ${htmlDecode(post.title)}
      </h3>
      ${text?.length
        ? html`<div
            class=${classMap({
              'post-tile-body': true,
            })}
          >
            ${unsafeHTML(text)}
          </div>`
        : ''}
      <div class="spacer"></div>
      <div
        class=${classMap({
          subreddit: true,
        })}
      >
        r/${post.subreddit}
      </div>
    </div>`;
  }
}
