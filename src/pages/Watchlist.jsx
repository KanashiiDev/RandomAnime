import React from 'react'
import {Heading,Flex} from "@chakra-ui/react";
import WatchList from '../components/WatchList'; 
export default function Watchlist() {
  let localStorageSave = JSON.parse(localStorage.getItem("RandAniS"));
  const array = localStorageSave[0] && localStorageSave[0].name ?  localStorageSave : [];
  return (
    <div>
      <Heading color="#d1d1d1" p='5px' mt="25px" mb="10px" textAlign='center'>
       My Watch List
      </Heading>
      <Flex justifyContent="center">
      <WatchList animeList={array} />
      </Flex>
    </div>
  );
};
