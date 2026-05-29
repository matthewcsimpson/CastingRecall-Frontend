const IMG_BASE =
  process.env.REACT_APP_TMDB_IMG_BASE || "https://image.tmdb.org/t/p/w500/";

/**
 * Build a TMDB image URL from a relative path, falling back when absent.
 * @param {string|null|undefined} path TMDB relative image path (e.g. poster_path, profile_path).
 * @param {{fallback?: *}} [options] Value to return when path is missing (default "").
 * @returns {*} Full TMDB image URL, or the fallback when path is falsy.
 */
export const tmdbImageUrl = (path, { fallback = "" } = {}) =>
  path ? `${IMG_BASE}${path}` : fallback;
