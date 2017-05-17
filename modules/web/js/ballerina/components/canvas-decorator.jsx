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

import React from 'react';
import PropTypes from 'prop-types';
import ASTNode from '../ast/node';
import DragDropManager from '../tool-palette/drag-drop-manager';
import MessageManager from './../visitors/message-manager';
import './canvas-decorator.css';
import {setCanvasOverlay, getCanvasOverlay} from '../configs/app-context';
import ArrowDecorator from './arrow-decorator';
import BackwardArrowDecorator from './backward-arrow-decorator';

class CanvasDecorator extends React.Component {
    constructor(props) {
      super(props);
      this.state = {dropZoneActivated: false, dropZoneDropNotAllowed: false};
    }

    render() {
        const { bBox = {} } = this.props;
        const dropZoneActivated = this.state.dropZoneActivated;
        const dropZoneDropNotAllowed = this.state.dropZoneDropNotAllowed;
        const canvasClassName = "svg-container" + (dropZoneActivated ? " drop-zone active" : "");
        const arrowStart = {
            x: 0,
            y: 0
        };
        const arrowEnd = {
            x: 0,
            y: 0
        };

        const dropZoneClassName = (dropZoneActivated ? "drop-zone active" : "drop-zone ")
                        + (dropZoneDropNotAllowed ? " blocked" : "");       
        return (
            <div>
                <div ref={x => {setCanvasOverlay(x);}}>
                    {/*This space is used to render html elements over svg*/ }
                </div>
                { (this.props.annotations) ? this.props.annotations : null }                
                <svg className={canvasClassName} width={ this.props.bBox.w } height={ this.props.bBox.h }>
                    <rect x="0" y="0"width="100%" height="100%"
                        className={dropZoneClassName}
                        onMouseOver={(e) => this.onDropZoneActivate(e)}
                        onMouseOut={(e) => this.onDropZoneDeactivate(e)}/>
                    {this.props.children}
                    <ArrowDecorator start={arrowStart} end={arrowEnd} enable={true} moveWithMessageManager={true}/>
                    <BackwardArrowDecorator start={arrowStart} end={arrowEnd} enable={true} moveWithMessageManager={true}/>
                </svg>
            </div>
        );
    }

    onDropZoneActivate (e) {
        const dragDropManager = this.context.dragDropManager,
              dropTarget = this.props.dropTarget;
        if(dragDropManager.isOnDrag()) {
            if(_.isEqual(dragDropManager.getActivatedDropTarget(), dropTarget)){
                return;
            }
            dragDropManager.setActivatedDropTarget(dropTarget);
            this.setState({dropZoneActivated: true,
                  dropZoneDropNotAllowed: !dragDropManager.isAtValidDropTarget()});
            dragDropManager.once('drop-target-changed', () => {
                this.setState({dropZoneActivated: false, dropZoneDropNotAllowed: false});
            });
        }
        e.stopPropagation();
    }

    onDropZoneDeactivate (e) {
        const dragDropManager = this.context.dragDropManager,
              dropTarget = this.props.dropTarget;
        if(dragDropManager.isOnDrag()){
            if(_.isEqual(dragDropManager.getActivatedDropTarget(), dropTarget)){
                dragDropManager.clearActivatedDropTarget();
                this.setState({dropZoneActivated: false, dropZoneDropNotAllowed: false});
            }
        }
        e.stopPropagation();
    }
}

CanvasDecorator.propTypes = {
    bBox: PropTypes.shape({
        h: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
    }).isRequired,
    children: PropTypes.node.isRequired,
    dropTarget: PropTypes.instanceOf(ASTNode).isRequired
}

CanvasDecorator.contextTypes = {
	 dragDropManager: PropTypes.instanceOf(DragDropManager).isRequired,
	 messageManager: PropTypes.instanceOf(MessageManager).isRequired
};

export default CanvasDecorator;
