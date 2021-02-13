import {LitElement, html, customElement, property, css} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';

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

interface Post {
  title: string;
  post_hint: string;
  url: string;
  selftext_html: string;
  author: string;
  score: number;
  subreddit: string;
  preview: {
    enabled: boolean;
    images: {
      resolutions: {
        height: number;
        width: number;
        url: string;
      }[];
    }[];
    source: {url: string};
  } | null;
  thumbnail: string;
}

interface ListingData {
  after: string;
  before: string | null;
  children: {
    kind: string;
    data: Post;
  }[];
  dist: number;
  modhash: string;
}

@customElement('explore-page')
export class ExplorePage extends LitElement {
  @property({attribute: true, type: String})
  topic: string;

  @property({attribute: true, type: Object})
  data: ListingData | undefined;

  constructor() {
    super();
    this.topic = 'gaming';
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
      }

      .post-tile-title {
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
        box-shadow: 0px 0px 20px 25px rgba(0, 0, 0, 0.5);
        background-color: rgba(0, 0, 0, 0.5);
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

      .post-tile-large {
        grid-column-end: span 2;
        grid-row-end: span 2;
      }
      .post-tile-large .post-tile-image {
        height: 252px;
      }
      .post-tile-large .post-tile-title {
        font-size: 14px;
      }
    `;
  }

  attributeChangedCallback(name: string, old: unknown, current: unknown) {
    console.log(arguments);
    if (name === 'topic' && old !== current) {
      this.topic = current as string;
      this.makeQuery();
    }
  }

  private async makeQuery() {
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
    return html`
      <div class="grid">
        ${this.data?.children.map(({data: post}) => {
          const hasImage = !!post.thumbnail;
          const isImage = post.post_hint === 'image';
          const isLarge = post.title.length > 70;
          const imgStyles = {
            backgroundImage: `url('${getImageUrl(post, isImage, isLarge)}')`,
          };
          return html`<div
            class="post-tile ${isLarge ? 'post-tile-large' : ''}"
          >
            ${hasImage
              ? unsafeHTML(
                  `<div class="post-tile-image" style="background-image: ${imgStyles.backgroundImage}" />`
                )
              : ''}
            <h3 class="post-tile-title">${post.title}</h3>
          </div>`;
        })}
        <slot></slot>
      </div>
    `;
  }
}

function getImageUrl(post: Post, isImage: boolean, isLarge: boolean) {
  if (isImage) return post.url;
  const previews = post.preview?.images[0].resolutions ?? null;
  if (!previews) return '';
  const resolution = isLarge
    ? previews[2] ?? previews[1] ?? previews[0]
    : previews[1] ?? previews[0];
  return resolution.url;
}
