export const media = [
  {
    id: 145665,
  },
  {
    id: 10087,
  },
  {
    id: 101347,
  },
  {
    id: 160188,
  },
  {
    id: 106286,
  },
  {
    id: 113596,
  },
  {
    id: 20954,
  },
  {
    id: 142770,
  },
  {
    id: 99750,
  },
  {
    id: 21049,
  },
  {
    id: 120377,
  },
  {
    id: 151970,
  },
  {
    id: 154587,
  },
  {
    id: 116589,
  },
  {
    id: 98202,
  },
  {
    id: 21827,
  },
  {
    id: 101921,
  },
  {
    id: 269,
  },
  {
    id: 16498,
  },
  {
    id: 2167,
  },
  {
    id: 101922,
  },
  {
    id: 133965,
  },
  {
    id: 5114,
  },
  {
    id: 113415,
  },
  {
    id: 14813,
  },
  {
    id: 99468,
  },
  {
    id: 113717,
  },
  {
    id: 103572,
  },
  {
    id: 127230,
  },
  {
    id: 140960,
  },
  {
    id: 130003,
  },
  {
    id: 125206,
  },
  {
    id: 108465,
  },
  {
    id: 150672,
  },
  {
    id: 103302,
  },
  {
    id: 116267,
  },
  {
    id: 20665,
  },
  {
    id: 130298,
  },
  {
    id: 21507,
  },
  {
    id: 148969,
  },
  {
    id: 159831,
  },
  {
    id: 105334,
  },
  {
    id: 124080,
  },
  {
    id: 18153,
  },
  {
    id: 20447,
  },
  {
    id: 120646,
  },
  {
    id: 128893,
  },
  {
    id: 155783,
  },
  {
    id: 7674,
  },
  {
    id: 21202,
  },
  {
    id: 21234,
  },
  {
    id: 20657,
  },
  {
    id: 21495,
  },
  {
    id: 99578,
  },
  {
    id: 6045,
  },
  {
    id: 120120,
  },
  {
    id: 20997,
  },
  {
    id: 99423,
  },
  {
    id: 14075,
  },
  {
    id: 9919,
  },
  {
    id: 141911,
  },
  {
    id: 153152,
  },
  {
    id: 101310,
  },
  {
    id: 21196,
  },
  {
    id: 98659,
  },
  {
    id: 151806,
  },
  {
    id: 154965,
  },
  {
    id: 114535,
  },
  {
    id: 127911,
  },
  {
    id: 114065,
  },
  {
    id: 20596,
  },
  {
    id: 11887,
  },
  {
    id: 20527,
  },
  {
    id: 20829,
  },
  {
    id: 101291,
  },
  {
    id: 11887,
  },
];
export const ArrayDef = [
  {
    name: " ",
    nameEng: " ",
    siteUrl: " ", idMal: " ",
    image: " ",
    bannerImage: " ",
    genres: " ",
    tags: " ",
    studios: " ",
    desc: " ",
    trailer: " ",
    averageScore: " ",
    duration: " ",
    source: " ",
    startDate: { year: 0, month: " " },
  },
];
export const query = ` query ($id: Int, $page: Int) {
    Page(page: $page) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(id: $id) {
        id
        idMal
        format
        tags {
          isMediaSpoiler
          name
          rank
        }
        studios (isMain:true) {
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
  } `;
