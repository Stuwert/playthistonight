const customPlatforms = [
  "Nintendo Switch",
  "Windows",
  "Mac",
  "Apple Arcade",
  "iOS",
  "PS4",
  "PS5",
  "Xbox",
  "Android",
  "Tabletop",
  "Stadia",
  "Luna",
  "Wii",
  "Wii U",
  "PS3",
  "Nintendo DS",
  "PS Vita",
  "Xbox One",
  "Xbox Series S/X",
  "Steam",
];
const verticals = ["piledriver"];

module.exports = (eleventyConfig) => {
  /**
   * Stuff about Tags
   */
  eleventyConfig.addCollection("tagList", function makeTagList(collection) {
    let tagSet;
    collection.getAll().forEach(function addItemsToTag(item) {
      if ("tags" in item.data) {
        tagSet = item.data.tags.filter(
          (tagItem, idx, restOfTags) =>
            !["all", "nav", "post", "post"].includes(tagItem) &&
            restOfTags.indexOf(tagItem) !== idx
        );
      }
      tagSet = [];
    });

    // returning an array in addCollection works in Eleventy 0.5.3
    return [...tagSet];
  });

  /**
   * Stuff about Platforms
   */
  customPlatforms.forEach((platform) => {
    eleventyConfig.addCollection(platform, (collectionList) => {
      return collectionList.getAll().filter(({ data: { platforms } }) => {
        if (!platforms) return false;

        return platforms.includes(platform);
      });
    });
  });

  eleventyConfig.addCollection("platformList", () => customPlatforms);

  /**
   * Stuff About Verticals
   */

  verticals.forEach((vertical) => {
    eleventyConfig.addCollection(vertical, (collectionList) => {
      return collectionList
        .getAll()
        .filter(({ data: { vertical: articleInVertical } }) => {
          return vertical === articleInVertical;
        });
    });
  });

  eleventyConfig.addCollection("verticalList", () => verticals);
};
