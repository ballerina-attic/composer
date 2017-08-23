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
import TagController from './utils/tag-component';
import { getComponentForNodeArray } from './../../../diagram-util';
import FragmentUtils from '../../../../utils/fragment-utils';
import ReturnParameterDefinitionHolderAST from './../../../../ast/argument-parameter-definition-holder';
import ASTFactory from '../../../../ast/ast-factory.js';

/**
 * Component class for ReturnParameterDefinitionHolder.
 * */
class ReturnParameterDefinitionHolder extends React.Component {

    /**
     * constructor for return parameter definition holder.
     * */
    constructor() {
        super();
        this.addReturnParameter = this.addReturnParameter.bind(this);
    }

    /**
     * Get types of ballerina to which can be applied when declaring variables.
     * @return {object} dropdown data.
     * */
    getTypeDropdownValues() {
        const { environment } = this.context;
        const dropdownData = [];
        const bTypes = environment.getTypes();
        _.forEach(bTypes, (bType) => {
            dropdownData.push({ id: bType, text: bType });
        });

        return dropdownData;
    }

    /**
     * Setter to add return parameters.
     * @param {string} input - input from tag-controller.
     * @return {boolean} true||false
     * */
    addReturnParameter(input) {
        if(input !== '') {
            const fragment = FragmentUtils.createReturnParameterFragment(input);
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
     * @return {object} isExist - true if exist, false if not.
     * */
    checkWhetherIdentifierAlreadyExist(identifier) {
        let isExist = false;
        if (this.props.model.getChildren().length > 0) {
            for (let i = 0; i < this.props.model.getChildren().length; i++) {
                if (!_.isNil(this.props.model.getChildren()[i].getName()) && 
                    this.props.model.getChildren()[i].getName() === identifier) {
                    isExist = true;
                    break;
                }
            }
        }
        return isExist;
    }

    /**
     * Validate input from controller and apply condition to tell whether to change the state.
     * @param {string} input
     * @return {boolean} true - change the state, false - don't change the state
     * */
    validateInput(input) {
        const splitedExpression = input.split(' ');
        return splitedExpression.length > 0;
    }

    /**
     * Validate type.
     * */
    validateType(typeString) {
        let isValid = false;
        const typeList = this.getTypeDropdownValues();
        let type;
        const structs = this.context.environment._currentPackage._structDefinitions;
        const types = _.map(typeList, 'id');

        if (typeString.substring(typeString.length - 2) === '[]') {
            type = typeString.substring(0, typeString.length - 2);
        } else if (typeString.split(':').length === 2) {
            // TODO: Here we assume that the type is a struct referred from another package
            return true;
        } else {
            type = typeString;
        }

        if (_.includes(types.concat(_.map(structs, '_structName')), type.trim())) {
            isValid = true;
        }

        return isValid;
    }

    render() {
        const model = this.props.model;
        const componentData = {
            title: 'Return Types: ',
            components: {
                openingBracket: this.props.model.parent.getViewState().components.openingReturnType,
                typesIcon: this.props.model.parent.getViewState().components.returnTypesIcon,
                closingBracket: this.props.model.parent.getViewState().components.closingReturnType,
            },
            openingBracketClassName: 'return-types-opening-brack-text',
            closingBracketClassName: 'return-types-closing-brack-text',
            prefixTextClassName: 'return-types-prefix-text',
            defaultText: '+ Add Returns',
        };
        const children = getComponentForNodeArray(model.getChildren());
        this.editorOptions = {
            propertyType: 'text',
            key: 'ParameterDefinition',
            model: model,
            getterMethod: ()=>{},
            setterMethod: this.addReturnParameter,
            fontSize: 12,
            isCustomHeight: true,
        };
        return (
            <TagController
                key={model.getID()}
                model={model}
                setter={this.addReturnParameter}
                validateInput={this.validateInput}
                modelComponents={children}
                componentData={componentData}
                editorOptions={this.editorOptions}
                groupClass="return-parameter-group"
            />
        );
    }
}

ReturnParameterDefinitionHolder.propsTypes = {
    model: PropTypes.instanceOf(ReturnParameterDefinitionHolderAST).isRequired,
};

ReturnParameterDefinitionHolder.contextTypes = {
    environment: PropTypes.instanceOf(Object).isRequired,
};

export default ReturnParameterDefinitionHolder;
