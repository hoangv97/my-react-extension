const storage = {
  KEYS: {
    hiddenCards: "hiddenCards",
    bgImages: "bgImages",
    cmcListings: "cmcListings",
    newsTopHeadlines: "newsTopHeadlines",
    noteContent: "noteContent",

    bookmarkWindowRndState: "bookmarkWindowRndState",
    coinWindowRndState: "coinWindowRndState",
    newsWindowRndState: "newsWindowRndState",
    noteWindowRndState: "noteWindowRndState",
  },
  getLocalStorage(key: string, defaultVal = null) {
    let result = JSON.parse(localStorage.getItem(key) || "null");
    // console.log(result, key, defaultVal)
    if (!result) return defaultVal;
    let { value, timeout, time } = result;
    if (!timeout) {
      return value;
    }
    let diff = new Date().getTime() - new Date(time).getTime();
    // console.log(value, timeout, time, diff)
    if (diff < timeout) {
      return value;
    } else {
      localStorage.removeItem(key);
      return defaultVal;
    }
  },
  setLocalStorage(key: string, val: any, timeout?: number) {
    let cacheValue = {
      value: val,
      timeout,
      time: new Date(),
    };
    localStorage.setItem(key, JSON.stringify(cacheValue));
  },
}

export default storage