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
define(['lodash', 'log', './conditional-statement'], function (_, log, ConditionalStatement) {

    /**
     * Class for timeout statement in ballerina.
     * @class TimeoutStatement
     * @constructor
     * @extends ConditionalStatement
     */
    var TimeoutStatement = function (args) {
        ConditionalStatement.call(this);
        this._parameter = _.get(args, "parameter", "");

        this.type = "TimeoutStatement";
    };

    TimeoutStatement.prototype = Object.create(ConditionalStatement.prototype);
    TimeoutStatement.prototype.constructor = TimeoutStatement;

    TimeoutStatement.prototype.setParameter = function (parameter, options) {
        if (!_.isNil(parameter)) {
            this.setAttribute('_parameter', parameter, options);
        }
    };

    TimeoutStatement.prototype.getParameter = function () {
        return this._parameter;
    };

    TimeoutStatement.prototype.initFromJson = function (jsonNode) {
        var self = this;
        _.each(jsonNode.children, function (childNode) {
            var child = self.getFactory().createFromJson(childNode);
            self.addChild(child);
            child.initFromJson(childNode);
        });
    };

    return TimeoutStatement;
});
