import React, { useEffect, useRef, useState } from "react";

import { svg } from "../../asset/HeartIconSvg";
import WishlistPage from "./WishListPage"; // UI component
import { useSelector } from "react-redux";

const Wishlist = () => {
  const [wishList, setWishList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { favListings, userData, isFavorite, itemId } = useSelector(
    (store) => ({
      favListings: store.app.userFavListing,
      userData: store.app.userData,
      isFavorite: store.app.isFavorite,
      itemId: store.app.itemId,
    })
  );

  let firstRender = useRef(false);

  // Fetch 9 random properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/properties"); // Flask backend
        const data = await res.json();
        setWishList(data);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!firstRender.current) {
      fetchProperties();
      firstRender.current = true;
    }
  }, []);

  return (
    <WishlistPage
      userData={userData}
      isLoading={isLoading}
      wishList={wishList}
      favListings={favListings}
      svg={svg}
    />
  );
};

export default Wishlist;
