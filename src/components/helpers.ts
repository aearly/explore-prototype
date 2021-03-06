import {GalleryPost, Post, PreviewImage} from './types';

export function getAspectRatio(post: Post) {
  const image = getPreview(post);
  if (!image) return 1;
  return image.height / image.width;
}

export function getImageUrl(post: Post) {
  const isImage = post.post_hint === 'image';
  if (isImage) return post.url;
  return getPreview(post)?.url ?? '';
}

export function getPreview(post: Post): PreviewImage | undefined {
  const isImage = post.post_hint === 'image';
  if (isGallery(post)) return getGalleryImage(post);
  if (isImage) return post.preview?.images[0].source;

  const previews = post.preview?.images[0].resolutions;
  if (!previews) return;

  return post.preview?.images[0].source;
  /* const resolution = isLarge
    ? previews[2] ?? previews[1] ?? previews[0]
    : previews[1] ?? previews[0];
  return resolution; */
}

export function isGallery(post: Post): post is GalleryPost {
  return !!post.gallery_data;
}

export function isVideo(post: Post): boolean {
  return post.post_hint?.includes('video');
}

export function getGalleryImage(post: GalleryPost): PreviewImage | undefined {
  const firstImage = post.gallery_data.items[0];
  const metadata = post.media_metadata[firstImage.media_id];
  if (!metadata) return;
  let thumb = metadata.p.find((info) => info.x > 300);

  if (!thumb) thumb = metadata.s;
  if (!thumb) return;
  return {
    url: thumb.u,
    width: thumb.x,
    height: thumb.y,
  };
}

export function htmlDecode(input: string) {
  var doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent;
}

export function firstMarkdownElem(input: string): string | undefined {
  const div = document.createElement('div');
  div.innerHTML = input;
  const firstChild = div.querySelector('.md')?.firstElementChild;
  if (firstChild) {
    return firstChild.textContent?.toString();
  }
  return;
}
