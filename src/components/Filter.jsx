import {
  Container,
  FormLabel,
  FormControl,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Button,
  Text,
  Box,
  Flex,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import Select, { components } from "react-select";
import { GENRE_OPTIONS, TAG_OPTIONS } from "../data/genre-tag.js";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DEFAULT_QUERY_OPTIONS } from "../data/FuncOptions.js";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import Result from "./Result.jsx";

// Custom hook for managing filter state
const useFilterState = () => {
  const currentYear = new Date().getFullYear();

  const defaultFilters = {
    episodes: [1, 100],
    scores: [1, 10],
    years: [1970, currentYear],
    genres: [],
    excludedGenres: [],
    tags: [],
    excludedTags: [],
    strictGenres: false,
  };

  const savedFilters = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("RandAniF"));
      return saved?.[0] || defaultFilters;
    } catch {
      return defaultFilters;
    }
  }, []);

  const [filters, setFilters] = useState(() => {
    return {
      ...defaultFilters,
      ...savedFilters,
      genres: savedFilters.genres?.map((g) => ({ value: g, label: g })) || [],
      excludedGenres: savedFilters.excludedGenres?.map((g) => ({ value: g, label: g })) || [],
      tags: savedFilters.tags?.map((t) => ({ value: t, label: t })) || [],
      excludedTags: savedFilters.excludedTags?.map((t) => ({ value: t, label: t })) || [],
    };
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    localStorage.removeItem("RandAniF");
  }, []);

  return { filters, updateFilter, setFilters, resetFilters };
};

// Custom hook for API operations
const useAnimeAPI = () => {
  const [state, setState] = useState({
    animeData: [],
    currentPage: 1,
    apiResponse: null,
    isLoading: false,
    error: null,
  });

  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        uri: "https://graphql.anilist.co",
        cache: new InMemoryCache(),
        defaultOptions: DEFAULT_QUERY_OPTIONS,
      }),
    []
  );

  const buildGraphQLQuery = useCallback((filterData) => {
    const genreQuery = filterData.genres.length > 0 ? "$genre: [String]" : "";
    const genreFilter = filterData.genres.length > 0 ? "genre_in: $genre" : "";
    const excludedGenreQuery = filterData.excludedGenres.length > 0 ? "$exGenre: [String]" : "";
    const excludedGenreFilter = filterData.excludedGenres.length > 0 ? "genre_not_in: $exGenre" : "";
    const tagQuery = filterData.tags.length > 0 ? "$tag: [String]" : "";
    const tagFilter = filterData.tags.length > 0 ? "tag_in: $tag" : "";
    const excludedTagQuery = filterData.excludedTags.length > 0 ? "$exTag: [String]" : "";
    const excludedTagFilter = filterData.excludedTags.length > 0 ? "tag_not_in: $exTag" : "";

    return gql`
      query (
        $id: Int
        $page: Int
        ${genreQuery}
        ${excludedGenreQuery}
        ${tagQuery}
        ${excludedTagQuery}
        $score_lesser: Int
        $score_greater: Int
        $ep_lesser: Int
        $ep_greater: Int
        $year_lesser: FuzzyDateInt
        $year_greater: FuzzyDateInt
      ) {
        Page (page: $page) {
          pageInfo {
            currentPage 
            hasNextPage
          }
          media(
            id: $id
            type: ANIME
            ${genreFilter}
            ${excludedGenreFilter}
            ${tagFilter}
            ${excludedTagFilter}
            format_in: [TV, MOVIE, ONA]
            averageScore_lesser: $score_lesser
            averageScore_greater: $score_greater
            episodes_lesser: $ep_lesser
            episodes_greater: $ep_greater
            startDate_lesser: $year_lesser
            startDate_greater: $year_greater
          ) {
            id
            idMal
            format
            tags {
              isMediaSpoiler
              name
              rank
            }
            studios (isMain:true) {
              nodes {
                name
              }
            }
            trailer {
              site
              id
            }
            averageScore
            duration
            source
            startDate {
              year
              month
            }
            episodes
            siteUrl
            genres
            description
            title {
              romaji
              english
            }
            bannerImage
            coverImage {
              large
            }
          }
        } 
      }
    `;
  }, []);

  const transformAnimeData = useCallback((mediaItems) => {
    return mediaItems.map((item) => ({
      name: item.title.romaji,
      nameEng: item.title.english,
      format: item.format,
      image: item.coverImage.large,
      bannerImage: item.bannerImage,
      genres: item.genres ? item.genres.join(", ") : "",
      tags: item.tags
        ? item.tags
            .filter((tag) => !tag.isMediaSpoiler)
            .map((tag) => ({
              name: tag.name,
              rank: tag.rank,
            }))
        : [],
      description: item.description,
      siteUrl: item.siteUrl,
      idMal: item.idMal,
      trailer: item.trailer,
      averageScore: item.averageScore,
      duration: item.duration,
      source: item.source ? item.source.replace(/_/g, " ") : "",
      startDate: item.startDate,
      episodes: item.episodes,
      studios: item.studios.nodes ? item.studios.nodes.map((node) => node.name).join(", ") : "",
    }));
  }, []);
  const isCancelledRef = useRef(false);
  const fetchAnimeData = useCallback(
    async (filterData) => {
      isCancelledRef.current = false;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const query = buildGraphQLQuery(filterData);
        const variables = buildQueryVariables(filterData, 1);

        const response = await apolloClient.query({ query, variables });

        if (!response?.data?.Page) throw new Error("Cannot get anime list!");

        const transformedData = transformAnimeData(response.data.Page.media);

        if (!isCancelledRef.current) {
          setState((prev) => ({
            ...prev,
            animeData: transformedData,
            apiResponse: { media: response.data.Page.media, pageInfo: response.data.Page.pageInfo },
            currentPage: 1,
            isLoading: false,
          }));
        }
      } catch (error) {
        if (!isCancelledRef.current) {
          console.error("Error fetching anime data:", error);
          setState((prev) => ({
            ...prev,
            error: error.message,
            isLoading: false,
          }));
        }
      }
    },
    [apolloClient, buildGraphQLQuery, transformAnimeData]
  );

  const loadNextPage = useCallback(
    async (filterData) => {
      try {
        const nextPage = state.currentPage + 1;

        const query = buildGraphQLQuery(filterData);
        const variables = buildQueryVariables(filterData, nextPage);

        const response = await apolloClient.query({ query, variables });

        const moreData = transformAnimeData(response.data.Page.media);

        setState((prev) => ({
          ...prev,
          animeData: [...prev.animeData, ...moreData],
          currentPage: nextPage,
          apiResponse: {
            ...prev.apiResponse,
            media: [...(prev.apiResponse?.media || []), ...response.data.Page.media],
            pageInfo: response.data.Page.pageInfo,
          },
        }));
      } catch (error) {
        console.error("Error loading next page:", error);
      }
    },
    [apolloClient, state.currentPage, buildGraphQLQuery, transformAnimeData]
  );

  const cancelRequest = useCallback(() => {
    isCancelledRef.current = true;
  }, []);

  const resetData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      animeData: [],
      apiResponse: null,
      currentPage: 1,
      error: null,
    }));
  }, []);

  return {
    ...state,
    fetchAnimeData,
    loadNextPage,
    cancelRequest,
    resetData,
  };
};

// Değişkenleri hazırlayan fonksiyon
const buildQueryVariables = (filterData, page = 1) => {
  const variables = {
    page,
    genre: filterData.genres.length > 0 ? filterData.genres : undefined,
    exGenre: filterData.excludedGenres.length > 0 ? filterData.excludedGenres : undefined,
    tag: filterData.tags.length > 0 ? filterData.tags : undefined,
    exTag: filterData.excludedTags.length > 0 ? filterData.excludedTags : undefined,
    score_greater: filterData.scoreMin,
    score_lesser: filterData.scoreMax,
    year_greater: filterData.yearMin,
    year_lesser: filterData.yearMax,
  };

  if (filterData.episodeMin !== 1) {
    variables.ep_greater = filterData.episodeMin;
  }
  if (filterData.episodeMax !== 100) {
    variables.ep_lesser = filterData.episodeMax;
  }

  return variables;
};

// Reusable Select Component
const CustomSelect = ({ id, label, value, onChange, options, placeholder, isOpen, onMenuOpen, onMenuClose }) => {
  const selectStyles = {
    menu: () => ({
      position: "relative",
    }),
  };

  return (
    <FormControl py={4} id={id}>
      <FormLabel>{label}</FormLabel>
      <Select
        styles={selectStyles}
        className='multiselect'
        isMulti
        options={options}
        menuIsOpen={isOpen}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        closeMenuOnSelect={false}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        components={{
          Menu: (props) => <components.Menu {...props} className='menu' height='0' />,
          DropdownIndicator: (props) => <components.DropdownIndicator {...props} className='dropdown' />,
          MenuList: (props) => <components.MenuList {...props} maxHeight='280px' />,
        }}
      />
    </FormControl>
  );
};

// Reusable Range Slider Component
const RangeSliderField = ({ id, label, value, onChange, min, max, step = 1, formatValue = (val) => val }) => (
  <FormControl id={id}>
    <FormLabel>{label}</FormLabel>
    <RangeSlider aria-label={["min", "max"]} min={min} max={max} step={step} value={value} onChange={onChange}>
      <RangeSliderTrack bg='#1a2a3e'>
        <RangeSliderFilledTrack bg='#42566f' />
      </RangeSliderTrack>
      <RangeSliderThumb boxSize={6} index={0}>
        <Box />
      </RangeSliderThumb>
      <RangeSliderThumb boxSize={6} index={1}>
        <Box />
      </RangeSliderThumb>
    </RangeSlider>
    <Flex justify='space-between'>
      <Text>{formatValue(value[0])}</Text>
      <Text>{formatValue(value[1])}</Text>
    </Flex>
  </FormControl>
);

export default function Filter({ spinMode }) {
  const { filters, updateFilter, resetFilters } = useFilterState();
  const { animeData, isLoading, error, fetchAnimeData, cancelRequest, resetData, loadNextPage, apiResponse } = useAnimeAPI();
  const [resultIndex, setResultIndex] = useState(0);
  const [menuStates, setMenuStates] = useState({
    genres: false,
    excludedGenres: false,
    tags: false,
    excludedTags: false,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  // Memoized options for selects
  const availableGenreOptions = useMemo(() => GENRE_OPTIONS.filter((option) => !filters.genres.find((selected) => selected.value === option.value)), [filters.genres]);

  const availableTagOptions = useMemo(() => TAG_OPTIONS.filter((option) => !filters.tags.find((selected) => selected.value === option.value)), [filters.tags]);

  // Handle genre changes
  const handleGenreChange = useCallback(
    (selectedGenres) => {
      updateFilter("genres", selectedGenres);
      // Remove excluded genres that are now selected
      const filteredExcluded = filters.excludedGenres.filter((excluded) => !selectedGenres.find((selected) => selected.value === excluded.value));
      updateFilter("excludedGenres", filteredExcluded);
    },
    [updateFilter, filters.excludedGenres]
  );

  // Handle tag changes
  const handleTagChange = useCallback(
    (selectedTags) => {
      updateFilter("tags", selectedTags);
      // Remove excluded tags that are now selected
      const filteredExcluded = filters.excludedTags.filter((excluded) => !selectedTags.find((selected) => selected.value === excluded.value));
      updateFilter("excludedTags", filteredExcluded);
    },
    [updateFilter, filters.excludedTags]
  );

  // Handle strict genres
  const handleStrictGenres = useCallback(
    (isChecked) => {
      updateFilter("strictGenres", isChecked);
      if (isChecked) {
        // When strict genres is enabled, exclude all other genres
        const allOtherGenres = GENRE_OPTIONS.filter((option) => !filters.genres.find((selected) => selected.value === option.value));
        updateFilter("excludedGenres", allOtherGenres);
      } else {
        updateFilter("excludedGenres", []);
      }
    },
    [updateFilter, filters.genres]
  );

  // Prepare filter data for API
  const prepareFilterData = useCallback(() => {
    return {
      genres: filters.genres.map((g) => g.value),
      excludedGenres: filters.excludedGenres.map((g) => g.value),
      tags: filters.tags.map((t) => t.value),
      excludedTags: filters.excludedTags.map((t) => t.value),
      episodeMin: filters.episodes[0],
      episodeMax: filters.episodes[1],
      scoreMin: filters.scores[0] * 10,
      scoreMax: filters.scores[1] * 10,
      yearMin: filters.years[0].toString().padEnd(8, "0"),
      yearMax: filters.years[1] === filters.years[0] ? filters.years[1].toString() + "1231" : filters.years[1].toString().padEnd(8, "0"),
    };
  }, [filters]);

  // Handle form submission
  const [lastUsedFilterData, setLastUsedFilterData] = useState(null);
  const onSubmit = useCallback(async () => {
    const filterData = prepareFilterData();
    setLastUsedFilterData(filterData);
    localStorage.setItem("RandAniF", JSON.stringify([filterData], null, 2));

    if (!spinMode) {
      resetData();
      setResultIndex(0);
      await fetchAnimeData(filterData);
      onOpen();
    }
  }, [prepareFilterData, spinMode, resetData, fetchAnimeData, onOpen]);

  // Handle navigation
  const handleNext = useCallback(() => {
    setResultIndex((prev) => (prev + 1) % animeData.length);
  }, [animeData.length]);

  const handlePrevious = useCallback(() => {
    setResultIndex((prev) => (prev === 0 ? animeData.length - 1 : prev - 1));
  }, [animeData.length]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    cancelRequest();
    resetData();
    onClose();
  }, [cancelRequest, resetData, onClose]);

  // Reset result index when data changes
  useEffect(() => {
    if (animeData.length > 0 && resultIndex >= animeData.length) {
      setResultIndex(0);
    }
  }, [animeData.length, resultIndex]);

  const isCheckboxDisabled = filters.genres.length < 2;

  return (
    <Container className='main filter' p='20px' px='0' borderRadius='10px' background='none'>
      <Container mt='10px' p='20px' pt='0px' borderRadius='10px' bgColor='#283645'>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Genres Section */}
          <Box display='flex' gap='25px'>
            <CustomSelect
              id='genres'
              label='Genres'
              value={filters.genres}
              onChange={handleGenreChange}
              options={GENRE_OPTIONS}
              placeholder='All'
              isOpen={menuStates.genres}
              onMenuOpen={() => setMenuStates((prev) => ({ ...prev, genres: true }))}
              onMenuClose={() => setMenuStates((prev) => ({ ...prev, genres: false }))}
            />

            <CustomSelect
              id='excludedGenres'
              label='Excluded Genres'
              value={filters.excludedGenres}
              onChange={(value) => updateFilter("excludedGenres", value)}
              options={availableGenreOptions}
              placeholder='None'
              isOpen={menuStates.excludedGenres}
              onMenuOpen={() => setMenuStates((prev) => ({ ...prev, excludedGenres: true }))}
              onMenuClose={() => setMenuStates((prev) => ({ ...prev, excludedGenres: false }))}
            />
          </Box>

          <Checkbox isDisabled={isCheckboxDisabled} isChecked={filters.strictGenres} onChange={(e) => handleStrictGenres(e.target.checked)}>
            {isCheckboxDisabled ? "Strict Genres (Select at least 2 genres)" : "Strict Genres"}
          </Checkbox>

          {/* Tags Section */}
          <Box display='flex' gap='25px'>
            <CustomSelect
              id='tags'
              label='Tags'
              value={filters.tags}
              onChange={handleTagChange}
              options={TAG_OPTIONS}
              placeholder='All'
              isOpen={menuStates.tags}
              onMenuOpen={() => setMenuStates((prev) => ({ ...prev, tags: true }))}
              onMenuClose={() => setMenuStates((prev) => ({ ...prev, tags: false }))}
            />

            <CustomSelect
              id='excludedTags'
              label='Excluded Tags'
              value={filters.excludedTags}
              onChange={(value) => updateFilter("excludedTags", value)}
              options={availableTagOptions}
              placeholder='None'
              isOpen={menuStates.excludedTags}
              onMenuOpen={() => setMenuStates((prev) => ({ ...prev, excludedTags: true }))}
              onMenuClose={() => setMenuStates((prev) => ({ ...prev, excludedTags: false }))}
            />
          </Box>

          {/* Range Sliders */}
          <Box display='flex' gap='60px'>
            <RangeSliderField
              id='episodes'
              label='Episodes'
              value={filters.episodes}
              onChange={(value) => updateFilter("episodes", value)}
              min={1}
              max={100}
              formatValue={(val) => (val === 100 ? "100+" : val)}
            />

            <RangeSliderField id='scores' label='Score' value={filters.scores} onChange={(value) => updateFilter("scores", value)} min={1} max={10} step={0.1} />

            <RangeSliderField id='years' label='Year' value={filters.years} onChange={(value) => updateFilter("years", value)} min={1970} max={new Date().getFullYear()} />
          </Box>

          {/* Submit Button */}
          <Button mt={4} w='100%' colorScheme='teal' isLoading={isSubmitting || isLoading} type='submit' className='submit' onClick={spinMode ? onClose : undefined}>
            {isLoading ? "Loading..." : "Submit"}
          </Button>
          {/* Reset Button */}
          <Button
            mt={2}
            colorScheme='red'
            w='100%'
            onClick={() => {
              resetFilters();
            }}>
            Reset
          </Button>
        </form>
      </Container>

      {/* Results Modal */}
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent className='result-modal'>
          <ModalHeader>
            Result
            {error && (
              <Alert status='error' mt={2}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            {animeData.length === 0 && !isLoading && !error && (
              <Text fontSize='1rem' color='#e37373'>
                No anime was found that meets your search criteria.
              </Text>
            )}
            {animeData.length > 0 && (
              <Flex justify='space-between' mt='10px'>
                <Button display={resultIndex === 0 ? "none" : "block"} className='wheel-button' w={resultIndex === 0 ? "0%" : "49%"} mb='10px' h='35px' onClick={handlePrevious}>
                  Back
                </Button>
                <Button
                  className='wheel-button'
                  w={resultIndex === 0 ? "100%" : "49%"}
                  h='35px'
                  onClick={async () => {
                    if (resultIndex + 1 >= animeData.length) {
                      if (lastUsedFilterData && apiResponse?.media?.length && apiResponse?.pageInfo?.hasNextPage !== false) {
                        const oldLength = animeData.length;
                        await loadNextPage(lastUsedFilterData);
                        setResultIndex(oldLength);
                        return;
                      }
                    }
                    setResultIndex((prev) => prev + 1);
                  }}>
                  {resultIndex + 1 === animeData.length ? (apiResponse?.pageInfo?.hasNextPage !== false ? "Load More" : "Back to First") : `Next (${resultIndex + 1}/${animeData.length})`}
                </Button>
              </Flex>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display={animeData.length > 0 ? "block" : "none"}>{animeData[resultIndex] && <Result>{animeData[resultIndex]}</Result>}</ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
