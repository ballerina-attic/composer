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
import Alerts from 'alerts';
import _ from 'lodash';
import { getCanvasOverlay } from 'ballerina/configs/app-context';
import AnnotationDefinitionAST from 'ballerina/ast/annotation-definition';
import ASTFactory from 'ballerina/ast/ast-factory.js';
import PanelDecorator from './panel-decorator';
import { getComponentForNodeArray, getDesigner } from './../../../diagram-util';
import AnnotationAttributeDecorator from './annotation-attribute-decorator';
import AnnotationDefinitionAttachment from './annotation-definition-attachment';
import TagController from './utils/tag-component';
import ActionMenu from './action-menu';

/**
 * React view for annotation defintion.
 * @class AnnotationDefinition
 * @extends {React.Component}
 */
class AnnotationDefinition extends React.Component {

    /**
     * Creates an instance of AnnotationDefinition.
     * @memberof AnnotationDefinition
     */
    constructor() {
        super();
        this.onAttachmentDelete = this.onAttachmentDelete.bind(this);
        this.addAttachmentPoint = this.addAttachmentPoint.bind(this);
    }

    /**
     * @override
     */
    componentDidMount() {
        if (this.props.model.getViewState().collapsed === false) {
            this.createActionMenu();
        }
    }

    /**
     * @override
     */
    componentDidUpdate() {
        if (this.actionMenuWrapper) {
            ReactDOM.unmountComponentAtNode(this.actionMenuWrapper);
            const canvasOverlay = getCanvasOverlay();
            if (canvasOverlay.contains(this.actionMenuWrapper)) {
                canvasOverlay.removeChild(this.actionMenuWrapper);
            }
            if (this.props.model.getViewState().collapsed === false) {
                this.createActionMenu();
            }
        }
    }

    /**
     * Delete attachment tag event handler.
     * @param {string} attachment - attachment to be deleted
     * */
    onAttachmentDelete(attachment) {
        const model = this.props.model;
        delete model.getViewState().attachments[attachment];
        model.removeAnnotationAttachmentPoints(attachment);
    }

    /**
     * Get types of ballerina to which can be applied when declaring variables.
     * @return {[string]} Attachment types
     * */
    getTypeDropdownValues() {
        const { environment } = this.context;
        return environment.getAnnotationAttachmentTypes();
    }

    /**
     * Gets the suggestions for attachment points for the definition.
     * @returns {string[]} The suggestions.
     * @memberof AnnotationDefinition
     */
    getAnnotationAttachmentPointsForSuggestions() {
        const { environment } = this.context;
        const attachmentTypes = environment.getAnnotationAttachmentTypes();
        const suggestions = [];
        for (let i = 0; i < attachmentTypes.length; i++) {
            const suggestion = {
                name: attachmentTypes[i],
            };
            suggestions.push(suggestion);
        }
        return suggestions;
    }

    /**
     * Validate input from tag controller and apply condition to tell whether to change he state.
     * @param {string} input - input from tag controller.
     * @return {boolean} true - change the state, false - don't change the state.
     * */
    validateInput(input) {
        const splittedExpression = input.split(' ');
        return splittedExpression.length === 1;
    }

    /**
     * Add Attachment point to annotation definition.
     * @param {string} attachment - Attachment to be added to the annotation definition
     * @return {boolean} true - if add successful, false - if add unsuccessful.
     * */
    addAttachmentPoint(attachment) {
        const model = this.props.model;
        try {
            if (this.validateType(attachment)) {
                model.addAnnotationAttachmentPoint(attachment);
            } else {
                const errorString = `Incorrect Annotation Attachment Type: ${attachment}`;
                Alerts.error(errorString);
                return false;
            }
        } catch (e) {
            Alerts.error(e);
            return false;
        }
        return true;
    }

    /**
     * Validate annotation attachment type.
     * @param {string} bType The ballerina type.
     * @return {boolean} isValid true if valid type, else false.
     * */
    validateType(bType) {
        let isValid = false;
        const typeList = this.getTypeDropdownValues();
        const filteredTypeList = _.filter(typeList, type => type === bType);
        if (filteredTypeList.length > 0) {
            isValid = true;
        }
        return isValid;
    }

    /**
     * Creates the action menu.
     * @memberof AnnotationDefinition
     */
    createActionMenu() {
        const model = this.props.model;
        const designer = getDesigner(['default']);
        const canvasOverlay = getCanvasOverlay();
        // Recreating content
        this.actionMenuWrapper = document.createElement('div');
        this.actionMenuWrapper.className = 'action-menu-wrapper';
        this.actionMenuWrapper.style.top = model.getViewState().components.body.y +
            designer.actionMenu.topOffset + 'px';
        this.actionMenuWrapper.style.left = model.getViewState().components.body.x +
            designer.actionMenu.leftOffset + 'px';
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

        if (model.getChildrenOfType(ASTFactory.isAnnotationAttachment).length > 0) {
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
        }

        const actionMenu = React.createElement(ActionMenu, { items: actionMenuItems }, null);
        ReactDOM.render(actionMenu, this.actionMenuWrapper);
    }

    /**
     * Render view for annotation definition
     * @returns {ReactElement} The view
     * @memberof AnnotationDefinition
     */
    render() {
        const model = this.props.model;
        const viewState = model.viewState;
        const bBox = model.viewState.bBox;
        const title = model.getAnnotationName();
        const children = getComponentForNodeArray(model.getChildren());
        const attachmentPoints = this.props.model.getAttachmentPoints();
        const attachments = [];

        // Create the annotationDefinitionAttachment components for attachment points.
        for (let i = 0; i < attachmentPoints.length; i++) {
            const attachmentValue = attachmentPoints[i];
            attachments.push(React.createElement(AnnotationDefinitionAttachment, {
                model,
                key: i,
                viewState: viewState.attachments[attachmentValue].viewState,
                attachmentValue,
                onDelete: this.onAttachmentDelete,
            }, null));
        }

        const componentData = {
            components: {
                openingBracket: this.props.model.getViewState().components.openingParameter,
                closingBracket: this.props.model.getViewState().components.closingParameter,
            },
            prefixView: this.props.model.getViewState().components.parametersPrefixContainer,
            openingBracketClassName: 'parameter-bracket-text',
            closingBracketClassName: 'parameter-bracket-text',
            prefixTextClassName: 'parameter-prefix-text',
            defaultText: '+ Add Attachment',
        };

        const tagController = (<TagController
            key={model.getID()}
            model={model}
            setter={this.addAttachmentPoint}
            validateInput={this.validateInput}
            modelComponents={attachments}
            componentData={componentData}
            isSelectBox
            suggestions={this.getAnnotationAttachmentPointsForSuggestions()}
            groupClass="annotation-attachment-group"
            label={'attach'}
        />);
        const titleComponentData = [{
            isNode: false,
            model: tagController,
        }];

        return (<PanelDecorator
            icon="annotation-black"
            title={title}
            bBox={bBox}
            model={model}
            titleComponentData={titleComponentData}
        >
            <AnnotationAttributeDecorator model={model} bBox={bBox} />
            {children}
        </PanelDecorator>);
    }
}

AnnotationDefinition.propTypes = {
    model: PropTypes.instanceOf(AnnotationDefinitionAST).isRequired,
};
AnnotationDefinition.contextTypes = {
    editor: PropTypes.instanceOf(Object).isRequired,
    environment: PropTypes.instanceOf(Object).isRequired,
};

export default AnnotationDefinition;
