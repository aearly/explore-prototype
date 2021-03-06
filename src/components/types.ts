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
  media?: {
    reddit_video: {
      fallback_url: string;
    };
  };
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

export interface SubredditAbout {
  active_user_count: number;
  banner_background_color: string;
  banner_background_image: string;
  banner_img: string;
  banner_size: string;
  description: string;
  description_html: string;
  display_name: string;
  header_img: string;
  headerSize: [number, number];
  icon_img: string;
  name: string;
  public_description: string;
  public_description_html: string;
  subscribers: number;
  title: string;
  url: string;
}

export const GRID_GRANULARITY = 4;
