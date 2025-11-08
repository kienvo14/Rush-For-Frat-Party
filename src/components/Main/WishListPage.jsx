import React from "react";

const WishlistPage = ({ wishList, isLoading, svg }) => {
  if (isLoading) return <div>Loading...</div>;
  if (!wishList || wishList.length === 0) return <div>No properties found.</div>;

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {wishList.map((p) => (
        <div key={p.id} className="border p-2 rounded-lg shadow hover:shadow-lg transition">
          <img src={p.img} alt={p.address} className="w-full h-40 object-cover rounded" />
          <div className="mt-2">
            <h3 className="font-bold text-lg">{p.address}</h3>
            <p>Price: ${p.price}</p>
            <p>Bedrooms: {p.bedrooms}</p>
            <p>Pets: {p.pets ? "Yes" : "No"}</p>
            <p>Distance: {p.distanceToSchool} km</p>
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline mt-1 block"
            >
              View Listing
            </a>
            {/* Optional heart icon for favorite */}
            <div className="mt-1 cursor-pointer">{svg}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistPage;
