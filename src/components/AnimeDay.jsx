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
      let Array = [{}];
      await arrfix();
      async function arrfix() {
        Array[0].name = result.title.romaji;
        Array[0].nameEng = result.title.english;
        Array[0].image = result.coverImage.large;
        Array[0].bannerImage = result.bannerImage;
        Array[0].format = result.format;
        Array[0].genres = result.genres ? result.genres.toString().split(",").join(", ") : " ";
        Array[0].tags = result.tags
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
        Array[0].desc = result.description;
        Array[0].siteUrl = result.siteUrl;
        Array[0].idMal = result.idMal;
        Array[0].trailer = result.trailer;
        Array[0].averageScore = result.averageScore;
        Array[0].duration = result.duration;
        Array[0].source = result.source !== null ? result.source.replace(/_/g, " ") : " ";
        Array[0].startDate = result.startDate;
        Array[0].episodes = result.episodes;
        Array[0].studios = result.studios.nodes
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
      backgroundImage={animedata && animedata[0].bannerImage ? animedata[0].bannerImage : ""}
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
            {animedata && animedata[0].name ? animedata[0].name : ""}
          </Heading>
          <Box color='#dadada' p='10px' height='60px' className='desc'>
            {<MarkdownView markdown={animedata && animedata[0].desc ? animedata[0].desc : ""} />}
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
                await {animedata};
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
