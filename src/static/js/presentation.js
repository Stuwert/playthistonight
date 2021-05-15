import Reveal from "reveal.js";
import Markdown from "reveal.js/plugin/markdown/markdown.esm";

const deck = new Reveal({
  plugins: [Markdown],
  width: 1080,
  height: 960,
});
deck.initialize();
