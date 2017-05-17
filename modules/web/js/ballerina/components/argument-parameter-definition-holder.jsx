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
import TagController from './utils/tag-component';
import {getComponentForNodeArray} from './utils';
import Alerts from 'alerts';
import _ from 'lodash';
import PropTypes from 'prop-types';

/**
 * Component class for ArgumentParameterDefinitionHolder.
 * */
class ArgumentParameterDefinitionHolder extends React.Component {

    constructor() {
        super();
        this.addArgumentParameter = this.addArgumentParameter.bind(this);
    }

    /**
     * Setter to add argument parameters.
     * @param {string} input - input from tag-controller.
     * @return {boolean} true|false
     * */
    addArgumentParameter(input) {
        let model = this.props.model;
        let splitedExpression = input.split(" ");

        if (!this.checkWhetherIdentifierAlreadyExist(splitedExpression[1])) {
            let parameterDef = model.getFactory().createParameterDefinition();
            let bType = splitedExpression[0];
            if (this.validateType(bType)) {
                parameterDef.setTypeName(bType);
            } else {
                let errorString = "Incorrect Variable Type: " + bType;
                Alerts.error(errorString);
                return false;
            }

            if (splitedExpression[1]) {
                parameterDef.setName(splitedExpression[1]);
            } else {
                let errorString = "Invalid Variable Name.";
                Alerts.error(errorString);
                return false;
            }
            this.props.model.addChild(parameterDef);
            return true;
        } else {
            let errorString = "Variable Already exists: " + splitedExpression[1];
            Alerts.error(errorString);
            return false;
        }
    }

    /**
     * Check whether given identifier is already exist.
     * @param {string} identifier - identifier of the user entered variable declaration.
     * @return {boolean} isExist - true if exist, false if not.
     * */
    checkWhetherIdentifierAlreadyExist(identifier) {
        let isExist = false;
        if (this.props.model.getChildren().length > 0) {
            for (let i = 0; i < this.props.model.getChildren().length; i++) {
                if (this.props.model.getChildren()[i].getName() === identifier) {
                    isExist = true;
                    break;
                }
            }
        }
        return isExist;
    }

    /**
     * Get types of ballerina to which can be applied when declaring variables.
     * */
    getTypeDropdownValues() {
        const {renderingContext} = this.context;
        let dropdownData = [];
        let bTypes = renderingContext.environment.getTypes();
        _.forEach(bTypes, function (bType) {
            dropdownData.push({id: bType, text: bType});
        });

        let structTypes = [];
        _.forEach(structTypes, function (sType) {
            dropdownData.push({id: sType.getAnnotationName(), text: sType.getAnnotationName()});
        });

        return dropdownData;
    }

    /**
     * Validate type.
     * */
    validateType(bType) {
        let isValid = false;
        let typeList = this.getTypeDropdownValues();
        let filteredTypeList = _.filter(typeList, function (type) {
            return type.id === bType;
        });
        if (filteredTypeList.length > 0) {
            isValid = true;
        }
        return isValid;
    }

    /**
     * Validate input from controller and apply condition to tell whether to change the state.
     * @param {string} input
     * @return {boolean} true - change the state, false - don't change the state
     * */
    validateInput(input) {
        let splitedExpression = input.split(" ");
        return splitedExpression.length > 1;
    }

    render() {
        let model = this.props.model;
        let componentData = {
            title: 'Parameters: ',
            components: {
                openingBracket: this.props.model.parent.getViewState().components.openingParameter,
                closingBracket: this.props.model.parent.getViewState().components.closingParameter
            },
            prefixView: this.props.model.parent.getViewState().components.parametersPrefixContainer,
            openingBracketClassName: 'parameter-opening-brack-text',
            closingBracketClassName: 'parameter-closing-brack-text',
            prefixTextClassName: 'parameter-prefix-text'
        };
        let children = getComponentForNodeArray(model.getChildren());
        return (
            <TagController key={model.getID()} model={model} setter={this.addArgumentParameter}
                           validateInput={this.validateInput} modelComponents={children}
                           componentData={componentData} groupClass="argument-parameter-group"/>
        );
    }
}

ArgumentParameterDefinitionHolder.contextTypes = {
    renderingContext: PropTypes.instanceOf(Object).isRequired
};

export default ArgumentParameterDefinitionHolder;
