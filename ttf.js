const svg2ttf = require("svg2ttf");
const ImageTracer = require("./public/javascripts/imagetracer_v1.2.1");
const PNG = require("pngjs").PNG;
const fs = require("graceful-fs"); // EMFILE 에러 해결을 위한 fs 라이브러리
const SVGIcons2SVGFontStream = require("svgicons2svgfont");

module.exports = (customOption, save_dir, fontName) => {
  let fontStream = new SVGIcons2SVGFontStream({
    fontName: fontName,
  });

  // 폴더 에러 방지
  try {
    fs.statSync("svg_font");
  } catch (err) {
    if (err.code === "ENOENT") {
      fs.mkdirSync("svg_font");
    }
  }

  try {
    fs.statSync("svgs");
  } catch (err) {
    if (err.code === "ENOENT") {
      fs.mkdirSync("svgs");
    }
  }

  try {
    fs.statSync("fonts");
  } catch (err) {
    if (err.code === "ENOENT") {
      fs.mkdirSync("fonts");
    }
  }

  let fileNames = fs.readdirSync(save_dir);

  let sources = [];

  // 원본 파일 이름으로부터 유니코드명 및 svg 파일 이름 추출
  for (let i = 0; i < fileNames.length; i++) {
    sources[i] = "0x" + fileNames[i].substring(0, 5);
  }

  // 각각의 이미지로부터 각각의 SVG 파일 생성
  for (let i = 0; i < fileNames.length; i++) {
    let j = i;

    let data = fs.readFileSync(`${save_dir}/${fileNames[j]}`);
    let png = PNG.sync.read(data);

    let imageData = {
      width: 224,
      height: 224,
      data: png.data,
    };

    // 벡터화 옵션 (폰트 스타일)
    let options = {
      ltres: customOption.ltres,
      qtres: customOption.qtres,
      strokewidth: customOption.strokewidth,
      pathomit: customOption.pathomit,
      blurradius: customOption.blurradius,
      blurdelta: customOption.blurdelta,
    };
    options.pal = [
      { r: 0, g: 0, b: 0, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 },
    ];
    options.linefilter = true;

    let svgString = ImageTracer.imagedataToSVG(imageData, options);
    fs.writeFileSync(`svgs/${fileNames[j]}.svg`, svgString);
  }

  // 폰트 이벤트리스너
  fontStream
    .pipe(fs.createWriteStream("svg_font/font.svg"))
    .on("finish", () => {
      let svgdata = fs.readFileSync("svg_font/font.svg", "utf8");
      let ttf = svg2ttf(svgdata, {});
      fs.writeFileSync("fonts/customfont.ttf", Buffer.from(ttf.buffer));
    })
    .on("error", (err) => {
      console.log(err);
    });

  // 여러 SVG 파일들을 하나의 SVG 파일로 생성
  for (let i = 0; i < sources.length; i++) {
    let glyph = fs.createReadStream(`svgs/${fileNames[i]}.svg`);
    glyph.metadata = {
      unicode: [String.fromCharCode(sources[i].toString(10))],
      name: `glyph${sources[i]}`,
    };
    fontStream.write(glyph);
  }

  fontStream.end();
};
