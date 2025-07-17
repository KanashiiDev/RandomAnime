import { Box, Container, Flex } from "@chakra-ui/react";
import SpinWheel from "../components/SpinWheel";
export default function Spinwheel() {
  return (
    <Container maxW='100%' p='0' minW='765px'>
      <Container className='main'> </Container>
      <Flex className='wheel-bg' justifyContent='center'>
        <Flex className='wheel-mask' p='20px'>
          <Box w='100vw' h='100vh' overflow='hidden' display='inline-table'>
            <SpinWheel />
          </Box>
        </Flex>
      </Flex>
    </Container>
  );
}
