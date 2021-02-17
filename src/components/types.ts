export interface Post {
  title: string;
  post_hint: string;
  url: string;
  selftext: string;
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
  pinned: boolean;
  stickied: boolean;
}

export interface ListingData {
  after: string;
  before: string | null;
  children: {
    kind: string;
    data: Post;
  }[];
  dist: number;
  modhash: string;
}
