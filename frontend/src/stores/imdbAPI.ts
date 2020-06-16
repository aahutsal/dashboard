const fetchJsonp = require('fetch-jsonp');

export interface IMDBSuggestion {
  id: string; // IMDB id, e.g. "nm0000206"
  l: string; // Person full name, e.g. "Keanu Reeves"
  s: string; // What is person known for, e.g. "Actor, The Matrix (1999)"
  i?: [string]; // Photo
}

/**
 * This is not an official IMDB API, but rather the API they use for their own frontend.
 * Probably it is illegal to use it like that.
 * @param partOfTheName String — part of the person name to search for
 */
export const searchPersonInIMDB = async (partOfTheName: string): Promise<IMDBSuggestion[]> => {
  if (!partOfTheName) return [];
  const query = partOfTheName.replace(/[.]/g, '');
  const jsonpCallbackFunction = `imdb$${query.replace(/[\s]/g, '_')}`;
  const searchResult = await fetchJsonp(
    `https://v2.sg.media-imdb.com/suggests/${query[0].toLowerCase()}/${query}.json`,
    {
      jsonpCallbackFunction,
    },
  ).then((a: any) => a.json());

  return searchResult.d.filter((entry: IMDBSuggestion) => entry.id.startsWith('nm'));
};
