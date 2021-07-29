import React from "react";

export const TileContainerContext = React.createContext({
  length: 0,
});

type Props = {
  length: number;
  children: any;
};

export const TileContainer = ({ children, length = 0 }: Props) => {
  return (
    <TileContainerContext.Provider value={{ length }}>
      {children}
    </TileContainerContext.Provider>
  );
};
