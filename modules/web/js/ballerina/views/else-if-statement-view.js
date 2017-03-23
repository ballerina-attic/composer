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
import log from 'log';
import BallerinaStatementView from './ballerina-statement-view';
import ElseIfStatement from '../ast/statements/else-if-statement';
import D3Utils from 'd3utils';

// TODO: 14/02/17 this class should extend from BlockStatementView class

/**
 * The view to represent a Else-If statement which is an AST visitor.
 * @class ElseIfStatementView
 * @extends BallerinaStatementView
 */
class ElseIfStatementView extends BallerinaStatementView {

    /**
     * @param {Object} args - Arguments for creating the view.
     * @param {ElseIfStatement} args.model - The Else-If statement model.
     * @param {Object} args.container - The HTML container to which the view should be added to.
     * @param {Object} args.parent - Parent Statement View, which in this case the if-else statement
     * @param {Object} [args.viewOptions={}] - Configuration values for the view.
     * @constructor
     */
    constructor(args) {
        super(args);
        this.getModel()._isChildOfWorker = args.isChildOfWorker;
        _.set(this._viewOptions, 'width', _.get(this._viewOptions, 'width', 120));
        _.set(this._viewOptions, 'height', _.get(this._viewOptions, 'height', 60));
        // Initialize the bounding box
        this.getBoundingBox().fromTopCenter(this.getTopCenter(),
            _.get(this._viewOptions, 'width'),  _.get(this._viewOptions, 'height'));
        this.init();
    }

    canVisitElseIfStatement() {
        return true;
    }

    init() {
    }

    /**
     * Render the else-if statement
     */
    render(diagramRenderingContext) {
        this._diagramRenderingContext = diagramRenderingContext;
        var elseIfGroup = D3Utils.group(this._container);
        elseIfGroup.attr('id','_' +this._model.id);

        var outer_rect = D3Utils.rect(this.getBoundingBox().x(), this.getBoundingBox().y(),
            this.getBoundingBox().w(), this.getBoundingBox().h(), 0, 0, elseIfGroup).classed('statement-rect', true);
        var title_rect = D3Utils.rect(this.getBoundingBox().x(), this.getBoundingBox().y(), 40, 20, 0, 0, elseIfGroup).classed('statement-rect', true);
        var title_text = D3Utils.textElement(this.getBoundingBox().x() + 20, this.getBoundingBox().y() + 10, 'ElseIf', elseIfGroup).classed('statement-text', true);
        elseIfGroup.outerRect = outer_rect;
        elseIfGroup.titleRect = title_rect;
        elseIfGroup.titleText = title_text;
        this.getBoundingBox().on('top-edge-moved', function(dy){
            outer_rect.attr('y', parseFloat(outer_rect.attr('y')) + dy);
            title_rect.attr('y', parseFloat(title_rect.attr('y')) + dy);
            title_text.attr('y', parseFloat(title_text.attr('y')) + dy);
        });
        this.setStatementGroup(elseIfGroup);
        this._model.accept(this);
    }

    /**
     * Set the else-if statement model
     * @param {ElseIfStatement} model
     */
    setModel(model) {
        if (!_.isNil(model) && model instanceof ElseIfStatement) {
            this._model = model;
        } else {
            log.error('Else If statement definition is undefined or is of different type.' + model);
            throw 'Else If statement definition is undefined or is of different type.' + model;
        }
    }

    /**
     * Set the container to draw the if statement
     * @param container
     */
    setContainer(container) {
        if (!_.isNil(container)) {
            this._container = container;
        } else {
            log.error('Container for Else If statement is undefined.' + container);
            throw 'Container for Else If statement is undefined.' + container;
        }
    }

    setViewOptions(viewOptions) {
        this._viewOptions = viewOptions;
    }

    getModel() {
        return this._model;
    }

    getContainer() {
        return this._container;
    }

    getViewOptions() {
        return this._viewOptions;
    }
}

export default ElseIfStatementView;
