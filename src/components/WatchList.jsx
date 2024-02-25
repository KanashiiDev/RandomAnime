import { React, useState, useEffect } from "react";
import {
  Container,
  Heading,
  Flex,
  Image,
  Text,
  Button,
  Grid,
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
const WatchList = ({ animeList }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [val, setval] = useState(0);

  return (
    <Grid justifyItems='center' templateColumns='1fr 1fr'>
      {animeList.map((anime, index) => (
        <Flex key={index} className='anime-box' width='400px' margin='10px' padding='10px' borderRadius='10px' background='#152232'>
          <Flex gap='10px' alignItems='center' className='Image' textAlign='center' w='100%' color='#c1c1c1'>
            <Image h='80px' w='60px' borderRadius='10px' src={anime.image}></Image>
            <Flex flexDir='column' textAlign='start' w='100%'>
              <Heading color='#e6e6e6' fontSize='1rem' as='header' mt='5px'>
                {anime.name}
              </Heading>
              <Text className='engName' visibility={anime.nameEng ? "visible" : "hidden"} mb='5px' as='span'>
                "{anime.nameEng}"
              </Text>
              <Flex justifyContent='space-between'>
                <Text>{anime.format} </Text>
                <Button
                  height='30px'
                  width='60px'
                  className='watchlistBtn'
                  onClick={async () => {
                    setval(index);
                    onOpen();
                  }}>
                  Details
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      ))}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent className='spin-filter-modal' maxW='550px'>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Result
              animedata2={async () => {
                {
                  await animeList[val];
                }
              }}>
              {animeList[val]}
            </Result>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Grid>
  );
};

export default WatchList;
