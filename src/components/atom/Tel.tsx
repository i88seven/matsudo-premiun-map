import React from "react";
import Typography from "@material-ui/core/Typography";

interface Props {
  tel: string,
}

const Url: React.VFC<Props> = (props) => {
  return (
    <Typography>
      <a
        href={`tel:${props.tel.replaceAll('-', '')}`
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.tel}
      </a>
    </Typography>
  );
};

export default Url;