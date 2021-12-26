import React, { ChangeEvent, useState } from "react";
import axios from "axios";
import { FormControlLabel, RadioGroup, Radio, InputLabel, Select, MenuItem, Button, Typography, Divider, List, Paper } from "@material-ui/core";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import Tag, { isTag } from "types/Tag";
import { isShop, isUnifiedShops, Shop, UnifiedShops } from "types/Shop";
import Url from "components/atom/Url";
import Tel from "components/atom/Tel";

import "App.css";
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import NowIcon from 'images/now.png'
import OtherIcon from 'images/other.png'
import ElectronicsIcon from 'images/electronics.png'
import ConvenienceIcon from 'images/convenience.png'
import RestaurantIcon from 'images/restaurant.png'
import DrugstoreIcon from 'images/drugstore.png'

const generateIcon = (icon: string) => L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [27, 57],
  iconSize: [35, 50],
  shadowAnchor: [23, 47],
  popupAnchor:  [-9, -56],
});
const currentIcon = generateIcon(NowIcon);
const otherIcon = generateIcon(OtherIcon);
const electronicsIcon = generateIcon(ElectronicsIcon);
const convenienceIcon = generateIcon(ConvenienceIcon);
const restaurantIcon = generateIcon(RestaurantIcon);
const drugstoreIcon = generateIcon(DrugstoreIcon);
const tagIcon = (tagName: string): L.Icon => {
  switch (tagName) {
    case '家電販売店':
      return electronicsIcon;
    case 'コンビニ':
      return convenienceIcon;
    case '飲食店':
      return restaurantIcon;
    case 'ドラッグストア・調剤薬局':
      return drugstoreIcon;
  }
  return otherIcon;
};
L.Marker.prototype.options.icon = otherIcon;

const distanceOptions = [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000];

const HomePage: React.VFC = () => {
  // デフォルトは新八柱駅
  const [currentPosition, setCurrentPosition] = useState(new LatLng(35.791714531276135, 139.93828231114674))
  const [fetchedCurrent, setFetchedCurrent] = React.useState(false);
  let leafletMap: L.Map;
  const [shops, setShops] = useState([] as Shop[]);
  const [distance, setDistance] = React.useState(500);
  const [isEspecial, setIsEspecial] = React.useState(false);
  const [tag, setTag] = React.useState(Tag.none as Tag);

  const handleChangeDistance = (event: ChangeEvent<{
    name?: string | undefined;
    value: unknown;
  }>) => {
    if (isNaN(Number(event.target.value))) return;
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
    setIsEspecial(event.target.value === 'true');
  };

  const getShops = async () => {
    // TODO distance が変わった時のみ、APIアクセス
    const url = process.env.REACT_APP_API + `?lat=${currentPosition.lat}&lng=${currentPosition.lng}&distance=${distance}`;
    const res = await axios.get(url);
    let shopsData: Shop[] = res.data;
    if (isEspecial) {
      shopsData = shopsData.filter((shop) => shop.especial);
    }
    if (tag !== Tag.none) {
      shopsData = shopsData.filter((shop) => shop.tag === tag);
    }
    setShops(shopsData);
  }

  function unifyShops() {
    return shops.reduce((prev, current): (Shop | UnifiedShops)[] => {
      const samePositionShop = prev.find(shop => shop.lat === current.lat && shop.lng === current.lng)
      if (!samePositionShop) {
        return [...prev, current]
      }
      if (isUnifiedShops(samePositionShop)) {
        samePositionShop.shops.push(current);
        return prev
      }
      if (isShop(samePositionShop)) {
        return prev.map(shop => {
          if (isShop(shop)) {
            if (shop.id !== samePositionShop.id) {
              return shop
            }
            return {
              shops: [shop],
              lat: shop.lat,
              lng: shop.lng,
            };
          }
          return shop
        });
      }
      return prev
    }, [] as (Shop | UnifiedShops)[])
  }

  function flyToCurrent() {
    if (fetchedCurrent) {
      leafletMap.flyTo(currentPosition, leafletMap.getZoom())
    }
  }

  function LocationMarker() {
    leafletMap = useMap();
    leafletMap.locate()
    useMapEvents({
      locationfound(e) {
        setCurrentPosition(e.latlng)
        leafletMap.flyTo(e.latlng, leafletMap.getZoom())
        setFetchedCurrent(true)
      },
    })
    const unifiedShops: (Shop | UnifiedShops)[] = unifyShops();
    return currentPosition === null ? null : (
      <>
        <Marker position={currentPosition} icon={currentIcon}>
          <Popup>現在地</Popup>
        </Marker>
        {unifiedShops.map((shop, index) => (
          isShop(shop)
            ? <Marker key={index} position={[shop.lat, shop.lng]} icon={tagIcon(shop.tag)}>
                <Popup>
                  <Typography variant="h5" component="div">{shop.title}</Typography>
                  <Typography variant="caption" color="textSecondary">{shop.address}</Typography>
                  <Typography variant="body2">
                    {shop.especial ? '専用のみ' : '共通・専用'}
                  </Typography>
                  <Tel tel={shop.tel} />
                  <Url url={shop.url} />
                </Popup>
              </Marker>
            : <Marker key={index} position={[shop.lat, shop.lng]} icon={otherIcon}>
                <Popup>
                  <Paper style={{maxHeight: 500, overflow: 'auto'}}>
                    <List>
                      {shop.shops.map((unifiedShop, listIndex) => (
                        <div key={listIndex}>
                          {listIndex > 0 ? <Divider /> : <></>}
                          <Typography variant="h5" component="div">{unifiedShop.title}</Typography>
                          <Typography variant="caption" color="textSecondary">{unifiedShop.address}</Typography>
                          <Typography variant="body2">
                            {unifiedShop.especial ? '専用のみ' : '共通・専用'}
                          </Typography>
                          <Tel tel={unifiedShop.tel} />
                          <Url url={unifiedShop.url} />
                        </div>
                      ))}
                    </List>
                  </Paper>
                </Popup>
              </Marker>
        ))}
      </>
    )
  }

  return (
    <div className="App">
      <div className="control-area">
        <div className="input-container">
          <InputLabel id="distance-label">検索半径</InputLabel>
          <Select
            id="input-distance"
            labelId="distance-label"
            value={distance}
            onChange={handleChangeDistance}
          >
            {distanceOptions.map((distanceOption) => (
              <MenuItem key={distanceOption} value={distanceOption}>{distanceOption}m</MenuItem>
            ))}
          </Select>
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
          name="radio-button-is-especial"
          value={isEspecial}
          onChange={handleChangeIsEspecial}
        >
          <FormControlLabel value={false} control={<Radio />} label="共通・専用" />
          <FormControlLabel value={true} control={<Radio />} label="専用のみ" />
        </RadioGroup>
        <div className="button-container">
          <Button variant="contained" color="primary" onClick={getShops}>検索</Button>
          {fetchedCurrent ? <Button variant="contained" color="default" onClick={flyToCurrent}>現在地へ</Button> : <></>}
        </div>
      </div>
      <MapContainer center={currentPosition} zoom={18}>
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