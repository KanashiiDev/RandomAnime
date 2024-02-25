import React, { useState, useEffect } from "react";
import { Container, Heading, Button, Text, Box, Flex, SimpleGrid, Image } from "@chakra-ui/react";
import MarkdownView from "react-showdown";
import { SiAnilist, SiMyanimelist } from "react-icons/si";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { ytopts } from "../data/FuncOptions.js";
import YouTube from "react-youtube";
export default function Result(animedata2) {
  const [bookmarked, setBookmarked] = useState(false);
  let animedata =
    animedata2.children && animedata2.children[0] ? animedata2.children[0] : animedata2.children ? animedata2.children : animedata2;
  useEffect(() => {
    check();
  }, [animedata]);
  async function save() {
    let localStorageSave = JSON.parse(localStorage.getItem("RandAniS"));
    if (localStorageSave && localStorageSave[0] && localStorageSave[0].name) {
      if (!localStorageSave.some((item) => item.name === animedata.name)) {
        localStorageSave.push(animedata);
        localStorage.setItem("RandAniS", JSON.stringify(localStorageSave));
      } else {
        localStorageSave = localStorageSave.filter((item) => item.name !== animedata.name);
        localStorage.setItem("RandAniS", JSON.stringify(localStorageSave));
      }
    } else {
      localStorageSave = [animedata];
      localStorage.setItem("RandAniS", JSON.stringify(localStorageSave));
    }
  }
  async function check() {
    let localStorageSave = JSON.parse(localStorage.getItem("RandAniS"));
    if (localStorageSave &&  localStorageSave[0] && localStorageSave[0].name) {
      if (localStorageSave.some((item) => item.name === animedata.name)) {
        setBookmarked(true);
      } else {
        setBookmarked(false);
      }
    }
  }
  if (animedata.name) {
    return (
      <div>
        <Container
          boxShadow='0px 0px 10px #040404'
          className='banner'
          opacity='.35'
          pos='relative'
          zIndex='-1'
          h='140px'
          borderRadius='10px'
          p='0'
          w='100%'
          maxW='100%'>
          <Image
            className='bannerImage'
            h='140px'
            borderRadius='10px'
            objectFit='cover'
            src={animedata.bannerImage}
            w={animedata.bannerImage ? "100%" : "0px"}></Image>
        </Container>
        <Flex gap='20px' mt='-130px' ml='15px' className='Image' textAlign='center' w='95%'>
          <Button
            _hover={{ background: "none" }}
            pos='absolute'
            background='none'
            maxW='10px'
            maxH='10px'
            margin='0'
            padding='0'
            color='#dadada'
            right='24px'
            onClick={async () => {
              await save();
              await check();
            }}>
            {bookmarked ? <IoBookmark /> : <IoBookmarkOutline />}
          </Button>
          <Image h='120px' w='80px' borderRadius='10px' src={animedata.image}></Image>
          <Flex flexDir='column' textAlign='start'>
            <Heading color='#e6e6e6' fontSize='1.3rem' as='header' mt='5px'>
              {animedata.name}
            </Heading>
            <Text className='engName' display={animedata.nameEng ? "block" : "none"} mb='5px' as='span'>
              "{animedata.nameEng}"
            </Text>
            <Text>{animedata.format}</Text>
          </Flex>
        </Flex>
        <Container className='DataMain' maxW='100%'>
          <Heading mt='25px' as='h4' size='md'>
            Genres
          </Heading>
          <Text>{animedata.genres}</Text>
          <Heading mt='15px' as='h4' size='md'>
            Description
          </Heading>
          {<MarkdownView markdown={animedata.desc} />}
          <Heading mt='15px' as='h4' size='md'>
            More Information
          </Heading>
          <SimpleGrid my='10px' columns={3} spacing={5}>
            <Box className='box-details'>
              <Heading as='h5' fontSize='1rem'>
                Avg. Score
              </Heading>
              <Text>{animedata.averageScore}</Text>
            </Box>
            <Box className='box-details'>
              <Heading as='h5' fontSize='1rem'>
                Release Date
              </Heading>
              <Text>
                {animedata.startDate.month}/{animedata.startDate.year}
              </Text>
            </Box>
            <Box className='box-details'>
              <Heading as='h5' fontSize='1rem'>
                Episodes
              </Heading>
              <Text>{animedata.episodes}</Text>
            </Box>
            <Box className='box-details'>
              <Heading as='h5' fontSize='1rem'>
                Eps. Duration
              </Heading>
              <Text>{animedata.duration} mins</Text>
            </Box>
            <Box className='box-details'>
              <Heading as='h5' fontSize='1rem'>
                Studio
              </Heading>
              <Text>{animedata.studios}</Text>
            </Box>
            <Box visibility={animedata.source !== ""} className='box-details'>
              <Heading as='h5' fontSize='1rem'>
                Source
              </Heading>
              <Text>{animedata.source}</Text>
            </Box>
          </SimpleGrid>
          <Button
            w='100%'
            mb={animedata.idMal ? "0px" : "20px"}
            mt='10px'
            colorScheme='facebook'
            leftIcon={<SiAnilist />}
            onClick={() => window.open(animedata.siteUrl, "_blank", "noopener,noreferrer")}>
            Anilist
          </Button>
          {animedata.idMal && animedata.idMal !== " " ? (
            <Button
              w='100%'
              mb='20px'
              mt='10px'
              colorScheme='facebook'
              leftIcon={<SiMyanimelist />}
              onClick={() => window.open("https://myanimelist.net/anime/" + animedata.idMal, "_blank", "noopener,noreferrer")}>
              MyAnimeList
            </Button>
          ) : (
            ""
          )}

          <Heading my='10px' as='h4' size='md' display={animedata.trailer !== null && animedata.trailer !== " " ? "block" : "none"}>
            Trailer
          </Heading>
          <Container
            p='0'
            overflow='hidden'
            h='390px'
            w='430px'
            borderRadius='10px'
            mb='10px'
            display={animedata.trailer !== null && animedata.trailer !== " " ? "block" : "none"}>
            {animedata.trailer !== null && animedata.trailer !== " " ? (
              <YouTube
                videoId={animedata.trailer !== null && animedata.trailer !== " " ? animedata.trailer.id : "dQw4w9WgXcQ"}
                opts={ytopts}></YouTube>
            ) : (
              ""
            )}
          </Container>
          <Heading as='h4' size='md' display={animedata.tags !== undefined && animedata.tags !== " " ? "block" : "none"}>
            Tags
          </Heading>
          {<MarkdownView className='tags' markdown={animedata.tags} />}
        </Container>
      </div>
    );
  }
}
