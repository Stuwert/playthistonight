import Reveal from "reveal.js";
import Markdown from "reveal.js/plugin/markdown/markdown.esm";
import Highlight from "reveal.js/plugin/highlight/highlight.esm";

console.log(Highlight);
const deck = new Reveal({
  plugins: [Markdown, Highlight],
});
console.log(deck.hasPlugin("highlight"));

deck.initialize();
