const { DateTime } = require("luxon");
const UglifyJS = require("uglify-es");
const htmlmin = require("html-minifier");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSEO = require("eleventy-plugin-seo");
const { JSDOM } = require("jsdom");
const { truncate } = require('./utilities/truncate');
const loadCustomCollections = require('./utilities/loadCustomCollections');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSEO, require("./_data/metadata.json"));

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");
  loadCustomCollections(eleventyConfig);

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // From: https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
  eleventyConfig.addFilter("capitalizeFirst", (str) => str.charAt(0).toUpperCase() + str.slice(1));

  eleventyConfig.addFilter("truncateAt", truncate)

  // Helps debug accessible data from njk file  
  eleventyConfig.addFilter("keys", (thing) => Object.keys(thing).join(", "))

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machinedate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
  });

  // Get the first n elements of an array
  eleventyConfig.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });


  // Minify JS
  eleventyConfig.addFilter("jsmin", function (code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });
  eleventyConfig.addFilter("dataSort", (collection, dataKey) => {
    return collection.sort((a, b) => {
      return a.data[dataKey] - b.data[dataKey];
    });
  });

  eleventyConfig.addFilter("getFirst", (postContent, htmlEl) => {
    const {
      window: { document: htmlDoc },
    } = new JSDOM(postContent, "text/html");
    return htmlDoc.querySelector(htmlEl);
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath.indexOf(".html") > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  eleventyConfig.addFilter("getRelatedPosts", function(posts, { platforms: platformsForCurrentPost, title: titleOfCurrentPost, writingType: writingTypeOfCurrentPost }) {
    if (!platformsForCurrentPost) return [];

    return posts.filter( ({data: { platforms, title , writingType, negative: isNegative } }) => {
      // Defaults to not sharing negative reviews
      if (isNegative) return false;
      if (title === titleOfCurrentPost) return false;
      if (writingType !== writingTypeOfCurrentPost) return false;
      if (!platforms || !platforms.length) return false;

      return !!platformsForCurrentPost.find( (platformInCurrentPost) => {
        return platforms.includes(platformInCurrentPost);
      })
    })
  });


  // only content in the `posts/` directory
  eleventyConfig.addCollection("posts", function (collection) {
    return collection.getAllSorted().filter(function (item) {
      return item.inputPath.match(/^\.\/posts\//) !== null;
    });
  });

  eleventyConfig.addCollection("designs", function (collection) {
    return collection.getAllSorted().filter(function (item) {
      return item.inputPath.match(/^\.\/designs\//) !== null;
    });
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("static/img");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy({ "_includes/assets/": "assets/"} );

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true,
    breaks: true,
    linkify: true,
  };
  let opts = {
    permalink: false,
  };

  eleventyConfig.setLibrary(
    "md",
    markdownIt(options).use(markdownItAnchor, opts)
  );

  // eleventyConfig.addPlugin(socialImages);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addWatchTarget("./src/sass/");

  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/favicon.png");

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addShortcode("packageVersion", () => `v${packageVersion}`);

  eleventyConfig.addFilter("slug", (str) => {
    if (!str) {
      return;
    }

    const regex = emojiRegex();
    // Remove Emoji first
    let string = str.replace(regex, "");

    return slugify(string, {
      lower: true,
      replacement: "-",
      remove: /[*+~·,()'"`´%!?¿:@\/]/g,
    });
  });

  /* Markdown Overrides */
  const markdownLibrary = markdownIt({
    html: true,
  }).use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "tdbc-anchor",
    permalinkSymbol: "#",
    permalinkSpace: false,
    level: [1, 2, 3],
    slugify: (s) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[\s+~\/]/g, "-")
        .replace(/[().`,%·'"!?¿:@*]/g, ""),
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      output: "public",
    },
  };
};
