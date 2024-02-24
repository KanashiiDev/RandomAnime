import { Container, Heading, Button, Text, Box, Flex,Image } from "@chakra-ui/react";
import Filter from "../components/filter";
import AnimeDay from "../components/AnimeDay";

export default function Home() {
  return (
    <Container  maxW='100%' p='0' minW='765px'>
 
      <AnimeDay />
      <Flex  background='#0a1625' color='#e3e3e3' alignContent='center' height='500px' w='100%' maxWidth='100%' minW='765px' pos="relative" overflow="hidden">
        <Container textAlign='center' width='70%' maxW='765px' minW='700px'  p='20px'>
          <Heading mt='30px' as='header' size='xl' mb='10px'>
            Welcome to Random Anime!
          </Heading>
          <Text size='md'>Looking for a new anime show to watch? Well, you've come to the right place! </Text>
          <Flex mt='45px'>
            <Container borderRadius='6px' background='#2a3748' w='200px' height='200px' p='6px'>
            <Image draggable={false} height="175px" ml="-93.3px" pos="absolute" src="..\img\homepng1.png"></Image>
            <Text fontSize="1.2rem" mb="5px"><b>Save It For Later</b></Text>
              <Text color="#ddd">
                If you see something you might want to check out later, save it to a watchlist and come back when you’re ready.
              </Text>
            </Container>
            <Container borderRadius='6px' background='#2a3748' w='200px' height='200px' p='6px'>
              <Text fontSize="1.2rem" mb="5px"><b>Genre Based List</b></Text>
              <Text color="#ddd">
                Choose what genres you like, or don't like, and only those anime will appear in your list. Or you can let fate decide for you by choosing "All" genres.
              </Text>
            </Container>
            <Container borderRadius='6px' background='#2a3748' w='200px' height='200px' p='6px'>
            <Image draggable={false} height="200px" ml="194px" mt="-10px" pos="absolute" src="..\img\homepng2.png"></Image>
            <Text fontSize="1.2rem" mb="5px"><b>Spin Wheel</b></Text>
              <Text color="#ddd">Spin the wheel to find a completely random anime, or update the settings so the random anime chosen better reflect your taste.
              </Text>
             
            </Container>
          </Flex>
        </Container>
      </Flex>
      <Flex className='filter-bg' justifyContent='center'>
        <Flex className='filter-mask' p='20px'>
        <Container className='main filter' p='20px' borderRadius='10px' background='none'>
        <Heading p='5px' textAlign='center'>
        Random Anime Generator
      </Heading>
      <Text textAlign='center' pb='10px'>
        Complete the form below to generate a list or single anime
      </Text>
      <Filter spin={false}> </Filter>
          </Container>
        </Flex>
      </Flex>
    </Container>
  );
}
