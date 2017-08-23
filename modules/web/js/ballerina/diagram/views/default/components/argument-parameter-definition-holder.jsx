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
import Alerts from 'alerts';
import _ from 'lodash';
import PropTypes from 'prop-types';
import FragmentUtils from './../../../../utils/fragment-utils';
import ArgumentParameterDefinitionHolderAST from './../../../../ast/argument-parameter-definition-holder';
import TagController from './utils/tag-component';
import { getComponentForNodeArray } from './../../../diagram-util';
import ASTFactory from '../../../../ast/ast-factory.js';

/**
 * Component class for ArgumentParameterDefinitionHolder.
 *
 * @class ArgumentParameterDefinitionHolder
 * @extends {React.Component}
 */
class ArgumentParameterDefinitionHolder extends React.Component {

    /**
     * Creates an instance of ArgumentParameterDefinitionHolder.
     *
     * @memberof ArgumentParameterDefinitionHolder
     */
    constructor() {
        super();
        this.addArgumentParameter = this.addArgumentParameter.bind(this);
    }

    /**
     * Get types of ballerina to which can be applied when declaring variables.
     *
     * @returns {Object[]} Dropdown values.
     * */
    getTypeDropdownValues() {
        const { environment } = this.context;
        const dropdownData = [];
        const bTypes = environment.getTypes();
        _.forEach(bTypes, (bType) => {
            dropdownData.push({ id: bType, text: bType });
        });

        const structTypes = [];
        _.forEach(structTypes, (sType) => {
            dropdownData.push({ id: sType.getAnnotationName(), text: sType.getAnnotationName() });
        });

        return dropdownData;
    }

    /**
     * Setter to add argument parameters.
     * @param {string} input - input from tag-controller.
     * @return {boolean} true|false
     * */
    addArgumentParameter(input) {
        if(input !== '') {
            input = input.replace(';', '');
            const fragment = FragmentUtils.createArgumentParameterFragment(input);
            const parsedJson = FragmentUtils.parseFragment(fragment);
            const model = this.props.model;

            if ((!_.has(parsedJson, 'error') && !_.has(parsedJson, 'syntax_errors'))) {
                if (_.isEqual(parsedJson.type, 'parameter_definition')) {
                    const parameterDefinition = ASTFactory.createParameterDefinition(parsedJson);
                    parameterDefinition.initFromJson(parsedJson);
                    if (!this.checkWhetherIdentifierAlreadyExist(parsedJson.parameter_name)) {
                        this.props.model.addChild(parameterDefinition);
                        return true;
                    }
                    const errorString = `Variable Already exists: ${parsedJson.parameter_name}`;
                    Alerts.error(errorString);
                    return false;
                }
            }
            const errorString = `Error while parsing parameter. Error response: ${JSON.stringify(parsedJson)}`;
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
     * Validate input from controller and apply condition to tell whether to change the state.
     * @param {string} input Input value.
     * @return {boolean} true - change the state, false - don't change the state
     * */
    validateInput(input) {
        const splitedExpression = input.split(' ');
        return splitedExpression.length > 1;
    }

    /**
     * Validates the type
     *
     * @param {string} bType The ballerina type.
     * @returns {boolean} true if valid, else false.
     *
     * @memberof ArgumentParameterDefinitionHolder
     */
    validateType(bType) {
        let isValid = false;
        const typeList = this.getTypeDropdownValues();
        const filteredTypeList = _.filter(typeList, type => type.id === bType);
        if (filteredTypeList.length > 0) {
            isValid = true;
        }
        return isValid;
    }

    /**
     * Renders the view for argument parameter definition holder.
     *
     * @returns {ReactElement} The view.
     *
     * @memberof ArgumentParameterDefinitionHolder
     */
    render() {
        const model = this.props.model;
        const componentData = {
            title: 'Parameters: ',
            components: {
                openingBracket: this.props.model.parent.getViewState().components.openingParameter,
                closingBracket: this.props.model.parent.getViewState().components.closingParameter,
            },
            prefixView: this.props.model.parent.getViewState().components.parametersPrefixContainer,
            openingBracketClassName: 'parameter-bracket-text',
            closingBracketClassName: 'parameter-bracket-text',
            prefixTextClassName: 'parameter-prefix-text',
            defaultText: '+ Add Param',
        };
        const children = getComponentForNodeArray(model.getChildren());
        this.editorOptions = {
            propertyType: 'text',
            key: 'ParameterDefinition',
            model: model,
            getterMethod: ()=>{},
            setterMethod: this.addArgumentParameter,
            fontSize: 12,
            isCustomHeight: true,
        };
        return (
            <TagController
                key={model.getID()}
                model={model}
                setter={this.addArgumentParameter}
                validateInput={this.validateInput}
                modelComponents={children}
                componentData={componentData}
                editorOptions={this.editorOptions}
                groupClass="argument-parameter-group"
            />
        );
    }
}

ArgumentParameterDefinitionHolder.propTypes = {
    model: PropTypes.instanceOf(ArgumentParameterDefinitionHolderAST).isRequired,
};

ArgumentParameterDefinitionHolder.contextTypes = {
    environment: PropTypes.instanceOf(Object).isRequired,
};

export default ArgumentParameterDefinitionHolder;
