import {LitElement, html, customElement, property, css} from 'lit-element';
import Cookies from 'js-cookie';
import {
  ApolloClient,
  ApolloLink,
  concat,
  gql,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';

@customElement('explore-page')
export class ExplorePage extends LitElement {
  @property({attribute: true})
  topic: string;

  _client: ApolloClient<NormalizedCacheObject>;

  constructor() {
    super();

    const httpLink = new HttpLink({
      uri: 'https://gql.reddit.com',
      credentials: 'include',
    });
    const authMiddleware = new ApolloLink((operation, forward) => {
      // add the authorization to the headers
      operation.setContext({
        headers: {
          //Authorization: `Bearer ${encodeURIComponent(
          //  Cookies.get('reddit_session') || ''
          //)};`,
          Cookie: `reddit_session=${encodeURIComponent(
            Cookies.get('reddit_session') || ''
          )};`,
        },
      });

      return forward(operation);
    });
    this._client = new ApolloClient<NormalizedCacheObject>({
      cache: new InMemoryCache(),
      link: concat(authMiddleware, httpLink),
    });
    this.topic = 'gaming';
  }

  static query = gql`
    query TopicBySlug(
      $topicSlug: String!
      $includeIdentity: Boolean = false
      $includeTopic: Boolean = false
      $includePosts: Boolean = true
      $includeSubreddits: Boolean = true
      $includeRelationships: Boolean = true
      $firstPosts: Int = 30
      $afterPosts: String
      $firstSubreddits: Int = 10
      $afterSubreddits: String
    ) {
      identity @include(if: $includeIdentity) {
        ...identityFragment
        preferences {
          ...identityPreferencesFragment
        }
      }
      topicBySlug(slug: $topicSlug) {
        ...topicFragment @include(if: $includeTopic)
        posts(first: $firstPosts, after: $afterPosts)
          @include(if: $includePosts) {
          ...postConnectionFragment
        }
        subreddits(first: $firstSubreddits, after: $afterSubreddits)
          @include(if: $includeSubreddits) {
          edges {
            node {
              ...subredditFragment
              ...subredditAboutFragment
            }
          }
        }
        parentRelationships @include(if: $includeRelationships) {
          ...topicRelationshipFragment
        }
        childRelationships @include(if: $includeRelationships) {
          ...topicRelationshipFragment
        }
        siblingRelationships @include(if: $includeRelationships) {
          ...topicRelationshipFragment
        }
      }
    }
  `;

  connectedCallback() {
    this.makeQuery();
  }

  static get styles() {
    return css`
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-auto-rows: 1/3;
      }
    `;
  }
  private makeQuery() {
    this._client.query({
      query: ExplorePage.query,
      variables: {topic: this.topic},
    });
  }

  render() {
    return html` <div class="grid"><h1>Explore</h1></div>`;
  }
}
