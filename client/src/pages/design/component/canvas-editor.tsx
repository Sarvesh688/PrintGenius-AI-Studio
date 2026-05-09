import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "fabric"
import { useCanvas } from "@/context/canvas-context";
import { ProductColorType, ProductType } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyCustomControls } from "@/lib/canvas-controls";
import { ENV } from "@/lib/env";
import ThreeDProductViewer from "./ThreeDProductViewer";

function getScale(el: HTMLElement, width: number, height: number, pad = 40) {
  return Math.min((el.clientWidth - pad) / width, (el.clientHeight - pad) / height, 1);
}

const CanvasEditor = ({
  template,
  defaultColor
}: {
  template: ProductType;
  defaultColor?: ProductColorType;
}) => {
  // Front canvas refs
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  // Back canvas refs
  const backCanvasRef = useRef<HTMLCanvasElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const [selectedColor, setSelectedColor] = useState<ProductColorType | null>(null)
  const [viewMode, setViewMode] = useState<"design" | "preview">("design");
  const [loading, setLoading] = useState(true);

  const [isMaskLoaded, setIsMaskLoaded] = useState(false);

  const {
    canvasEditor,
    setFrontCanvas,
    setBackCanvas,
    frontCanvas,
    backCanvas,
    activeSide,
    setActiveSide,
    listingData,
    updatedListingState
  } = useCanvas()

  const DISPLAY_SIZE = 662;

  const printableArea = {
    top: template.printableArea.top,
    left: template.printableArea.left,
    width: template.printableArea.width,
    height: template.printableArea.height
  }


  useEffect(() => {
    if (listingData.selectedColors.length > 0) {
      setSelectedColor(listingData.selectedColors[listingData.selectedColors.length - 1]);
    } else {
      if (defaultColor) {
        setSelectedColor(defaultColor)
      }
    }
  }, [listingData?.selectedColors])

  useEffect(() => {
    setIsMaskLoaded(false);
  }, [template.baseUrl]);

  // ── Front canvas initialisation ──────────────────────────────────────────
  useEffect(() => {
    if (!frontCanvasRef.current || !template) return;
    let canvas: Canvas;

    (async () => {
      try {
        const scale = containerRef.current
          ? getScale(containerRef.current, printableArea.width, printableArea.height)
          : 1;

        canvas = new Canvas(frontCanvasRef.current!, {
          width: printableArea.width,
          height: printableArea.height,
          backgroundColor: undefined,
          preserveObjectStacking: true,
          controlsAboveOverlay: true
        });
        canvas.setDimensions({
          width: printableArea.width * scale,
          height: printableArea.height * scale
        });
        canvas.setZoom(scale);

        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
          canvas.getElement().width = printableArea.width * dpr;
          canvas.getElement().height = printableArea.height * dpr;
          canvas.getContext().scale(dpr, dpr);
        }

        canvas.calcOffset();
        canvas.requestRenderAll();
        applyCustomControls(canvas);
        setFrontCanvas(canvas);
      } catch (e) {
        console.log("Front canvas failed to init");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      canvas?.dispose();
      setFrontCanvas(null);
    };
  }, [template]);

  // ── Back canvas initialisation ───────────────────────────────────────────
  useEffect(() => {
    if (!backCanvasRef.current || !template) return;
    let canvas: Canvas;

    (async () => {
      try {
        const scale = containerRef.current
          ? getScale(containerRef.current, printableArea.width, printableArea.height)
          : 1;

        canvas = new Canvas(backCanvasRef.current!, {
          width: printableArea.width,
          height: printableArea.height,
          backgroundColor: undefined,
          preserveObjectStacking: true,
          controlsAboveOverlay: true
        });
        canvas.setDimensions({
          width: printableArea.width * scale,
          height: printableArea.height * scale
        });
        canvas.setZoom(scale);

        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
          canvas.getElement().width = printableArea.width * dpr;
          canvas.getElement().height = printableArea.height * dpr;
          canvas.getContext().scale(dpr, dpr);
        }

        canvas.calcOffset();
        canvas.requestRenderAll();
        applyCustomControls(canvas);
        setBackCanvas(canvas);
      } catch (e) {
        console.log("Back canvas failed to init");
      }
    })();

    return () => {
      canvas?.dispose();
      setBackCanvas(null);
    };
  }, [template]);

  // ── Front canvas event handlers ──────────────────────────────────────────
  useEffect(() => {
    if (!canvasEditor || activeSide !== "front") return;

    const captureFrontArtwork = () => {
      const artworkDataUrl = canvasEditor.toDataURL({
        format: "png",
        multiplier: 1,
        quality: 1.0
      });
      updatedListingState("frontArtworkUrl", artworkDataUrl);
    };

    const captureFrontArtworkWithPlacement = (e: any) => {
      const obj = e.target ?? canvasEditor.getActiveObject() ?? canvasEditor.getObjects()[0];
      if (obj) {
        updatedListingState("frontArtworkPlacement", {
          top: obj.top,
          left: obj.left,
          width: obj.getScaledWidth(),
          height: obj.getScaledHeight(),
          refDisplayWidth: DISPLAY_SIZE
        });
      }
      captureFrontArtwork();
    };

    canvasEditor.on("object:modified", captureFrontArtworkWithPlacement);
    canvasEditor.on("object:added", captureFrontArtworkWithPlacement);
    canvasEditor.on("object:removed", captureFrontArtwork);
    canvasEditor.on("mouse:down", (e) => {
      if (!e.target) {
        canvasEditor.discardActiveObject();
        canvasEditor.requestRenderAll();
      }
    });

    return () => {
      canvasEditor.off("object:modified", captureFrontArtworkWithPlacement);
      canvasEditor.off("object:added", captureFrontArtworkWithPlacement);
      canvasEditor.off("object:removed", captureFrontArtwork);
      canvasEditor.off("mouse:down", () => { });
    };
  }, [canvasEditor, activeSide]);

  // ── Back canvas event handlers ───────────────────────────────────────────
  useEffect(() => {
    if (!canvasEditor || activeSide !== "back") return;

    const captureBackArtwork = () => {
      const artworkDataUrl = canvasEditor.toDataURL({
        format: "png",
        multiplier: 1,
        quality: 1.0
      });
      updatedListingState("backArtworkUrl", artworkDataUrl);
    };

    const captureBackArtworkWithPlacement = (e: any) => {
      const obj = e.target ?? canvasEditor.getActiveObject() ?? canvasEditor.getObjects()[0];
      if (obj) {
        updatedListingState("backArtworkPlacement", {
          top: obj.top,
          left: obj.left,
          width: obj.getScaledWidth(),
          height: obj.getScaledHeight(),
          refDisplayWidth: DISPLAY_SIZE
        });
      }
      captureBackArtwork();
    };

    canvasEditor.on("object:modified", captureBackArtworkWithPlacement);
    canvasEditor.on("object:added", captureBackArtworkWithPlacement);
    canvasEditor.on("object:removed", captureBackArtwork);
    canvasEditor.on("mouse:down", (e) => {
      if (!e.target) {
        canvasEditor.discardActiveObject();
        canvasEditor.requestRenderAll();
      }
    });

    return () => {
      canvasEditor.off("object:modified", captureBackArtworkWithPlacement);
      canvasEditor.off("object:added", captureBackArtworkWithPlacement);
      canvasEditor.off("object:removed", captureBackArtwork);
      canvasEditor.off("mouse:down", () => { });
    };
  }, [canvasEditor, activeSide]);

  const generatePreview = useCallback(() => {
    if (!frontCanvas || !selectedColor?.mockupUrl) return;

    frontCanvas.discardActiveObject();
    frontCanvas.requestRenderAll();

    const artworkDataUrl = frontCanvas.toDataURL({
      format: "png",
      multiplier: 1,
      quality: 1.0
    });
    updatedListingState("frontArtworkUrl", artworkDataUrl);
    const mockupImg = new Image();
    mockupImg.crossOrigin = "anonymous";
    mockupImg.src = selectedColor.mockupUrl;
    mockupImg.onload = () => {
      const W = mockupImg.naturalWidth;
      const H = mockupImg.naturalHeight;
      const mergeCanvas = document.createElement("canvas");
      mergeCanvas.width = W;
      mergeCanvas.height = H;
      const ctx = mergeCanvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(mockupImg, 0, 0, W, H);

      const artImg = new Image();
      artImg.src = artworkDataUrl;
      artImg.onload = () => {
        const scale = W / DISPLAY_SIZE;
        const dx = printableArea.left * scale;
        const dy = printableArea.top * scale;
        const dw = printableArea.width * scale;
        const dh = printableArea.height * scale;

        ctx.drawImage(artImg, dx, dy, dw, dh);

        mergeCanvas.toBlob(
          () => {
            // Unused in 3D mode
          },
          "image/png",
          1.0
        );
      };
    };
  }, [frontCanvas, selectedColor, printableArea, updatedListingState]);

  const generateBackPreview = useCallback(() => {
    if (!selectedColor?.mockupUrl) return;

    // If back canvas has no objects, use the plain mockup image
    const hasBackObjects = backCanvas && backCanvas.getObjects().length > 0;

    if (!hasBackObjects) {
      return;
    }

    backCanvas!.discardActiveObject();
    backCanvas!.requestRenderAll();

    const artworkDataUrl = backCanvas!.toDataURL({
      format: "png",
      multiplier: 1,
      quality: 1.0
    });
    updatedListingState("backArtworkUrl", artworkDataUrl);
    const mockupImg = new Image();
    mockupImg.crossOrigin = "anonymous";
    mockupImg.src = selectedColor.mockupUrl;
    mockupImg.onload = () => {
      const W = mockupImg.naturalWidth;
      const H = mockupImg.naturalHeight;
      const mergeCanvas = document.createElement("canvas");
      mergeCanvas.width = W;
      mergeCanvas.height = H;
      const ctx = mergeCanvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(mockupImg, 0, 0, W, H);

      const artImg = new Image();
      artImg.src = artworkDataUrl;
      artImg.onload = () => {
        const scale = W / DISPLAY_SIZE;
        const dx = printableArea.left * scale;
        const dy = printableArea.top * scale;
        const dw = printableArea.width * scale;
        const dh = printableArea.height * scale;

        ctx.drawImage(artImg, dx, dy, dw, dh);

        mergeCanvas.toBlob(
          () => {
            // Unused in 3D mode
          },
          "image/png",
          1.0
        );
      };
    };
  }, [backCanvas, selectedColor, printableArea]);

  useEffect(() => {
    if (!selectedColor || viewMode !== "preview") return;
    generatePreview();
    generateBackPreview();
  }, [selectedColor, viewMode]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-start w-full
      h-full bg-[#f6f6f6] overflow-hidden
      "
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-800/80 z-20">
          <p>Loading Canvas</p>
        </div>
      )}

      <div className="product-design-area relative flex flex-col
       items-center justify-start w-full transform scale-[95%] -mt-8  p-9
      ">

        {/* Side Toggle — Front / Back */}
        <div className="mb-4 flex items-center bg-background rounded-full p-1 shadow-sm border border-border z-30">
          <Button
            onClick={() => setActiveSide("front")}
            className={cn("rounded-full cursor-pointer", activeSide === "front" ? "bg-foreground text-background" : "bg-transparent text-foreground hover:bg-accent")}
          >
            Front
          </Button>
          <Button
            onClick={() => setActiveSide("back")}
            className={cn("rounded-full cursor-pointer", activeSide === "back" ? "bg-foreground text-background" : "bg-transparent text-foreground hover:bg-accent")}
          >
            Back
          </Button>
        </div>

        <div className="product-preview-base w-full aspect-square relative transition-colors duration-300"
          style={{
            backgroundColor: isMaskLoaded ? (selectedColor?.color || "white") : "transparent",
            display: viewMode === "design" ? "block" : "none",
            maxWidth: `${DISPLAY_SIZE}px`,
            height: `${DISPLAY_SIZE}px`,
            lineHeight: `${DISPLAY_SIZE}px`
          }}
        >
          {!isMaskLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-[#f6f6f6]">
              <span className="text-base font-medium text-muted-foreground animate-pulse">Loading mask...</span>
            </div>
          )}
          <div
            ref={printableAreaRef}
            className="absolute z-20 "
            style={{
              top: printableArea.top,
              left: printableArea.left,
              width: `${printableArea.width}px`,
              height: `${printableArea.height}px`
            }}
          >
            {/* Front canvas — visible when activeSide === "front" */}
            <div
              className="printable-area outlined w-full h-full"
              style={{ display: activeSide === "front" ? "block" : "none" }}
            >
              <canvas ref={frontCanvasRef} className="w-full h-full" />
              <div className="printable-area-info-icon" />
            </div>

            {/* Back canvas — visible when activeSide === "back" */}
            <div
              className="printable-area outlined w-full h-full"
              style={{ display: activeSide === "back" ? "block" : "none" }}
            >
              <canvas ref={backCanvasRef} className="w-full h-full" />
              <div className="printable-area-info-icon" />
            </div>
          </div>

          <img className="product-mask-image"
            src={`${ENV.BASE_API_URL}${template.baseUrl}`}
            alt=""
            decoding="async"
            loading="eager"
            onLoad={() => setIsMaskLoaded(true)}
            style={{
              imageRendering: '-webkit-optimize-contrast',
              background: 'transparent !important',
              transform: activeSide === "back" ? "scaleX(-1)" : "none",
              transition: "transform 0.4s ease",
            }}
          />

          <div className="grid-lines" />
        </div>

        {/* {Mockup Preview — 3D Viewer} */}

        <div
          className="mockup-preview aspect-square"
          style={{
            display: viewMode === "preview" ? "block" : "none",
            maxWidth: `${DISPLAY_SIZE}px`,
            width: `${DISPLAY_SIZE}px`,
            height: `${DISPLAY_SIZE}px`,
            position: "relative",
          }}
        >
          {viewMode === "preview" && (
            <ThreeDProductViewer
              color={selectedColor?.color || "#ffffff"}
              productType={template.type}
              frontTextureUrl={listingData.frontArtworkUrl}
              backTextureUrl={listingData.backArtworkUrl}
              viewSide={activeSide}
            />
          )}

          {/* Flip button — overlaid at bottom center */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <Button
              onClick={() => setActiveSide(activeSide === "front" ? "back" : "front")}
              className="rounded-full bg-background text-foreground border border-border shadow-sm hover:bg-accent cursor-pointer"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {activeSide === "front" ? "View Back" : "View Front"}
            </Button>
          </div>
        </div>

        <div className="mt-7 mb-3 flex items-center bg-background rounded-full p-1 shadow-sm border border-border z-30 ">
          <Button
            onClick={() => {
              generatePreview()
              generateBackPreview()
              setViewMode("preview")
            }}
            className={cn("rounded-full cursor-pointer", viewMode === "preview" ? "bg-foreground text-background" : "bg-transparent text-foreground hover:bg-accent")}
          >
            <Eye className="w-5 h-5" /> Preview
          </Button>

          <Button
            onClick={() => {
              setViewMode("design");
              frontCanvas?.requestRenderAll();
              backCanvas?.requestRenderAll();
            }}
            className={cn("rounded-full cursor-pointer", viewMode === "design" ? "bg-foreground text-background" : "bg-transparent text-foreground hover:bg-accent")}
          >
            <Pencil className="w-5 h-5" /> Design
          </Button>
        </div>


      </div>

      <div className="absolute right-6 top-1/4 -translate-y-2/3
       flex flex-col gap-2 rounded-full z-30">
        {listingData.selectedColors.map((color) => (
          <button
            key={color._id}
            onClick={() => setSelectedColor(color)}
            className={`w-8 h-8 cursor-pointer rounded-full border-2 transition-all hover:scale-110
              ${selectedColor?._id === color._id
                ? 'border-transparent ring-1 ring-offset-1 ring-foreground'
                : 'border-border'
              }`}
            style={{ backgroundColor: color.color }}
          />
        ))}
      </div>
    </div>
  )
}

export default CanvasEditor
