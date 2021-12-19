import React, { ChangeEvent, useState } from "react";
import { FormControlLabel, RadioGroup, Radio, TextField, InputLabel, Select, MenuItem } from "@material-ui/core";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import Tag, { isTag } from "types/Tag";
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
  const [distance, setDistance] = React.useState(500);
  const [isEspecial, setIsEspecial] = React.useState(false);
  const [tag, setTag] = React.useState(Tag.none as Tag);

  const handleChangeDistance = (event: ChangeEvent<HTMLInputElement>) => {
    setDistance(Number(event.target.value));
  };

  const handleChangeTag = (event: ChangeEvent<{
    name?: string | undefined;
    value: unknown;
  }>) => {
    if (typeof event.target.value != 'string' || !isTag(event.target.value)) return;
    setTag(event.target.value);
  };

  const handleChangeIsEspecial = (event: ChangeEvent<HTMLInputElement>) => {
    setIsEspecial(event.target.value == 'true');
  };

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
      <div className="control-area">
        <div className="input-container">
          <TextField
            id="input-distance"
            label="検索半径(m)"
            type="number"
            value={distance}
            InputLabelProps={{
              shrink: true,
            }}
            variant="standard"
            onChange={handleChangeDistance}
          />
        </div>
        <div className="input-container">
          <InputLabel id="tag-label">業種</InputLabel>
          <Select
            labelId="tag-label"
            value={tag}
            label="業種"
            onChange={handleChangeTag}
          >
            {Object.entries(Tag).map(([key, name]) => (
              <MenuItem key={key} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </div>
        <RadioGroup
          className="input-container"
          aria-label="isEspecial"
          name="radio-button-is-especial"
          value={isEspecial}
          onChange={handleChangeIsEspecial}
        >
          <FormControlLabel value={false} control={<Radio />} label="共通・専用" />
          <FormControlLabel value={true} control={<Radio />} label="専用のみ" />
        </RadioGroup>
      </div>
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