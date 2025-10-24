import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { X, Volume2, VolumeX, Maximize, Play, Pause } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
  onComplete: () => void;
}

export function VideoPlayer({ videoUrl, title, onClose, onComplete }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3>{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="aspect-video bg-black relative">
          {/* Placeholder for video - in production, use actual video element */}
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4" />
              <p>Video Player</p>
              <p className="text-sm text-gray-400 mt-2">{videoUrl}</p>
            </div>
          </div>
          
          {/* Video controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <div className="flex-1 h-1 bg-white/30 rounded-full">
                <div className="w-1/3 h-full bg-white rounded-full" />
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Hoàn thành bài học
          </Button>
        </div>
      </Card>
    </div>
  );
}
