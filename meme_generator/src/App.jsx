import React, { useEffect, useRef, useState } from "react";
import "./App.css";
export default function Meme() {
  const [meme, setMeme] = React.useState({
    topText: "",
    bottomText: "",
    randomImage: "https://i.imgflip.com/9ehk.jpg",
  });
  const [allMemes, setAllMemes] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function getMemes() {
      const res = await fetch("https://api.imgflip.com/get_memes");
      const data = await res.json();
      setAllMemes(data.data.memes);
    }
    getMemes();
  }, []);

  function getMemeImage() {
    const randomNumber = Math.floor(Math.random() * allMemes.length);
    const url = allMemes[randomNumber].url;
    setMeme((prevMeme) => ({
      ...prevMeme,
      randomImage: url,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setMeme((prevMeme) => ({
      ...prevMeme,
      [name]: value,
    }));
  }

  function downloadMemeImage() {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      context.font = "28px Impact";
      context.fillStyle = "white";
      context.strokeStyle = "black";
      context.lineWidth = 2;
      context.textAlign = "center";

      const topText = meme.topText;
      const bottomText = meme.bottomText;

      const maxTextWidth = canvas.width - 40;
      const textMargin = 20;

      // Wrap text function to fit within canvas width
      const wrapText = (text) => {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        for (const word of words) {
          const testLine =
            currentLine.length === 0 ? word : `${currentLine} ${word}`;
          const testLineWidth = context.measureText(testLine).width;

          if (testLineWidth < maxTextWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }

        lines.push(currentLine);
        return lines;
      };

      const topTextLines = wrapText(topText);
      const bottomTextLines = wrapText(bottomText);

      topTextLines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, textMargin + index * 36);
        context.strokeText(line, canvas.width / 2, textMargin + index * 36);
      });

      bottomTextLines.forEach((line, index) => {
        const y =
          canvas.height -
          textMargin -
          (bottomTextLines.length - 1 - index) * 36;
        context.fillText(line, canvas.width / 2, y);
        context.strokeText(line, canvas.width / 2, y);
      });

      const dataURL = canvas.toDataURL("image/jpeg", 1.0);

      // Create a temporary link for download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "meme.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    image.src = meme.randomImage;
  }

  return (
    <main>
      <div className="form">
        <input
          type="text"
          placeholder="Enter your epic punchline..."
          className="form--input"
          name="topText"
          value={meme.topText}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Give the meme its grand finale..."
          className="form--input"
          name="bottomText"
          value={meme.bottomText}
          onChange={handleChange}
        />
        <button className="form--button" onClick={getMemeImage}>
          Generate a Fresh Meme
        </button>
      </div>
      <div className="meme">
        <img src={meme.randomImage} alt="Meme" className="meme--image" />
        <h2 className="meme--text top">{meme.topText}</h2>
        <h2 className="meme--text bottom">{meme.bottomText}</h2>
      </div>
      <button className="download-button" onClick={downloadMemeImage}>
        Download Meme
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </main>
  );
}
