import {
  Button,
  Flex,
  Heading,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import Result from "./Result.jsx";
import { React, useState, useEffect } from "react";
import MarkdownView from "react-showdown";
import { tagFix } from "../data/FuncOptions.js";
export default function AnimeDay() {
  const [animedata, setanimedata] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    get();
  }, []);
  async function get() {
    try {
      let response = await fetch("/dailyUpdateResult.json");
      let result = await response.json();
      let Array = [];
      await arrfix();
      async function arrfix() {
        Array.name = result.title.romaji;
        Array.nameEng = result.title.english;
        Array.image = result.coverImage.large;
        Array.bannerImage = result.bannerImage;
        Array.format = result.format;
        Array.genres = result.genres ? result.genres.toString().split(",").join(", ") : " ";
        Array.tags = result.tags
          ? result.tags
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
        Array.desc = result.description;
        Array.siteUrl = result.siteUrl;
        Array.idMal = result.idMal;
        Array.trailer = result.trailer;
        Array.averageScore = result.averageScore;
        Array.duration = result.duration;
        Array.source = result.source !== null ? result.source.replace(/_/g, " ") : " ";
        Array.startDate = result.startDate;
        Array.episodes = result.episodes;
        Array.studios = result.studios.nodes
          ? result.studios.nodes
              .map((node) => node.name)
              .toString()
              .split(",")
              .join(", ")
          : " ";
      }
      setanimedata(await Array);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <Flex
      justifyContent='center'
      bgRepeat='no-repeat'
      bgSize='cover'
      backgroundImage={animedata && animedata.bannerImage ? animedata.bannerImage : ""}
      height='420px'
      w='100%'
      minW='650px'>
      <Flex maxW='800px' overflow='hidden' borderTopRadius='10px' mt='auto' w='70%' minW='650px' height='100px' backgroundColor='#1f1f1fe3'>
        <Flex flexDir='column' background='#0c0c0c8f'>
          <Heading color='#e3e3e3' size='md' w='95px' p='10px' height='50px' textAlign='center' lineHeight='1.3'>
            Anime of The Day
          </Heading>
        </Flex>

        <Flex direction='column' w='84%'>
          <Heading h='30px' w='100%' color='#e3e3e3' size='mm' p='10px'>
            {animedata && animedata.name ? animedata.name : ""}
          </Heading>
          <Box color='#dadada' p='10px' height='60px' className='desc'>
            {<MarkdownView markdown={animedata && animedata.desc ? animedata.desc : ""} />}
          </Box>
        </Flex>
        <Button className='dayAnimeBtn' mb='10px' mt='auto' mx='10px' onClick={onOpen}>
          Details
        </Button>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent className='spin-filter-modal' maxW='550px'>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Result
              animedata2={async () => {
                await animedata;
              }}>
              {animedata}
            </Result>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
