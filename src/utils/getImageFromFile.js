export const getImageUrl = file => {
  if (file) {
    return URL.createObjectURL(file);
  }
  return;
};
