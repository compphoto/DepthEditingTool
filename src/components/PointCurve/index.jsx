import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import PointCurveStyle from "./style";
import { dimensionToBox, adjustTone } from "utils/canvasUtils";

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
    cpS: {
      x: 0,
      y: 0
    },
    cp1: {
      x: 0,
      y: 0
    },
    cp2: {
      x: 0,
      y: 0
    },
    cpE: {
      x: 0,
      y: 0
    },
    selectedControl: null
  };
  isPointInPath = (x1, y1, x2, y2) => {
    if (x2 >= x1 - 15 && x2 <= x1 + 15 && y2 >= y1 - 15 && y2 <= y1 + 15) {
      return true;
    }
    return false;
  };
  drawPointCurve = () => {
    const { cpS, cp1, cp2, cpE } = this.state;
    const pointCurveCanvas = this.pointCurveRef.current;
    const pointCurveContext = pointCurveCanvas.getContext("2d");

    pointCurveContext.clearRect(0, 0, pointCurveCanvas.width, pointCurveCanvas.height);
    pointCurveContext.beginPath();
    pointCurveContext.moveTo(cpS.x, cpS.y);
    pointCurveContext.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, cpE.x, cpE.y);
    pointCurveContext.stroke();

    // Start and end points

    pointCurveContext.fillStyle = "blue";
    pointCurveContext.beginPath();
    pointCurveContext.arc(cpS.x, cpS.y, 5, 0, 2 * Math.PI); // Start point
    pointCurveContext.arc(cpE.x, cpE.y, 5, 0, 2 * Math.PI); // End point
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
    const { cp1, cp2 } = this.state;
    let sc = null;
    if (this.isPointInPath(cp1.x, cp1.y, e.layerX, e.layerY)) {
      sc = "cp1";
    }
    if (this.isPointInPath(cp2.x, cp2.y, e.layerX, e.layerY)) {
      sc = "cp2";
    }
    this.setState({ selectedControl: sc });
  };
  componentDidMount() {
    const pointCurveCanvas = this.pointCurveRef.current;
    this.setState(
      {
        cpS: { x: 0, y: pointCurveCanvas.width },
        cp1: { x: 0, y: pointCurveCanvas.width },
        cp2: { x: pointCurveCanvas.width, y: 0 },
        cpE: { x: pointCurveCanvas.width, y: 0 }
      },
      () => {
        this.drawPointCurve();
        pointCurveCanvas.addEventListener("mousedown", this.selectCurve);
        pointCurveCanvas.addEventListener("mousemove", this.moveCurve);
      }
    );
  }
  componentWillUnmount() {
    const pointCurveCanvas = this.pointCurveRef.current;
    pointCurveCanvas.removeEventListener("mousedown", this.selectCurve);
    pointCurveCanvas.removeEventListener("mousemove", this.moveCurve);
  }
  render() {
    const { pointCurveRef } = this;
    const { cpS, cp1, cp2, cpE, selectedControl } = this.state;
    const { depthCanvasDimension, parameters, addEffect } = this.props;
    return (
      <PointCurveStyle>
        <canvas
          width="200px"
          height="200px"
          ref={pointCurveRef}
          onMouseOut={e => selectedControl && this.setState({ selectedControl: null })}
          onMouseOver={e => selectedControl && this.setState({ selectedControl: null })}
          onMouseUp={e => {
            if (selectedControl) {
              const { croppedArea } = parameters;
              if (croppedArea || depthCanvasDimension) {
                let newArea = null;
                if (croppedArea) {
                  newArea = croppedArea;
                } else {
                  newArea = dimensionToBox(depthCanvasDimension);
                }
                addEffect({
                  name: "depthStack",
                  value: {
                    func: adjustTone,
                    params: [newArea, cpS, cp1, cp2, cpE]
                  }
                });
              }
              this.setState({ selectedControl: null });
            }
          }}
        ></canvas>
      </PointCurveStyle>
    );
  }
}

const mapStateToProps = state => ({
  depthCanvasDimension: imageSelectors.depthCanvasDimension(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(PointCurve);
