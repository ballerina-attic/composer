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
import _ from 'lodash';
import breakpointHoc from 'src/plugins/debugger/views/BreakpointHoc';
import ExpressionEditor from 'plugins/ballerina/expression-editor/expression-editor-utils';
import ActionBox from './action-box';
import SimpleBBox from './../../../../../model/view/simple-bounding-box';
import './statement-decorator.css';
import Breakpoint from './breakpoint';
import ActiveArbiter from './active-arbiter';
import Node from '../../../../../model/tree/node';
import DropZone from '../../../../../drag-drop/DropZone';
import ArrowDecorator from './arrow-decorator';
import StatementPropertyItemSelector from './../utils/statement-property-item-selector';
import TreeUtil from '../../../../../model/tree-util';
import splitVariableDefByLambda from '../../../../../model/lambda-util';
import { getComponentForNodeArray } from '../../../../diagram-util';

/**
 * Wraps other UI elements and provide box with a heading.
 * Enrich elements with a action box and expression editors.
 */
class ActionInvocationDecorator extends React.Component {

    /**
     * Calculate statement box.
     * @param {object} props - New props.
     * @return {SimpleBBox} - Statement box.
     */
    static calculateStatementBox(props) {
        const { viewState } = props;
        const { bBox } = viewState;
        const innerZoneHeight = viewState.components['drop-zone'].h;
        return new SimpleBBox(bBox.x, bBox.y + innerZoneHeight, bBox.w, bBox.h - innerZoneHeight);
    }

    /**
     *
     * @param {object} props - Init props.
     * Initialize the statement decorator.
     */
    constructor(props) {
        super();
        this.setActionVisibilityFalse = this.setActionVisibility.bind(this, false);
        this.setActionVisibilityTrue = this.setActionVisibility.bind(this, true);

        this.state = {
            active: 'hidden',
            statementBox: ActionInvocationDecorator.calculateStatementBox(props),
        };
    }

    /**
     * Calculate statement box on props change.
     * @param {object} props - Next props.
     */
    componentWillReceiveProps(props) {
        this.setState({ statementBox: ActionInvocationDecorator.calculateStatementBox(props) });
    }

    /**
     * Removes self on delete button click.
     * @returns {void}
     */
    onDelete() {
        this.props.model.remove();
    }

    /**
     * Navigates to code line in the source view from the design view node
     */
    onJumpToCodeLine() {
        const { editor } = this.context;
        editor.goToSource(this.props.model);
    }

    /**
     * Call-back for when a new value is entered via expression editor.
     */
    onUpdate() {
        // TODO: implement validate logic.
    }

    /**
     * Shows the action box.
     * @param {boolean} show - Display action box if true or else hide.
     */
    setActionVisibility(show) {
        if (show) {
            this.context.activeArbiter.readyToActivate(this);
        } else {
            this.context.activeArbiter.readyToDeactivate(this);
        }
    }

    /**
     * renders an ExpressionEditor in the statement box.
     */
    openEditor() {
        const options = this.props.editorOptions;
        const packageScope = this.context.environment;
        const ballerinaFileEditor = this.context.editor;
        if (options) {
            new ExpressionEditor(this.state.statementBox,
                text => this.onUpdate(text), options, packageScope, ballerinaFileEditor)
                        .render(this.context.getOverlayContainer());
        }
    }

    /**
     * Renders breakpoint indicator
     * @return {XML} Breakpoint react element.
     */
    renderBreakpointIndicator() {
        const breakpointSize = 14;
        const bBox = this.state.statementBox;
        const breakpointHalf = breakpointSize / 2;
        const pointX = bBox.getRight() - breakpointHalf;
        const pointY = bBox.y - breakpointHalf;
        return (
            <Breakpoint
                x={pointX}
                y={pointY}
                size={breakpointSize}
                isBreakpoint={this.props.isBreakpoint}
                onClick={() => this.props.onBreakpointClick()}
            />
        );
    }

    /**
     * Override the rendering logic.
     * @returns {XML} rendered component.
     */
    render() {
        const { viewState, expression, isBreakpoint } = this.props;
        const statementBox = viewState.components['statement-box'];
        const dropZone = viewState.components['drop-zone'];
        const text = viewState.components.text;

        const actionBoxBbox = new SimpleBBox();

        const { designer } = this.context;
        actionBoxBbox.w = (3 * designer.config.actionBox.width) / 4;
        actionBoxBbox.h = designer.config.actionBox.height;
        actionBoxBbox.x = statementBox.x + ((statementBox.w - actionBoxBbox.w) / 2);
        actionBoxBbox.y = statementBox.y + statementBox.h + designer.config.actionBox.padding.top;

        let tooltip = null;
        if (viewState.fullExpression !== expression) {
            const fullExp = _.trimEnd(this.props.viewState.fullExpression, ';');
            tooltip = (<title>{fullExp}</title>);
        }

        let dropDownItems;
        const dropDownItemMeta = [];
        let backwardArrowStart;
        let backwardArrowEnd;
        if (viewState.isActionInvocation) {
            // TODO: Need to remove the unique by filter whne the lang server item resolver is implemented
            dropDownItems = _.uniqBy(TreeUtil.getAllVisibleEndpoints(this.props.model.parent), (item) => {
                return item.variable.name.value;
            });
            dropDownItems.forEach((item) => {
                const meta = {
                    text: _.get(item, 'variable.name.value'),
                    callback: (newEp) => {
                        TreeUtil.changeInvocationEndpoint(this.props.model, newEp);
                        this.props.model.trigger('tree-modified', {
                            origin: this.props.model,
                            type: 'invocation-endpoint-change',
                            title: 'Change Target Endpoint',
                            data: {
                                node: this.props.model,
                            },
                        });
                    },
                };
                dropDownItemMeta.push(meta);
            });
            this.props.model.getSource();

            if (viewState.components.invocation) {
                backwardArrowStart = Object.assign({}, viewState.components.invocation.end);
                backwardArrowStart.y = viewState.components['statement-box'].y
                    + viewState.components['statement-box'].h - 10;
                backwardArrowEnd = Object.assign({}, viewState.components.invocation.start);
                backwardArrowEnd.y = backwardArrowStart.y;
            }
        }

        const { lambdas } = splitVariableDefByLambda(this.props.model);
        const bBox = viewState.bBox;
        const hiderTop = viewState.components['statement-box'].y + viewState.components['statement-box'].h + 1;
        let children = [];
        let hiderBottom = hiderTop;
        if (lambdas.length) {
            children = getComponentForNodeArray(lambdas);
            hiderBottom = lambdas[lambdas.length - 1].viewState.bBox.getBottom();
        }

        return (
            <g
                className='statement'
                onMouseOut={this.setActionVisibilityFalse}
                onMouseOver={this.setActionVisibilityTrue}
                ref={(group) => {
                    this.myRoot = group;
                }}
            >
                <line
                    x1={bBox.getCenterX()}
                    y1={hiderTop}
                    x2={bBox.getCenterX()}
                    y2={hiderBottom}
                    className='life-line-hider'
                />
                { children }
                <DropZone
                    model={this.props.model}
                    x={dropZone.x}
                    y={dropZone.y}
                    width={dropZone.w}
                    height={dropZone.h}
                    baseComponent='rect'
                    dropTarget={this.props.model.parent}
                    dropBefore={this.props.model}
                    renderUponDragStart
                    enableDragBg
                    enableCenterOverlayLine
                />
                <g>
                    <rect
                        x={statementBox.x}
                        y={statementBox.y}
                        width={statementBox.w}
                        height={statementBox.h}
                        className='action-invocation-statement-rect'
                        onClick={e => this.openEditor(e)}
                    >
                        {tooltip}
                    </rect>
                    <text
                        x={viewState.components.invocation.start.x
                            + this.context.designer.config.statement.padding.left}
                        y={viewState.components.invocation.start.y
                            - (this.context.designer.config.actionInvocationStatement.textHeight / 2)}
                        className='action-invocation-text'
                    >
                        {expression}
                    </text>
                </g>
                <ActionBox
                    bBox={actionBoxBbox}
                    show={this.state.active}
                    isBreakpoint={isBreakpoint}
                    onDelete={() => this.onDelete()}
                    onJumptoCodeLine={() => this.onJumpToCodeLine()}
                    onBreakpointClick={() => this.props.onBreakpointClick()}
                />
                <g>
                    <ArrowDecorator
                        start={viewState.components.invocation.start}
                        end={viewState.components.invocation.end}
                    />
                    <ArrowDecorator
                        start={backwardArrowStart}
                        end={backwardArrowEnd}
                        dashed
                    />
                </g>
                <StatementPropertyItemSelector
                    model={this.props.model}
                    bBox={this.props.model.viewState.components.dropDown}
                    itemsMeta={dropDownItemMeta}
                    show={this.state.active}
                />
                {isBreakpoint && this.renderBreakpointIndicator()}
                {this.props.children}
            </g>);
    }

}

ActionInvocationDecorator.defaultProps = {
    editorOptions: null,
    children: null,
};

ActionInvocationDecorator.propTypes = {
    viewState: PropTypes.shape({
        bBox: PropTypes.instanceOf(SimpleBBox),
        fullExpression: PropTypes.string,
        components: PropTypes.objectOf(PropTypes.instanceOf(SimpleBBox)),
    }).isRequired,
    children: PropTypes.node,
    model: PropTypes.instanceOf(Node).isRequired,
    expression: PropTypes.string.isRequired,
    editorOptions: PropTypes.shape({
        propertyType: PropTypes.string,
        key: PropTypes.string,
        model: PropTypes.instanceOf(Object),
        getterMethod: PropTypes.func,
        setterMethod: PropTypes.func,
    }),
    onBreakpointClick: PropTypes.func.isRequired,
    isBreakpoint: PropTypes.bool.isRequired,
};

ActionInvocationDecorator.contextTypes = {
    getOverlayContainer: PropTypes.instanceOf(Object).isRequired,
    editor: PropTypes.instanceOf(Object).isRequired,
    environment: PropTypes.instanceOf(Object).isRequired,
    activeArbiter: PropTypes.instanceOf(ActiveArbiter).isRequired,
    mode: PropTypes.string,
    designer: PropTypes.instanceOf(Object),
};


export default breakpointHoc(ActionInvocationDecorator);
