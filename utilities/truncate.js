exports.truncate = (textToTruncate, lengthToTruncate) => {
  if (textToTruncate.length <= lengthToTruncate) { return textToTruncate; }
  const subString = textToTruncate.substr(0, lengthToTruncate - 1); // the original check
  return `${subString.substr(0, subString.lastIndexOf(' '))}&hellip;`;
};
