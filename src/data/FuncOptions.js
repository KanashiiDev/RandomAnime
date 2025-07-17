export const ytopts = {
  height: "390",
  width: "430",
  playerVars: {
    autoplay: 0,
  },
};
//Random Number
export const getRandomNumber = (number) => Math.floor(Math.random() * number);

//Load Image
export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

//Random Different Numbers
export async function getUniqueRandomNumbers(number, times) {
  let numbers = [];
  const count = Math.min(number, times); 
  while (numbers.length < count) {
    let randomNumber = Math.floor(Math.random() * number);
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }
  return numbers;
}

//Fix Anime Tags that contains apostrophe(')
export function formatTag(str, type) {
  if (typeof str !== "string") return "";
  if (type === "str") {
    return str.replace(/'/g, " ");
  }
  if (type === "url") {
    return encodeURIComponent(str);
  }
  return str;
}

//truncateText Long Label
export const truncateText = (input, value) => (input.length > value ? `${input.substring(0, value)}...` : input);

//Apollo Client Query Default Options
export const DEFAULT_QUERY_OPTIONS = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

export function cloneWheelPropsPreservingImages(baseProps) {
  const copy = JSON.parse(JSON.stringify(baseProps));
  if (Array.isArray(baseProps.items) && Array.isArray(copy.items)) {
    for (let i = 0; i < baseProps.items.length; i++) {
      copy.items[i].image = baseProps.items[i].image;
    }
  }
  copy.overlayImage = baseProps.overlayImage;

  return copy;
}
