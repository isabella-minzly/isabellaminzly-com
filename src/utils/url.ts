// Internal links go through url() so the site works both at a domain root (isabellaminzly.com)
// and in a subfolder (the GitHub Pages preview at /isabellaminzly-com/).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string) => `${base}${path}`;

// The page path without the base, to compare with navigation hrefs
export const pagePath = (pathname: string) => {
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return path.endsWith('/') ? path : `${path}/`;
};
