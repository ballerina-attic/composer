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
define(
    ['require', 'lodash', 'log', './block-statement-view', './../ast/join-statement'],
    function (require, _, log, BlockStatementView, JoinStatement) {

        /**
         * The view to represent a Catch statement which is an AST visitor.
         * @param {Object} args - Arguments for creating the view.
         * @param {JoinStatement} args.model - The Fork Join statement model.
         * @param {Object} args.container - The HTML container to which the view should be added to.
         * @param {Object} args.parent - Parent Statement View, which in this case the fork-join statement
         * @param {Object} [args.viewOptions={}] - Configuration values for the view.
         * @class JoinStatementView
         * @constructor
         * @extends BlockStatementView
         */
        var JoinStatementView = function (args) {
            _.set(args, "viewOptions.title.text", "Join");
            BlockStatementView.call(this, args);
            this.getModel()._isChildOfWorker = args.isChildOfWorker;
        };

        JoinStatementView.prototype = Object.create(BlockStatementView.prototype);
        JoinStatementView.prototype.constructor = JoinStatementView;

        JoinStatementView.prototype.canVisitJoinStatement = function(){
            return true;
        };

        /**
         * set the join statement model
         * @param {JoinStatement} model
         */
        JoinStatementView.prototype.setModel = function (model) {
            if (!_.isNil(model) && model instanceof JoinStatement) {
                (this.__proto__.__proto__).setModel(model);
            } else {
                log.error("Fork Join statement definition is undefined or is of different type." + model);
                throw "Fork Join statement definition is undefined or is of different type." + model;
            }
        };

        JoinStatementView.prototype.render = function (diagramRenderingContext) {
            // Calling super render.
            (this.__proto__.__proto__).render.call(this, diagramRenderingContext);

            this.listenTo(this._model, 'update-property-text', function(value, key){
                this._model.setParameter(value);
            });
        };

        return JoinStatementView;
    });
