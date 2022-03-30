/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { Player } from "./Player";

const socket = io("localhost:8000");

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playerServiceRef = useRef<Player>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const toggleIsPlaying = () => {
    if(!playerServiceRef.current) return;

    setIsPlaying((prev) => !prev);
    playerServiceRef.current.togglePlayback();
  }

  useEffect(() => {
    playerServiceRef.current = new Player({canvas: canvasRef.current});

    socket.on("connect", () => {
      console.log("connected", socket.id);
    
      socket.on("video-package", (frame) => {
        playerServiceRef.current.onVideoFrame(frame)
      })

      socket.on("audio-package", (frame) => {
        playerServiceRef.current.onAudioFrame(frame);
      })
    });
  }, []);

  return (
    <div>
      <button onClick={toggleIsPlaying}>{isPlaying ? "Pause" : "Play"}</button>
      <canvas
        width={1280}
        height={720}
        ref={canvasRef}
        style={{border: "1px solid gray", width: "480px"}}/>
    </div>
  )
}