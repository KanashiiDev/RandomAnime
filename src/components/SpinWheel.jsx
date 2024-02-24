import {
  Container,
  Heading,
  Button,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import Filter from "../components/filter";
import { React, useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { Wheel } from "spin-wheel";
import { animedataDefault, props } from "../data/spinWheelItems.js";
import { randomizeNumber, truncate, QuerydefaultOptions, randomizeDiffNumbers, tagFix } from "../data/FuncOptions.js";
import Result from "./Result.jsx";

let animedata = animedataDefault;
let apiresponse;
let currentpage = 1;
let randList = [];
// API QUERY Options
let localStorageData;

//Api Query
async function apireq() {
  localStorageData = JSON.parse(localStorage.getItem("RandAniF"));
  if (localStorageData) {
    let g = localStorageData[0].genres == "" ? "" : "$genre: [String]";
    let g2 = localStorageData[0].genres == "" ? "" : "genre_in: $genre";
    let exg = localStorageData[0].excludedGenres == "" ? "" : "$exGenre: [String]";
    let exg2 = localStorageData[0].excludedGenres == "" ? "" : "genre_not_in: $exGenre";
    let tg = localStorageData[0].tags == "" ? "" : "$tag: [String]";
    let tg2 = localStorageData[0].tags == "" ? "" : "tag_in: $tag";
    let extg = localStorageData[0].excludedTags == "" ? "" : "$exTag: [String]";
    let extg2 = localStorageData[0].excludedTags == "" ? "" : "tag_not_in: $exTag";
    const apolloClient = new ApolloClient({
      uri: "https://graphql.anilist.co",
      cache: new InMemoryCache(),
      defaultOptions: QuerydefaultOptions,
    });
    //async () => apolloClient.resetStore();
    const GET_ANIME_PAGE = gql`
      query (
        $id: Int
        $page: Int
        ${g}
        ${exg}
        ${tg}
        ${extg}
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
            ${g2}
            ${exg2}
            ${tg2}
            ${extg2}
            format_in: [TV, MOVIE, ONA]
            averageScore_lesser: $score_lesser
            averageScore_greater: $score_greater
            episodes_lesser: $ep_lesser
            episodes_greater: $ep_greater
            startDate_lesser: $year_lesser
            startDate_greater: $year_greater
            
          ) {
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
      }
    `;
    //API Request
    try {
      const response = await apolloClient.query({
        query: GET_ANIME_PAGE,
        variables: {
          page: currentpage,
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
        },
      });
      if (!response || !response.data) throw new Error("Cannot get anime list!");

      apiresponse = await response.data.Page;
      if (apiresponse.media.length > 0) {
        document.querySelector(".wheel-button-next").style.display = apiresponse && apiresponse.pageInfo.hasNextPage ? "block" : "none";
        document.querySelector(".wheel-button-edit").style.width = apiresponse && apiresponse.pageInfo.hasNextPage ? "49%" : "100%";
        randList = await randomizeDiffNumbers(await apiresponse.media.length, 21);
      }
    } catch (err) {
      document.querySelector(".wheel-alert").innerHTML = "Not Found";
      document.querySelector(".wheel-alert").classList.add("error");
      throw err;
    }
  }
}

//Load Spin Wheel
async function loadw() {
  if (once == 1) {
    if (w) {
      animedata = animedataDefault;
      await apireq();
      let prop = props;
      if (!apiresponse || apiresponse.media.length === 0) {
        document.querySelector(".wheel-alert").innerHTML = "Not Found";
        document.querySelector(".wheel-alert").classList.add("error");
        return;
      } else {
        document.querySelector(".wheel-alert").innerHTML = "";
        document.querySelector(".wheel-alert").classList.remove("error");
      }
      if (apiresponse.media.length < 21) {
        prop.items = prop.items.slice(0, apiresponse.media.length);
      }
      let apires;
      for (let i = 0; i < prop.items.length; i++) {
        apires = apiresponse.media[randList[i]];
        prop.items[i].label = truncate(apires.title.romaji, 25);
        prop.items[i].image = apires.coverImage.large;
        animedata[i].name = apires.title.romaji;
        animedata[i].nameEng = apires.title.english;
        animedata[i].format = apires.format;
        animedata[i].image = apires.coverImage.large;
        animedata[i].bannerImage = apires.bannerImage;
        animedata[i].genres = apires.genres ? apires.genres.toString().split(",").join(", ") : " ";
        animedata[i].tags = apires.tags
          ? apires.tags
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
          : " ";
        animedata[i].desc = apires.description;
        animedata[i].siteUrl = apires.siteUrl;
        animedata[i].idMal = apires.idMal;
        animedata[i].trailer = apires.trailer;
        animedata[i].averageScore = apires.averageScore;
        animedata[i].duration = apires.duration;
        animedata[i].source = apires.source !== null ? apires.source.replace(/_/g, " ") : " ";
        animedata[i].startDate = apires.startDate;
        animedata[i].episodes = apires.episodes;
        animedata[i].source = animedata[i].source;
        animedata[i].studios = apires.studios.nodes
          ? apires.studios.nodes
              .map((node) => node.name)
              .toString()
              .split(",")
              .join(", ")
          : " ";
      }
      w.init(prop);
      w.isInteractive = false;
      return;
    }
    const wheeldiv = document.querySelector(".wheel-wrapper");
    for (let i = 0; i < props.items.length; i++) {
      props.items[i].label = truncate(props.items[i].label, 25);
    }

    w = new Wheel(wheeldiv, props);
    w.isInteractive = false;
  }
  once++;
}

//Spin Wheel Props
let once = 0;
let w;

//Main
export default function SpinWheel() {
  const [SpinWinner, setSpinWinner] = useState(0);
  const [spinDisabled, setspinDisabled] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure();

  //Load Spin Wheel on Start
  useEffect(() => {
    w = null;
    once = 0;
    setTimeout(() => {
      loadw();
    }, 50);
  }, []);
  useEffect(() => {
    if (w && spinDisabled) {
      w.spinToItem(SpinWinner, 4000, false, 3);
    }
  }, [SpinWinner]);

  return (
    <Container zIndex='1' className='main filter' p='20px' borderRadius='10px' background='none'>
      <Heading p='5px' textAlign='center'>
        Random Spin Wheel
      </Heading>
      <Text textAlign='center' pb='10px'>
        Spin for Random Anime!
      </Text>
      <Container
        display='flex'
        justifyContent='center'
        alignContent='center'
        my='10px'
        p='20px'
        pt='0px'
        borderRadius='10px'
        className='wheel-wrapper'
        ml='-60px'
        maxH='600px'
        h='580px'
        minW='600px'
        w='600px'></Container>
      <Text className='wheel-alert' mt='363px' ml='190px' position='absolute'></Text>
      <Button
        isDisabled={spinDisabled}
        className='wheel-button'
        onClick={async () => {
          setspinDisabled(true);
          setSpinWinner(randomizeNumber(animedata.length));
          setTimeout(() => {
            setspinDisabled(false);
            onOpen2();
          }, 4000);
        }}>
        Spin
      </Button>
      <Flex justifyContent='space-between'>
        <Button
          isDisabled={spinDisabled}
          mt='10px'
          w='100%'
          className='wheel-button-edit'
          onClick={() => {
            onOpen(),
              setTimeout(() => {
                let sub = document.querySelector(".submit");
                if (sub) {
                  sub.addEventListener("click", function () {
                    onClose();
                    once = 1;
                    currentpage = 1;
                    loadw();
                  });
                }
                clearTimeout();
              }, 1000);
          }}>
          Edit
        </Button>
        <Button
          w='49%'
          background='#6b83a1'
          display={apiresponse && apiresponse.pageInfo.hasNextPage ? "block" : "none"}
          isDisabled={spinDisabled}
          mt='10px'
          className='wheel-button-next'
          onClick={() => {
            once = 1;
            currentpage += 1;
            loadw();
          }}>
          Next
        </Button>
      </Flex>
      <Modal isOpen={isOpen2} onClose={onClose2}>
        <ModalOverlay />
        <ModalContent className='spin-filter-modal' maxW='550px'>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Result
              animedata2={async () => {
                await animedata[SpinWinner];
              }}>
              {animedata[SpinWinner]}
            </Result>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent className='spin-filter-modal' maxW='550px'>
          <ModalHeader>Edit Spin Wheel</ModalHeader>
          <ModalCloseButton
            onClick={() => {
              once = 1;
              loadw();
            }}
          />
          <ModalBody>
            <Filter spin={true}> </Filter>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
