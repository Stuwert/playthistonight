const { DateTime } = require("luxon");
const UglifyJS = require("uglify-es");
const htmlmin = require("html-minifier");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSEO = require("eleventy-plugin-seo");
const { JSDOM } = require("jsdom");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSEO, require("./_data/metadata.json"));

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addCollection("myCollectionName", function(collectionApi) {
    // get unsorted items
    const test = collectionApi.getAll();

    console.log(test);
  });

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

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

  eleventyConfig.addFilter("getRelatedPosts", function(values, { tags: tagsForCurrentPost, title: titleOfCurrentPost, writingType: writingTypeOfCurrentPost }) {
    if (!tagsForCurrentPost) return [];

    return values.filter( ({data: { tags, title , writingType} }) => {
      if (title === titleOfCurrentPost) return false;
      if (writingType !== writingTypeOfCurrentPost) return false;

      return !!tagsForCurrentPost.find( (tag) => {
        if (['posts', 'post'].includes(tag)) return false;

        return tags.includes(tag);
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
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
