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
import _ from 'lodash';
import log from 'log';
import ASTNode from './node';
import CallableDefinition from './callable-definition';
import CommonUtils from '../utils/common-utils';
import BallerinaASTFactory from './../ast/ballerina-ast-factory';

/**
 * Constructor for FunctionDefinition
 * @param {Object} args - The arguments to create the FunctionDefinition
 * @param {string} [args.functionName=newFunction] - Function name
 * @param {boolean} [args.isPublic=false] - Public or not of the function
 * @param {string[]} [args.annotations] - Function annotations
 * @constructor
 */
class FunctionDefinition extends CallableDefinition {
    constructor(args) {
        super('FunctionDefinition');
        this.id = autoGenerateId();
        this._functionName = _.get(args, 'functionName');
        this._isPublic = _.get(args, "isPublic") || false;
        this._annotations = _.get(args, 'annotations', []);
    }

    setFunctionName(name, options) {
        if (!_.isNil(name) && ASTNode.isValidIdentifier(name)) {
            this.setAttribute('_functionName', name, options);
        } else {
            var errorString = "Invalid function name: " + name;
            log.error(errorString);
            throw errorString;
        }
    }

    setIsPublic(isPublic, options) {
        if(!_.isNil(isPublic)){
            this.setAttribute('_isPublic', isPublic, options);
        }
    }

    getFunctionName() {
        return this._functionName;
    }

    getArguments() {
        return this.getArgumentParameterDefinitionHolder().getChildren();
    }

    getIsPublic() {
        return this._isPublic;
    }

    getVariableDefinitionStatements() {
        return this.filterChildren(this.getFactory().isVariableDefinitionStatement).slice(0);
    }

    /**
     * Adds new variable declaration.
     */
    addVariableDeclaration(newVariableDeclaration) {
        // Get the index of the last variable declaration.
        var index = this.findLastIndexOfChild(this.getFactory().isVariableDeclaration);
        // index = -1 when there are not any variable declarations, hence get the index for connector
        // declarations.
        if (index == -1) {
            index = this.findLastIndexOfChild(this.getFactory().isConnectorDeclaration);
        }

        this.addChild(newVariableDeclaration, index + 1);
    }

    /**
     * Removes variable declaration.
     */
    removeVariableDeclaration(variableDeclarationIdentifier) {
        // Removing the variable from the children.
        this.removeChildByIdentifier = _.remove(this.getFactory().isVariableDeclaration, variableDeclarationIdentifier);
    }

    /**
     * Returns the list of arguments as a string separated by commas.
     * @return {string} - Arguments as string.
     */
    getArgumentsAsString() {
        var argsStringArray = [];
        var args = this.getArguments();
        _.forEach(args, function(arg){
            argsStringArray.push(arg.getParameterDefinitionAsString());
        });

        return _.join(argsStringArray, ', ');
    }

    /**
     * Adds new argument to the function definition.
     * @param type - The type of the argument.
     * @param identifier - The identifier of the argument.
     */
    addArgument(type, identifier) {
        var newArgumentParamDef = this.getFactory().createParameterDefinition();
        newArgumentParamDef.setTypeName(type);
        newArgumentParamDef.setName(identifier);

        var argParamDefHolder = this.getArgumentParameterDefinitionHolder();
        var index = argParamDefHolder.getChildren().length;

        argParamDefHolder.addChild(newArgumentParamDef, index + 1);
    }

    /**
     * Removes an argument from a function definition.
     * @param identifier - The identifier of the argument.
     * @return {Array} - The removed argument.
     */
    removeArgument(identifier) {
        this.getArgumentParameterDefinitionHolder().removeChildByName(this.getFactory().isParameterDefinition, identifier);
    }

    getArgumentParameterDefinitionHolder() {
        var argParamDefHolder = this.findChild(this.getFactory().isArgumentParameterDefinitionHolder);
        if (_.isUndefined(argParamDefHolder)) {
            argParamDefHolder = this.getFactory().createArgumentParameterDefinitionHolder();
            this.addChild(argParamDefHolder);
        }
        return argParamDefHolder;
    }

    //// Start of return type functions.

    /**
     * Gets the return type as a string separated by commas.
     * @return {string} - Return types separated by comma.
     */
    getReturnTypesAsString() {
        var returnTypes = [];
        _.forEach(this.getReturnParameterDefinitionHolder().getChildren(), function (returnType) {
            returnTypes.push(returnType.getParameterDefinitionAsString());
        });

        return _.join(returnTypes, ", ");
    }

    /**
     * Gets the defined return types.
     * @return {ParameterDefinition[]} - Array of returns.
     */
    getReturnTypes() {
        return this.getReturnParameterDefinitionHolder().getChildren();
    }

    /**
     * Adds a new argument to return type model.
     * @param {string} type - The type of the argument.
     * @param {string} identifier - The identifier of the argument.
     */
    addReturnType(type, identifier) {
        var self = this;

        var returnParamDefHolder = this.getReturnParameterDefinitionHolder();

        // Check if there is already a return type with the same identifier.
        if (!_.isUndefined(identifier)) {
            var child = returnParamDefHolder.findChildByIdentifier(true, identifier);
            if (_.isUndefined(child)) {
                var errorString = "An return argument with identifier '" + identifier + "' already exists.";
                log.error(errorString);
                throw errorString;
            }
        }

        // Validating whether return type can be added based on identifiers of other return types.
        if (!_.isUndefined(identifier)) {
            if (!this.hasNamedReturnTypes() && this.hasReturnTypes()) {
                var errorStringWithoutIdentifiers = "Return types without identifiers already exists. Remove them to " +
                    "add return types with identifiers.";
                log.error(errorStringWithoutIdentifiers);
                throw errorStringWithoutIdentifiers;
            }
        } else {
            if (this.hasNamedReturnTypes() && this.hasReturnTypes()) {
                var errorStringWithIdentifiers = "Return types with identifiers already exists. Remove them to add " +
                    "return types without identifiers.";
                log.error(errorStringWithIdentifiers);
                throw errorStringWithIdentifiers;
            }
        }

        var paramDef = this.getFactory().createParameterDefinition({typeName: type, name: identifier});
        returnParamDefHolder.addChild(paramDef, 0);
    }

    hasNamedReturnTypes() {
        if (this.getReturnParameterDefinitionHolder().getChildren().length == 0) {
            //if there are no return types in the return type model
            return false;
        } else if (this.getReturnTypeModel().getChildren().length == 0) {
            //if there are no return types in the return type model
            return false;
        } else {
            //check if any of the return types have identifiers
            var indexWithoutIdentifiers = _.findIndex(this.getReturnParameterDefinitionHolder().getChildren(), function (child) {
                return _.isUndefined(child.getName());
            });

            if (indexWithoutIdentifiers !== -1) {
                return false;
            } else {
                return true;
            }
        }
    }

    hasReturnTypes() {
        if (this.getReturnParameterDefinitionHolder().getChildren().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Removes return type argument from the return type model.
     * @param {string} identifier - The identifier of a {ParameterDefinition} which resides in the return type model.
     */
    removeReturnType(modelID) {
        var removeChild = this.getReturnParameterDefinitionHolder().removeChildById(this.getFactory().isParameterDefinition, modelID);

        // Deleting the argument from the AST.
        if (!_.isUndefined(removeChild)) {
            var exceptionString = 'Could not find a return type with id : ' + modelID;
            log.error(exceptionString);
            throw exceptionString;
        }
    }

    getReturnParameterDefinitionHolder() {
        var returnParamDefHolder = this.findChild(this.getFactory().isReturnParameterDefinitionHolder);
        if (_.isUndefined(returnParamDefHolder)) {
            returnParamDefHolder = this.getFactory().createReturnParameterDefinitionHolder();
            this.addChild(returnParamDefHolder);
        }
        return returnParamDefHolder;
    }

    //// End of return type functions.

    getConnectionDeclarations() {
        var connectorDeclaration = [];
        var self = this;

        _.forEach(this.getChildren(), function (child) {
            if (self.getFactory().isConnectorDeclaration(child)) {
                connectorDeclaration.push(child);
            }
        });
        return _.sortBy(connectorDeclaration, [function (connectorDeclaration) {
            return connectorDeclaration.getConnectorVariable();
        }]);
    }

    /**
     * Override the super call to addChild
     * @param child
     * @param index
     */
    addChild(child, index) {
        if (BallerinaASTFactory.isWorkerDeclaration(child)) {
            Object.getPrototypeOf(this.constructor.prototype).addChild.call(this, child);
        } else {
            const firstWorkerIndex = _.findIndex(this.getChildren(), function (child) {
                return BallerinaASTFactory.isWorkerDeclaration(child);
            });

            if (firstWorkerIndex > -1 && _.isNil(index)) {
                index = firstWorkerIndex;
            }
            Object.getPrototypeOf(this.constructor.prototype).addChild.call(this, child, index);
        }
    }

    getWorkerDeclarations() {
        var workerDeclarations = [];
        var self = this;

        _.forEach(this.getChildren(), function (child) {
            if (self.getFactory().isWorkerDeclaration(child)) {
                workerDeclarations.push(child);
            }
        });
        return _.sortBy(workerDeclarations, [function (workerDeclaration) {
            return workerDeclaration.getWorkerName();
        }]);
    }

    /**
     * Validates possible immediate child types.
     * @override
     * @param node
     * @return {boolean}
     */
    canBeParentOf(node) {
        return this.getFactory().isConnectorDeclaration(node)
            || this.getFactory().isVariableDeclaration(node)
            || this.getFactory().isWorkerDeclaration(node)
            || this.getFactory().isStatement(node);
    }

    /**
     * initialize FunctionDefinition from json object
     * @param {Object} jsonNode to initialize from
     * @param {string} [jsonNode.function_name] - Name of the function definition
     * @param {string} [jsonNode.annotations] - Annotations of the function definition
     * @param {boolean} [jsonNode.is_public_function] - Public or not of the function
     */
    initFromJson(jsonNode) {
        this.setFunctionName(jsonNode.function_name, {doSilently: true});
        this.setIsPublic(jsonNode.is_public_function, {doSilently: true});
        this._annotations = jsonNode.annotations;

        var self = this;

        _.each(jsonNode.children, function (childNode) {
            var child = undefined;
            var childNodeTemp = undefined;
            //TODO : generalize this logic
            if (childNode.type === "variable_definition_statement" && !_.isNil(childNode.children[1]) && childNode.children[1].type === 'connector_init_expr') {
                child = self.getFactory().createConnectorDeclaration();
                childNodeTemp = childNode;
            } else {
                child = self.getFactory().createFromJson(childNode);
                childNodeTemp = childNode;
            }
            self.addChild(child);
            child.initFromJson(childNodeTemp);
        });
    }

    /**
     * @inheritDoc
     * @override
     */
    generateUniqueIdentifiers() {
        CommonUtils.generateUniqueIdentifier({
            node: this,
            attributes: [{
                defaultValue: 'Function',
                setter: this.setFunctionName,
                getter: this.getFunctionName,
                parents: [{
                    // ballerina-ast-node
                    node: this.parent,
                    getChildrenFunc: this.parent.getFunctionDefinitions,
                    getter: this.getFunctionName
                }]
            }]
        });
    }

    /**
     * Get the connector by name
     * @param {string} connectorName
     * @return {ConnectorDeclaration}
     */
    getConnectorByName(connectorName) {
        var factory = this.getFactory();
        var connectorReference = _.find(this.getChildren(), function (child) {
            return (factory.isConnectorDeclaration(child) && (child.getConnectorVariable() === connectorName));
        });

        return connectorReference;
    }

    /**
     * Get all the connector references in the immediate scope
     * @return {ConnectorDeclaration[]} connectorReferences
     */
    getConnectorsInImmediateScope() {
        var factory = this.getFactory();
        var connectorReferences = _.filter(this.getChildren(), function (child) {
            return factory.isConnectorDeclaration(child);
        });

        return connectorReferences;
    }

    /**
     * Checks if the current method a main method.
     * @return {boolean} - true if main method, else false.
     */
    isMainFunction() {
        return _.isEqual(this.getFunctionName(), "main")
            && _.isEqual(_.size(this.getArguments()), 1)
            && _.isEqual(this.getArguments()[0].getType().trim(), "string[]");
    }
}

// Auto generated Id for function definitions (for accordion views)
function autoGenerateId(){
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

export default FunctionDefinition;
