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

  eleventyConfig.addCollection("genreList", function(collection) {
    let genreList = new Set();
    collection.getAll().forEach(function(item) {
      if( "tags" in item.data ) {

        // These are technically tags but they get turned into genres
        for (const tag of tags) {
          genreList.add(tag);
        }
      }
    });

    // returning an array in addCollection works in Eleventy 0.5.3
    return [...genreList];
  });

  eleventyConfig.addCollection("platformList", function() {
    return customPlatforms;
  })

}
