/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
    /**
     * Create model for service
     * @param {int} lineNumber
     * @param {string} serviceName
     * @param {object} children
     * @return {object} service
     * */
    getServiceModel: function (lineNumber, serviceName, children) {
        var service = {
            annotation_attachments: [],
            children: [],
            line_number: lineNumber,
            service_name: serviceName,
            type: "service_definition"
        };

        if (children) {
            for (var i = 0; i < children.length; i++) {
                service.children.push(children[i]);
            }
        }

        return service;
    },
    /**
     * Create model for root
     * @param {object} children
     * @return {object} root
     * */
    getRootModel: function (children) {
        var root = {
            root: []
        };

        if (children) {
            for (var i = 0; i < children.length; i++) {
                root.root.push(children[i]);
            }
        }

        return root;
    },
    /**
     * Create model for package
     * @param {string} packageName
     * @return {object} package
     * */
    getPackageModel: function (packageName) {
        return {
            package_name: packageName,
            type: "package"
        };
    },
    /**
     * Create model for resource
     * @param {int} lineNumber
     * @param {object} resourceName
     * @param {object} children
     * @return {object} resource
     * */
    getResourceModel: function (lineNumber, resourceName, children) {
        var resource = {
            annotation_attachments: [],
            children: [],
            line_number: lineNumber,
            resource_name: resourceName,
            type: "resource_definition"
        };

        if (children) {
            for (var i = 0; i < children.length; i++) {
                resource.children.push(children[i]);
            }
        }

        return resource;
    },
    /**
     * Create model for argument declaration
     * @param {int} lineNumber
     * @param {string} parameter_name
     * @param {string} parameter_type
     * @param {object} children
     * @return {object} argument
     * */
    getArgumentDeclarationModel: function (lineNumber, parameter_name, parameter_type, children) {
        var argument = {
            children: [],
            line_number: lineNumber,
            parameter_name: parameter_name,
            parameter_type: parameter_type,
            type: "argument_declaration"
        };

        if (children) {
            for (var i = 0; i < children.length; i++) {
                argument.children.push(children[i]);
            }
        }

        return argument;
    },

    getVariableDefinitionStatementModel: function (lineNumber, children) {
        var arguments = {
            line_number: lineNumber,
            type: 'variable_definition_statement',
            children: []
        };

        if (children) {
            for (var i = 0; i < children.length; i++) {
                arguments.children.push(children[i]);
            }
        }

        return arguments;
    },

    getVariableReferenceExpressionModel: function (lineNumber, variableName, children) {
        var arguments = {
            line_number: lineNumber,
                type: "variable_reference_expression",
            variable_name: variableName,
            children: []
        };

        if (children) {
            for (var i = 0; i < children.length; i++) {
                arguments.children.push(children[i]);
            }
        }

        return arguments;
    },

    getConnectorInitExpressionModel: function (lineNumber, connectorName, uri) {
         var arguments = {
             line_number: lineNumber,
             type: "connector_init_expr",
             connector_name: connectorName,
             arguments: [
                 {
                     type: "basic_literal_expression",
                     basic_literal_type: "string",
                     basic_literal_value: uri,
                     line_number: lineNumber
                 }
             ]
         };

         return arguments;
    },

    getVariableDefinitionModel: function (lineNumber, variableName, variableType, packageName) {
        var arguments = {
            line_number: lineNumber,
            type: "variable_definition",
            variable_name: variableName,
            variable_type: variableType,
            package_name: packageName
        };

        return arguments;
    }
};