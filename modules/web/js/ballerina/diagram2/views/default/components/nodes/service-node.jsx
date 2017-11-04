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
import PanelDecorator from './../decorators/panel-decorator';
import { getComponentForNodeArray } from './../../../../diagram-util';
import GlobalExpanded from './globals-expanded';
import GlobalDefinitions from './global-definitions';
import PanelDecoratorButton from './../decorators/panel-decorator-button';
import ServiceTransportLine from './service-transport-line';
import ImageUtil from './../../../../image-util';
import ServerConnectorProperties from '../utils/server-connector-properties';
import TreeUtil from '../../../../../model/tree-util';
import EndpointDecorator from '../decorators/endpoint-decorator';
import FragmentUtils from './../../../../../utils/fragment-utils';
import TreeBuilder from './../../../../../model/tree-builder';

/**
 * React component for a service definition.
 *
 * @class ServiceNode
 * @extends {React.Component}
 */
class ServiceNode extends React.Component {

    /**
     * Creates an instance of ServiceNode.
     * @param {Object} props React properties.
     * @memberof ServiceNode
     */
    constructor(props) {
        super(props);
        this.state = {
            addResource: false,
        };
        this.handleDeleteVariable = this.handleDeleteVariable.bind(this);
        this.handleAddVariable = this.handleAddVariable.bind(this);
        this.handleVarialblesBadgeClick = this.handleVarialblesBadgeClick.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    /**
     * Event handler when the swagger button of the service definition panel is clicked.
     * @memberof ServiceNode
     */
    onSwaggerButtonClicked() {
        this.context.editor.showSwaggerViewForService(this.props.model);
    }

    canDropToPanelBody(dragSource) {
        return TreeUtil.isEndpointTypeVariableDef(dragSource);
    }

    /**
     * Handles global variable delete event.
     *
     * @param {ASTNode} deletedGlobal Variable AST.
     * @memberof ServiceNode
     */
    handleDeleteVariable(deletedGlobal) {
        this.props.model.removeVariables(deletedGlobal);
    }

    /**
     * Handles global variable add event.
     *
     * @param {ASTNode} addGlobal Variable AST.
     * @memberof ServiceNode
     */
    handleAddVariable(value) {
        if (!value) {
            return;
        }
        const fragment = FragmentUtils.createStatementFragment(`${value}`);
        const parsedJson = FragmentUtils.parseFragment(fragment);
        if (!parsedJson.error) {
            const index = this.props.model.getVariables().length - 1;
            this.props.model.addVariables(TreeBuilder.build(parsedJson), index + 1);
        } else {
            this.context.alert.showError('Invalid content provided !');
        }
    }

    /**
     * Handles variables badge click event to expand or collapse the view.
     *
     * @memberof ServiceNode
     */
    handleVarialblesBadgeClick() {
        this.props.model.viewState.variablesExpanded = !this.props.model.viewState.variablesExpanded;
        this.context.editor.update();
    }
    /**
     * Handles the mouse enter event on the service definition
     */
    onMouseEnter() {
        this.setState({ style: 'showResourceGroup', addResource: true });
    }

    /**
     * Handles the mouse leave event on the service definition
     */
    onMouseLeave() {
        if (_.isEmpty(this.props.model.viewState.overlayContainer)) {
            this.setState({ style: 'hideResourceGroup', addResource: false });
        }
    }
    /**
     * Renders the view for a service definition.
     *
     * @returns {ReactElement} The view.
     * @memberof ServiceNode
     */
    render() {
        const model = this.props.model;
        const viewState = model.viewState;
        const bBox = model.viewState.bBox;
        const variables = model.getVariables();

        // get the service name
        const title = model.getName().value;

        const connectors = variables
            .filter((element) => { return TreeUtil.isEndpointTypeVariableDef(element); }).map((statement) => {
                return (
                    <EndpointDecorator
                        model={statement}
                        title={statement.variable.name.value}
                        bBox={statement.viewState.bBox}
                    />);
            });
        /**
         * Here we skip rendering the variables
         */
        const blockNode = getComponentForNodeArray(model.getResources(), this.context.mode);
        const rightComponents = [];

        // TODO: Check whether the service is a http/https and then only allow. JMS services does not need swagger defs.
        // eslint-disable-next-line no-constant-condition
        if (this.props.model.getProtocolPackageIdentifier().value === 'http') {
            // Pushing swagger edit button.
            rightComponents.push({
                component: PanelDecoratorButton,
                props: {
                    key: `${model.getID()}-swagger-button`,
                    icon: ImageUtil.getSVGIconString('swagger'),
                    tooltip: 'Swagger Source',
                    onClick: () => this.onSwaggerButtonClicked(),
                },
            });
        }

        const resources = model.getResources();
        this.props.model.viewState.components.transportLine.y2 = 0;
        if (resources[resources.length - 1]) {
            this.props.model.viewState.components.transportLine.y2
                = resources[resources.length - 1].body.viewState.bBox.y - 15;
        }

        return (
            <g
                className={`protocol-${model.getProtocolPackageIdentifier().value}`}
                onMouseLeave={this.onMouseLeave}
                onMouseEnter={this.onMouseEnter}
            >
                <PanelDecorator
                    icon="tool-icons/service"
                    title={title}
                    bBox={bBox}
                    model={model}
                    dropTarget={this.props.model}
                    canDrop={this.canDropToPanelBody}
                    rightComponents={rightComponents}
                    protocol={model.getProtocolPackageIdentifier().value}
                >
                    <ServiceTransportLine
                        model={this.props.model}
                        bBox={this.props.model.viewState.components.transportLine}
                        resources={resources}
                        addResource={this.state.addResource}
                    />
                    {
                            viewState.variablesExpanded ?
                                <GlobalExpanded
                                    bBox={viewState.components.initFunction}
                                    globals={variables}
                                    onCollapse={this.handleVarialblesBadgeClick}
                                    title="Variables"
                                    addText={'+ Add Variable'}
                                    model={this.props.model}
                                    onAddNewValue={this.handleAddVariable}
                                    newValuePlaceholder={''}
                                    onDeleteClick={this.handleDeleteVariable}
                                    getValue={g => (g.getSource())}
                                /> :
                                <GlobalDefinitions
                                    bBox={viewState.components.initFunction}
                                    numberOfItems={variables.length}
                                    title={'Variables'}
                                    onExpand={this.handleVarialblesBadgeClick}
                                />
                        }
                    {blockNode}
                    {connectors}
                </PanelDecorator>
                <ServerConnectorProperties
                    bBox={this.props.model.viewState.components.transportLine}
                    model={this.props.model}
                    protocol={model.getProtocolPackageIdentifier().value}
                />
            </g>);
    }
}

ServiceNode.propTypes = {
    model: PropTypes.instanceOf(Object).isRequired,
};

ServiceNode.contextTypes = {
    editor: PropTypes.instanceOf(Object).isRequired,
    mode: PropTypes.string,
    alert: PropTypes.instanceOf(Object).isRequired,
};

export default ServiceNode;
