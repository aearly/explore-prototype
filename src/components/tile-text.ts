import {LitElement, html, customElement, property, query} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {classMap} from 'lit-html/directives/class-map';
import {Post} from './types';
// @ts-ignore
import {clamp} from '@clampy-js/clampy';

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

  showshim = true;
  showtitle = true;
  showsubreddit = true;

  static get styles() {
    return exploreStyles();
  }

  updated() {
    if (this.titleElem) {
      clamp(this.titleElem, {clamp: 3});
    }
    if (this.bodyElem) {
      clamp(this.bodyElem.firstElementChild, {clamp: 5});
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
        shim: isImage && this.showshim,
      })}
    >
      <h3
        class=${classMap({
          'post-tile-title': true,
          hidden: isImage && !this.showtitle,
        })}
      >
        ${htmlDecode(post.title)}
      </h3>
      ${text?.length
        ? html`<div
            class=${classMap({
              'post-tile-body': true,
              hidden: isImage && !this.showtitle,
            })}
          >
            ${unsafeHTML(text)}
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
