const svg2ttf = require("svg2ttf");
const ImageTracer = require("./public/javascripts/imagetracer_v1.2.1");
const PNG = require("pngjs").PNG;
const fs = require("graceful-fs"); // EMFILE 에러 해결을 위한 fs 라이브러리

module.exports = (customOption, save_dir) => {
  const SVGIcons2SVGFontStream = require("svgicons2svgfont");
  let fontStream = new SVGIcons2SVGFontStream({
    fontName: "customfont",
  });

  // 폴더가 없을 때 파일 읽기에 실패하는 에러 방지
  try {
    fs.mkdirSync("svg-font");
  } catch (error) {}

  let files = fs.readdirSync(`${save_dir}`);

  let sources = [];
  let fileName = [];

  // 원본 파일 이름으로부터 유니코드명 및 svg 파일 이름 추출
  for (let i = 0; i < files.length; i++) {
    sources[i] = "0x" + files[i].substring(0, 5);
    fileName[i] = files[i].substring(0, 5);
  }

  // 각각의 이미지로부터 각각의 SVG 파일 생성
  for (let i = 0; i < files.length; i++) {
    let j = i;

    let data = fs.readFileSync(`${save_dir}/${fileName[j]}.png`);
    let png = PNG.sync.read(data);

    let myImageData = {
      width: 128,
      height: 128,
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

    let svgstring = ImageTracer.imagedataToSVG(myImageData, options);
    try {
      fs.writeFileSync(`./svg/${fileName[j]}.svg`, svgstring);
    } catch (error) {
      fs.mkdirSync("svg");
      fs.writeFileSync(`./svg/${fileName[j]}.svg`, svgstring);
    }
  }

  // 폰트 이벤트리스너
  fontStream
    .pipe(fs.createWriteStream("./svg-font/font.svg"))
    .on("finish", () => {
      let svgdata = fs.readFileSync("./svg-font/font.svg", "utf8");
      let ttf = svg2ttf(svgdata, {});
      try {
        fs.writeFileSync("./ttf-fonts/customfont.ttf", new Buffer(ttf.buffer));
      } catch (error) {
        fs.mkdirSync("ttf-fonts");
        fs.writeFileSync("./ttf-fonts/customfont.ttf", new Buffer(ttf.buffer));
      }
    })
    .on("error", (err) => {
      console.log(err);
    });

  // 여러 SVG 파일들을 하나의 SVG 파일로 생성
  for (let i = 0; i < sources.length; i++) {
    let glyph = fs.createReadStream(`./svg/${fileName[i]}.svg`);
    glyph.metadata = {
      unicode: [String.fromCharCode(sources[i].toString(10))],
      name: `glyph${sources[i]}`,
    };
    fontStream.write(glyph);
  }

  fontStream.end();
};
