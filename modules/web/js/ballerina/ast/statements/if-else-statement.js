/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import ElseStatement from './else-statement';
import ElseIfStatement from './else-if-statement';
import IfStatement from './if-statement';
import BallerinaASTFactory from './../ballerina-ast-factory';

/**
 * Class for if conditions in ballerina.
 * @constructor
 */

class IfElseStatement extends Statement {
    constructor(args) {
        super('IfElseStatement');
        this._elseIfStatements = [];
        this.createIfStatement(args);
    }

    getIfStatement() {
        return this._ifStatement;
    }

    getElseStatement() {
        return this._elseStatement;
    }

    getElseIfStatements() {
        return this._elseIfStatements;
    }

    setIfStatement(ifStatement, options) {
        if (!_.isNil(this._ifStatement)) {
            this._ifStatement.remove();
        }
        this.setAttribute('_ifStatement', ifStatement, options);
    }

    /**
     * creates Else Statement
     * @param args
     */
    createIfStatement(args) {
        var newIfStmt = new IfStatement(args);
        this._ifStatement = newIfStmt;
        this.addChild(newIfStmt);
        return newIfStmt;
    }

    /**
     * creates Else Statement
     * @param args
     */
    createElseStatement(args) {
        var newElseStatement = new ElseStatement(args);
        this._elseStatement = newElseStatement;
        this.addChild(newElseStatement);
        return newElseStatement;
    }

    /**
     * creates Else If Statement
     * @param args
     */
    createElseIfStatement(args) {
        var newElseIfStatement = new ElseIfStatement(args);
        this._elseIfStatements.push(newElseIfStatement);
        this.addChild(newElseIfStatement);
        return newElseIfStatement;
    }

    addElseStatement(elseStatement) {
        this._elseStatement = elseStatement;
        Object.getPrototypeOf(this.constructor.prototype).addChild.call(this, elseStatement);
    }

    addElseIfStatement(elseIfStatement, index) {
        const elseStatementIndex = _.findIndex(this.getChildren(), function (node) {
            return BallerinaASTFactory.isElseStatement(node);
        });

        this._elseIfStatements.push(elseIfStatement);

        Object.getPrototypeOf(this.constructor.prototype).addChild.call(
            this, elseIfStatement, index || elseStatementIndex);
    }

    /**
     * Override the addChild method for ordering the child elements
     * @param {ASTNode} child
     * @param {number|undefined} index
     */
    addChild(child, index) {
        const lastElseIfIndex = _.findLastIndex(this.getChildren(), function (node) {
            return BallerinaASTFactory.isElseIfStatement(node);
        });

        const elseStatementIndex = _.findIndex(this.getChildren(), function (node) {
            return BallerinaASTFactory.isElseStatement(node);
        });

        if (BallerinaASTFactory.isElseIfStatement(child) && elseStatementIndex > -1) {
            index = elseStatementIndex;
        }
        Object.getPrototypeOf(this.constructor.prototype).addChild.call(this, child, index);
    }

    /**
     * initialize IfElseStatement from json object
     * @param {Object} jsonNode to initialize from
     * @param {Object} [jsonNode.if_statement] - If statement
     * @param {Object} [jsonNode.else_statement] - Else statement
     * @param {Object} [jsonNode.else_if_statements] - Else If statements
     */
    initFromJson(jsonNode) {
        // create if statement
        let ifStmtNode = jsonNode.if_statement;
        if (!_.isNil(ifStmtNode)) {
            let ifStatement = this.getFactory().createFromJson(ifStmtNode);
            ifStatement.initFromJson(ifStmtNode);
            this.setIfStatement(ifStatement);
            this.addChild(ifStatement);
        }
        // create else statement
        let elseStmtNode = jsonNode.else_statement;
        if (!_.isNil(elseStmtNode)) {
            let elseStatement = this.getFactory().createFromJson(elseStmtNode);
            elseStatement.initFromJson(elseStmtNode);
            this._elseStatement = elseStatement;
            this.addChild(elseStatement);
        }
        // create else if statements
        if (!_.isNil(jsonNode.else_if_statements) && _.isArray(jsonNode.else_if_statements)) {
            _.each(jsonNode.else_if_statements, (elseIfStmtNode) => {
                if (!_.isNil(elseIfStmtNode)) {
                    let elseIfStatement = this.getFactory().createFromJson(elseIfStmtNode);
                    elseIfStatement.initFromJson(elseIfStmtNode);
                    this._elseIfStatements.push(elseIfStatement);
                    this.addChild(elseIfStatement);
                }
            });
        }
    }
}

export default IfElseStatement;
