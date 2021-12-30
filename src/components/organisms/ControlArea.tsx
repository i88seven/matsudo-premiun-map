import React, { ChangeEvent, useState } from "react";
import axios from "axios";
import { FormControlLabel, RadioGroup, Radio, InputLabel, Select, MenuItem, Button, FormControl } from "@material-ui/core";
import { LatLng } from "leaflet";
import Tag, { isTag } from "types/Tag";
import { Shop } from "types/Shop";

const distanceOptions = [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000];

interface Props {
  currentPosition: LatLng,
  fetchedCurrent: boolean,
  setShops: Function,
  flyToCurrent: any,
}

const ControlArea: React.VFC<Props> = (props) => {
  const [distance, setDistance] = useState(500);
  const [isEspecial, setIsEspecial] = useState(false);
  const [tag, setTag] = useState(Tag.none as Tag);

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
    const url = process.env.REACT_APP_API + `?lat=${props.currentPosition.lat}&lng=${props.currentPosition.lng}&distance=${distance}`;
    const res = await axios.get(url);
    let shopsData: Shop[] = res.data;
    if (isEspecial) {
      shopsData = shopsData.filter((shop) => shop.especial);
    }
    if (tag !== Tag.none) {
      shopsData = shopsData.filter((shop) => shop.tag === tag);
    }
    props.setShops(shopsData);
    props.flyToCurrent();
  }

  return (
    <div className="control-area">
      <FormControl component="div" className="input-container" style={{width: '120px'}}>
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
      </FormControl>
      <FormControl component="div" className="input-container" style={{width: '160px'}}>
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
      </FormControl>
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
        {props.fetchedCurrent ? <Button variant="contained" color="default" onClick={props.flyToCurrent}>現在地へ</Button> : <></>}
      </div>
    </div>
  );
};

export default ControlArea;