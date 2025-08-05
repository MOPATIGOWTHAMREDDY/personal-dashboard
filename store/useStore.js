import create from 'zustand';
export const useStore = create(set => ({
  user: null,
  setUser: user => set({ user }),
  movies: [],
  music: [],
  news:  [],
  setMovies: movies => set({ movies }),
  setMusic:  music  => set({ music }),
  setNews:   news   => set({ news  }),
}));
