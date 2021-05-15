/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
module.exports = function loadEleventyConfig(eleventyConfig) {
  eleventyConfig.addPlugin(require("eleventy-load"), {
    rules: [
      {
        test: /\.(md|html)$/,
        loaders: [
          {
            loader: require("eleventy-load-html"),
          },
        ],
      },
      {
        test: /\.js$/,
        loaders: [
          {
            loader: require("eleventy-load-js"),
          },
          {
            loader: require("eleventy-load-file"),
          },
        ],
      },
    ],
  });
};
