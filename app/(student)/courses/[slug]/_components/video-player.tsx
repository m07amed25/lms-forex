"use client";

import { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";
import { markLessonComplete } from "../_actions/mark-complete";

type VideoPlayerProps = {
  signedUrl: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
};

export function VideoPlayer({
  signedUrl,
  lessonId,
  courseId,
  isCompleted,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered");
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{ src: signedUrl, type: "video/mp4" }],
    });

    player.on("error", () => {
      setError(true);
    });

    player.on("ended", () => {
      if (!isCompleted) {
        markLessonComplete({ lessonId, courseId });
      }
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [signedUrl, lessonId, courseId, isCompleted]);

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-8 text-muted-foreground">
        Video unavailable
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg">
      <div ref={videoRef} />
    </div>
  );
}

