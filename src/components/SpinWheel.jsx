import { Heading, Box, Button, Text, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Spinner } from "@chakra-ui/react";
import Filter from "../components/Filter";
import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { Wheel } from "spin-wheel";
import { WHEEL_PROPERTIES as BASE_WHEEL_PROPERTIES } from "../data/spinWheelItems.js";
import { DEFAULT_ANIME_DATA as BASE_ANIME_DATA } from "../data/spinWheelItems.js";
import { getRandomNumber, truncateText, DEFAULT_QUERY_OPTIONS, getUniqueRandomNumbers, formatTag, loadImage, cloneWheelPropsPreservingImages } from "../data/FuncOptions.js";
import Result from "./Result.jsx";

let animeData = JSON.parse(JSON.stringify(BASE_ANIME_DATA));
let apiResponse;
let currentPage = 1;
let randList = [];
let wheelStatus = 0;
let wheel;
let localStorageData;

//Api Query
async function apiRequest() {
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
      defaultOptions: DEFAULT_QUERY_OPTIONS,
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
          page: currentPage,
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

      apiResponse = await response.data.Page;
      if (apiResponse.media.length > 0) {
        document.querySelector(".wheel-button-next").style.display = apiResponse && apiResponse.pageInfo.hasNextPage ? "block" : "none";
        document.querySelector(".wheel-button-edit").style.width = apiResponse && apiResponse.pageInfo.hasNextPage ? "49%" : "100%";
        randList = await getUniqueRandomNumbers(await apiResponse.media.length, 21);
      }
    } catch (err) {
      document.querySelector(".wheel-alert").innerHTML = "Not Found";
      document.querySelector(".wheel-alert").classList.add("error");
      throw err;
    }
  }
}

//Load Spin Wheel
async function loadWheel() {
  if (wheelStatus == 1) {
    if (wheel) {
      animeData = JSON.parse(JSON.stringify(BASE_ANIME_DATA));
      await apiRequest();
      let prop = cloneWheelPropsPreservingImages(BASE_WHEEL_PROPERTIES);
      if (!apiResponse || apiResponse.media.length === 0) {
        document.querySelector(".wheel-alert").innerHTML = "Not Found";
        document.querySelector(".wheel-alert").classList.add("error");
        return;
      } else {
        document.querySelector(".wheel-alert").innerHTML = "";
        document.querySelector(".wheel-alert").classList.remove("error");
      }
      const itemCount = Math.min(21, apiResponse.media.length);
      prop.items = prop.items.slice(0, itemCount);
      animeData = animeData.slice(0, itemCount);
      randList = await getUniqueRandomNumbers(apiResponse.media.length, itemCount);
      let apires;

      for (let i = 0; i < itemCount; i++) {
        apires = apiResponse.media[randList[i]];
        prop.items[i].label = truncateText(apires.title.romaji, 25);
        const img = await loadImage(apires.coverImage.large);
        prop.items[i].image = img;
        animeData[i].name = apires.title.romaji;
        animeData[i].nameEng = apires.title.english;
        animeData[i].format = apires.format;
        animeData[i].image = apires.coverImage.large;
        animeData[i].bannerImage = apires.bannerImage;
        animeData[i].genres = apires.genres ? apires.genres.toString().split(",").join(", ") : " ";
        (animeData[i].tags = apires.tags
          ? apires.tags
              .filter((tag) => !tag.isMediaSpoiler)
              .map((tag) => ({
                name: tag.name,
                rank: tag.rank,
              }))
          : []),
          (animeData[i].desc = apires.description);
        animeData[i].siteUrl = apires.siteUrl;
        animeData[i].idMal = apires.idMal;
        animeData[i].trailer = apires.trailer;
        animeData[i].averageScore = apires.averageScore;
        animeData[i].duration = apires.duration;
        animeData[i].source = apires.source !== null ? apires.source.replace(/_/g, " ") : " ";
        animeData[i].startDate = apires.startDate;
        animeData[i].episodes = apires.episodes;
        animeData[i].source = animeData[i].source;
        animeData[i].studios = apires.studios.nodes
          ? apires.studios.nodes
              .map((node) => node.name)
              .toString()
              .split(",")
              .join(", ")
          : " ";
      }
      wheel.init(prop);
      wheel.isInteractive = false;
      return;
    }
    const wheeldiv = document.querySelector(".wheel-wrapper");
    const initialProp = cloneWheelPropsPreservingImages(BASE_WHEEL_PROPERTIES);

    for (let i = 0; i < initialProp.items.length; i++) {
      initialProp.items[i].label = truncateText(initialProp.items[i].label, 25);
      initialProp.items[i].image = await loadImage(initialProp.items[i].image);
    }
    wheel = new Wheel(wheeldiv, initialProp);
    wheel.isInteractive = false;
  }
  wheelStatus++;
}

//Main
export default function SpinWheel() {
  const [SpinWinner, setSpinWinner] = useState(0);
  const [isSpinning, setisSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure();

  //Load Spin Wheel on Start
  useEffect(() => {
    wheel = null;
    wheelStatus = 0;
    setTimeout(() => {
      loadWheel();
    }, 50);
  }, []);
  useEffect(() => {
    if (wheel && isSpinning) {
      wheel.spinToItem(SpinWinner, 4000, false, 3);
    }
  }, [SpinWinner]);

  return (
    <Box zIndex='1' className='main filter' p='20px' borderRadius='10px' background='none' justifyContent='center' maxW='65%' maxH='65%' margin='auto'>
      <Heading p='5px' textAlign='center'>
        Random Spin Wheel
      </Heading>
      <Text textAlign='center' pb='10px'>
        Spin for Random Anime!
      </Text>
      <Box className='wheel-wrapper'></Box>
      <Text className='wheel-alert' left='46.5%' position='absolute'></Text>
      <Flex flexDirection={"column"} justifyContent={"center"} margin={"10px auto"} width={"50%"}>
        <Button
          isDisabled={isSpinning || isLoading}
          className='wheel-button'
          onClick={async () => {
            setisSpinning(true);
            setSpinWinner(getRandomNumber(animeData.length));
            setTimeout(() => {
              setisSpinning(false);
              onOpen2();
            }, 4000);
          }}>
          {isLoading ? <Spinner size='sm' color='white' /> : "Spin"}
        </Button>
        <Flex justifyContent='space-between'>
          <Button
            isDisabled={isSpinning || isLoading}
            mt='10px'
            w='100%'
            className='wheel-button-edit'
            onClick={() => {
              onOpen();

              const checkAndBindSubmit = () => {
                const submitButton = document.querySelector(".submit");

                if (!submitButton) {
                  setTimeout(checkAndBindSubmit, 100);
                  return;
                }

                submitButton.replaceWith(submitButton.cloneNode(true));
                const newButton = document.querySelector(".submit");

                newButton.addEventListener("click", async function () {
                  const current = JSON.stringify(JSON.parse(localStorage.getItem("RandAniF")));
                  const latest = JSON.stringify(localStorageData);

                  if (current !== latest) {
                    newButton.disabled = true;
                    newButton.textContent = "Loading...";

                    setIsLoading(true);
                    wheelStatus = 1;
                    currentPage = 1;
                    await loadWheel();
                    setIsLoading(false);

                    onClose();
                  }
                });
              };

              checkAndBindSubmit();
            }}>
            {isLoading ? <Spinner size='sm' color='white' /> : "Edit"}
          </Button>
          <Button
            w='49%'
            background='#6b83a1'
            display={apiResponse && apiResponse.pageInfo.hasNextPage ? "block" : "none"}
            isDisabled={isSpinning || isLoading}
            mt='10px'
            className='wheel-button-next'
            onClick={async () => {
              setIsLoading(true);
              wheelStatus = 1;
              currentPage += 1;
              await loadWheel();
              setIsLoading(false);
            }}>
            {isLoading ? <Spinner size='sm' color='white' /> : "Next"}
          </Button>
        </Flex>
      </Flex>
      <Modal isOpen={isOpen2} onClose={onClose2}>
        <ModalOverlay />
        <ModalContent className='result-modal'>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Result animeData={animeData[SpinWinner]}>{animeData[SpinWinner]}</Result>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal closeOnOverlayClick={true} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent className='result-modal'>
          <ModalHeader>Edit Spin Wheel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Filter spinMode={true}> </Filter>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
