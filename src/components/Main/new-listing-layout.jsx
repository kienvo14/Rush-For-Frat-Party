import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import House from "../components/House/House"; // your new simplified version

const NewListingLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen">
        <House />
      </main>
      <Footer />
    </div>
  );
};

export default NewListingLayout;
