import Tag from "types/Tag";

export interface Shop {
  id: String,
  title: String,
  tag: Tag,
  especial: boolean,
  address: String,
  tel: String,
  url: String,
  lat: number,
  lng: number,
}
