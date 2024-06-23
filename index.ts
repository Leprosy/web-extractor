import { Extractor } from "./lib/extractor/Extractor"; // TODO: switch this for _Extractor and do a benchmark
import { Fetcher } from "./lib/fetcher/Fetcher";
import { argv } from "node:process";
import fs from "node:fs";



const main = async () => {
  const _start = Date.now();
  const { txt, finalUrl } = await Fetcher(argv[2] || "https://l3pro.netlify.app/");
  //console.log("Content fetched is", { txt, finalUrl });
  const data = Extractor(txt, finalUrl);
  console.log("Final content is", { data });
  console.log("Execution time", Date.now() - _start, "ms");
  fs.writeFileSync("out.html", data);
};

main();

/*
Test URLS
https://kotaku.com/new-doom-dark-ages-trailer-bethesda-xbox-showcase-sgf-1851528789
https://www.latercera.com/nacional/noticia/minuto-a-minuto-este-domingo-se-realizan-las-elecciones-primarias-2024/2ML6PZFKSZBK7NKKCJ3U43VWCI/
https://nodejs.org/en/learn/manipulating-files/writing-files-with-nodejs
https://www.xataka.com/videojuegos/indiana-jones-gran-circulo-tiene-nuevo-trailer-plagado-referencias-a-peliculas-tremendo-apartado-visual
 */