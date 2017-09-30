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
import breakpointHoc from 'src/plugins/debugger/views/BreakpointHoc';
import { blockStatement, statement, actionBox } from '../../../../../configs/designer-defaults.js';
// import StatementContainer from './statement-container';
import ASTNode from '../../../../../ast/node';
import SimpleBBox from '../../../../../ast/simple-bounding-box';
import './compound-statement-decorator.css';
// import ExpressionEditor from '../../../../../expression-editor/expression-editor-utils';
// import ActionBox from './action-box';
import DragDropManager from '../../../../../tool-palette/drag-drop-manager';
// import ActiveArbiter from './active-arbiter';
// import Breakpoint from './breakpoint';

const CLASS_MAP = {
    hidden: 'hide-action',
    visible: 'show-action',
    fade: 'delayed-hide-action',
};

/**
 * Wraps other UI elements and provide box with a heading.
 * Enrich elements with a action box and expression editors.
 */
class BlockStatementDecorator extends React.Component {

    /**
     * Initialize the block decorator.
     */
    constructor() {
        super();
        this.state = {
            active: 'hidden',
        };
        this.onDelete = this.onDelete.bind(this);
        this.onJumpToCodeLine = this.onJumpToCodeLine.bind(this);
        this.setActionVisibilityFalse = this.setActionVisibility.bind(this, false);
        this.setActionVisibilityTrue = this.setActionVisibility.bind(this, true);
        this.openExpressionEditor = e => this.openEditor(this.props.expression, this.props.editorOptions, e);
        this.openParameterEditor = e => this.openEditor(this.props.parameterEditorOptions.value,
            this.props.parameterEditorOptions, e);
    }
    /**
     * Handles click event of breakpoint, adds/remove breakpoint from the node when click event fired
     *
     */
    onBreakpointClick() {
        const { model } = this.props;
        const { isBreakpoint = false } = model;
        if (isBreakpoint) {
            model.removeBreakpoint();
        } else {
            model.addBreakpoint();
        }
    }

    /**
     * Removes self on delete button click. Note that model is retried form dropTarget for
     * backward compatibility with old components written when model was not required.
     * @returns {void}
     */
    onDelete() {
        const model = this.props.model || this.props.dropTarget;
        model.remove();
    }
    /**
     * Navigates to codeline in the source view from the design view node
     *
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
     * Shows the action box, depending on whether on child element, delays display.
     * @param {boolean} show - Display action box.
     * @param {MouseEvent} e - Mouse move event from moving on to or out of statement.
     */
    setActionVisibility(show, e) {
        if (!this.context.dragDropManager.isOnDrag()) {
            if (show) {
                const isInChildStatement = this.isInFocusableChild(e.target);
                const isFromChildStatement = this.isInFocusableChild(e.relatedTarget);

                if (!isInChildStatement) {
                    if (isFromChildStatement) {
                        this.context.activeArbiter.readyToDelayedActivate(this);
                    } else {
                        this.context.activeArbiter.readyToActivate(this);
                    }
                }
            } else {
                let elm = e.relatedTarget;
                let isInMe = false;
                while (elm && elm.getAttribute) {
                    if (elm === this.myRoot) {
                        isInMe = true;
                    }
                    elm = elm.parentNode;
                }
                if (!isInMe) {
                    this.context.activeArbiter.readyToDeactivate(this);
                }
            }
        }
    }

    /**
     * True if the given element is a child of this element that has it's own focus.
     * @private
     * @param {HTMLElement} elmToCheck - child to be checked.
     * @return {boolean} True if child is focusable.
     */
    isInFocusableChild(elmToCheck) {
        const regex = new RegExp('(^|\\s)((compound-)?statement|life-line-group)(\\s|$)');
        let isInStatement = false;
        let elm = elmToCheck;
        while (elm && elm !== this.myRoot && elm.getAttribute) {
            if (regex.test(elm.getAttribute('class'))) {
                isInStatement = true;
            }
            elm = elm.parentNode;
        }
        return isInStatement;
    }

    /**
     * renders an ExpressionEditor in the header space.
     * @param {string} value - Initial value.
     * @param {object} options - options to be sent to ExpressionEditor.
     */
    openEditor(value, options) {
        const packageScope = this.context.environment;
        if (value && options) {
            new ExpressionEditor(
                this.conditionBox,
                this.onUpdate.bind(this),
                options,
                packageScope).render(this.context.getOverlayContainer());
        }
    }

    /**
     * Render breakpoint element.
     * @private
     * @return {XML} React element of the breakpoint.
     */
    renderBreakpointIndicator() {
        const breakpointSize = 14;
        const { bBox } = this.props;
        const breakpointHalf = breakpointSize / 2;
        const pointX = bBox.getRight() - breakpointHalf;
        const pointY = (bBox.y + statement.gutter.v) - breakpointHalf;
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
        const { bBox, title, dropTarget, expression, isBreakpoint, isDebugHit} = this.props;
        const model = this.props.model;
        const viewState = model.viewState;
        const titleH = blockStatement.heading.height;
        const titleW = this.props.titleWidth;
        const statementBBox = viewState.components['statement-box'];

        const p1X = statementBBox.x;
        const p1Y = statementBBox.y + titleH;
        const p2X = statementBBox.x + titleW;
        const p2Y = statementBBox.y + titleH;
        const p3X = statementBBox.x + titleW + 10;
        const p3Y = statementBBox.y;

        const titleX = statementBBox.x + (titleW / 2);
        const titleY = statementBBox.y + (titleH / 2);

        let expressionX = 0;
        if (expression) {
            expressionX = p3X + statement.padding.left;
        }
        let paramSeparatorX = 0;
        let parameterText = null;
        if (this.props.parameterBbox && this.props.parameterEditorOptions) {
            paramSeparatorX = this.props.parameterBbox.x;
            parameterText = this.props.parameterEditorOptions.value;
        }

        this.conditionBox = new SimpleBBox(bBox.x, bBox.y, bBox.w, titleH);
        const isCompact = this.context.mode === 'compact';
        const actionBoxBbox = new SimpleBBox(
            isCompact ? bBox.x - actionBox.width - 2 : bBox.x + ((bBox.w - actionBox.width) / 2),
            bBox.y + titleH + actionBox.padding.top,
            actionBox.width,
            actionBox.height);
        const utilClassName = CLASS_MAP[this.state.active];

        let statementRectClass = 'statement-title-rect';
        if (isDebugHit) {
            statementRectClass = `${statementRectClass} debug-hit`;
        }
        const separatorGapV = titleH / 3;
        return (
            <g
                onMouseOut={this.setActionVisibilityFalse}
                onMouseOver={this.setActionVisibilityTrue}
                ref={(group) => {
                    this.myRoot = group;
                }}
            >
                <rect
                    x={statementBBox.x}
                    y={statementBBox.y}
                    width={statementBBox.w}
                    height={statementBBox.h}
                    className="background-empty-rect"
                />
                <rect
                    x={statementBBox.x}
                    y={statementBBox.y}
                    width={statementBBox.w}
                    height={titleH}
                    rx="0"
                    ry="0"
                    className={statementRectClass}
                    onClick={!parameterText && this.openExpressionEditor}
                />
                <text x={titleX} y={titleY} className="statement-text">{title}</text>

                {expression &&
                <text
                    x={expressionX}
                    y={titleY}
                    className="condition-text"
                    onClick={this.openExpressionEditor}
                >
                    {expression.text}
                </text>}

                {parameterText &&
                <g>
                    <line
                        x1={paramSeparatorX}
                        y1={titleY - separatorGapV}
                        y2={titleY + separatorGapV}
                        x2={paramSeparatorX}
                        className="parameter-separator"
                    />
                    <text
                        x={paramSeparatorX + blockStatement.heading.paramPaddingX}
                        y={titleY}
                        className="condition-text"
                        onClick={this.openParameterEditor}
                    >
                        ( {parameterText} )
                    </text>
                </g>}

                <polyline points={`${p1X},${p1Y} ${p2X},${p2Y} ${p3X},${p3Y}`} className="statement-title-polyline" />

                {
                    <g className={utilClassName}>
                        {this.props.utilities}
                    </g>
                }
                { isBreakpoint && this.renderBreakpointIndicator() }
            </g>);
    }
}

BlockStatementDecorator.defaultProps = {
    draggable: null,
    undeletable: false,
    titleWidth: blockStatement.heading.width,
    editorOptions: null,
    parameterEditorOptions: null,
    utilities: null,
    parameterBbox: null,
    expression: null,
    disabledButtons: {
        debug: false,
        delete: false,
        jump: false,
    },
};

BlockStatementDecorator.propTypes = {
    draggable: PropTypes.func,
    title: PropTypes.string.isRequired,
    model: PropTypes.instanceOf(ASTNode).isRequired,
    children: PropTypes.arrayOf(React.PropTypes.node).isRequired,
    utilities: PropTypes.element,
    bBox: PropTypes.instanceOf(SimpleBBox).isRequired,
    parameterBbox: PropTypes.instanceOf(SimpleBBox),
    undeletable: PropTypes.bool,
    dropTarget: PropTypes.instanceOf(ASTNode).isRequired,
    titleWidth: PropTypes.number,
    expression: PropTypes.shape({
        text: PropTypes.string,
    }),
    editorOptions: PropTypes.shape({
        propertyType: PropTypes.string,
        key: PropTypes.string,
        model: PropTypes.instanceOf(ASTNode),
        getterMethod: PropTypes.func,
        setterMethod: PropTypes.func,
    }),
    parameterEditorOptions: PropTypes.shape({
        propertyType: PropTypes.string,
        key: PropTypes.string,
        value: PropTypes.string,
        model: PropTypes.instanceOf(ASTNode),
        getterMethod: PropTypes.func,
        setterMethod: PropTypes.func,
    }),
    onBreakpointClick: PropTypes.func.isRequired,
    isBreakpoint: PropTypes.bool.isRequired,
    disabledButtons: PropTypes.shape({
        debug: PropTypes.bool.isRequired,
        delete: PropTypes.bool.isRequired,
        jump: PropTypes.bool.isRequired,
    }),
};

BlockStatementDecorator.contextTypes = {
    getOverlayContainer: PropTypes.instanceOf(Object).isRequired,
    environment: PropTypes.instanceOf(Object).isRequired,
    dragDropManager: PropTypes.instanceOf(DragDropManager).isRequired,
    editor: PropTypes.instanceOf(Object).isRequired,
    mode: PropTypes.string,
};

export default breakpointHoc(BlockStatementDecorator);
