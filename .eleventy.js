const { DateTime } = require("luxon");
const UglifyJS = require("uglify-es");
const htmlmin = require("html-minifier");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSEO = require("eleventy-plugin-seo");
const { JSDOM } = require("jsdom");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const { truncate } = require("./utilities/truncate");
const loadEleventyConfig = require("./utilities/eleventyload");
const loadCustomCollections = require("./utilities/loadCustomCollections");
const seoConfig = require("./src/_data/metadata.json");

module.exports = function setupEleventy(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSEO, seoConfig);
  // Sets up so that the loader will work
  loadEleventyConfig(eleventyConfig);

  eleventyConfig.addWatchTarget("./src/sass/");

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");
  loadCustomCollections(eleventyConfig);

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  eleventyConfig.addFilter("jsonStringify", (data) => JSON.stringify(data));

  eleventyConfig.addFilter("keys", (data) => Object.keys(data));

  // From: https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
  eleventyConfig.addFilter(
    "capitalizeFirst",
    (str) => str.charAt(0).toUpperCase() + str.slice(1)
  );

  eleventyConfig.addFilter("truncateAt", truncate);

  // Helps debug accessible data from njk file
  eleventyConfig.addFilter("keys", (thing) => Object.keys(thing).join(", "));

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machinedate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISO();
  });

  // Get the first n elements of an array
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Minify JS
  eleventyConfig.addFilter("jsmin", function minifyJs(code) {
    const minified = UglifyJS.minify(code);
    if (minified.error) {
      throw new Error(`Could not minify code ${minified.error}`);
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

  eleventyConfig.addFilter("getAll", (postContent, htmlEl, htmlProperty) => {
    const {
      window: { document: htmlDoc },
    } = new JSDOM(postContent, "text/html");

    const mappedElements = [];

    return htmlDoc.querySelectorAll(htmlEl).forEach((element) => {
      mappedElements.push(element[htmlProperty]);
    });
  });

  // Minify HTML output
  eleventyConfig.addTransform(
    "htmlmin",
    function minifyHtml(content, outputPath) {
      if (outputPath.indexOf(".html") > -1) {
        const minified = htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        });
        return minified;
      }
      return content;
    }
  );

  eleventyConfig.addFilter(
    "getRelatedPosts",
    function getRelatedPosts(
      posts,
      {
        platforms: platformsForCurrentPost,
        title: titleOfCurrentPost,
        writingType: writingTypeOfCurrentPost,
      }
    ) {
      if (!platformsForCurrentPost) return [];

      return posts.filter(
        ({ data: { platforms, title, writingType, negative: isNegative } }) => {
          // Defaults to not sharing negative reviews
          if (isNegative) return false;
          if (title === titleOfCurrentPost) return false;
          if (writingType !== writingTypeOfCurrentPost) return false;
          if (!platforms || !platforms.length) return false;

          return !!platformsForCurrentPost.find((platformInCurrentPost) => {
            return platforms.includes(platformInCurrentPost);
          });
        }
      );
    }
  );

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("src/static/img");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("admin");
  // eleventyConfig.addPassthroughCopy({ "src/_includes/assets/": "assets/"} );

  const options = {
    html: true,
    breaks: true,
    linkify: true,
  };
  const opts = {
    permalink: false,
  };

  eleventyConfig.setLibrary(
    "md",
    markdownIt(options).use(markdownItAnchor, opts)
  );

  return {
    templateFormats: ["md", "njk", "html", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
