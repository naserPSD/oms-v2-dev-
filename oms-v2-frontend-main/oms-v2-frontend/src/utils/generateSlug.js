export const generateSlug = (itemName) => {
  return itemName
    .toLowerCase() // Convert to lowercase
    .replace(/ /g, "-") // Replace spaces with dashes
    .replace(/[^\u0980-\u09FFa-z0-9-]/g, "");
};
