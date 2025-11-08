import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import SkeletonLoaderList from "./HouseSkeleton";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchRowsWithOptions } from "../../api/apiRooms";
import { useDispatch, useSelector } from "react-redux";
import { setMinimize, setStartScroll } from "../../redux/AppSlice";
import { setActiveInput } from "../../redux/mainFormSlice";
import { deleteFavorite, saveFavorite } from "../../api/apiAuthentication";

import HouseCard from "./RoomsDesktop";

const ContinueExploring = ({
  selectedIcon,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  showMore,
}) => {
  return (
    <div className="w-full flex flex-col mt-10 gap-y-2 justify-center items-center h-20">
      <span className="text-lg font-medium">
        {`Continue exploring ${selectedIcon} ${selectedIcon?.endsWith("s") ? "" : "homes"}`}
      </span>
      <button
        className={`bg-black text-white h-12 w-32 rounded-lg ${isFetchingNextPage ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={() => {
          fetchNextPage();
          showMore.current = false;
        }}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? "Loading..." : "Show More"}
      </button>
    </div>
  );
};

const SkeletonGrid = ({ itemCount = 9, gridClasses = "" }) => {
  return (
    <div className={`grid gap-x-6 mt-5 ${gridClasses} grid-cols-3 gap-y-6`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div
          key={index}
          className="skeleton rounded-1xl aspect-square skeleton-item"
        ></div>
      ))}
    </div>
  );
};

const IMAGE_WIDTH = 301.91;
const ITEMS_PER_PAGE = 9; // <-- force 9 items per link

const useFavoriteEffect = (
  itemId,
  userData,
  isFavorite,
  saveFavorite,
  deleteFavorite
) => {
  useEffect(() => {
    const handleFavoriteUpdate = async () => {
      if (!itemId || !userData) return;

      if (isFavorite) {
        await saveFavorite(itemId);
      } else {
        await deleteFavorite(itemId);
      }
    };

    handleFavoriteUpdate();
  }, [itemId, userData, isFavorite, saveFavorite, deleteFavorite]);
};

const useScrollPositions = (houseListingData) => {
  const [localScrollPositions, setLocalScrollPositions] = useState({});

  useEffect(() => {
    if (!houseListingData) return;

    const initialScrollPositions = {};
    houseListingData.pages.forEach((page) => {
      page.forEach((item) => {
        initialScrollPositions[item.id] = {
          isAtStart: true,
          isAtEnd: false,
        };
      });
    });
    setLocalScrollPositions(initialScrollPositions);
  }, [houseListingData]);

  return [localScrollPositions, setLocalScrollPositions];
};

const useWindowScrollEffect = (handleWindowScroll) => {
  useEffect(() => {
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [handleWindowScroll]);
};

const useScrollRestoration = (selectedIcon, startScroll) => {
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useLayoutEffect(() => {
    if (!startScroll) window.scrollTo(0, 10);
  }, [selectedIcon, startScroll]);
};

const useCustomEffects = ({
  itemId,
  userData,
  isFavorite,
  saveFavorite,
  deleteFavorite,
  houseListingData,
  handleWindowScroll,
  selectedIcon,
  startScroll,
  showMore,
}) => {
  const [localScrollPositions, setLocalScrollPositions] =
    useScrollPositions(houseListingData);

  useFavoriteEffect(itemId, userData, isFavorite, saveFavorite, deleteFavorite);
  useWindowScrollEffect(handleWindowScroll);
  useScrollRestoration(selectedIcon, startScroll);

  useEffect(() => {
    showMore.current = true;
  }, [selectedIcon, showMore]);

  return {
    showMore,
    localScrollPositions,
    setLocalScrollPositions,
  };
};

const useItemScroll = (setLocalScrollPositions, houseImagesRefs) => {
  const handleScroll = useCallback(
    (itemId) => {
      const container = houseImagesRefs.current[itemId];
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setLocalScrollPositions((prev) => ({
          ...prev,
          [itemId]: {
            isAtStart: scrollLeft === 0,
            isAtEnd: Math.abs(scrollWidth - clientWidth - scrollLeft) < 1,
          },
        }));
      }
    },
    [setLocalScrollPositions, houseImagesRefs]
  );

  const handleScrollBtn = useCallback(
    (e, direction, itemId) => {
      e.preventDefault();
      e.stopPropagation();
      const container = houseImagesRefs.current[itemId];

      if (container) {
        const scrollAmount = direction === "right" ? IMAGE_WIDTH : -IMAGE_WIDTH;
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    },
    [houseImagesRefs]
  );

  return { handleScroll, handleScrollBtn };
};

const useWindowScroll = (
  containerRef,
  showMore,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
) => {
  const dispatch = useDispatch();

  const handleWindowScroll = useCallback(() => {
    const currentScrollPosition = window.scrollY;

    dispatch(setMinimize(false));
    dispatch(setActiveInput(""));

    if (currentScrollPosition > 0) {
      dispatch(setStartScroll(false));
    } else if (currentScrollPosition < 22) {
      dispatch(setStartScroll(true));
    }

    if (!showMore.current) {
      if (
        containerRef.current &&
        containerRef.current.getBoundingClientRect().bottom <=
          window.innerHeight + 500
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    }
  }, [
    dispatch,
    fetchNextPage,
    containerRef,
    showMore,
    hasNextPage,
    isFetchingNextPage,
  ]);

  return handleWindowScroll;
};

const useScrollHandlers = ({
  setLocalScrollPositions,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  showMore,
  houseImagesRefs,
  containerRef,
}) => {
  const { handleScroll, handleScrollBtn } = useItemScroll(
    setLocalScrollPositions,
    houseImagesRefs
  );
  const handleWindowScroll = useWindowScroll(
    containerRef,
    showMore,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  );

  return {
    handleScroll,
    handleWindowScroll,
    handleScrollBtn,
  };
};

const useHouseListingData = (ids, selectedIcon, selectedCountry, city) => {
  const {
    data: houseListingData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["iconFilter", ids, selectedIcon, selectedCountry, city],
    queryFn: ({ pageParam = 0 }) =>
      fetchRowsWithOptions(
        ids,
        selectedIcon,
        selectedCountry,
        city,
        pageParam * ITEMS_PER_PAGE,
        (pageParam + 1) * ITEMS_PER_PAGE - 1
      ),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage && lastPage.length < ITEMS_PER_PAGE) return undefined;
      return pages.length;
    },
    enabled: !!selectedIcon,
  });

  return {
    houseListingData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};

const House = () => {
  const [localScrollPositions, setLocalScrollPositions] = useState({});
  const houseImagesRefs = useRef({});
  const containerRef = useRef(null);
  const showMore = useRef(true);

  const {
    isFavorite,
    itemId,
    selectedIcon,
    selectedCountry,
    startScroll,
    userData,
    userFavListing: favListings,
    city,
    inputSearchIds: ids,
  } = useSelector((store) => store.app);

  const {
    houseListingData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useHouseListingData(ids, selectedIcon, selectedCountry, city);

  const { handleScroll, handleWindowScroll, handleScrollBtn } =
    useScrollHandlers({
      setLocalScrollPositions,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      houseImagesRefs,
      containerRef,
      showMore,
    });

  const { showMore: showMoreVal, localScrollPositions: lsp, setLocalScrollPositions: setLsp } =
    useCustomEffects({
      itemId,
      userData,
      isFavorite,
      favListings,
      saveFavorite,
      deleteFavorite,
      houseListingData,
      handleWindowScroll,
      selectedIcon,
      startScroll,
      showMore,
    });

  // Flatten all fetched pages into a single list
  const allItems = houseListingData?.pages.flatMap((p) => p) ?? [];

  // Visible count = number of pages fetched * items per page (so initial = 1 * 9 = 9)
  const visibleCount =
    Math.min(allItems.length, (houseListingData?.pages?.length || 1) * ITEMS_PER_PAGE) ||
    Math.min(allItems.length, ITEMS_PER_PAGE);

  // Items to render (strictly 3x3 grid per "page")
  const itemsToRender = allItems.slice(0, visibleCount);

  return (
    <div
      className={`relative pb-14 w-full transition-transform duration-[0.3s] ease-in-out px-5 1xl:px-20 top-[4rem] ${
        !startScroll ? "-translate-y-[4.8rem]" : "translate-y-[0rem]"
      }`}
      ref={containerRef}
    >
      <div className="grid grid-cols-3 gap-x-6 gap-y-6 justify-center w-full items-start">
        {status === "pending" ? (
          <SkeletonLoaderList />
        ) : (
          itemsToRender.map((item, index) => (
            <HouseCard
              key={item.id}
              item={item}
              localScrollPositions={localScrollPositions}
              userData={userData}
              favListings={favListings}
              handleScroll={handleScroll}
              handleScrollBtn={handleScrollBtn}
              houseImagesRefs={houseImagesRefs}
              index={index}
            />
          ))
        )}
      </div>

      {/* Continue / Show more logic */}
      {!!houseListingData && showMore?.current && hasNextPage && (
        <ContinueExploring
          selectedIcon={selectedIcon}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          showMore={showMore}
        />
      )}

      {isFetchingNextPage && (
        <SkeletonGrid
          itemCount={9}
          gridClasses="justify-center w-full items-start grid-cols-3 gap-y-6"
        />
      )}
    </div>
  );
};

export default House;
