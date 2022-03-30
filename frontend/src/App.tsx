import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { Player } from "./services/Player";
import { FrameStructure } from "./utils/interfaces";

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
      console.log(`[socket] Connected with id ${socket.id}`);
    
      socket.on("video-package", (frame: FrameStructure) => {
        playerServiceRef.current.onVideoFrame(frame)
      })

      socket.on("audio-package", (frame: FrameStructure) => {
        playerServiceRef.current.onAudioFrame(frame);
      })
    });
  }, []);

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <button 
        onClick={toggleIsPlaying}
        style={{width: "150px"}}
      >
        {isPlaying ? "Pause Playback" : "Start Playback"}
      </button>

      <canvas
        width={1280}
        height={720}
        ref={canvasRef}
        style={{border: "1px solid gray", width: "80%", minWidth: "480px", margin: "5px 0"}}/>
    </div>
  )
}