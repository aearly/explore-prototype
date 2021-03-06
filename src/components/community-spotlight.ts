import {LitElement, html, customElement, property, css} from 'lit-element';
import {firstMarkdownElem, htmlDecode} from './helpers';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
//import {classMap} from 'lit-html/directives/class-map';
import {SubredditAbout} from './types';

@customElement('community-spotlight')
export default class CommunitySpotlight extends LitElement {
  @property({attribute: true, type: String})
  subreddit = '';

  @property({attribute: true, type: Object})
  about: SubredditAbout | undefined;

  private async fetchAbout() {
    this.about = undefined;
    if (!this.subreddit) return;
    const resp = await fetch(
      `https://www.reddit.com/r/${this.subreddit}/about.json`,
      {
        mode: 'cors',
      }
    );
    const body = await resp.json();
    this.about = body.data;
  }

  attributeChangedCallback(name: string, prev: unknown, current: unknown) {
    switch (name) {
      case 'subreddit': {
        this.subreddit = current as string;
        if (prev !== current) {
          this.fetchAbout();
        }
        return;
      }
    }
  }

  static get styles() {
    return css`
      .about {
        background-repeat: no-repeat;
        background-size: cover;
        background-position: top center;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        color: white;
      }
      .comm-shim {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          180deg,
          rgba(0, 0, 0, 20%) 50%,
          #000000 100%
        );
      }
      .text {
        position: absolute;
        display: flex;
        flex-direction: column;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        padding: 16px;
      }
      .intro {
        flex: none;
        margin: 0;
        font-weight: 700;
        font-size: 10px;
        line-height: 12px;
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      }
      .name {
        flex: auto;
        margin: 0;
        font-weight: bold;
        font-size: 26px;
        line-height: 31px;
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      }
      .desc {
        flex: none;
        margin: 0;
        font-size: 14px;
        line-height: 17px;
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      }
    `;
  }

  render() {
    if (!this.about) return html``;
    return html`
      <div
        class="about"
        style="background-image: url('${this.about.banner_img ||
        this.about.header_img}')"
      >
        <div class="comm-shim"></div>
        <div class="text">
          <p class="intro">COMMUNITY SPOTLIGHT</p>
          <h3 class="name">r/${this.about.display_name}</h3>
          <p class="desc">
            ${unsafeHTML(
              firstMarkdownElem(htmlDecode(this.about.public_description_html))
            )}
          </p>
        </div>
      </div>
    `;
  }
}
