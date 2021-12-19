import React from "react";
import { MapContainer, TileLayer, } from "react-leaflet";
import { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

import "App.css";

const HomePage: React.VFC = () => {
  // デフォルトは新八柱駅
  let position = new LatLng(35.791714531276135, 139.93828231114674);

  return (
    <div className="App">
      <MapContainer center={position} zoom={18}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}

export default HomePage;