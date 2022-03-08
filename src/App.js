import { useState, useRef } from "react";
import preprocessImage from "./preprocess";
import Tesseract from "tesseract.js";
import "./App.css";
import * as fs from "fs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { MyDocument } from "./Document";
function App() {
  const [image, setImage] = useState("");
  const [text, setText] = useState("");
  // const [pin, setPin] = useState("");
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleChange = (event) => {
    setImage(URL.createObjectURL(event.target.files[0]));
    // setImage(`${window.location.origin}/${event.target.files[0].name}`);
    // const image = preprocessImage(canvasObj, event.target.files[0]);
  };

  const handleClick = () => {
    const canvas = canvasRef.current;
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(imageRef.current, 0, 0);
    ctx.putImageData(preprocessImage(canvas), 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");

    Tesseract.recognize(dataUrl, "eng", {
      logger: (m) => console.log(m),
    })
      .catch((err) => {
        console.error(err);
      })
      .then((result) => {
        // Get Confidence score
        let confidence = result.confidence;
        // Get full output
        let text = result.text;

        setText(text);
        // setPin(patterns);
      });
  };
  async function exportToWord() {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text })],
            }),
          ],
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "myWord.docx";
    link.click();
  }

  async function handlePdf() {
    <PDFDownloadLink document={<MyDocument />} fileName="fee_acceptance.pdf">
      {({ blob, url, loading, error }) =>
        loading ? "Loading document..." : "Download now!"
      }
    </PDFDownloadLink>;
  }
  return (
    <div className="App">
      <main className="App-main">
        <h3>Actual image uploaded</h3>
        <img src={image} className="App-logo" alt="logo" ref={imageRef} />
        <h3>Canvas</h3>
        <canvas ref={canvasRef} width={700} height={300}></canvas>
        <h3>Extracted text</h3>
        <div className="pin-box">
          <p> {text} </p>
        </div>
        <input type="file" onChange={handleChange} />
        <button onClick={handleClick} style={{ height: 50 }}>
          Convert to text
        </button>
        <button onClick={exportToWord} style={{ height: 50 }}>
          Convert to eord doc{" "}
        </button>
        <button onClick={exportToWord} style={{ height: 50 }}>
          {" "}
          <PDFDownloadLink
            document={<MyDocument text={text} />}
            fileName="myPdf.pdf"
          >
            {({ blob, url, loading, error }) =>
              loading ? "Loading document..." : "Download now!"
            }
          </PDFDownloadLink>{" "}
        </button>
      </main>
    </div>
  );
}

export default App;
