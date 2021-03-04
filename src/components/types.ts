export interface Post {
  id: string;
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
      source: PreviewImage;
      resolutions: PreviewImage[];
    }[];
    source: {url: string};
  } | null;
  thumbnail: string;
  pinned: boolean;
  stickied: boolean;
  ups: number;
}

export interface PreviewImage {
  height: number;
  width: number;
  url: string;
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
