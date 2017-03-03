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
define(
    ['require', 'lodash', 'log', './block-statement-view', './../ast/statements/fork-statement'],
    function (require, _, log, BlockStatementView, ForkStatement) {

        /**
         * The view to represent a Fork statement which is an AST visitor.
         * @param {Object} args - Arguments for creating the view.
         * @param {ForkStatement} args.model - The Fork statement model.
         * @param {Object} args.container - The HTML container to which the view should be added to.
         * @param {Object} args.parent - Parent Statement View, which in this case the fork-join statement
         * @param {Object} [args.viewOptions={}] - Configuration values for the view.
         * @class ForkStatementView
         * @constructor
         * @extends BlockStatementView
         */
        var ForkStatementView = function (args) {
            _.set(args, "viewOptions.title.text", "Fork");
            BlockStatementView.call(this, args);
            this.getModel()._isChildOfWorker = args.isChildOfWorker;
        };

        ForkStatementView.prototype = Object.create(BlockStatementView.prototype);
        ForkStatementView.prototype.constructor = ForkStatementView;

        ForkStatementView.prototype.canVisitForkStatement = function(){
            return true;
        };

        /**
         * Set the fork statement model
         * @param {ForkStatement} model
         */
        ForkStatementView.prototype.setModel = function (model) {
            if (!_.isNil(model) && model instanceof ForkStatement) {
                (this.__proto__.__proto__).setModel(model);
            } else {
                log.error("Fork statement definition is undefined or is of different type." + model);
                throw "Fork statement definition is undefined or is of different type." + model;
            }
        };

        ForkStatementView.prototype.initFromJson = function (jsonNode) {
            var self = this;
            _.each(jsonNode.children, function (childNode) {
                var child = self.getFactory().createFromJson(childNode);
                child.initFromJson(childNode);
                self.addChild(child);
            });
        };

        return ForkStatementView;
    });
