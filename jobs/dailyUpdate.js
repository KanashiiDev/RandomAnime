import model from "../models/db.js";
import mongoose from "mongoose";
import { media, query } from "../src/data/dailyItems.js";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core/core.cjs";
import { tagFix } from "../src/data/FuncOptions.js";
import * as fs from "node:fs";
 
async function dailyUpdate() {
  const CFG = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const apolloClient = new ApolloClient({
    uri: "https://graphql.anilist.co",
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
        errorPolicy: "ignore",
      },
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
    },
  });
  await mongoose.connect(CFG.MONGO);

  const data = await model.find();

  if (data[0]) {
    let apiresponse, usedItems, animes;
    async function apireq() {
      animes = media;
      const GET_ANIME_PAGE = gql(query);
      try {
        const response = await apolloClient.query({
          query: GET_ANIME_PAGE,
          variables: {
            id: animes[usedItems].id,
          },
        });
        if (!response || !response.data) throw new Error("Cannot get anime list!");
        if (response) {
          apiresponse = await response.data.Page.media[0];
          fs.writeFileSync("./public/dailyUpdateResult.json", JSON.stringify(apiresponse), function (err) {
            if (err) {
              return console.log(err);
            }
            console.log("Anime of The Day Saved!");
          });
        }
      } catch (err) {
        throw err;
      }
    }
    usedItems = await data[0].usedIds;
    await apireq();
    await model.updateMany(
      {},
      {
        $set: {
          name: apiresponse.title.romaji,
          nameEng: apiresponse.title.english ? apiresponse.title.english : " ",
          format: apiresponse.format ? apiresponse.format : " ",
          siteUrl: apiresponse.siteUrl ? apiresponse.siteUrl : " ",
          idMal: apiresponse.idMal ? apiresponse.idMal : " ",
          image: apiresponse.coverImage.large ? apiresponse.coverImage.large : " ",
          bannerImage: apiresponse.bannerImage ? apiresponse.bannerImage : " ",
          genres: apiresponse.genres ? apiresponse.genres.toString().split(",").join(", ") : " ",
          tags: apiresponse.tags
            ? apiresponse.tags
                .filter((item) => item.isMediaSpoiler === false)
                .map(
                  (node) =>
                    "<div class='tag'><a href='https://anilist.co/search/anime?genres=" +
                    tagFix(node.name, "url") +
                    "'><div class='tag-name'>" +
                    tagFix(node.name, "str") +
                    "</div></a>" +
                    "<div class='tag-percent'> (" +
                    node.rank +
                    "%)</div></div>"
                )
                .toString()
                .split(",")
                .join("")
            : " ",
          studios: apiresponse.studios.nodes
            ? apiresponse.studios.nodes
                .map((node) => node.name)
                .toString()
                .split(",")
                .join(", ")
            : " ",
          desc: apiresponse.description ? apiresponse.description : " ",
          trailer: apiresponse.trailer && apiresponse.trailer.id ? apiresponse.trailer.id : " ",
          averageScore: apiresponse.averageScore ? apiresponse.averageScore : " ",
          duration: apiresponse.duration ? apiresponse.duration : " ",
          source: apiresponse.source ? apiresponse.source : " ",
          startDate: apiresponse.startDate.month + "/" + apiresponse.startDate.year,
          usedIds: usedItems === apiresponse.length ? 0 : usedItems + 1,
        },
      }
    );
  } else {
    new model({
      name: " ",
      nameEng: " ",
      siteUrl: " ",
      idMal: " ",
      image: " ",
      bannerImage: " ",
      format: " ",
      genres: " ",
      tags: " ",
      studios: " ",
      desc: " ",
      trailer: " ",
      averageScore: 0,
      duration: 0,
      source: " ",
      startDate: " ",
      usedIds: 0,
    }).save();
  }
}

export default dailyUpdate;
