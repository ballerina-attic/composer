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
import Expression from './expression';

/**
 * Constructor for VariableReferenceExpression
 * @param {Object} args - Arguments to create the VariableReferenceExpression
 * @constructor
 */
class ReferenceTypeInitExpression extends Expression {
    constructor(args) {
        super('ReferenceTypeInitExpression');
        this.whiteSpace.defaultDescriptor.regions = {
            0: '',
            1: '',
            2: ''
        };
    }

    /**
     * initialize ReferenceTypeInitExpression from json object
     * @param {Object} jsonNode to initialize from
     */
    initFromJson(jsonNode) {
        var self = this;
        var generateExpression = '';
        _.each(jsonNode.children, function (childNode) {
            var child = self.getFactory().createFromJson(childNode);
            self.addChild(child);
            child.initFromJson(childNode);
            generateExpression +=child.getExpression() + ",";
        });
        this.setExpression('{' + this.getWSRegion(1)
            + (generateExpression.substring(0, generateExpression.length-1))
            + '}' + this.getWSRegion(2),{doSilently: true});
    }

    generateExpression() {
        var generateExpression = '';
        this.children.forEach((child) => {
            generateExpression += child.getExpression() + ',';
        })
        this.setExpression('{' + this.getWSRegion(1)
            + (generateExpression.substring(0, generateExpression.length-1))
            + '}' + this.getWSRegion(2),{doSilently: true});
        return this.getExpression();
    }
}

export default ReferenceTypeInitExpression;
