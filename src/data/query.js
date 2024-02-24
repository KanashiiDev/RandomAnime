let localStorageData = JSON.parse(localStorage.getItem("RandAniF"));
let gg = localStorageData[0].genres == "" ? "" : "$genre: [String]";
let gg2 = localStorageData[0].genres == "" ? "" : "genre_in: $genre";
let eexg = localStorageData[0].excludedGenres == "" ? "" : "$exGenre: [String]";
let eexg2 = localStorageData[0].excludedGenres == "" ? "" : "genre_not_in: $exGenre";
let ttg = localStorageData[0].tags == "" ? "" : "$tag: [String]";
let ttg2 = localStorageData[0].tags == "" ? "" : "tag_in: $tag";
let eextg = localStorageData[0].excludedTags == "" ? "" : "$exTag: [String]";
let eextg2 = localStorageData[0].excludedTags == "" ? "" : "tag_not_in: $exTag";
let ccurrentpage = 1;
 

export async function cfg(g,g2,exg,exg2,tg,tg2,extg,extg2,currentpage){
    gg = g;
    gg2 = g2;
    eexg = exg;
    eexg2 = exg2;
    ttg = tg;
    ttg2 = tg2;
    eextg = extg;
    eextg2 = extg2;
    ccurrentpage = currentpage;
}


import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { QuerydefaultOptions  } from "../data/FuncOptions.js";


export var apolloClient = new ApolloClient({
    uri: "https://graphql.anilist.co",
    cache: new InMemoryCache(),
    defaultOptions: QuerydefaultOptions,
  });
  await cfg();
  //async () => apolloClient.resetStore();
  export var GET_ANIME_PAGE = gql`
    query (
      $id: Int
      $page: Int
      ${gg}
      ${eexg}
      ${ttg}
      ${eextg}
      $score_lesser: Int
      $score_greater: Int
      $ep_lesser: Int
      $ep_greater: Int
      $year_lesser: FuzzyDateInt
      $year_greater: FuzzyDateInt
    ) {
      Page (page: $page) {pageInfo{currentPage hasNextPage}
         
        media(
          id: $id
          type: ANIME
          ${gg2}
          ${eexg2}
          ${ttg2}
          ${eextg2}
          averageScore_lesser: $score_lesser
          averageScore_greater: $score_greater
          episodes_lesser: $ep_lesser
          episodes_greater: $ep_greater
          startDate_lesser: $year_lesser
          startDate_greater: $year_greater
          
        ) {
          id
          studios {
            nodes {
              name
            }
          }
          trailer {
            site
            id
          }
          averageScore
          duration
          source
          startDate {
            year
            month
          }
          episodes
          siteUrl
          genres
          description
          siteUrl
          title {
            romaji
            english
          }
          bannerImage
          coverImage {
            large
          }
        }
      } 
    }
  `;

  export var vars = {
    page: ccurrentpage,
    genre: localStorageData[0].genres,
    exGenre: localStorageData[0].excludedGenres,
    tag: localStorageData[0].tags,
    exTag: localStorageData[0].excludedTags,
    ep_greater: localStorageData[0].epMin,
    ep_lesser: localStorageData[0].epMax,
    score_greater: localStorageData[0].scoreMin,
    score_lesser: localStorageData[0].scoreMax,
    year_greater: localStorageData[0].yearMin,
    year_lesser: localStorageData[0].yearMax,
  }; 
 