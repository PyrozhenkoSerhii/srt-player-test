/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AudioPlayer } from "./AudioPlayer";

const audioPlayer = new AudioPlayer();

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const toggleIsPlaying = () => {
    setIsPlaying((prev) => !prev);
    audioPlayer.togglePlayback();
  }

  useEffect(() => {
    if(!canvasRef.current) return;

    const context = canvasRef.current?.getContext("2d");
    const socket = io("localhost:8000");

    socket.on("connect", () => {
      console.log("connected", socket.id);
    
      socket.on("video-package", (data) => {
        // console.log(`Received a video-package of size: ${data.byteLength}`);

        const array = new Uint8ClampedArray(data);
        const image = new ImageData(array, 1280, 720);
        context.putImageData(image, 0, 0);
      })

      socket.on("audio-package", (data) => {
        // console.log(`Received an audio-package of size: ${data.byteLength}`);
        audioPlayer.onData(data);
      })
    });
  }, [canvasRef.current]);

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