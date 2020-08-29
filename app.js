const express = require("express");
const fs = require("graceful-fs");
const bodyParser = require("body-parser");

const ttf_maker = require("./ttf.js");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`images`));

app.get("/", (req, res) => {
  // let files = fs.readdirSync(`ttf-maker/${save_dir}`);
  let files = fs.readdirSync(`./images/`);
  let samples = [
    files[100],
    files[200],
    files[300],
    files[400],
    files[500],
    files[600],
    files[700],
    files[800],
    files[900],
  ];

  res.send(`
  <!DOCTYPE html>
  <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>TESTing</title>
    </head>
    <body>
      <form action="/vector" method="POST">
        <div id="range_container">
          <p>ltres</p>
          <input name="ltres" type="range" min="0" max="2" step="0.1" value="1" style="width:350px;">
          <p>qtres</p>
          <input name="qtres" type="range" min="0" max="2" step="0.1" value="1" style="width:350px;">
          <p>strokewidth</p>
          <input name="strokewidth" type="range" min="0" max="2" step="0.1" value="1" style="width:350px;">
        </div>
        <div id="range_container2">
          <p>pathomit</p>
          <input name="pathomit" type="range" min="0" max="2" step="0.1" value="1" style="width:350px;">
          <p>blurradius</p>
          <input name="blurradius" type="range" min="0" max="2" step="0.1" value="1" style="width:350px;">
          <p>blurdelta</p>
          <input name="blurdelta" type="range" min="0" max="2" step="0.1" value="1" style="width:350px;">
          <input id="save_button" type="submit">Save</button>
        </div>   
      </form> 
      <!-- <img src="/${samples[0]}" alt="sample img"/> -->
      <img src="/${samples[0]}" alt="sample img"/>
    </body>
  </html>
`);
});

app.post("/vector", (req, res) => {
  const options = {
    ltres: req.body.ltres,
    qtres: req.body.qtres,
    strokewidth: req.body.strokewidth,
    pathomit: req.body.pathomit,
    blurradius: req.bodyblurradius,
    blurdelta: req.body.blurdelta,
  };

  ttf_maker(options, "images");

  res.redirect("/download_ttf");
});

app.get("/download_ttf", (req, res) => {
  const file = `ttf-fonts/customfont.ttf`;
  res.download(file);
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
