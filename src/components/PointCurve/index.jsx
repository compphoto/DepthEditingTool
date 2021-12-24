import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import PointCurveStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import {
  cloneCanvas,
  drawCanvasImage,
  drawMainImage,
  cropCanvas,
  editBoundingArea,
  highlightPixelArea,
  editHighlightPixelArea,
  getRatio,
  getDimension,
  drawBox,
  drawScaledCanvasImage,
  modifyBitmap
} from "utils/canvasUtils";
import { runCanvasOperations, runTempDepthOperations } from "utils/stackOperations";
import { addEffect } from "@react-three/fiber";

let objectUrl = null;
let circle1 = new Path2D();
let circle2 = new Path2D();

class PointCurve extends Component {
  constructor() {
    super();
    this.pointCurveRef = createRef();
  }
  state = {
    initBoundingBox: null,
    cp1: {
      x: 0,
      y: 0
    },
    cp2: {
      x: 0,
      y: 0
    },
    selectedControl: null
  };
  drawPointCurve = () => {
    const { cp1, cp2 } = this.state;
    const pointCurveCanvas = this.pointCurveRef.current;
    const pointCurveContext = pointCurveCanvas.getContext("2d");

    pointCurveContext.clearRect(0, 0, pointCurveCanvas.width, pointCurveCanvas.height);
    pointCurveContext.beginPath();
    pointCurveContext.moveTo(0, 0);
    pointCurveContext.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, pointCurveCanvas.width, pointCurveCanvas.height);
    pointCurveContext.stroke();

    // Start and end points

    pointCurveContext.fillStyle = "blue";
    pointCurveContext.beginPath();
    pointCurveContext.arc(0, 0, 5, 0, 2 * Math.PI); // Start point
    pointCurveContext.arc(pointCurveCanvas.width, pointCurveCanvas.height, 5, 0, 2 * Math.PI); // End point
    pointCurveContext.fill();

    // Control points
    circle1 = new Path2D();
    circle2 = new Path2D();
    circle1.arc(cp1.x, cp1.y, 5, 0, 2 * Math.PI); // Control point one
    pointCurveContext.fillStyle = "red";
    pointCurveContext.fill(circle1);
    circle2.arc(cp2.x, cp2.y, 5, 0, 2 * Math.PI); // Control point two
    pointCurveContext.fillStyle = "red";
    pointCurveContext.fill(circle2);
  };
  moveCurve = e => {
    const { selectedControl } = this.state;
    if (selectedControl === "cp1") {
      this.setState(
        {
          cp1: {
            x: e.layerX,
            y: e.layerY
          }
        },
        () => {
          this.drawPointCurve();
        }
      );
    }
    if (selectedControl === "cp2") {
      this.setState(
        {
          cp2: {
            x: e.layerX,
            y: e.layerY
          }
        },
        () => {
          this.drawPointCurve();
        }
      );
    }
  };
  selectCurve = e => {
    const pointCurveCanvas = this.pointCurveRef.current;
    const pointCurveContext = pointCurveCanvas.getContext("2d");
    let sc = null;
    if (pointCurveContext.isPointInPath(circle1, e.layerX, e.layerY)) {
      sc = "cp1";
    }
    if (pointCurveContext.isPointInPath(circle2, e.layerX, e.layerY)) {
      sc = "cp2";
    }
    this.setState({ selectedControl: sc });
  };
  componentDidMount() {
    const pointCurveCanvas = this.pointCurveRef.current;
    this.setState({ cp2: { x: pointCurveCanvas.width, y: pointCurveCanvas.height } }, () => {
      this.drawPointCurve();
      pointCurveCanvas.addEventListener("mousedown", this.selectCurve);
      pointCurveCanvas.addEventListener("mousemove", this.moveCurve);
    });
  }
  // componentDidUpdate(prevProps, prevState) {
  //   let { pointCurveRef } = this;
  //   let {
  //     pointCurveUrl,
  //     mainDepthCanvas,
  //     tempDepthCanvas,
  //     prevDepthSize,
  //     depthCanvasDimension,
  //     bitmapCanvas,
  //     tools,
  //     toolsParameters,
  //     parameters,
  //     operationStack,
  //     initImage,
  //     storeParameters,
  //     addOperation,
  //     removeOperation,
  //     addEffect
  //   } = this.props;
  //   let depthCanvas = pointCurveRef.current;
  //   let depthContext = depthCanvas.getContext("2d");

  //   if (prevProps.tools.currentTool !== tools.currentTool) {
  //     if (tools.currentTool) {
  //       depthCanvas.addEventListener("click", this.drawBoundingBox);
  //     } else {
  //       depthCanvas.removeEventListener("click", this.drawBoundingBox);
  //       const bitmapContext = bitmapCanvas.getContext("2d");
  //       bitmapContext.clearRect(0, 0, bitmapCanvas.width, bitmapCanvas.height);
  //       removeOperation({
  //         name: "depthStack",
  //         value: drawBox
  //       });
  //       storeParameters({
  //         croppedCanvasImage: null,
  //         croppedArea: null,
  //         histogramParams: {
  //           pixelRange: [0, 255],
  //           domain: [0, 255],
  //           values: [0, 255],
  //           update: [0, 255]
  //         }
  //       });
  //     }
  //   }
  //   if (
  //     prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage ||
  //     prevProps.tempDepthCanvas !== tempDepthCanvas
  //   ) {
  //     if (parameters.croppedCanvasImage) {
  //       let histDepthData = getImageData(parameters.croppedCanvasImage);
  //       this.setState({ data: histDepthData });
  //     } else {
  //       if (tempDepthCanvas) {
  //         const boundingBox = [
  //           depthCanvasDimension[0],
  //           depthCanvasDimension[1],
  //           depthCanvasDimension[2] - depthCanvasDimension[0],
  //           depthCanvasDimension[3] - depthCanvasDimension[1]
  //         ];
  //         let histDepthData = getImageData(cropCanvas(tempDepthCanvas, boundingBox));
  //         this.setState({ data: histDepthData });
  //       }
  //     }
  //   }
  // }
  componentWillUnmount() {
    const pointCurveCanvas = this.pointCurveRef.current;
    pointCurveCanvas.removeEventListener("mousedown", this.selectCurve);
    pointCurveCanvas.removeEventListener("mousemove", this.moveCurve);
  }
  render() {
    const { pointCurveRef } = this;
    const { selectedControl } = this.state;
    // const depthCanvas = pointCurveRef.current;
    // const { mainDepthCanvas, parameters, tools, storeParameters, addOperation } = this.props;
    // const { scale, translatePos, startDragOffset, mouseDown } = parameters.canvasParams;
    return (
      <PointCurveStyle>
        <canvas
          width="200px"
          height="200px"
          ref={pointCurveRef}
          onMouseUp={e => selectedControl && this.setState({ selectedControl: null })}
          onMouseOver={e => selectedControl && this.setState({ selectedControl: null })}
          onMouseOut={e => selectedControl && this.setState({ selectedControl: null })}
        ></canvas>
      </PointCurveStyle>
    );
  }
}

const mapStateToProps = state => ({
  // pointCurveUrl: imageSelectors.pointCurveUrl(state),
  // mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  // tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  // prevDepthSize: imageSelectors.prevDepthSize(state),
  // depthCanvasDimension: imageSelectors.depthCanvasDimension(state),
  // bitmapCanvas: imageSelectors.bitmapCanvas(state),
  // tools: imageSelectors.tools(state),
  // toolsParameters: imageSelectors.toolsParameters(state),
  // parameters: imageSelectors.parameters(state),
  // operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  storeParameters: imageActions.storeParameters,
  addOperation: imageActions.addOperation,
  removeOperation: imageActions.removeOperation,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(PointCurve);
