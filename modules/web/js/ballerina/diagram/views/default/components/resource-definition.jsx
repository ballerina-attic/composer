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
import ResourceDefinitionAST from 'ballerina/ast/resource-definition';
import { getCanvasOverlay } from 'ballerina/configs/app-context';
import LifeLineDecorator from './lifeline.jsx';
import StatementContainer from './statement-container';
import PanelDecorator from './panel-decorator';
import ResourceTransportLink from './resource-transport-link';
import { getComponentForNodeArray, getDesigner } from './../../../diagram-util';
import { lifeLine } from './../../../../configs/designer-defaults';
import ImageUtil from './image-util';
import ASTFactory from '../../../../ast/ast-factory.js';
import ActionMenu from './action-menu';

class ResourceDefinition extends React.Component {

    constructor(props) {
        super(props);
    }
    /**
     * @override
     * @memberof ServiceDefinition
     */
    componentDidMount() {
        this.createActionMenu();
    }

    /**
     * @override
     * @memberof ServiceDefinition
     */
    componentDidUpdate() {
        ReactDOM.unmountComponentAtNode(this.actionMenuWrapper);
        const canvasOverlay = getCanvasOverlay();
        canvasOverlay.removeChild(this.actionMenuWrapper);
        this.createActionMenu();
    }

    canDropToPanelBody(nodeBeingDragged) {
        const nodeFactory = ASTFactory;
        // IMPORTANT: override default validation logic
        // Panel's drop zone is for worker and connector declarations only.
        // Statements should only be allowed on top of resource worker's dropzone.
        return nodeFactory.isConnectorDeclaration(nodeBeingDragged)
            || nodeFactory.isWorkerDeclaration(nodeBeingDragged);
    }

    /**
     * Creates the action menu.
     * @memberof ServiceDefinition
     */
    createActionMenu() {
        const model = this.props.model;
        const designer = getDesigner(['default']);
        const canvasOverlay = getCanvasOverlay();
        // Recreating content
        this.actionMenuWrapper = document.createElement('div');
        this.actionMenuWrapper.className = 'action-menu-wrapper';
        this.actionMenuWrapper.style.top = model.getViewState().components.body.y + designer.actionMenu.topOffset + 'px';
        this.actionMenuWrapper.style.left = model.getViewState().components.body.x + designer.actionMenu.leftOffset + 'px';
        canvasOverlay.appendChild(this.actionMenuWrapper);

        const actionMenuItems = [];

        const addAnnotationButton = {
            key: this.props.model.getID(),
            icon: 'fw-add',
            text: 'Add Annotation',
            onClick: () => {
                model.getViewState().showAddAnnotations = true;
                model.getViewState().showAnnotationContainer = true;
                this.context.editor.update();
            },
        };
        actionMenuItems.push(addAnnotationButton);
        if (model.getViewState().showAnnotationContainer) {
            const hideAnnotations = {
                key: this.props.model.getID(),
                icon: 'fw-hide',
                text: 'Hide Annotations',
                onClick: () => {
                    model.getViewState().showAnnotationContainer = false;
                    this.context.editor.update();
                },
            };
            actionMenuItems.push(hideAnnotations);
        } else {
            const showAnnotations = {
                key: this.props.model.getID(),
                icon: 'fw-view',
                text: 'Show Annotations',
                onClick: () => {
                    model.getViewState().showAnnotationContainer = true;
                    this.context.editor.update();
                },
            };
            actionMenuItems.push(showAnnotations);
        }

        const actionMenu = React.createElement(ActionMenu, { items: actionMenuItems }, null);
        ReactDOM.render(actionMenu, this.actionMenuWrapper);
    }

    render() {
        const bBox = this.props.model.viewState.bBox;
        const name = this.props.model.getResourceName();
        const statementContainerBBox = this.props.model.getViewState().components.statementContainer;
        const statementContainerBBoxClone = Object.assign({}, this.props.model.getViewState().components.statementContainer);
        const connectorOffset = this.props.model.getViewState().components.statementContainer.expansionW;
        statementContainerBBoxClone.w += connectorOffset;
        const workerScopeContainerBBox = this.props.model.getViewState().components.workerScopeContainer;
        // lets calculate function worker lifeline bounding box.
        const resourceWorkerBBox = {};
        resourceWorkerBBox.x = statementContainerBBox.x + (statementContainerBBox.w - lifeLine.width) / 2;
        resourceWorkerBBox.y = statementContainerBBox.y - lifeLine.head.height;
        resourceWorkerBBox.w = lifeLine.width;
        resourceWorkerBBox.h = statementContainerBBox.h + lifeLine.head.height * 2;

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
        }];

        let annotationBodyHeight = 0;
        if (!_.isNil(this.props.model.viewState.components.annotation)) {
            annotationBodyHeight = this.props.model.viewState.components.annotation.h;
        }

        const tLinkBox = Object.assign({}, bBox);
        tLinkBox.y += annotationBodyHeight;

        return (
            <g>
                <ResourceTransportLink bBox={tLinkBox} />
                <PanelDecorator
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
                        <StatementContainer dropTarget={this.props.model} bBox={statementContainerBBoxClone}>
                            {children}
                        </StatementContainer>
                    </g>
                </PanelDecorator>
            </g>);
    }
}

ResourceDefinition.propTypes = {
    model: PropTypes.instanceOf(ResourceDefinitionAST).isRequired,
};

ResourceDefinition.contextTypes = {
    editor: PropTypes.instanceOf(Object).isRequired,
    mode: PropTypes.string,
};

export default ResourceDefinition;
