"use client";

import React, { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Upload, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface ImageCropperProps {
  onImageCropped: (croppedImageUrl: string) => void;
}

export function ImageCropper({ onImageCropped }: ImageCropperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const drawWidth = img.naturalWidth;
    const drawHeight = img.naturalHeight;
    const scale = Math.max(size / drawWidth, size / drawHeight);

    ctx.drawImage(
      img,
      (-drawWidth * scale) / 2,
      (-drawHeight * scale) / 2,
      drawWidth * scale,
      drawHeight * scale
    );
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onImageCropped(url);
        setIsOpen(false);
        setImageSrc(null);
        setZoom(1);
        setRotation(0);
      }
    }, "image/jpeg", 0.9);
  }, [zoom, rotation, onImageCropped]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload & Crop Avatar
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Avatar</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "400px" }}>
              {imageSrc && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: "transform 0.1s",
                    }}
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Preview"
                      className="max-w-full max-h-full"
                      onLoad={() => {}}
                    />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="border-4 border-white rounded-full shadow-lg"
                    style={{ width: "300px", height: "300px" }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Zoom</label>
                  <span className="text-sm text-gray-500">{zoom.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomOut className="w-4 h-4" />
                  <Slider
                    value={[zoom]}
                    onValueChange={(value: number[]) => setZoom(value[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Xoay</label>
                  <span className="text-sm text-gray-500">{rotation}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4" />
                  <Slider
                    value={[rotation]}
                    onValueChange={(value: number[]) => setRotation(value[0])}
                    min={0}
                    max={360}
                    step={1}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setImageSrc(null);
                  setZoom(1);
                  setRotation(0);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button type="button" onClick={handleCrop}>
                Áp dụng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
