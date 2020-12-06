const customPlatforms = [ "Nintendo Switch", "Windows", "Mac", "Apple Arcade" , "iOS", "PS4", "PS5", "Xbox", "Android", "Tabletop", "Stadia", "Luna", "Wii", "Wii U", "PS3", "Nintendo DS", "PS Vita", "Xbox One", "Xbox Series S/X", "Steam" ];


module.exports = (eleventyConfig) => {
  customPlatforms.forEach( (platform) => {
    eleventyConfig.addCollection(platform, (collectionList) => {
      return collectionList.getAll().filter( ({ data: { platforms } }) => {
        if (!platforms) return false;

        return platforms.includes(platform);
      })
    })
  });

  eleventyConfig.addCollection("platformList", function() {
    return customPlatforms;
  })

  eleventyConfig.addCollection("tagList", function(collection) {
    let tagSet = new Set();
    collection.getAll().forEach(function(item) {
      if( "tags" in item.data ) {
        const tags = item.data.tags.filter((item) => !["all", "nav", "post", "post"].includes(item));

        for (const tag of tags) {
          tagSet.add(tag);
        }
      }
    });

    // returning an array in addCollection works in Eleventy 0.5.3
    return [...tagSet];
  });

}
