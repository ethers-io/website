import { readFileSync } from "fs";

const css = readFileSync("./style.css").toString();

const output = css.replace(/url\((.*)\)/g, (all, url) => {
    const base64 = readFileSync(url).toString("base64");
    return `url(data:image/svg+xml;base64,${ base64 })`;
});

console.log(output);
