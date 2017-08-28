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
import _ from 'lodash';
import LifeLineDecorator from './lifeline.jsx';
import StatementContainer from './statement-container';
import PanelDecorator from './panel-decorator';
import ParameterDefinition from './parameter-definition';
import ResourceTransportLink from './resource-transport-link';
import { getComponentForNodeArray } from './../../../diagram-util';
import { lifeLine } from './../../../../configs/designer-defaults';
import ImageUtil from './image-util';
import ASTFactory from '../../../../ast/ast-factory.js';

class ResourceDefinition extends React.Component {

    constructor(props) {
        super(props);
        this.designer = _.get(props, 'designer');
        this.mode = _.get(props, 'mode');
    }

    canDropToPanelBody(nodeBeingDragged) {
        const nodeFactory = ASTFactory;
        // IMPORTANT: override default validation logic
        // Panel's drop zone is for worker and connector declarations only.
        // Statements should only be allowed on top of resource worker's dropzone.
        return nodeFactory.isConnectorDeclaration(nodeBeingDragged)
            || nodeFactory.isWorkerDeclaration(nodeBeingDragged);
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
        const resource_worker_bBox = {};
        resource_worker_bBox.x = statementContainerBBox.x + (statementContainerBBox.w - lifeLine.width) / 2;
        resource_worker_bBox.y = statementContainerBBox.y - lifeLine.head.height;
        resource_worker_bBox.w = lifeLine.width;
        resource_worker_bBox.h = statementContainerBBox.h + lifeLine.head.height * 2;

        const classes = {
            lineClass: 'default-worker-life-line',
            polygonClass: 'default-worker-life-line-polygon',
        };


        const children = getComponentForNodeArray(this.props.model.getChildren(), this.props.designer, this.props.mode);
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
                            bBox={resource_worker_bBox}
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

export default ResourceDefinition;
