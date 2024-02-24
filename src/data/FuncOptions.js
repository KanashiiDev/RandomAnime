export const ytopts = {
  height: "390",
  width: "430",
  playerVars: {
    autoplay: 0,
  },
};
//Random Number
export const randomizeNumber = (number) => Math.floor(Math.random() * number);

//Random Different Numbers
export async function randomizeDiffNumbers(number, times) {
  let numbers = [];
  while (numbers.length < times) {
    let randomNumber = Math.floor(Math.random() * number);
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }
  return numbers;
}
//Fix Anime Tags that contains apostrophe(')
export function tagFix(str, type) {
  if (type === "str") {
    return String(str).replace(/'/g, " ");
  }
  if (type === "url") {
    return String(str).replace(/'/g, "%27");
  }
}

//Truncate Long Label
export const truncate = (input,value) => (input.length > value ? `${input.substring(0, value)}...` : input);

//Apollo Client Query Default Options
export const QuerydefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};