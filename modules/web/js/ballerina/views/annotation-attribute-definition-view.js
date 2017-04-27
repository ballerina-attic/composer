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
import log from 'log';
import Alerts from 'alerts';
import BallerinaView from './ballerina-view';

class AnnotationAttributeDefinitionView extends BallerinaView {
    constructor(args) {
        super(args);
        this._parentView = _.get(args, "parentView");
        this._annotationAttributeDefinitionTypeWrapper = undefined;
        this._typeWrapper = undefined;
        this._identifierWrapper = undefined;
        this._deleteButton = undefined;
    }

    render(diagramRenderContext) {
        this.setDiagramRenderingContext(diagramRenderContext);

        var self = this;

        var annotationAttributeDefinitionWrapper = $("<div/>", {
            id: this.getModel().getID(),
            class: "annotation-variable-definition-wrapper"
        }).data("model", this.getModel()).appendTo(this.getContainer());

        this._annotationAttributeDefinitionTypeWrapper = annotationAttributeDefinitionWrapper.get(0);

        var annotationAttributeDefinitionIdentifierWrapper = $("<div/>", {
            text: this.getModel().getAttributeStatementString(),
            class: "annotation-variable-definition-identifier pull-left"
        }).appendTo(annotationAttributeDefinitionWrapper);

        this._nameWrapper = annotationAttributeDefinitionIdentifierWrapper.get(0);

        var deleteButton = $("<div class='add-annotation-variable-button pull-left'/>").css("visibility", "hidden")
            .appendTo(annotationAttributeDefinitionWrapper);

        $("<span class='fw-stack fw-lg'><i class='fw fw-square fw-stack-2x'></i>" +
            "<i class='fw fw-cancel fw-stack-1x fw-inverse add-annotation-remove-button-square'></i></span>")
            .appendTo(deleteButton);

        $(annotationAttributeDefinitionWrapper).hover(function () {
            deleteButton.css("visibility", "visible");
        }, function () {
            deleteButton.css("visibility", "hidden");
        });

        this._deleteButton = deleteButton.get(0);

        $(deleteButton).click(function () {
            $(annotationAttributeDefinitionWrapper).remove();
            self.getParent().removeAnnotationAttributeDefinition(self.getModel().getID());
        });
    }

    renderEditView() {
        var self = this;

        $(this._nameWrapper).empty();

        var identifierEditWrapper = $("<div/>", {
            click: function (e) {
                e.stopPropagation();
            }
        }).appendTo(this._nameWrapper);

        // Creating the identifier text box.
        var identifierTextBox = $("<input/>", {
            type: "text",
            class: "annotation-variable-identifier-text-input",
            val: this.getModel().getAttributeStatementString()
        }).keypress(function (e) {
            /* Ignore Delete and Backspace keypress in firefox and capture other keypress events.
             (Chrome and IE ignore keypress event of these keys in browser level)*/
            if (!_.isEqual(e.key, "Delete") && !_.isEqual(e.key, "Backspace")) {
                var enteredKey = e.which || e.charCode || e.keyCode;
                // Disabling enter key
                if (_.isEqual(enteredKey, 13)) {
                    e.stopPropagation();
                    return false;
                }
            }
        }).focusout(function (e) {
            try {
                // var bType = typeDropdown.select2('data')[0].text;
                var variableDeclaration = $(identifierTextBox).val().trim();
                var splitedExpression = variableDeclaration.split("=");
                var leftHandSideExpression = splitedExpression[0].trim();
                var rightHandSideExpression;
                if (splitedExpression.length > 1) {
                    rightHandSideExpression = splitedExpression[1].trim();
                }

                if (leftHandSideExpression.split(" ").length <= 1) {
                    var errorString = "Invalid variable declaration: " + variableDeclaration;
                    Alerts.error(errorString);
                    e.stopPropagation();
                    return false;
                }

                var bType = leftHandSideExpression.split(" ")[0];
                if (!self._validateType(bType)) {
                    var errorString = "Invalid type for a variable: " + bType;
                    Alerts.error(errorString);
                    e.stopPropagation();
                    return false;
                }

                var identifier = leftHandSideExpression.split(" ")[1];
                self.getModel().setAttributeName(identifier);

                var defaultValue = "";
                if (rightHandSideExpression) {
                    defaultValue = rightHandSideExpression;
                }

                self.getModel().setAttributeType(bType);
                self.getModel().setAttributeValue(defaultValue);
            } catch (e) {
                Alerts.error(e);
            }
        }).appendTo($(identifierEditWrapper));
    }


    getDeleteButton() {
        return this._deleteButton;
    }

    getWrapper() {
        return this._annotationAttributeDefinitionTypeWrapper;
    }

    _getTypeDropdownValues() {
        var dropdownData = [];
        // Adding items to the type dropdown.
        var bTypes = this.getDiagramRenderingContext().getEnvironment().getTypes();
        _.forEach(bTypes, function (bType) {
            dropdownData.push({id: bType, text: bType});
        });

        var structTypes = this.getDiagramRenderingContext().getPackagedScopedEnvironment().getCurrentPackage().getStructDefinitions();
        _.forEach(structTypes, function (sType) {
            dropdownData.push({id: sType.getAnnotationName(), text: sType.getAnnotationName()});
        });

        return dropdownData;
    }

    _validateType(bType) {
        var isValid = false;
        var typeList = this._getTypeDropdownValues();
        var filteredTypeList = _.filter(typeList, function (type) {
            return type.id === bType;
        });
        if (filteredTypeList.length > 0) {
            isValid = true;
        }
        return isValid;
    }
}

export default AnnotationAttributeDefinitionView;