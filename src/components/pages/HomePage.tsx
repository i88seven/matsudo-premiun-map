import React, { useState } from "react";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Typography, Divider, List, Paper } from "@material-ui/core";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTagKey } from "types/Tag";
import { isShop, isUnifiedShops, Shop, UnifiedShops } from "types/Shop";
import Url from "components/atom/Url";
import Tel from "components/atom/Tel";

import "App.css";
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import NowIcon from 'images/now.png'
import ElectronicsIcon from 'images/electronics.png'
import BarberIcon from 'images/barber.png'
import GlassesIcon from 'images/glasses.png'
import ConvenienceIcon from 'images/convenience.png'
import RestaurantIcon from 'images/restaurant.png'
import FoodIcon from 'images/food.png'
import ClothingIcon from 'images/clothing.png'
import SupermarketIcon from 'images/supermarket.png'
import ServiceIcon from 'images/service.png'
import DrugstoreIcon from 'images/drugstore.png'
import GasIcon from 'images/gas.png'
import RetailIcon from 'images/retail.png'
import OtherIcon from 'images/other.png'
import ManyIcon from 'images/many.png'
import ControlArea from "components/organisms/ControlArea";
import ControlDialog from "components/organisms/ControlDialog";

const generateIcon = (icon: string) => L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [27, 42],
  iconSize: [45, 39],
  shadowAnchor: [18, 45],
  popupAnchor:  [-3, -41],
});
type IconKey = 'current' | 'electronics' | 'barber' | 'glasses' | 'convenience'
  | 'restaurant' | 'food' | 'clothing' | 'supermarket' | 'service' | 'drugstore'
  | 'gas' | 'retail' | 'other' | 'many' | 'none';
const icons: {[key in IconKey]: string} = {
  current: NowIcon,
  electronics: ElectronicsIcon,
  barber: BarberIcon,
  glasses: GlassesIcon,
  convenience: ConvenienceIcon,
  restaurant: RestaurantIcon,
  food: FoodIcon,
  clothing: ClothingIcon,
  supermarket: SupermarketIcon,
  service: ServiceIcon,
  drugstore: DrugstoreIcon,
  gas: GasIcon,
  retail: RetailIcon,
  other: OtherIcon,
  many: ManyIcon,
  none: OtherIcon,
}
const leafletIcons: {[key in IconKey]?: L.Icon} = {};
(Object.keys(icons) as IconKey[]).forEach(key => {
  leafletIcons[key] = generateIcon(icons[key])
})

const fetchIconKey = (tagName: string): IconKey => {
  const tagKey = getTagKey(tagName);

  function isIconKey(value: string): value is IconKey {
    return leafletIcons.hasOwnProperty(value);
  }
  if (isIconKey(tagKey)) {
    return tagKey;
  }
  return 'none';
};
L.Marker.prototype.options.icon = leafletIcons.other;


const HomePage: React.VFC = () => {
  const isMiniWindowQuery = useMediaQuery('(max-width: 430px)');
  const [isMiniWindow, setIsMiniWindow] = useState(true);

  // デフォルトは新八柱駅
  const [currentPosition, setCurrentPosition] = useState(new LatLng(35.791714531276135, 139.93828231114674))
  const [fetchedCurrent, setFetchedCurrent] = useState(false);
  let leafletMap: L.Map;
  const [shops, setShops] = useState([] as Shop[]);

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
      // すでに shop として登録されていたら、many を表示する UnifiedShops に変更して入れ直す
      if (isShop(samePositionShop)) {
        return prev.map(shop => {
          if (isShop(shop)) {
            if (shop.id !== samePositionShop.id) {
              return shop
            }
            return {
              shops: [shop, current],
              lat: shop.lat,
              lng: shop.lng,
            };
          }
          return shop // UnifiedShops
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

  React.useEffect(() => {
    setIsMiniWindow(isMiniWindowQuery);
  }, [isMiniWindowQuery]);

  function LocationMarker() {
    leafletMap = useMap();
    leafletMap.locate()
    useMapEvents({
      locationfound(e) {
        setCurrentPosition(e.latlng)
        if (!fetchedCurrent) {
          leafletMap.flyTo(e.latlng, leafletMap.getZoom())
          setFetchedCurrent(true)
        }
      },
    })
    const unifiedShops: (Shop | UnifiedShops)[] = unifyShops();
    return currentPosition === null ? null : (
      <>
        <Marker position={currentPosition} icon={leafletIcons.current}>
          <Popup>
            <Typography variant="h5" component="div">
              現在地
              <img className="popup-icon now-icon" src={icons.current} alt="現在地" />
            </Typography>
          </Popup>
        </Marker>
        {unifiedShops.map((shop, index) => (
          isShop(shop)
            ? <Marker key={index} position={[shop.lat, shop.lng]} icon={leafletIcons[fetchIconKey(shop.tag)]}>
                <Popup>
                  <img
                      className="popup-icon"
                      src={icons[fetchIconKey(shop.tag)]}
                      alt={shop.tag}
                    />
                  <Typography variant="h5" component="div">{shop.title}</Typography>
                  <Typography variant="caption" color="textSecondary">{shop.address}</Typography>
                  <Typography variant="body2">
                    {shop.especial ? '専用のみ' : '共通・専用'}
                  </Typography>
                  <Tel tel={shop.tel} />
                  <Url url={shop.url} />
                </Popup>
              </Marker>
            : <Marker key={index} position={[shop.lat, shop.lng]} icon={leafletIcons.many}>
                <Popup>
                  <Paper style={{maxHeight: 500, overflow: 'auto'}}>
                    <List>
                      {shop.shops.map((unifiedShop, listIndex) => (
                        <div key={listIndex}>
                          {listIndex > 0 ? <Divider /> : <></>}
                          <img
                            className="popup-icon"
                            src={icons[fetchIconKey(unifiedShop.tag)]}
                            alt={unifiedShop.tag}
                          />
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
      {isMiniWindow
        ? <ControlDialog
          currentPosition={currentPosition}
          fetchedCurrent={fetchedCurrent}
          setShops={setShops}
          flyToCurrent={flyToCurrent}
        />
        : <ControlArea
          currentPosition={currentPosition}
          fetchedCurrent={fetchedCurrent}
          setShops={setShops}
          flyToCurrent={flyToCurrent}
        />
      }
      <MapContainer
        style={{height: (isMiniWindow ? 'calc(100vh - 38px)' : 'calc(100vh - 84px)')}}
        center={currentPosition}
        zoom={18}
      >
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