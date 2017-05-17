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
 * Component class for ReturnParameterDefinitionHolder.
 * */
class ReturnParameterDefinitionHolder extends React.Component {

    constructor() {
        super();
        this.addReturnParameter = this.addReturnParameter.bind(this);
    }

    /**
     * Setter to add return parameters.
     * @param {string} input - input from tag-controller.
     * @return {boolean} true||false
     * */
    addReturnParameter(input) {
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
     * @return {object} isExist - true if exist, false if not.
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
            title: 'Return Types: ',
            components: {
                openingBracket: this.props.model.parent.getViewState().components.openingReturnType,
                typesIcon: this.props.model.parent.getViewState().components.returnTypesIcon,
                closingBracket: this.props.model.parent.getViewState().components.closingReturnType
            },
            openingBracketClassName: 'return-types-opening-brack-text',
            closingBracketClassName: 'return-types-closing-brack-text',
            prefixTextClassName: 'return-types-prefix-text',
        };
        let children = getComponentForNodeArray(model.getChildren());
        return (
            <TagController key={model.getID()} model={model} setter={this.addReturnParameter}
                           validateInput={this.validateInput} modelComponents={children}
                           componentData={componentData}/>
        );
    }
}

ReturnParameterDefinitionHolder.contextTypes = {
    renderingContext: PropTypes.instanceOf(Object).isRequired
};

export default ReturnParameterDefinitionHolder;
