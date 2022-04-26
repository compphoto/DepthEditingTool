export const getImageUrl = file => {
  if (file) {
    return URL.createObjectURL(file);
  }
  return;
};

export const scribblePathConverter = (path, rectangle) => {
  let [temp_x, temp_y, w, h] = rectangle;
  let newArray = [];
  path.forEach((element, key) => {
    if (key % 50 === 0) {
      let { x, y } = element["start"];
      newArray.push([y - temp_y, x - temp_x]);
    }
  });
  let { x, y } = path[path.length - 1]["end"];
  newArray.push([y - temp_y, x - temp_x]);
  return newArray;
};
