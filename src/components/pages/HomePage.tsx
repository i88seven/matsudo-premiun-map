import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Tag } from "types/Tag";
import { Shop } from "types/Shop";

import "App.css";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const defaultShop: Shop[] = [{
  id: '269442',
  title: 'マツモトキヨシ小金店',
  tag: Tag.drugstore,
  especial: true,
  address: '〒270-0014 千葉県松戸市小金435-1',
  tel: '047-309-6211',
  url: '-',
  lat: 35.8317934,
  lng: 139.9313732,
}];

const HomePage: React.VFC = () => {
  // デフォルトは新八柱駅
  let position = new LatLng(35.791714531276135, 139.93828231114674);
  const [shops, setShops] = useState(defaultShop);

  function LocationMarker() {
    const [currentPosition, setCurrentPosition] = useState(position)
    const map = useMap();
    map.locate()
    useMapEvents({
      locationfound(e) {
        setCurrentPosition(e.latlng)
        map.flyTo(e.latlng, map.getZoom())
      },
    })
    return currentPosition === null ? null : (
      <>
        <Marker position={currentPosition}>
          <Popup>現在地</Popup>
        </Marker>
        {shops.map((shop, index) => (
          <Marker key={index} position={[shop.lat, shop.lng]}>
            <Popup>{shop.title}</Popup>
          </Marker>
        ))}
      </>
    )
  }

  return (
    <div className="App">
      <MapContainer center={position} zoom={18}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}

export default HomePage;