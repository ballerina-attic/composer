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
import Expression from './../expressions/expression';
import FragmentUtils from '../../utils/fragment-utils';

/**
 * Constructor for LeftOperandExpression
 * @param {Object} args - Arguments to create the LeftOperandExpression
 * @constructor
 */
class LeftOperandExpression extends Expression {
  constructor(args) {
    super('LeftOperandExpression');
  }

  getExpressionString() {
    const exps = [];
    _.forEach(this.getChildren(), (child) => {
      exps.push(child.getExpressionString());
    });
    const expression = _.join(exps, ',');
    return expression;
  }

    /**
     * Set the expression from the expression string
     * @param {string} expressionString
     * @override
     */
  setExpressionFromString(expression, callback) {
    if (!_.isNil(expression)) {
      const fragment = FragmentUtils.createExpressionFragment(expression);
      const parsedJson = FragmentUtils.parseFragment(fragment);
      if ((!_.has(parsedJson, 'error')
                   || !_.has(parsedJson, 'syntax_errors'))
                   && _.isEqual(parsedJson.type, 'left_operand_expression')) {
        this.initFromJson(parsedJson);
        if (_.isFunction(callback)) {
          callback({ isValid: true });
        }
      } else if (_.isFunction(callback)) {
        callback({ isValid: false, response: parsedJson });
      }
    }
  }

    /**
     * setting parameters from json
     * @param jsonNode
     */
  initFromJson(jsonNode) {
    if (!_.isEmpty(jsonNode.children)) {
      jsonNode.children.forEach((childJsonNode) => {
        const child = this.getFactory().createFromJson(childJsonNode);
        child.initFromJson(childJsonNode);
        this.addChild(child, undefined, true, true);
      });
    }
  }
}

export default LeftOperandExpression;
