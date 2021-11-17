import * as d3 from "d3";

export const getImageData = img => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
  const src = context.getImageData(0, 0, img.width, img.height).data;
  let histBrightness = new Array(256).fill(0);
  for (let i = 0; i < src.length; i += 4) {
    let r = src[i];
    let g = src[i + 1];
    let b = src[i + 2];
    histBrightness[r]++;
    histBrightness[g]++;
    histBrightness[b]++;
  }
  return histBrightness;
};

export const processImage = (q, histBrightness) => {
  let W = (window.innerWidth / 1700) * 521;
  let H = W / 2;
  const svg = d3.select("#hist-svg");
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = W - margin.left - margin.right;
  const height = H - margin.top - margin.bottom;
  q.style.width = W;
  q.style.height = H;

  function graphComponent(histData) {
    d3.selectAll(".histogram").remove();
    d3.selectAll("g.y-axis").remove();

    let data = histData.map((value, key) => {
      return { freq: value, idx: +key };
    });
    let x = d3
      .scaleLinear()
      .range([0, width])
      .domain([
        0,
        d3.max(data, d => {
          return d.idx;
        })
      ]);
    let y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        d3.max(data, d => {
          return d.freq;
        })
      ]);
    let g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + -5 + ",0)")
      .call(d3.axisLeft(y).ticks(10).tickSizeInner(10).tickSizeOuter(2));
    g.selectAll(".histogram")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "histogram")
      .attr("fill", "gray")
      .attr("x", d => {
        return x(d.idx);
      })
      .attr("y", d => {
        return y(d.freq);
      })
      .attr("width", 2)
      .attr("opacity", 0.8)
      .attr("height", d => {
        return height - y(d.freq);
      });
  }
  graphComponent(histBrightness);
};
