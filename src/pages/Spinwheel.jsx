import React from "react";
import { Container, Heading, Text, Flex } from "@chakra-ui/react";
import SpinWheel from "../components/SpinWheel";
export default function Spinwheel() {
  return (
    <Container maxW='100%' p='0' minW="765px">
      <Container className='main'> </Container>
      <Flex className='wheel-bg' justifyContent='center'>
        <Flex className='wheel-mask' p='20px'>
          <SpinWheel />
        </Flex>
      </Flex>
    </Container>
  );
}
