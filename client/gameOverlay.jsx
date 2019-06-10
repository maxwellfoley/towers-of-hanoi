import React, { Component } from 'react';
import Sizer from './sizer';

export default class GameOverlay extends Component {
  constructor(props) {
    super(props);
    this.box = React.createRef();
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
  }

  resize() {
    var height = .48*window.innerWidth > .8*window.innerHeight ? .8*window.innerHeight : .48*window.innerWidth;
    this.box.current.style.height =  height;
  }

  componentWillUnmount() {
    //cleanup
    window.removeEventListener('resize', this.resize, false);
  }
  render() {
    var height = .48*window.innerWidth > .8*window.innerHeight ? .8*window.innerHeight : .48*window.innerWidth;

    return (
      <Sizer>
        <div id="overlay-outer" ref={this.box} style={{height:height}}>
          <div id="overlay-inner">
            { this.props.children }
          </div>
        </div>
      </Sizer>
    )
  }
}