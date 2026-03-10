const formatLocation = (longitude, latitude) => {

  const lng = Number(longitude);
  const lat = Number(latitude);

  if (isNaN(lng) || isNaN(lat)) {
    throw new Error("Invalid coordinates");
  }

  return {
    type: "Point",
    coordinates: [lng, lat] 
  };

};

export default formatLocation;