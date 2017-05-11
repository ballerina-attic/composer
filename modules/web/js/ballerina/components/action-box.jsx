/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from "react";
import PropTypes from 'prop-types';
import ImageUtil from './image-util';
import './action-box.css';
import Breakpoint from './breakpoint';

class ActionBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {inGracePeriod: false};
    this.isFirstRender = true;
  }

  render() {
    const bBox = this.props.bBox;
    const numIcons = 3;
    const iconSize = 14;
    const y = bBox.y + (bBox.h - iconSize) / 2
    const horizontalGap = (bBox.w - iconSize * numIcons) / (numIcons + 1);
    const className = this.isFirstRender ? 'hide-action' : ( this.props.show ? "show-action" : "delayed-hide-action");

    return (<g className={className}>
                   <rect x={ bBox.x } y={ bBox.y } width={ bBox.w } height={ bBox.h } rx="0" ry="0" className="property-pane-action-button-wrapper"></rect>
                   <image width={ iconSize } height={ iconSize } className="property-pane-action-button-delete"
                      onClick={this.props.onDelete} xlinkHref={ ImageUtil.getSVGIconString("delete") } x={bBox.x + horizontalGap} y={y}/>
                  <Breakpoint
                      x={bBox.x + iconSize + horizontalGap * 2}
                      y={y}
                      size={iconSize}
                      isBreakpoint={this.props.isBreakpoint}
                      onClick={this.props.onBreakpointClick}
                  />
                   <image width={ iconSize } height={ iconSize } className="property-pane-action-button-jump"
                      xlinkHref={ ImageUtil.getSVGIconString("code-design") }
                      x={bBox.x + iconSize * 2 + horizontalGap * 3}
                      y={y}
                      onClick={this.props.onJumptoCodeLine}
                  />
                </g>);
  }

  componentDidMount(){
    this.isFirstRender = false;
  }

}

ActionBox.propTypes = {
  bBox: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired,
  }),
  isBreakpoint: PropTypes.bool,
  onBreakpointClick: PropTypes.func
}


export default ActionBox;
