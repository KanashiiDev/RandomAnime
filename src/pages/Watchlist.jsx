import { Heading, Flex, Text } from "@chakra-ui/react";
import WatchList from "../components/WatchList";

export default function Watchlist() {
  let localStorageRaw = localStorage.getItem("RandAniS");
  let localStorageSave;

  try {
    localStorageSave = localStorageRaw ? JSON.parse(localStorageRaw) : [];
  } catch (e) {
    localStorageSave = [];
  }

  const array = Array.isArray(localStorageSave) && localStorageSave[0]?.name ? localStorageSave : [];

  return (
    <div>
      <Heading color='#d1d1d1' p='5px' mt='25px' mb='10px' textAlign='center'>
        My Watch List
      </Heading>
      <Flex justifyContent='center'>
        {array.length > 0 ? (
          <WatchList animeList={array} />
        ) : (
          <Text color="#ccc" fontSize="lg" mt="40px" textAlign="center">
            No saved anime in your watchlist yet.
          </Text>
        )}
      </Flex>
    </div>
  );
}
