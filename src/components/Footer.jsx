import React from "react";
import { Box, Container, Flex, Heading, Text, Link } from "@chakra-ui/react";

export default function Footer() {
  const footer = {};
  return (
    <Flex sx={footer} as='footer' bg='#152232'>
      <Container pt='13px' maxWidth='1920px' width='800px'>
        <Text  textAlign='center' color='#bcbcbc'>
          All anime series names, images, and content are copyrighted content of their respective license holders. <br></br>
            I do not own the rights to any of these anime series. 
         Anime information compiled from <Link href='https://anilist.co/' isExternal>AniList</Link>.
        </Text>
        <Text textAlign='center' color='#bbb' p="13px" pt="6px">
          Created and open sourced by <Link href='https://github.com/KanashiiDev' isExternal> KanashiiDev.</Link> Licensed MIT.
        </Text>
 
      </Container>
    </Flex>
  );
}
