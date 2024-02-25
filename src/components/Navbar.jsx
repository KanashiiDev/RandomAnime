import { Box, Flex, Heading, Button, Link } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  let navigate = useNavigate();
  function handleClick(page) {
    navigate(page);
  }

  const box = {
    p: "10px",
    alignSelf: "center",
    "& a": {
      color: "#d1d1d1",
      transition: ".5s",
    },
    "& a:hover": {
      color: "#a5c0e2",
    },
  };
  return (
    <Flex as='nav' bg='#152232' minW='765px'>
      <Heading color='#fff' p='10px'>
        RandomAni
      </Heading>
      <Box sx={box}>
        <Link _hover={{ textDecoration: "none" }} onClick={() => handleClick("/")}>
          Home
        </Link>
      </Box>
      <Box sx={box}>
        <Link _hover={{ textDecoration: "none" }} onClick={() => handleClick("/spinwheel")}>
          Spin Wheel
        </Link>
      </Box>
      <Box sx={box}>
        <Link _hover={{ textDecoration: "none" }} onClick={() => handleClick("/watchlist")}>
          Watch List
        </Link>
      </Box>
    </Flex>
  );
}
