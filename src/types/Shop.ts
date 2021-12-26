import Tag from "types/Tag";

export interface Shop {
  id: string,
  title: string,
  tag: Tag,
  especial: boolean,
  address: string,
  tel: string,
  url: string,
  lat: number,
  lng: number,
}

export interface UnifiedShops {
  shops: Shop[],
  lat: number,
  lng: number,
}

export function isShop(value: Shop | UnifiedShops): value is Shop {
  return value.hasOwnProperty('title');
}

export function isUnifiedShops(value: Shop | UnifiedShops): value is UnifiedShops {
  return !value.hasOwnProperty('title');
}
