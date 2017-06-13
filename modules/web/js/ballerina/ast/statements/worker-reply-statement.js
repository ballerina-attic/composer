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
import Statement from './statement';
import BallerinaASTFactory from './../../ast/ballerina-ast-factory';
import FragmentUtils from './../../utils/fragment-utils';

/**
 * Class to represent worker reply statement in ballerina.
 * @constructor
 */
class WorkerReplyStatement extends Statement {
  constructor(args) {
    super('WorkerReplyStatement');
    this._source = _.get(args, 'source');
    this._destination = _.get(args, 'destination');
    this._expressionList = _.get(args, 'expressionList', []);
    this._replyStatement = _.get(args, 'replyStatement', 'm1 <- workerName');
    this._workerName = _.get(args, 'workerName', 'workerName');
  }

  setSource(source) {
    this._source = source;
  }

  getSource() {
    return this._source;
  }

  setDestination(destination) {
    this._destination = destination;
  }

  getDestination() {
    return this._destination;
  }

    /**
     * Set destination worker Name
     * @param {string} workerName
     */
  setWorkerName(workerName) {
    this._workerName = workerName;
  }

    /**
     * Get destination worker name
     * @returns {string} _workerName - destination worker name
     */
  getWorkerName() {
    return this._workerName;
  }

  addToExpressionList(expression) {
    this._expressionList.push(expression);
  }

  getExpressionList() {
    return this._expressionList;
  }

    /**
     * Get the statement String
     * @returns {string} statement string
     * @override
     */
  getStatementString() {
    let statementStr = '';
    for (let itr = 0; itr < this.getExpressionList().length; itr++) {
      if (BallerinaASTFactory.isExpression(this.getExpressionList()[itr])) {
        statementStr += this.getExpressionList()[itr].getExpressionString();
      } else if (BallerinaASTFactory.isStatement(this.getExpressionList()[itr])) {
        statementStr += this.getExpressionList()[itr].getStatementString();
      }

      if (itr !== this.getExpressionList().length - 1) {
        statementStr += ',';
      }
    }
    statementStr += `<-${this.getWorkerName()}`;

    return statementStr;
  }

    /**
     * Set the statement from the string
     * @param {string} statementString
     * @param {function} callback
     * @override
     */
  setStatementFromString(statementString, callback) {
    const fragment = FragmentUtils.createStatementFragment(`${statementString};`);
    const parsedJson = FragmentUtils.parseFragment(fragment);

    if ((!_.has(parsedJson, 'error') || !_.has(parsedJson, 'syntax_errors'))
            && _.isEqual(parsedJson.type, 'worker_reply_statement')) {
      this.initFromJson(parsedJson);

            // Manually firing the tree-modified event here.
            // TODO: need a proper fix to avoid breaking the undo-redo
      this.trigger('tree-modified', {
        origin: this,
        type: 'custom',
        title: 'Worker Reply Statement Custom Tree modified',
        context: this,
      });

      if (_.isFunction(callback)) {
        callback({ isValid: true });
      }
    } else if (_.isFunction(callback)) {
      callback({ isValid: false, response: parsedJson });
    }
  }

  canBeAChildOf(node) {
    return this.getFactory().isResourceDefinition(node)
            || this.getFactory().isFunctionDefinition(node)
            || this.getFactory().isWorkerDeclaration(node)
            || this.getFactory().isConnectorAction(node)
            || (this.getFactory().isStatement(node) && !node._isChildOfWorker);
  }

    /**
     * initialize from json
     * @param jsonNode
     */
  initFromJson(jsonNode) {
    const workerName = jsonNode.worker_name;
    const self = this;
    const expressionList = jsonNode.expression_list;
    this.getExpressionList().length = 0;

    for (let itr = 0; itr < expressionList.length; itr++) {
      const expressionNode = BallerinaASTFactory.createFromJson(expressionList[itr].expression[0]);
      expressionNode.initFromJson(expressionList[itr].expression[0]);
      self.addToExpressionList(expressionNode);
    }

    let workerInstance;
    if (!_.isNil(this.getParent())) {
      workerInstance = _.find(this.getParent().getChildren(), child => self.getFactory().isWorkerDeclaration(child) && !child.isDefaultWorker() && child.getWorkerName() === workerName);
    }
    this.setDestination(workerInstance);
    this.setWorkerName(workerName);
  }
}

export default WorkerReplyStatement;

