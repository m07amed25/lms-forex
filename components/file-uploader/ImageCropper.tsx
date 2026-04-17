"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "../ui/button";
import { ZoomIn, ZoomOut, Check, RotateCcw } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  aspect?: number;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/webp",
        0.9,
      );
    };
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = imageSrc;
  });
}

export default function ImageCropper({
  imageSrc,
  aspect = 16 / 9,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropChange = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(blob);
    } catch {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col w-full h-full min-h-80">
      {/* Aspect ratio hint */}
      <div className="text-center py-2 text-xs text-muted-foreground font-medium">
        Recommended: 16:9 aspect ratio — zoom and drag to fit
      </div>

      {/* Cropper area */}
      <div className="relative flex-1 min-h-64 bg-black/90 rounded-lg overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropChange}
          showGrid
          zoomSpeed={0.1}
          minZoom={1}
          maxZoom={3}
          objectFit="contain"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 pt-4 px-1">
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            disabled={zoom <= 1}
          >
            <ZoomOut className="size-4" />
          </Button>

          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24 accent-primary h-1.5 cursor-pointer"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            disabled={zoom >= 3}
          >
            <ZoomIn className="size-4" />
          </Button>

          <span className="text-xs text-muted-foreground font-mono w-10 text-center">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setCrop({ x: 0, y: 0 });
              setZoom(1);
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={handleConfirm}
            disabled={isSaving}
          >
            <Check className="size-3.5" />
            {isSaving ? "Cropping..." : "Confirm Crop"}
          </Button>
        </div>
      </div>
    </div>
  );
}
