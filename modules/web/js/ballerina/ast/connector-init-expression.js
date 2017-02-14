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
define(['lodash', 'log', './expression'], function (_, log, Expression) {

    /**
     * Constructor for connector init expression.
     *
     * @param {Object} [args] - Arguments to create a connector init expression.
     * @param {string} [args._connectorName] - The name of the connector. Example: "ClientConnector".
     * @param {string|undefined} [args.packageName] - The package prefix. Example: "http". Undefined when invoking a
     * connector in the same package.
     * @param {string|undefined} [args.packagePath] - The complete path of the package. Example: "ballerina.net.http".
     * Undefined when invoking a connector in the same package.
     * @param {string} [args.argsExpressions] - Arguments passed to initialize the connector. Example: One argument
     * passed to the client connector is the url, hence one argument is the url, "http://localhost:9090".
     * @constructor
     * @augments Expression
     */
    var ConnectorInitExpression = function (args) {
        Expression.call(this, "Connector-Init-Expression");
        this._connectorName = _.get(args, "connectorName");
        this._packageName = _.get(args, "packageName");
        this._packagePath = _.get(args, "packagePath");
        this._argsExpressions = _.get(args, "argsExpressions", []);
    };

    /** @lends ConnectorInitExpression **/
    ConnectorInitExpression.prototype = Object.create(Expression.prototype);
    ConnectorInitExpression.prototype.constructor = ConnectorInitExpression;

    /**
     * @param {string} connectorName
     * @param {Object} [options]
     */
    ConnectorInitExpression.prototype.setConnectorName = function (connectorName, options) {
        this.setAttribute("_connectorName", connectorName, options);
    };

    /**
     * @return {string}
     */
    ConnectorInitExpression.prototype.getConnectorName = function () {
        return this._connectorName;
    };

    /**
     * @param {string|undefined} packageName
     * @param {Object} [options]
     */
    ConnectorInitExpression.prototype.setPackageName = function (packageName, options) {
        this.setAttribute("_packageName", packageName, options);
    };

    /**
     * @return {string}
     */
    ConnectorInitExpression.prototype.getPackageName = function () {
        return this._packageName;
    };

    /**
     * @param {string} packagePath
     * @param {Object} [options]
     */
    ConnectorInitExpression.prototype.setPackagePath = function (packagePath, options) {
        this.setAttribute("_packagePath", packagePath, options);
    };

    /**
     * @return {string}
     */
    ConnectorInitExpression.prototype.getPackagePath = function () {
        return this._packagePath;
    };

    /**
     * @param {string} argExpressions
     * @param {Object} [options]
     */
    ConnectorInitExpression.prototype.setArgExpressions = function (argExpressions, options) {
        this.setAttribute("_argsExpressions", argExpressions, options);
    };

    /**
     * @return {string}
     */
    ConnectorInitExpression.prototype.getArgExpressions = function () {
        return this._argsExpressions;
    };

    /**
     * @return {string}
     */
    ConnectorInitExpression.prototype.getExpression = function () {
        var hasPackage = !_.isNil(this._packageName);
        var argumentExpressionsAsString = [];
        _.forEach(this._argsExpressions, function (argumentExpression) {
            argumentExpressionsAsString.push(argumentExpression.getExpression());
        });
        var expression = "create ";
        if (hasPackage) {
            expression += this._packageName + ":" + this._connectorName + "(" + _.join(argumentExpressionsAsString, ", ") + ")"
        } else {
            expression += this._connectorName + "(" + _.join(argumentExpressionsAsString, ", ") + ")"
        }

        return expression;
    };

    /**
     * @param {string} expressionAsString
     */
    ConnectorInitExpression.prototype.setExpression = function (expressionAsString) {
        // Splitting by first opening bracket.
        var packageNameAndConnectorName = expressionAsString.split("(")[0];
        if (_.isEqual(packageNameAndConnectorName.indexOf(packageNameAndConnectorName, ":"), -1)) {
            this.setPackageName(undefined);
            this.setConnectorName(packageNameAndConnectorName)
        } else {
            this.setPackageName(packageNameAndConnectorName.split(":")[0]);
            this.setConnectorName(packageNameAndConnectorName.split(":")[1])
        }

        this.setArgExpressions(/\((.*)\)/g.exec(expressionAsString)[1]);
    };

    /**
     * Initialize connector init expression from json object for parsing.
     * @param {Object} jsonNode - Model for parsing a connector init expression.
     * @param {string} jsonNode.connector_init_name - The connector name.
     * @param {string} jsonNode.connector_init_package_name - The package prefix.
     * @param {string} jsonNode.connector_init_package_path - The package path.
     * @param {string} jsonNode.connector_init_args - The arguments as an array of {@link Expression}s.
     */
    ConnectorInitExpression.prototype.initFromJson = function (jsonNode) {
        var self = this;
        this.setConnectorName(jsonNode.connector_init_name, {doSilently: true});
        this.setPackageName(jsonNode.connector_init_package_name, {doSilently: true});
        this.setPackagePath(jsonNode.connector_init_package_path, {doSilently: true});

        var tempArgExpressions = [];
        _.forEach(jsonNode.connector_init_args, function(initArg){
            var child = self.getFactory().createFromJson(initArg);
            child.initFromJson(initArg);
            tempArgExpressions.push(child.getExpression());
        });

        this.setArgExpressions(_.join(tempArgExpressions, ", "));
    };

    return ConnectorInitExpression;
});
