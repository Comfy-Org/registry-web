import React from "react";

const Container = ({ children }) => {
  return <div className="max-w-screen-xl min-h-screen px-4 mx-auto lg:px-6">{children}</div>;
};

export default Container;
