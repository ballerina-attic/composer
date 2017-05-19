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
import _ from 'lodash';
import {statement} from './../configs/designer-defaults';
import {lifeLine} from './../configs/designer-defaults';
import ASTNode from '../ast/node';
import ActionBox from './action-box';
import DragDropManager from '../tool-palette/drag-drop-manager';
import SimpleBBox from './../ast/simple-bounding-box';
import * as DesignerDefaults from './../configs/designer-defaults';
import MessageManager from './../visitors/message-manager';
import ASTFactory from './../ast/ballerina-ast-factory';
import './statement-decorator.css';
import ArrowDecorator from './arrow-decorator';
import BackwardArrowDecorator from './backward-arrow-decorator';
import ExpressionEditor from 'expression_editor_utils';
import ImageUtil from './image-util';
import Breakpoint from './breakpoint';
import ActiveArbiter from './active-arbiter';

const text_offset = 50;

class StatementDecorator extends React.Component {

	constructor(props, context) {
		super(props, context);
        const {dragDropManager} = context;
        dragDropManager.on('drag-start', this.startDropZones.bind(this));
        dragDropManager.on('drag-stop', this.stopDragZones.bind(this));

		this.state = {
		    innerDropZoneActivated: false,
	        innerDropZoneDropNotAllowed: false,
	        innerDropZoneExist: false,
            active: 'hidden'
		};
	}

	startDropZones() {
        this.setState({innerDropZoneExist: true});
    }

	stopDragZones() {
        this.setState({innerDropZoneExist: false});
    }

    onDelete() {
        this.props.model.remove();
    }

	onJumptoCodeLine() {
			const {viewState: {fullExpression}} = this.props;
			const {renderingContext: {ballerinaFileEditor}} = this.context;

			const container = ballerinaFileEditor._container;
			$(container).find('.view-source-btn').trigger('click');
			ballerinaFileEditor.getSourceView().jumpToLine({expression: fullExpression});
	}

	renderBreakpointIndicator() {
			const breakpointSize = 14;
			const pointX = this.statementBox.x + this.statementBox.w - breakpointSize/2;
			const pointY = this.statementBox.y - breakpointSize/2;
			return (
					<Breakpoint
							x={pointX}
							y={pointY}
							size={breakpointSize}
							isBreakpoint={this.props.model.isBreakpoint}
							onClick = { () => this.onBreakpointClick() }
					/>
			);
	}

	onBreakpointClick() {
			const { model } = this.props;
			const { isBreakpoint = false } = model;
			if(model.isBreakpoint) {
					model.removeBreakpoint();
			} else {
					model.addBreakpoint();
			}
	}

	render() {
		const { viewState, expression ,model} = this.props;
		let bBox = viewState.bBox;
		let innerZoneHeight = viewState.components['drop-zone'].h;

		// calculate the bBox for the statement
		this.statementBox = {};
		this.statementBox.h = bBox.h - innerZoneHeight;
		this.statementBox.y = bBox.y + innerZoneHeight;
		this.statementBox.w = bBox.w;
		this.statementBox.x = bBox.x;
		// we need to draw a drop box above and a statement box
		const text_x = bBox.x + (bBox.w / 2);
		const text_y = this.statementBox.y + (this.statementBox.h / 2);
		const drop_zone_x = bBox.x + (bBox.w - lifeLine.width)/2;
		const innerDropZoneActivated = this.state.innerDropZoneActivated;
		const innerDropZoneDropNotAllowed = this.state.innerDropZoneDropNotAllowed;
		let arrowStart = { x: 0, y: 0 };
		let arrowEnd = { x: 0, y: 0 };
		let backArrowStart = { x: 0, y: 0 };
		let backArrowEnd = { x: 0, y: 0 };
		const dropZoneClassName = ((!innerDropZoneActivated) ? "inner-drop-zone" : "inner-drop-zone active")
											+ ((innerDropZoneDropNotAllowed) ? " block" : "");

		const arrowStartPointX = bBox.getRight();
		const arrowStartPointY = this.statementBox.y + this.statementBox.h/2;
		const radius = 10;

		let actionInvocation;
		let isActionInvocation = false;
		let connector;
		if (ASTFactory.isAssignmentStatement(model)) {
			actionInvocation = model.getChildren()[1].getChildren()[0];
		} else if (ASTFactory.isVariableDefinitionStatement(model)) {
			actionInvocation = model.getChildren()[1];
		}

		if (actionInvocation) {
			isActionInvocation = !_.isNil(actionInvocation) && ASTFactory.isActionInvocationExpression(actionInvocation);
			if (!_.isNil(actionInvocation._connector)) {
				connector = actionInvocation._connector;

				// TODO: need a proper way to do this
				let isConnectorAvailable = !_.isEmpty(connector.getParent().filterChildren(function (child) {
					return child.id === connector.id;
				}));

				arrowStart.x = this.statementBox.x + this.statementBox.w;
				arrowStart.y = this.statementBox.y + this.statementBox.h/3;

				if (!isConnectorAvailable) {
					connector = undefined;
					actionInvocation._connector = undefined;
				} else {
					arrowEnd.x = connector.getViewState().bBox.x + connector.getViewState().bBox.w/2;
				}

				arrowEnd.y = arrowStart.y;
				backArrowStart.x = arrowEnd.x;
				backArrowStart.y = this.statementBox.y + (2 * this.statementBox.h/3);
				backArrowEnd.x = arrowStart.x;
				backArrowEnd.y = backArrowStart.y;
			}
		}
		const actionBbox = new SimpleBBox();
        const fill = this.state.innerDropZoneExist ? {} : {fill:'none'};
		actionBbox.w = DesignerDefaults.actionBox.width;
		actionBbox.h = DesignerDefaults.actionBox.height;
		actionBbox.x = bBox.x + ( bBox.w - actionBbox.w) / 2;
		actionBbox.y = bBox.y + bBox.h + DesignerDefaults.actionBox.padding.top;
		let statementRectClass = "statement-rect";
		if(model.isDebugHit) {
				statementRectClass = `${statementRectClass} debug-hit`;
		}

		return (
            <g className="statement"
               onMouseOut={ this.setActionVisibility.bind(this, false) }
               onMouseOver={ this.setActionVisibility.bind(this, true)}>
						<rect x={drop_zone_x} y={bBox.y} width={lifeLine.width} height={innerZoneHeight}
			                className={dropZoneClassName} {...fill}
						 		onMouseOver={(e) => this.onDropZoneActivate(e)}
								onMouseOut={(e) => this.onDropZoneDeactivate(e)}/>
						<rect x={bBox.x} y={this.statementBox.y} width={bBox.w} height={this.statementBox.h} className={statementRectClass}
							  onClick={(e) => this.openExpressionEditor(e)} />
						<g className="statement-body">
							<text x={text_x} y={text_y} className="statement-text" onClick={(e) => this.openExpressionEditor(e)}>{expression}</text>
						</g>
						<ActionBox
                            bBox={ actionBbox }
                            show={ this.state.active }
                            isBreakpoint={model.isBreakpoint}
                            onDelete={ () => this.onDelete() }
                            onJumptoCodeLine={ () => this.onJumptoCodeLine() }
                            onBreakpointClick={ () => this.onBreakpointClick() }
						/>

						{isActionInvocation &&
							<g>
								<circle cx={arrowStartPointX}
								cy={arrowStartPointY}
								r={radius}
								fill="#444"
								fillOpacity={0}
								onMouseOver={(e) => this.onArrowStartPointMouseOver(e)}
								onMouseOut={(e) => this.onArrowStartPointMouseOut(e)}
								onMouseDown={(e) => this.onMouseDown(e)}
								onMouseUp={(e) => this.onMouseUp(e)}/>
								{connector && <ArrowDecorator start={arrowStart} end={arrowEnd} enable={true}/>}
								{connector && <BackwardArrowDecorator start={backArrowStart} end={backArrowEnd} enable={true}/>}
							</g>
						}
						{		model.isBreakpoint &&
								this.renderBreakpointIndicator()
						}
				{this.props.children}
				</g>);
	}

  setActionVisibility (show) {
      if (!this.context.dragDropManager.isOnDrag()) {
          if (show) {
              this.context.activeArbiter.readyToActivate(this);
          } else {
              this.context.activeArbiter.readyToDeactivate(this);
          }
      }
  }

	onDropZoneActivate (e) {
			const dragDropManager = this.context.dragDropManager,
						dropTarget = this.props.model.getParent(),
						model = this.props.model;
			if(dragDropManager.isOnDrag()) {
					if(_.isEqual(dragDropManager.getActivatedDropTarget(), dropTarget)){
							return;
					}
					dragDropManager.setActivatedDropTarget(dropTarget,
							(nodeBeingDragged) => {
									// IMPORTANT: override node's default validation logic
									// This drop zone is for statements only.
									// Statements should only be allowed here.
									return model.getFactory().isStatement(nodeBeingDragged);
							},
							() => {
									return dropTarget.getIndexOfChild(model);
							}
					);
					this.setState({innerDropZoneActivated: true,
							innerDropZoneDropNotAllowed: !dragDropManager.isAtValidDropTarget()
					});
					dragDropManager.once('drop-target-changed', function(){
							this.setState({innerDropZoneActivated: false, innerDropZoneDropNotAllowed: false});
					}, this);
			}
	}

	onDropZoneDeactivate (e) {
			const dragDropManager = this.context.dragDropManager,
						dropTarget = this.props.model.getParent();
			if(dragDropManager.isOnDrag()){
					if(_.isEqual(dragDropManager.getActivatedDropTarget(), dropTarget)){
							dragDropManager.clearActivatedDropTarget();
							this.setState({innerDropZoneActivated: false, innerDropZoneDropNotAllowed: false});
					}
			}
	}

	onArrowStartPointMouseOver (e) {
		e.target.style.fill = '#444';
		e.target.style.fillOpacity = 0.5;
		e.target.style.cursor = 'url(images/BlackHandwriting.cur), pointer';
	}

	onArrowStartPointMouseOut (e) {
		e.target.style.fill = '#444';
		e.target.style.fillOpacity = 0;
	}

	onMouseDown (e) {
		const messageManager = this.context.messageManager;
		const model = this.props.model;
		const bBox = model.getViewState().bBox;
		const statement_h = this.statementBox.h;
		const messageStartX = bBox.x +  bBox.w;
		const messageStartY = this.statementBox.y +  statement_h/2;
		let actionInvocation;
		if (ASTFactory.isAssignmentStatement(model)) {
			actionInvocation = model.getChildren()[1].getChildren()[0];
		} else if (ASTFactory.isVariableDefinitionStatement(model)) {
			actionInvocation = model.getChildren()[1];
		}
		messageManager.setSource(actionInvocation);
		messageManager.setIsOnDrag(true);
		messageManager.setMessageStart(messageStartX, messageStartY);

		messageManager.setTargetValidationCallback(function (destination) {
			return actionInvocation.messageDrawTargetAllowed(destination);
		});

		messageManager.startDrawMessage(function (source, destination) {
			source.setConnector(destination);
			model.generateStatementString();
			model.trigger('tree-modified', {type:'custom', title:'action set'});
		});
	}

	onMouseUp (e) {
		const messageManager = this.context.messageManager;
		messageManager.reset();
	}

	openExpressionEditor(e){
		let options = this.props.editorOptions;
		let packageScope = this.context.renderingContext.packagedScopedEnvironemnt;
		if(options){
			new ExpressionEditor( this.statementBox , this.context.container ,
				(text) => this.onUpdate(text), options , packageScope );
		}
	}

	onUpdate(text){
	}

}

StatementDecorator.propTypes = {
	bBox: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired,
		w: PropTypes.number.isRequired,
		h: PropTypes.number.isRequired,
	}),
	model: PropTypes.instanceOf(ASTNode).isRequired,
	expression: PropTypes.string.isRequired,
};

StatementDecorator.contextTypes = {
	 dragDropManager: PropTypes.instanceOf(DragDropManager).isRequired,
	 messageManager: PropTypes.instanceOf(MessageManager).isRequired,
	 container: PropTypes.instanceOf(Object).isRequired,
	 renderingContext: PropTypes.instanceOf(Object).isRequired,
     activeArbiter: PropTypes.instanceOf(ActiveArbiter).isRequired
};


export default StatementDecorator;
