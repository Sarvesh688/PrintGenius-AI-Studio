import { ArtworkPlacement } from "@/types/listing";
import { ProductColorType } from "@/types/product";
import { Canvas } from "fabric"
import React, { createContext, useContext, useState } from "react";

interface ListingDataType {
  selectedColors: ProductColorType[];
  title: string;
  description: string;
  sellingPrice: number;
  // Front side
  frontArtworkUrl: string;
  frontArtworkPlacement: ArtworkPlacement;
  // Back side
  backArtworkUrl: string;
  backArtworkPlacement: ArtworkPlacement;
  // Legacy aliases (always mirror front fields)
  artworkUrl: string;
  artworkPlacement: ArtworkPlacement;
}
       
export type ListingDataKey = keyof ListingDataType;

interface CanvasContextType {
  frontCanvas: Canvas | null;
  setFrontCanvas: (canvas: Canvas | null) => void;
  backCanvas: Canvas | null;
  setBackCanvas: (canvas: Canvas | null) => void;
  activeSide: "front" | "back";
  setActiveSide: (side: "front" | "back") => void;
  // Computed: returns frontCanvas or backCanvas based on activeSide
  canvasEditor: Canvas | null;
  setCanvasEditor: (canvas: Canvas | null) => void;
  listingData: ListingDataType;
  setListingData: (listingData: ListingDataType) => void;
  updatedListingState: (key: ListingDataKey, value: any) => void;
}

const defaultArtworkPlacement: ArtworkPlacement = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  refDisplayWidth: 662,
};

const listingDataInitialState: ListingDataType = {
  selectedColors: [],
  title: "",
  description: "",
  sellingPrice: 0,
  frontArtworkUrl: "",
  frontArtworkPlacement: { ...defaultArtworkPlacement },
  backArtworkUrl: "",
  backArtworkPlacement: { ...defaultArtworkPlacement },
  // Legacy aliases mirror front fields
  artworkUrl: "",
  artworkPlacement: { ...defaultArtworkPlacement },
};

const CanvasContext = createContext<CanvasContextType | null>(null);

export function CanvasProvider({
  children,
  basePrice
}: {
  children: React.ReactNode;
  basePrice?: number
}) {

  const [frontCanvas, setFrontCanvas] = useState<Canvas | null>(null);
  const [backCanvas, setBackCanvas] = useState<Canvas | null>(null);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [listingData, setListingData] = useState<ListingDataType>({
    ...listingDataInitialState,
    sellingPrice: basePrice || 0,
  });

  // Computed: active canvas based on activeSide
  const canvasEditor = activeSide === "front" ? frontCanvas : backCanvas;

  // setCanvasEditor sets the appropriate canvas based on activeSide
  const setCanvasEditor = (canvas: Canvas | null) => {
    if (activeSide === "front") {
      setFrontCanvas(canvas);
    } else {
      setBackCanvas(canvas);
    }
  };

  const updatedListingState = (key: ListingDataKey, value: any) => {
    setListingData((prev) => {
      const next: ListingDataType = { ...prev, [key]: value };
      // Keep legacy aliases in sync with front fields
      if (key === "frontArtworkUrl") {
        next.artworkUrl = value;
      }
      if (key === "frontArtworkPlacement") {
        next.artworkPlacement = value;
      }
      return next;
    });
  };

  return (
    <CanvasContext.Provider
      value={{
        frontCanvas,
        setFrontCanvas,
        backCanvas,
        setBackCanvas,
        activeSide,
        setActiveSide,
        canvasEditor,
        setCanvasEditor,
        listingData,
        setListingData,
        updatedListingState,
      }}
    >
      {children}
    </CanvasContext.Provider>
  )

}


export function useCanvas() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside <CanvasProvider>");
  return ctx;
}
