import React, { Fragment } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { MuiRail, MuiHandle, MuiTrack, MuiTick } from "./components";
import BarChart from "./barchart";

class RangeSlider extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { parameters, storeParameters } = this.props;
    const { domain, values, update } = parameters.histogramParams;
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
            storeParameters({
              histogramParams: {
                ...parameters.histogramParams,
                pixelRange: update,
                update
              }
            })
          }
          onChange={values =>
            storeParameters({
              histogramParams: {
                ...parameters.histogramParams,
                values
              }
            })
          }
          values={values}
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
