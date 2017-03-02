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
define(['require', 'lodash', 'log', './compound-statement-view', './../ast/statements/forkjoin-statement', './../ast/statements/join-statement',
  './../ast/statements/timeout-statement', './point'],
    function (require, _, log, CompoundStatementView, ForkJoinStatement, JoinStatement, TimeoutStatement, Point) {

        /**
         * The view to represent a Fork Join statement which is an AST visitor.
         * @param {Object} args - Arguments for creating the view.
         * @param {ForkJoinStatement} args.model - The Fork Join statement model.
         * @param {Object} args.container - The HTML container to which the view should be added to.
         * @param {Object} args.parent - Parent View (Resource, Worker, etc)
         * @param {Object} [args.viewOptions={}] - Configuration values for the view.
         * @class ForkJoinStatementView
         * @constructor
         * @extends CompoundStatementView
         */
        var ForkJoinStatementView = function (args) {
            CompoundStatementView.call(this, args);

            this._forkBlockView = undefined;
            this._joinBlockView = undefined;
            this._timeoutBlockView = undefined;
            this.getModel()._isChildOfWorker = args.isChildOfWorker;

            if (_.isNil(this._model) || !(this._model instanceof ForkJoinStatement)) {
                log.error("Fork Join statement definition is undefined or is of different type." + this._model);
                throw "Fork Join statement definition is undefined or is of different type." + this._model;
            }

            if (_.isNil(this._container)) {
                log.error("Container for Fork Join statement is undefined." + this._container);
                throw "Container for Fork Join statement is undefined." + this._container;
            }
        };

        ForkJoinStatementView.prototype = Object.create(CompoundStatementView.prototype);
        ForkJoinStatementView.prototype.constructor = ForkJoinStatementView;

        ForkJoinStatementView.prototype.canVisitForkJoinStatement = function(){
            return true;
        };

        /**
         * Visit Fork Statement
         * @param {ForkStatement} statement
         */
        ForkJoinStatementView.prototype.visitForkStatement = function(statement){
            this._forkBlockView = this.visitChildStatement(statement);
        };

        /**
         * Visit Join Statement
         * @param {JoinStatement} statement
         */
        ForkJoinStatementView.prototype.visitJoinStatement = function(statement){
            this._joinBlockView = this.visitChildStatement(statement);
        };

        /**
         * Visit Timeout Statement
         * @param {TimeoutStatement} statement
         */
        ForkJoinStatementView.prototype.visitTimeoutStatement = function(statement){
            this._timeoutBlockView = this.visitChildStatement(statement);
        };

        ForkJoinStatementView.prototype.render = function (diagramRenderingContext) {
            // Calling super render.
            (this.__proto__.__proto__).render.call(this, diagramRenderingContext);

            // Creating property pane
            var model = this.getModel();
            var editableProperty = {};
            _.forEach(model.getChildren(), function (childStatement, index) {
                if (childStatement instanceof JoinStatement) {
                    editableProperty = {
                        propertyType: "text",
                        key: "Join parameter",
                        model: childStatement,
                        getterMethod: childStatement.getParameter
                    };
                    return false;
                }
            });
            this._createPropertyPane({
                                         model: model,
                                         statementGroup: this.getStatementGroup(),
                                         editableProperties: editableProperty
                                     });
            this._createDebugIndicator({
                                           statementGroup: this.getStatementGroup()
                                       });
        };

        /**
         * Set the ForkJoinStatement model
         * @param {ForkJoinStatement} model
         */
        ForkJoinStatementView.prototype.setModel = function (model) {
            if (!_.isNil(model) && model instanceof ForkJoinStatement) {
                (this.__proto__.__proto__).setModel(model);
            } else {
                log.error("Fork Join statement definition is undefined or is of different type." + model);
                throw "Fork Join statement definition is undefined or is of different type." + model;
            }
        };

        ForkJoinStatementView.prototype.getForkBlockView = function () {
            return this._forkBlockView;
        };

        ForkJoinStatementView.prototype.getJoinBlockView = function () {
            return this._joinBlockView;
        };

        ForkJoinStatementView.prototype.getTimeoutBlockView = function () {
            return this._timeoutBlockView;
        };

        ForkJoinStatementView.prototype.onBeforeModelRemove = function () {
            this.removeAllChildStatements();
        };

        ForkJoinStatementView.prototype._getEditPaneLocation = function () {
            var statementBoundingBox = this.getJoinBlockView().getBoundingBox();
            return new Point((statementBoundingBox.x()), (statementBoundingBox.y() - 1));
        };

        return ForkJoinStatementView;
    });
