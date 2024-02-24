import { Schema, model } from "mongoose";

const _default = model(
  "DailyAnime",
  new Schema({
    name: String,
    nameEng: String,
    siteUrl: String,
    idMal: String,
    image: String,
    bannerImage: String,
    format: String,
    genres: String,
    tags: String,
    studios: String,
    desc: String,
    trailer: String,
    averageScore: Number,
    duration: Number,
    source: String,
    startDate: String,
    usedIds: Number,
  })
);
export { _default as default };
