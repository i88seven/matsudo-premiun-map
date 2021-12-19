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
