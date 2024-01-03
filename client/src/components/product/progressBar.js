import React from "react";
import ProgressBar from "@ramonak/react-progress-bar";

export default function StockProgressBar ({ currentStock}) {
  return (
  <ProgressBar 
    completed={currentStock.toString()} 
    maxCompleted="20"
    bgColor="brown"
    transitionDuration	="0.2s"
    transitionTimingFunction="linear"
  />);
};