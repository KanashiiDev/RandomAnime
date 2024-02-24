import {
  Container,
  FormLabel,
  FormControl,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Button,
  Text,
  Box,
  Flex,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import Select, { components } from "react-select";
import { genres, tags } from "../data/genre-tag.js";
import { useState, useEffect } from "react";
import { QuerydefaultOptions, randomizeDiffNumbers, tagFix } from "../data/FuncOptions.js";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { animeArrayDefault } from "../data/spinWheelItems.js";
import Result from "./Result.jsx";
let animedata = [];

export default function Filter({ spin }) {
  let apiresponse;
  let currentpage = 1;
  let apileng = 0;
  let localStorageData;

  //API Request
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
      //API Query
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
      //API Request Loop
      await get();
      async function get() {
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
          //Duplicate default array 50 times
          for (let i = 0; i < 50; i++) {
            const clone = { ...animeArrayDefault };
            animedata.push(clone);
          }
          apileng += response.data.Page.media.length;
          if (response.data.Page.pageInfo.currentPage === 1) {
            apiresponse = response.data.Page;
            load(true);
          } else {
            //Next Page and Current Page Info
            apiresponse.pageInfo.hasNextPage = response.data.Page.pageInfo.hasNextPage;
            apiresponse.pageInfo.currentPage = response.data.Page.pageInfo.currentPage;
          }
          //Has Next Page = True
          if (response.data.Page.pageInfo.hasNextPage === true) {
            apiresponse.media.push(...response.data.Page.media);
            load(true);
            setTimeout(() => {
              if (animedata[0] !== "exit") {
                currentpage++;
                return get();
              } else {
                return;
              }
            }, 2500);
          }
          //Has Next Page = False and Current Page > 1
          else {
            if (response.data.Page.pageInfo.currentPage > 1) {
              apiresponse.media.push(...response.data.Page.media);
              load(true);
            }
          }
        } catch (err) {
          throw err;
        }
      }
    }
  }
  const [anilength, setanilength] = useState(0);
  async function load(val) {
    let randList = [];
    let apires;

    //First Load
    if (!val) {
      animedata = [];
      currentpage = 1;
      apileng = 0;
      setResultAnime(0);
      await apireq();
      if (!apiresponse || apiresponse.media.length === 0) {
        return;
      }
    } else {
      await load2();
      //After Response Remove Empty Arrays
      async function load2() {
        if (
          (apiresponse.pageInfo.hasNextPage === false && apileng < 10) ||
          (apiresponse.pageInfo.hasNextPage === false && animedata.length > apileng)
        ) {
          animedata = animedata.slice(0, apileng);
        }
        randList = await randomizeDiffNumbers(animedata.length, animedata.length);
        await load3();
      }
      // Then add Anime to array
      async function load3() {
        setanilength(animedata.length);
        for (let i = 0; i < animedata.length; i++) {
          apires = apiresponse.media[randList[i]];
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
          animedata[i].studios = apires.studios.nodes
            ? apires.studios.nodes
                .map((node) => node.name)
                .toString()
                .split(",")
                .join(", ")
            : " ";
        }
      }
      onOpen();
    }
  }
  const [ResultAnime, setResultAnime] = useState(0);
  const selectStyles = {
    menu: () => ({
      position: "relative",
    }),
  };
  const now = new Date().getFullYear();
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const [s4, setS4] = useState(false);
  const [eps, setEps] = useState([1, 100]);
  const [scores, setScores] = useState([1, 10]);
  const [years, setYears] = useState([1970, now]);
  const [genre, setGenre] = useState([""]);
  const [exGenre, setExGenre] = useState([""]);
  const [genres2, setGenres2] = useState(genres);
  const [tag, setTag] = useState([""]);
  const [exTag, setExTag] = useState([""]);
  const [tags2, setTags2] = useState(tags);
  const [genreSelected, setGenreSelected] = useState([""]);
  const [CheckboxDisabled, setCheckboxDisabled] = useState(false);
  const [exGenreSelected, setExGenreSelected] = useState([""]);
  const [strictGenres, setstrictGenres] = useState(false);
  const [tagSelected, setTagSelected] = useState([""]);
  const [exTagSelected, setExTagSelected] = useState(["Hentai"]);
  const [collects, setCollects] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    setCheckboxDisabled(genre.length < 2 ? true : false);
    onSubmit();
  }, [genre, exGenre, tag, exTag, eps, scores, years, strictGenres]);
  //Form Submit Function
  function onSubmit() {
    if (strictGenres) {
      setExGenreSelected([]);
      genres2.forEach((e) => {
        setExGenreSelected((current) => [...current, e.value]);
      });
    }
    //set localstorage items
    setCollects([
      {
        genres: genreSelected,
        excludedGenres: exGenreSelected,
        tags: tagSelected,
        excludedTags: exTagSelected,
        epMin: eps[0],
        epMax: eps[1],
        scoreMin: scores[0] * 10,
        scoreMax: scores[1] * 10,
        yearMin: years[0].toString().padEnd(8, "0"),
        yearMax: years[1] === years[0] ? years[1].toString() + "1231" : years[1].toString().padEnd(8, "0"),
      },
    ]);
    return new Promise((resolve) => {
      if (collects.length > 0) {
        localStorage.setItem("RandAniF", JSON.stringify(collects, null, 1));
      }
      resolve();
    });
  }

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  // Select Open Handler
  const openHandler = async (sAct) => {
    const menuEl = document.querySelector(`#${sAct} .menu`);
    const menuElD = document.querySelector(`#${sAct} .dropdown`).parentElement;
    const menuElDD = document.querySelector(`#${sAct} .dropdown`).children[0];
    menuEl.classList.add("menu--open");
    menuElDD.style.transition = ".4s all ease-in-out";
    menuElDD.classList.add("rotate180");
    setTimeout(() => {
      menuEl.style.height = "280px";
      menuElD.addEventListener("click", function () {
        closeHandler(sAct);
      });
    }, 400);
  };
  // Select Close Handler
  const closeHandler = async (sAct) => {
    const menuEl = document.querySelector(`#${sAct} .menu`);
    const menuElD = document.querySelector(`#${sAct} .dropdown`).parentElement;
    const menuElDD = document.querySelector(`#${sAct} .dropdown`).children[0];
    menuEl.classList.remove("menu--open");
    menuElDD.classList.remove("rotate180");
    setTimeout(() => {
      menuEl.classList.add("menu--close");
      menuEl.addEventListener("animationend", function () {
        sAct === "s1" ? setS1(false) : sAct === "s2" ? setS2(false) : sAct === "s3" ? setS3(false) : sAct === "s4" ? setS4(false) : null;
        menuEl.style.height = "0px";
        menuElD.removeEventListener("click", function () {
          closeHandler();
        });
      });
    }, 5);
  };
  useEffect(() => {
    if (animedata && apiresponse && animedata.length > anilength) {
      animedata = animedata.slice(0, anilength);
    }
    if (ResultAnime + 1 > anilength) {
      setResultAnime(0);
    }
  }, [ResultAnime]);
  return (
    <Container className='main filter' p='20px' px='0' borderRadius='10px' background='none'>
      <Container mt='10px' p='20px' pt='0px' borderRadius='10px' bgColor='#283645'>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Genres */}
          <Box display='flex' gap='25px'>
            <FormControl py={4} id='genre'>
              <FormLabel>Genres</FormLabel>
              <Select
                styles={selectStyles}
                className='multiselect'
                isMulti
                options={genres}
                menuIsOpen={s1}
                value={genre}
                onChange={(e) => {
                  setGenre(e);
                  setGenres2(genres.filter((o2) => !e.includes(o2)));
                  setExGenre(exGenre.filter((o2) => !e.includes(o2)));
                  setGenreSelected([]);
                  e.forEach((e) => {
                    setGenreSelected((current) => [...current, e.value]);
                  });
                }}
                placeholder='All'
                id='s1'
                closeMenuOnSelect={false}
                onMenuOpen={async () => {
                  await setS1(true);
                  openHandler("s1");
                }}
                components={{
                  Menu: (props) => <components.Menu {...props} className='menu' height='0' />,
                  DropdownIndicator: (props) => <components.DropdownIndicator {...props} className='dropdown' />,
                  MenuList: (props) => <components.MenuList {...props} maxHeight='280px' />,
                }}
              />
            </FormControl>

            {/* Excluded Genres */}
            <FormControl py={4} id='exgenre'>
              <FormLabel> Excluded Genres</FormLabel>
              <Select
                styles={selectStyles}
                className='multiselect'
                isMulti
                options={genres2}
                value={exGenre}
                menuIsOpen={s2}
                onChange={(e) => {
                  setExGenre(e);
                  setExGenreSelected([]);

                  e.forEach((e) => {
                    setExGenreSelected((current) => [...current, e.value]);
                  });
                }}
                placeholder='None'
                id='s2'
                closeMenuOnSelect={false}
                onMenuOpen={async () => {
                  await setS2(true);
                  openHandler("s2");
                }}
                components={{
                  Menu: (props) => <components.Menu {...props} className='menu' height='0' />,
                  DropdownIndicator: (props) => <components.DropdownIndicator {...props} className='dropdown' />,
                  MenuList: (props) => <components.MenuList {...props} maxHeight='280px' />,
                }}
              />
            </FormControl>
          </Box>
          <Checkbox isDisabled={CheckboxDisabled} onChange={(e) => setstrictGenres(e.target.checked)}>
            {CheckboxDisabled ? "Strict Genres (Select at least 2 genres)" : "Strict Genres"}
          </Checkbox>
          {/* Tags */}
          <Box display='flex' gap='25px'>
            <FormControl py={4} id='tag'>
              <FormLabel>Tags</FormLabel>
              <Select
                styles={selectStyles}
                className='multiselect'
                isMulti
                options={tags}
                value={tag}
                menuIsOpen={s3}
                onChange={(e) => {
                  setTag(e);
                  setTags2(tags.filter((o2) => !e.includes(o2)));
                  setExTag(exTag.filter((o2) => !e.includes(o2)));
                  setTagSelected([]);

                  e.forEach((e) => {
                    setTagSelected((current) => [...current, e.value]);
                  });
                }}
                placeholder='All'
                id='s3'
                closeMenuOnSelect={false}
                onMenuOpen={async () => {
                  await setS3(true);
                  openHandler("s3");
                }}
                components={{
                  Menu: (props) => <components.Menu {...props} className='menu' height='0' />,
                  DropdownIndicator: (props) => <components.DropdownIndicator {...props} className='dropdown' />,
                  MenuList: (props) => <components.MenuList {...props} maxHeight='280px' />,
                }}
              />
            </FormControl>

            {/* Excluded Tags */}
            <FormControl py={4} id='extag'>
              <FormLabel> Excluded Tags</FormLabel>
              <Select
                styles={selectStyles}
                className='multiselect'
                isMulti
                options={tags2}
                value={exTag}
                menuIsOpen={s4}
                onChange={(e) => {
                  setExTag(e);
                  setExTagSelected([]);

                  e.forEach((e) => {
                    setExTagSelected((current) => [...current, e.value]);
                  });
                }}
                placeholder='None'
                id='s4'
                closeMenuOnSelect={false}
                onMenuOpen={async () => {
                  await setS4(true);
                  openHandler("s4");
                }}
                components={{
                  Menu: (props) => <components.Menu {...props} className='menu' height='0' />,
                  DropdownIndicator: (props) => <components.DropdownIndicator {...props} className='dropdown' />,
                  MenuList: (props) => <components.MenuList {...props} maxHeight='280px' />,
                }}
              />
            </FormControl>
          </Box>
          <Box display='flex' gap='60px'>
            {/* Episodes */}
            <FormControl id='eps'>
              <FormLabel>Episodes</FormLabel>
              {/* Episode Slider */}
              <RangeSlider aria-label={["min", "max"]} min={1} defaultValue={[1, 100]} onChange={(val) => setEps(val)}>
                <RangeSliderTrack bg='#1a2a3e'>
                  <RangeSliderFilledTrack bg='#42566f' />
                </RangeSliderTrack>
                <RangeSliderThumb boxSize={6} index={0}>
                  <Box />
                </RangeSliderThumb>
                <RangeSliderThumb boxSize={6} index={1}>
                  <Box />
                </RangeSliderThumb>
              </RangeSlider>

              {/* Episode Text */}
              <Flex justify='space-between'>
                <Text className='ep0'>{eps[0]}</Text>
                <Text className='ep1'>{eps[1] === 100 ? "100+" : eps[1]}</Text>
              </Flex>
            </FormControl>

            {/* Score */}
            <FormControl id='scores'>
              <FormLabel>Score</FormLabel>

              {/* Score Slider */}
              <RangeSlider
                aria-label={["min", "max"]}
                min={1}
                max={10}
                step={0.1}
                presicion={2}
                defaultValue={[1, 10]}
                onChange={(val) => setScores(val)}>
                <RangeSliderTrack bg='#1a2a3e'>
                  <RangeSliderFilledTrack bg='#42566f' />
                </RangeSliderTrack>
                <RangeSliderThumb boxSize={6} index={0}>
                  <Box />
                </RangeSliderThumb>
                <RangeSliderThumb boxSize={6} index={1}>
                  <Box />
                </RangeSliderThumb>
              </RangeSlider>

              {/* Score Text */}
              <Flex justify='space-between'>
                <Text className='score0'>{scores[0]}</Text>
                <Text className='score1'>{scores[1]}</Text>
              </Flex>
            </FormControl>

            {/* Year */}
            <FormControl id='years'>
              <FormLabel>Year</FormLabel>

              {/* Year Slider */}
              <RangeSlider aria-label={["min", "max"]} min={1970} max={now} defaultValue={[1970, now]} onChange={(val) => setYears(val)}>
                <RangeSliderTrack bg='#1a2a3e'>
                  <RangeSliderFilledTrack bg='#42566f' />
                </RangeSliderTrack>
                <RangeSliderThumb boxSize={6} index={0}>
                  <Box />
                </RangeSliderThumb>
                <RangeSliderThumb boxSize={6} index={1}>
                  <Box />
                </RangeSliderThumb>
              </RangeSlider>

              {/* Year Text */}
              <Flex justify='space-between'>
                <Text className='score0'>{years[0]}</Text>
                <Text className='score1'>{years[1]}</Text>
              </Flex>
            </FormControl>
          </Box>
          {/* Submit Button*/}
          <Button
            mt={4}
            w='100%'
            colorScheme='teal'
            isLoading={isSubmitting}
            type='submit'
            className='submit'
            onClick={
              //for SpinWheel Button
              spin
                ? onClose
                : async () => {
                    setResultAnime(ResultAnime + 1);
                    await load();
                  }
            }>
            Submit
          </Button>
        </form>
      </Container>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={() => {
          onClose();
          animedata = ["exit"];
        }}>
        <ModalOverlay />
        <ModalContent className='spin-filter-modal' maxW='650px'>
          <ModalHeader>
            Result
            {animedata.length > 0 ? (
              ""
            ) : (
              <Text fontSize='1rem' color='#e37373'>
                No anime was found that meets your search criteria.
              </Text>
            )}
            <Flex justify='space-between' mt='10px' display={animedata.length > 0 ? "flex" : "none"}>
              {/*Back Button*/}
              <Button
                display={ResultAnime === 0 ? "none" : "block"}
                className='wheel-button'
                w={ResultAnime === 0 ? "0%" : "49%"}
                mb='10px'
                h='35px'
                onClick={async () => {
                  setResultAnime(ResultAnime - 1);
                }}>
                Back
              </Button>
              {/*Next Button*/}
              <Button
                className='wheel-button'
                w={ResultAnime === 0 ? "100%" : "49%"}
                h='35px'
                onClick={async () => {
                  setResultAnime(ResultAnime + 1);
                }}>
                {ResultAnime + 1 === anilength ? "Back to First " : "Next "}({ResultAnime + 1 + "/" + anilength})
              </Button>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display={animedata.length > 0 ? "block" : "none"}>
            {/*Result*/}
            <Result
              animedata2={async () => {
                await animedata[ResultAnime];
              }}>
              {animedata[ResultAnime]}
            </Result>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
