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
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getCanvasOverlay } from 'ballerina/configs/app-context';
import StatementContainer from './statement-container';
import PanelDecorator from './panel-decorator';
import LifeLineDecorator from './lifeline.jsx';
import { getComponentForNodeArray, getDesigner } from './../../../diagram-util';
import { lifeLine } from './../../../../configs/designer-defaults';
import ConnectorActionAST from './../../../../ast/connector-action';
import ImageUtil from './image-util';
import ASTFactory from '../../../../ast/ast-factory.js';
import ActionMenu from './action-menu';

/**
 * React component for a connector action.
 *
 * @class ConnectorAction
 * @extends {React.Component}
 */
class ConnectorAction extends React.Component {

    /**
     * Creates an instance of ConnectorAction.
     * @param {Object} props React properties.
     * @memberof ConnectorAction
     */
    constructor(props) {
        super(props);
    }

    /**
     * @override
     */
    componentDidMount() {
        this.createActionMenu();
    }

    /**
     * @override
     */
    componentDidUpdate() {
        ReactDOM.unmountComponentAtNode(this.actionMenuWrapper);
        const canvasOverlay = getCanvasOverlay();
        canvasOverlay.removeChild(this.actionMenuWrapper);
        this.createActionMenu();
    }

    /**
     * Validating method that decides what can be dropped.
     *
     * @param {ASTNode} nodeBeingDragged Node that is being dropped.
     * @returns {boolean} true if {@link ConnectorDeclaration} or {@link WorkerDeclaration}, else false.
     * @memberof ConnectorAction
     */
    canDropToPanelBody(nodeBeingDragged) {
        const nodeFactory = ASTFactory;
        // IMPORTANT: override default validation logic
        // Panel's drop zone is for worker and connector declarations only.
        // Statements should only be allowed on top of resource worker's dropzone.
        return nodeFactory.isConnectorDeclaration(nodeBeingDragged)
            || nodeFactory.isWorkerDeclaration(nodeBeingDragged);
    }

    /**
     * Renders the view for a connector action.
     *
     * @returns {ReactElement} The view.
     * @memberof ConnectorAction
     */
    render() {
        const bBox = this.props.model.viewState.bBox;
        const name = this.props.model.getActionName();
        const statementContainerBBox = this.props.model.getViewState().components.statementContainer;
        const workerScopeContainerBBox = this.props.model.getViewState().components.workerScopeContainer;
        // lets calculate function worker lifeline bounding box.
        const resourceWorkerBBox = {};
        resourceWorkerBBox.x = statementContainerBBox.x + ((statementContainerBBox.w - lifeLine.width) / 2);
        resourceWorkerBBox.y = statementContainerBBox.y - lifeLine.head.height;
        resourceWorkerBBox.w = lifeLine.width;
        resourceWorkerBBox.h = statementContainerBBox.h + (lifeLine.head.height * 2);

        const classes = {
            lineClass: 'default-worker-life-line',
            polygonClass: 'default-worker-life-line-polygon',
        };
        const children = getComponentForNodeArray(this.props.model.getChildren(), this.context.mode);
        const nodeFactory = ASTFactory;
        // Check for connector declaration children
        const connectorChildren = (this.props.model.filterChildren(nodeFactory.isConnectorDeclaration));
        const titleComponentData = [{
            isNode: true,
            model: this.props.model.getArgumentParameterDefinitionHolder(),
        }, {
            isNode: true,
            model: this.props.model.getReturnParameterDefinitionHolder(),
        }];

        return (<PanelDecorator
            icon="tool-icons/resource"
            title={name}
            bBox={bBox}
            model={this.props.model}
            dropTarget={this.props.model}
            dropSourceValidateCB={node => this.canDropToPanelBody(node)}
            titleComponentData={titleComponentData}
        >
            <g>
                <LifeLineDecorator
                    title="default"
                    bBox={resourceWorkerBBox}
                    classes={classes}
                    icon={ImageUtil.getSVGIconString('tool-icons/worker-white')}
                    iconColor='#025482'
                />
                { connectorChildren.length > 0 &&
                <g>
                    <rect
                        x={workerScopeContainerBBox.x}
                        y={workerScopeContainerBBox.y}
                        width={workerScopeContainerBBox.w + workerScopeContainerBBox.expansionW}
                        height={workerScopeContainerBBox.h}
                        style={{ fill: 'none',
                            stroke: '#67696d',
                            strokeWidth: 2,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'miter',
                            strokeMiterlimit: 4,
                            strokeOpacity: 1,
                            strokeDasharray: 5 }}
                    /> </g> }
                <StatementContainer dropTarget={this.props.model} bBox={statementContainerBBox}>
                    {children}
                </StatementContainer>
            </g>
        </PanelDecorator>);
    }
}

ConnectorAction.propTypes = {
    model: PropTypes.instanceOf(ConnectorActionAST).isRequired,
    mode: PropTypes.string,
};

ConnectorAction.defaultProps = {
    mode: 'default',
};

ConnectorAction.contextTypes = {
    editor: PropTypes.instanceOf(Object).isRequired,
};

export default ConnectorAction;
