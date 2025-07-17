import { useState, useEffect } from "react";
import { Container, Heading, Button, Text, Box, Flex, SimpleGrid, Image, useToast, Spinner } from "@chakra-ui/react";
import MarkdownView from "react-showdown";
import { SiAnilist, SiMyanimelist, SiYoutube } from "react-icons/si";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { ytopts } from "../data/FuncOptions.js";
import YouTube from "react-youtube";
export default function Result(animedata2) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const toast = useToast();
  let animedata = animedata2.children && animedata2.children[0] ? animedata2.children[0] : animedata2.children ? animedata2.children : animedata2;
  useEffect(() => {
    if (!animedata) return;

    const localStorageSave = JSON.parse(localStorage.getItem("RandAniS")) || [];
    const alreadySaved = localStorageSave.some((item) => item.name === animedata.name);
    setBookmarked(alreadySaved);
    setShowTrailer(false);
    setCoverLoaded(false);
    setBannerLoaded(false);
  }, [animedata]);

  const handleBookmarkToggle = async () => {
    let localStorageSave = JSON.parse(localStorage.getItem("RandAniS")) || [];
    let updatedList;

    const alreadySaved = localStorageSave.some((item) => item.name === animedata.name);

    if (alreadySaved) {
      updatedList = localStorageSave.filter((item) => item.name !== animedata.name);
      setBookmarked(false);
      toast({
        title: "Removed from Watchlist",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    } else {
      updatedList = [...localStorageSave, animedata];
      setBookmarked(true);
      toast({
        title: "Saved to Watchlist",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }

    localStorage.setItem("RandAniS", JSON.stringify(updatedList));
  };
  const Section = ({ title, content, children }) => (
    <>
      <Heading mt='15px' as='h4' size='md'>
        {title}
      </Heading>
      {content || children}
    </>
  );

  const ActionButton = ({ color, icon, label, onClick }) => (
    <Button w='100%' mt='10px' mb='10px' bg={color + ".700"} color='white' _hover={{ bg: color + ".600" }} leftIcon={icon} onClick={onClick}>
      {label}
    </Button>
  );

  if (animedata.name) {
    return (
      <Box>
        {/* Banner */}
        <Box position='relative' h='140px' w='100%' borderRadius='10px' overflow='hidden' boxShadow='0px 0px 10px #040404' opacity='0.35' zIndex='-1'>
          {!bannerLoaded && (
            <Flex position='absolute' top='0' left='0' right='0' bottom='0' align='center' justify='center' bg='blackAlpha.300'>
              <Spinner size='lg' color='whiteAlpha.800' />
            </Flex>
          )}
          <Image
            className='bannerImage'
            src={animedata.bannerImage || "https://anilist.co/img/icons/icon.svg"}
            fallbackSrc='https://anilist.co/img/icons/icon.svg'
            h='140px'
            w='100%'
            objectFit={animedata.bannerImage ? "cover" : "contain"}
            borderRadius='10px'
            display={bannerLoaded ? "block" : "none"}
            onLoad={() => setBannerLoaded(true)}
            onError={() => setBannerLoaded(true)}
          />
        </Box>

        {/* Header Info */}
        <Flex gap='20px' mt='-130px' ml='15px' className='Image' textAlign='center' w='95%' position='relative'>
          <Button _hover={{ background: "none" }} pos='absolute' background='none' maxW='10px' maxH='15px' margin='0' padding='0' color='#dadada' right='-15px' onClick={handleBookmarkToggle}>
            {bookmarked ? <IoBookmark /> : <IoBookmarkOutline />}
          </Button>
          <Box position='relative' h='120px' w='80px' borderRadius='10px' overflow='hidden'>
            {!coverLoaded && (
              <Flex position='absolute' top='0' left='0' right='0' bottom='0' align='center' justify='center' bg='blackAlpha.300'>
                <Spinner size='sm' color='whiteAlpha.800' />
              </Flex>
            )}
            <Image
              src={animedata.image || "https://anilist.co/img/icons/icon.svg"}
              fallbackSrc='https://anilist.co/img/icons/icon.svg'
              h='120px'
              w='80px'
              borderRadius='10px'
              objectFit={animedata.image ? "cover" : "contain"}
              display={coverLoaded ? "block" : "none"}
              onLoad={() => setCoverLoaded(true)}
              onError={() => setCoverLoaded(true)}
            />
          </Box>
          <Flex flexDir='column' textAlign='start'>
            <Heading color='#e6e6e6' fontSize='1.3rem' mt='5px'>
              {animedata.name}
            </Heading>
            {animedata.nameEng && (
              <Text className='engName' mb='5px'>
                "{animedata.nameEng}"
              </Text>
            )}
            <Text>{animedata.format}</Text>
          </Flex>
        </Flex>

        {/* Main Info */}
        {bannerLoaded && coverLoaded ? (
          <Container className='DataMain' maxW='100%' flex='1' mt="20px">
            <Section title='Genres' content={animedata.genres} />
            <Section title='Description' content={<MarkdownView markdown={animedata.description} />} />
            <Section title='More Information'>
              <SimpleGrid my='10px' columns={3} spacing={5}>
                {[
                  ["Avg. Score", animedata.averageScore],
                  ["Release Date", `${animedata.startDate?.month}/${animedata.startDate?.year}`],
                  ["Episodes", animedata.episodes],
                  ["Eps. Duration", `${animedata.duration} mins`],
                  ["Studio", animedata.studios],
                  animedata.source && ["Source", animedata.source],
                ]
                  .filter(Boolean)
                  .map(([label, value]) => (
                    <Box key={label} className='box-details' transition='transform .3s' _hover={{ transform: "scale(1.1)" }}>
                      <Heading fontSize='1rem'>{label}</Heading>
                      <Text>{value}</Text>
                    </Box>
                  ))}
              </SimpleGrid>
            </Section>

            {/* Links */}
            <ActionButton color='blue' icon={<SiAnilist />} label='Anilist' onClick={() => window.open(animedata.siteUrl, "_blank", "noopener,noreferrer")} />
            {animedata.idMal && (
              <ActionButton
                color='blue'
                icon={<SiMyanimelist />}
                label='MyAnimeList'
                onClick={() => window.open(`https://myanimelist.net/anime/${animedata.idMal}`, "_blank", "noopener,noreferrer")}
              />
            )}

            {/* Trailer */}
            {animedata.trailer?.id && (
              <>
                <Heading my='10px' as='h4' size='md'>
                  Trailer
                </Heading>

                {!showTrailer ? (
                  <ActionButton color='red' icon={<SiYoutube />} label='Youtube' onClick={() => setShowTrailer(true)}>
                    Show Trailer
                  </ActionButton>
                ) : (
                  <Container p='0' overflow='hidden' h='390px' w='430px' borderRadius='10px' mb='10px'>
                    <YouTube videoId={animedata.trailer.id} opts={ytopts} />
                  </Container>
                )}
              </>
            )}

            {/* Tags */}
            {Array.isArray(animedata.tags) && animedata.tags.length > 0 && (
              <>
                <Heading as='h4' size='md'>
                  Tags
                </Heading>
                <div className='tags'>
                  {animedata.tags.map((tag) => (
                    <div key={tag.name} className='tag'>
                      <a href={`https://anilist.co/search/anime?genres=${encodeURIComponent(tag.name)}`} target='_blank' rel='noopener noreferrer'>
                        <div className='tag-name'>{tag.name.replace(/'/g, " ")}</div>
                      </a>
                      <div className='tag-percent'>({tag.rank}%)</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Container>
        ) : (
          <Flex justify='center' align='center' h='200px'>
            <Spinner size='lg' color='blue.400' />
          </Flex>
        )}
      </Box>
    );
  }
}
