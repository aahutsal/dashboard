export type Movie = {
  title: string;
  posterUrl: string;
};

// TODO: move User object from backend to `common` so that we can reuse it in FE
export type User = {
  name: string;
  contact: string;
  status: string;
  movies: Movie[];
};
