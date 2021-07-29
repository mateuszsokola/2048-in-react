import React from "react";
import "./button.less";

type Props = {
  children: any;
  onClick?: () => void;
};

export const Button = ({ children, onClick }: Props) => {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
};
