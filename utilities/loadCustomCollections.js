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

  // eleventyConfig.addCollection("platforms", function() {
  //   return customPlatforms;
  // })

}
