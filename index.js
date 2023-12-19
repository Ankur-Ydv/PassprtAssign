const express = require("express");
const fileUpload = require("express-fileupload");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.json());
app.use(fileUpload());

app.get("/", async (req, res) => {
  try {
    const jsonData = {
      message: "Welcome to the Movie Ticket Generator API",
      version: "1.0",
      date: new Date(),
    };

    res.json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/generate-ticket", async (req, res) => {
  try {
    const { experienceName, date, numberOfPersons, customerName } = req.body;

    const bookingId = generateUniqueId();

    const canvas = createCanvas(400, 800);
    const ctx = canvas.getContext("2d");

    const backgroundImage = await loadImage("./ticket.jpg");
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Add text to the canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`${bookingId}`, 110, 30);

    ctx.fillStyle = "black";
    ctx.fillText(`${date}`, 40, 330);
    ctx.fillText(`${numberOfPersons}`, 330, 408);
    ctx.fillText(`${customerName}`, 40, 410);
    ctx.fillText(`${bookingId}`, 120, 630);

    const imagePath = `./tickets/ticket_${bookingId}.png`;
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => {
      res.download(imagePath, "ticket.png", () => {
        fs.unlinkSync(imagePath);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function generateUniqueId() {
  // Implement your unique ID generation logic here (e.g., using the uuid library)
  // For simplicity, let's use a timestamp for now
  return Date.now().toString();
}
