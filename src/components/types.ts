export interface Post {
  id: string;
  title: string;
  post_hint: string;
  url: string;
  num_comments: number;
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
  gallery_data?: {items: MediaItem[]};
  thumbnail: string;
  pinned: boolean;
  stickied: boolean;
  ups: number;
}

export interface GalleryPost extends Post {
  gallery_data: {items: MediaItem[]};
  media_metadata: Record<string, MediaInfo>;
}

export interface PreviewImage {
  height: number;
  width: number;
  url: string;
}

export interface MediaItem {
  id: string;
  media_id: string;
}

export interface MediaInfo {
  e: string;
  id: string;
  /** content type */
  m: string;
  /** preview sizes */
  p: MediaImage[];
  s: MediaImage;
}

export interface MediaImage {
  u: string;
  x: number;
  y: number;
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

export const GRID_GRANULARITY = 4;
