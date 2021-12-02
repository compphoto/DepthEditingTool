import React, { Fragment } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Grid, Button, TextField } from "@material-ui/core";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { MuiRail, MuiHandle, MuiTrack, MuiTick } from "./components";
import BarChart from "./barchart";

class RangeSlider extends React.Component {
  constructor(props) {
    super(props);
    const range = [0, 255];
    this.state = {
      domain: range,
      update: range,
      values: range
    };
  }
  render() {
    const { domain, values, update } = this.state;
    const { parameters, storeParameters } = this.props;
    return (
      <Fragment>
        <BarChart data={this.props.data} highlight={update} />
        <Slider
          mode={3}
          step={1}
          domain={domain}
          rootStyle={{
            position: "relative",
            width: "100%"
          }}
          onUpdate={update =>
            this.setState({ update }, () => {
              storeParameters({
                pixelRange: [...update]
              });
            })
          }
          onChange={values => this.setState({ values: parameters.pixelRange })}
          values={parameters.pixelRange}
        >
          <Rail>{({ getRailProps }) => <MuiRail getRailProps={getRailProps} />}</Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <MuiHandle key={handle.id} handle={handle} domain={domain} getHandleProps={getHandleProps} />
                ))}
              </div>
            )}
          </Handles>
          <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <MuiTrack key={id} source={source} target={target} getTrackProps={getTrackProps} />
                ))}
              </div>
            )}
          </Tracks>
          <Ticks count={5}>
            {({ ticks }) => (
              <div className="slider-ticks">
                {ticks.map(tick => (
                  <MuiTick key={tick.id} tick={tick} count={ticks.length} />
                ))}
              </div>
            )}
          </Ticks>
        </Slider>
        <Grid container alignItems="center" justify="space-around" style={{ marginTop: "88px" }}>
          <Grid item xs={4} style={{ textAlign: "right" }}>
            <TextField
              variant="outlined"
              label="min disparity"
              value={parameters.pixelRange[0]}
              onChange={evt => {
                const value = evt.target.value;
                const newState = [value, parameters.pixelRange[1]];
                storeParameters({
                  pixelRange: [...newState]
                });
                if (value && value >= domain[0]) {
                  this.setState({ values: newState });
                }
              }}
            />
          </Grid>
          <Grid item xs={4} style={{ textAlign: "center" }}>
            —
          </Grid>
          <Grid item xs={4} style={{ textAlign: "left" }}>
            <TextField
              variant="outlined"
              label="max disparity"
              value={parameters.pixelRange[1]}
              onChange={evt => {
                const value = evt.target.value;
                const newState = [parameters.pixelRange[0], value];
                storeParameters({
                  pixelRange: [...newState]
                });
                if (value && value <= domain[1] && value >= values[0]) {
                  this.setState({ values: newState });
                }
              }}
            />
          </Grid>
        </Grid>
        <Button
          style={{ marginTop: "3%", marginBottom: "3%" }}
          onClick={() => {
            this.setState({
              values: domain,
              update: domain
            });
            storeParameters({
              pixelRange: [...domain]
            });
          }}
        >
          Reset
        </Button>
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  storeParameters: imageActions.storeParameters
};

export default connect(mapStateToProps, mapDispatchToProps)(RangeSlider);
