import React, { Component } from 'react';

//abstracted some redundant code into a component.
//basically the pop-up overlay, the game itself, and the options bar need to be
//  the same width, which is calculated dynamically based on the window size
//unfortunately we can't set height in here because the options bar needs to be
//  smaller height-wize or else there is no way to click the canvas underneath it

export default class Sizer extends Component {
  constructor(props) {
    super(props);
    this.box = React.createRef();
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
  }

  resize() {
    var height = .48*window.innerWidth > .8*window.innerHeight ? .8*window.innerHeight : .48*window.innerWidth;
    this.box.current.style.width =  1.6 * height;
  }

  componentWillUnmount() {
    //cleanup
    window.removeEventListener('resize', this.resize, false);
  }
  
  render() {
    var height = .48*window.innerWidth > .8*window.innerHeight ? .8*window.innerHeight : .48*window.innerWidth;

    return (
    <div id="sizer-container" > 
      <div 
        id="sizer-inner"
        ref={this.box} style={{width:1.6*height}}>
          { this.props.children }  
      </div>
    </div>)
  }
}