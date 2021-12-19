import React from "react";
import Typography from "@material-ui/core/Typography";

interface Props {
  url: string,
}

const Url: React.VFC<Props> = (props) => {
  if (!props.url.startsWith('http')) {
    return (<></>);
  }
  return (
    <Typography>
      <a
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.url}
      </a>
    </Typography>
  );
};

export default Url;