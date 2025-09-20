declare module 'leo-profanity' {
  const filter: {
    loadDictionary: (lang?: string) => void;
    clearList: () => void;
    add: (words: string | string[]) => void;
    remove: (words: string | string[]) => void;
    check: (text: string) => boolean;
    clean: (text: string) => string;
    isProfane: (text: string) => boolean;
  };
  export default filter;
}
