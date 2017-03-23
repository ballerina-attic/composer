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
import $ from 'jquery';
import Alerts from 'alerts';
import BallerinaView from './ballerina-view';
import ASTNode from './../ast/node';

/**
 * Arguments for creating a constant definition view.
 * @class ConstantDefinitionView
 * @extends BallerinaView
 */
class ConstantDefinitionView extends BallerinaView {

    /**
     * @param args - See docs of {@link BallerinaView}.
     * @constructor
     */
    constructor(args) {
        super(args);
        this._constantDefinitionWrapper = undefined;
        this._deleteButton = undefined;
    }

    /**
     * @inheritDoc
     * Implements the view for a constant definition.
     */
    render(diagramRenderContext) {
        this.setDiagramRenderingContext(diagramRenderContext);

        var self = this;

        var constantDefinitionWrapper = $('<div/>', {
            id: this.getModel().getID(),
            class: 'constant-declaration-wrapper'
        }).data('model', this.getModel()).appendTo(this.getContainer());

        this._constantDefinitionWrapper = constantDefinitionWrapper.get(0);

        var constantDefinitionTypeWrapper = $('<div/>', {
            text: this.getModel().getType(),
            class: 'constant-declaration-type'
        }).appendTo(constantDefinitionWrapper);

        var constantDefinitionIdentifierWrapper = $('<span/>', {
            text: this.getModel().getIdentifier(),
            'contenteditable': true,
            class: 'constant-declaration-field'
        }).keypress(function (e) {
            /* Ignore Delete and Backspace keypress in firefox and capture other keypress events.
             (Chrome and IE ignore keypress event of these keys in browser level)*/
            if (!_.isEqual(e.key, 'Delete') && !_.isEqual(e.key, 'Backspace')) {
                // Updating annotation text of the model on typing.
                var enteredKey = e.which || e.charCode || e.keyCode;
                var newIdentifier = $(this).text() + String.fromCharCode(enteredKey);

                // Validation the identifier against grammar.
                if (!ASTNode.isValidIdentifier(newIdentifier)) {
                    var errorString = 'Invalid identifier for a parameter: ' + newIdentifier;
                    Alerts.error(errorString);
                    e.stopPropagation();
                    return false;
                } else {
                    self.getModel().setIdentifier(newIdentifier);
                }
            }
        }).keyup(function(){
            try {
                self.getModel().setIdentifier($(this).text());
            } catch (error) {
                Alerts.error(error);
            }
        }).appendTo(constantDefinitionWrapper);

        $('<span/>', {
            text: '=',
            class: 'constant-declaration-field constant-declaration-equals',
            click: function(e){
                e.preventDefault();
                return false;
            }
        }).appendTo(constantDefinitionWrapper);

        var constantDefinitionValueWrapper = $('<span/>', {
            text: this.getModel().getValue(),
            'contenteditable': true,
            class: 'constant-declaration-field'
        }).keypress(function (e) {
            /* Ignore Delete and Backspace keypress in firefox and capture other keypress events.
             (Chrome and IE ignore keypress event of these keys in browser level)*/
            if (!_.isEqual(e.key, 'Delete') && !_.isEqual(e.key, 'Backspace')) {
                // Updating annotation text of the model on typing.
                var enteredKey = e.which || e.charCode || e.keyCode;
                // Disabling enter key
                if (_.isEqual(enteredKey, 13)) {
                    e.stopPropagation();
                    return false;
                }

                var newValue = $(this).text() + String.fromCharCode(enteredKey);

                try {
                    self.getModel().setValue(newValue);
                } catch (errorString) {
                    Alerts.error(errorString);
                    e.stopPropagation();
                    return false;
                }
            }
        }).keyup(function () {
            try {
                self.getModel().setValue($(this).text());
            } catch (error) {
                Alerts.error(error);
            }
        }).appendTo(constantDefinitionWrapper);

        // Creating delete button.
        var deleteButton = $('<i class=\'fw fw-cancel\'></i>').appendTo(constantDefinitionWrapper);

        this._deleteButton = deleteButton.get(0);

        // Removes the value of the argument in the model and rebind the arguments to the arguments view.
        $(deleteButton).click(function () {
            self.getModel().remove();
        });

        this.getModel().on('before-remove', function() {
            $(constantDefinitionWrapper).remove();
        });
    }

    getParameterWrapper() {
        return this._constantDefinitionWrapper;
    }

    getDeleteButton() {
        return this._deleteButton;
    }
}

export default ConstantDefinitionView;
