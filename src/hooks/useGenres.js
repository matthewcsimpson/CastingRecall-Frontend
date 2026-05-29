import useFetch from "./useFetch";

/**
 * Fetches TMDB genre metadata and keeps it cached in state for reuse across components.
 * @param {string} genreUrl Base URL for the TMDB genre endpoint.
 * @param {string} bearerToken TMDB bearer token used for authenticated requests.
 * @returns {Array<{id: number, name: string}>|null} Array of genre objects once loaded, otherwise null while pending.
 */
const useGenres = (genreUrl, bearerToken) => {
  const url = genreUrl && bearerToken ? `${genreUrl}?language=en-US` : null;

  const { data } = useFetch(url, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      Accept: "application/json",
    },
    select: (response) => response.data.genres,
  });

  return data;
};

export default useGenres;
