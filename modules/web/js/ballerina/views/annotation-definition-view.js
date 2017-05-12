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
import log from 'log';
import $ from 'jquery';
import Canvas from './canvas';
import SVGCanvas from './../../ballerina/views/svg-canvas';
import AnnotationDefinition from './../ast/annotation-definition';
import ASTNode from './../ast/node';
import Alerts from 'alerts';
import ExpressionEditor from 'expression_editor_utils';
import AnnotationAttributeDefinitionView from './annotation-attribute-definition-view';

/**
 * The view to represent an annotation definition which is an AST Visitor.
 * */
class AnnotationDefinitionView extends SVGCanvas {
    constructor(args) {
        super(args);

        this._annotationName = _.get(args, 'annotationName', "");
        this._attachmentPoints = _.get(args, 'attachmentPoints', []);
        this._attributeDefinitions = _.get(args, 'attributeDefinitions', []);
        this._parentView = _.get(args, 'parentView');
        this._viewOptions.offsetTop = _.get(args, 'viewOptionsOffsetTop', 75);
        this._viewOptions.topBottomTotalGap = _.get(args, 'viewOptionsTopBottomTotalGap', 100);
        this._viewOptions.panelIcon = _.get(args.viewOptions, 'cssClass.service_icon');
        this._viewOptions.minHeight = _.get(args, 'minHeight', 300);

        this._totalHeight = 170;

        if (_.isNil(this._model) || !(this._model instanceof AnnotationDefinition)) {
            log.error('Annotation definition is undefined or is of different type.' + this._model);
            throw 'Annotation definition is undefined or is of different type.' + this._model;
        }

        if (_.isNil(this._container)) {
            log.error('Container for annotation definition is undefined.' + this._container);
            throw 'Container for annotation definition is undefined.' + this._container;
        }
    }

    setModel(model) {
        if (!_.isNil(model) && model instanceof AnnotationDefinition) {
            this._model = model;
        } else {
            log.error('Annotation definition is undefined or is of different type.' + model);
            throw 'Annotation definition is undefined or is of different type.' + model;
        }
    }

    setContainer(container) {
        if (!_.isNil(container)) {
            this._container = container;
        } else {
            log.error('Container for annotation definition is undefined.' + container);
            throw 'Container for annotation definition is undefined.' + container;
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

    render(diagramRenderingContext) {
        this.setDiagramRenderingContext(diagramRenderingContext);

        // Draws the outlying body of the annotation definition.
        this.drawAccordionCanvas(this._viewOptions, this.getModel().getID(), this.getModel().getType().toLowerCase(),
            this.getModel().getAnnotationName());

        // Setting the styles for the canvas icon.
        this.getPanelIcon().addClass(_.get(this._viewOptions, "cssClass.annotation_icon", ""));
        this.getPanelIcon().addClass("annotation-icon");
        var self = this;

        //Scroll to the added position and highlight the heading
        var currentContainer = $('#' + this.getModel().getID());

        $(_.get(this._viewOptions, "design_view.container", "")).scrollTop(currentContainer.parent().position().top);
        var hadingBox = $('#' + this.getModel().getID() + "_heading");
        var canvas_heading_new = _.get(this._viewOptions, "cssClass.canvas_heading_new", "");
        var new_drop_timeout = _.get(this._viewOptions, "design_view.new_drop_timeout", "");
        hadingBox.addClass(canvas_heading_new);
        setTimeout(function () {
            hadingBox.removeClass(canvas_heading_new);
        }, new_drop_timeout);

        $(this.getTitle()).addClass("annotation-title-anchor");
        $(this.getTitle()).closest("h4").addClass("clearfix");
        $(this.getTitle()).text(this.getModel().getAnnotationName())
            .on("change paste keyup", function () {
                self.getModel().setAnnotationName($(this).text());
            }).on("click", function (event) {
            event.stopPropagation();
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

                var newAnnotationName = $(this).val() + String.fromCharCode(enteredKey);

                try {
                    self.getModel().setAnnotationName(newAnnotationName);
                } catch (error) {
                    Alerts.error(error);
                    e.stopPropagation();
                    return false;
                }
            }
        });

        ////// Start implementation for Attachment View

        var attachmentButton = $('<div class="attachments-btn" data-toggle="tooltip" title="Attachments" ' +
            'data-placement="bottom"></div>').appendTo($(this.getTitle()).closest("h4")).tooltip();

        // Positioning the attachment button.
        attachmentButton.css('left', '0px');
        attachmentButton.css('top', '0px');

        $('<span class="btn-icon">Attach:</span>').appendTo(attachmentButton);

        let attachmentPaneWrapper = $('<div class="attachment-pane"/>').appendTo($(this.getTitle()).closest("h4"));
        // Positioning the  pane from the left border of the container(service, resource, etc).
        attachmentPaneWrapper.css('left', '87px');
        // Positioning the variable pane from the top border of the container(service, resource, etc).
        attachmentPaneWrapper.css('top', '0px');
        // Setting max-width of the variable wrapper.
        attachmentPaneWrapper.css('max-width', this._viewOptions.width + 'px');

        let attachmentContentWrapper = $('<div class="attachment-content-wrapper"/>').appendTo(attachmentPaneWrapper);

        let variablesActionWrapper = $('<div class="attachment-action-wrapper"/>').appendTo(attachmentContentWrapper);

        let variableAddPane = $('<div class="action-content-wrapper-heading attachment-add-action-wrapper"/>')
            .appendTo(variablesActionWrapper);

        // Creating the variable type dropdown.
        let variableIdentifier = $('<select id="variableIdentifier" class="annotation-definition-identifier" multiple="multiple"/>').appendTo(variableAddPane);

        $(document).ready(function () {
            $(variableIdentifier).select2({
                tags: true,
                tokenSeparators: [',', ' '],
                data: self._getAnnotationAttachmentTypes()
            });

            $(variableIdentifier).on('select2:selecting', function (e) {
                var newIdentifier = e.params.args.data.text;
                if (!ASTNode.isValidIdentifier(newIdentifier)) {
                    let errorString = 'Invalid keyword for attachment: ' + newIdentifier;
                    log.error(errorString);
                    Alerts.error(errorString);
                    e.stopPropagation();
                    return false;
                }

                if (!self._validateAttachment(newIdentifier)) {
                    let errorString = "Invalid keyword for attachment: " + newIdentifier;
                    Alerts.error(errorString);
                    e.stopPropagation();
                    return false;
                }
            });

            $(variableIdentifier).on('select2:select', function (e) {
                let identifierOfNewVariable = e.params.data.text.trim();
                try {
                    self._model.addAnnotationAttachmentPoint(identifierOfNewVariable);
                } catch (error) {
                    log.error(error);
                    Alerts.error(error);
                }
            });

            $(variableIdentifier).on('select2:unselecting', function (e) {
                self.getModel().removeAnnotationAttachmentPoints(e.params.args.data.text + '');
                self._renderAttachments();
            });

            // Rendering the variables
            self._renderAttachments();
        });

        // By default the variable pane is shown on pane load.
        $(attachmentButton).css('opacity', 1);
        attachmentPaneWrapper.show();

        // Stop propagating event to elements behind. This is needed for closing the wrapper when clicked outside.
        attachmentPaneWrapper.click(function (event) {
            event.stopPropagation();
        });

        ////// End implementation for Attachment View

        /** start annotation variable definition.**/

        let annotationContentWrapper = $("<div/>", {
            id: this.getModel().getID(),
            class: "annotation-content-wrapper"
        }).data("model", this.getModel()).appendTo(this.getBodyWrapper());

        //// Creating operational panel

        let annotationOperationsWrapper = $("<div/>", {
            class: "attribute-content-operations-wrapper"
        }).appendTo(annotationContentWrapper);

        var inputBoxesWrapper = $("<div/>", {
            class: "annotation-attribute-inputboxes-wrapper"
        }).appendTo(annotationOperationsWrapper);


        var annotationVariablesWrapper = $("<div/>", {
            class: "annotation-content-variables-wrapper"
        }).appendTo(annotationOperationsWrapper);


        var identifierTextInput = $("<div/>", {
            class: "annotation-identifier-text-input",
            text: "Enter Variable"
        }).appendTo(inputBoxesWrapper);

        identifierTextInput.on('click', function (e) {

            var editableProperty = {
                propertyType: 'text',
                key: 'AnnotationAttributeDefinition',
                model: self.getModel(),
                getterMethod: function () {

                },
                setterMethod: function () {
                }
            };
            identifierTextInput.empty();
            let packageScope = diagramRenderingContext.packagedScopedEnvironemnt;
            self.expressionEditor = new ExpressionEditor(identifierTextInput, "annotation-expression-editor-wrapper",
                editableProperty, packageScope, function () {

                });
        }).focusout(function (e) {
            var text = self.expressionEditor._editor.getSession().getValue();
            if (text && text !== "") {
                identifierTextInput.text(text);
            } else {
                identifierTextInput.text("Enter Variable");
            }
        });

        this.listenTo(this.getModel(), 'update-property-text', this.updateVariableIdentifierText);

        // Creating the identifier text box.
        var identifierTextBox = $("<input/>", {
            type: "text",
            class: "annotation-identifier-text-input",
            "placeholder": "Enter Variable"
        }).keypress(function (e) {
            /* Ignore Delete and Backspace keypress in firefox and capture other keypress events.
             (Chrome and IE ignore keypress event of these keys in browser level)*/
            if (!_.isEqual(e.key, "Delete") && !_.isEqual(e.key, "Backspace")) {
                var enteredKey = e.which || e.charCode || e.keyCode;
                // Adding new variable upon enter key.
                if (_.isEqual(enteredKey, 13)) {
                    addAnnotationVariableButton.click();
                    e.stopPropagation();
                    return false;
                }
            }
        });//.appendTo(inputBoxesWrapper);

        // Creating cancelling add new constant button.
        var addAnnotationVariableButton = $("<div class='add-annotation-variable-button pull-left'/>")
            .appendTo(inputBoxesWrapper);
        $("<span class='fw-stack fw-lg'><i class='fw fw-square fw-stack-2x'></i>" +
            "<i class='fw fw-check fw-stack-1x fw-inverse add-annotation-variable-button-square'></i></span>")
            .appendTo(addAnnotationVariableButton);

        $(addAnnotationVariableButton).click(function (e) {
            self.expressionEditor._editor.execCommand("Enter|Shift-Enter");
        });

        //// End of operational panel.
        this._renderAttributeDefinitions(annotationVariablesWrapper);

        $(annotationVariablesWrapper).click(function (e) {
            e.preventDefault();
            return false;
        });

        // On window click.
        $(window).click(function (event) {
            self._renderAttributeDefinitions(annotationVariablesWrapper);
        });

        currentContainer.find('svg').remove();
    }

    /**
     * Get the types values for the drop down.
     * @return {Object} dropdownData
     * */
    _getTypeDropdownValues() {
        var dropdownData = [];
        // Adding items to the type dropdown.
        var bTypes = this.getDiagramRenderingContext().getEnvironment().getTypes();
        _.forEach(bTypes, function (bType) {
            dropdownData.push({id: bType, text: bType});
        });

        return dropdownData;
    }

    /**
     * Get the attachment types.
     * @return {Object} attachment type list.
     * */
    _getAnnotationAttachmentTypes() {
        return ["service", "resource", "action"];
    }

    /**
     * Validate attachment by checking whether it exist in the attachment type list.
     * @param {string} newAttachment.
     * @return {boolean} isValid true if valid false if not valid.
     * */
    _validateAttachment(newAttachment) {
        var isValid = false;
        var attachmentPointList = this._getAnnotationAttachmentTypes();
        var filteredAttachmentList = _.filter(attachmentPointList, function (attachment) {
            return attachment === newAttachment;
        });
        if (filteredAttachmentList.length > 0) {
            isValid = true;
        }
        return isValid;
    }

    /**
     * Validate Type for Variable declaration.
     * @param {String} bType.
     * @return {boolean} isValidate
     * */
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

    /**
     * Render attribute definition view on canvas.
     * @param {Object} wrapper.
     * */
    _renderAttributeDefinitions(wrapper) {
        $(wrapper).empty();
        var self = this;
        _.forEach(this._model.getAnnotationAttributeDefinitions(), function (attributeDefinition) {
            var annotationAttributeDefinitionView = new AnnotationAttributeDefinitionView({
                parent: self.getModel(),
                model: attributeDefinition,
                container: wrapper,
                toolPalette: self.getToolPalette(),
                messageManager: self.getMessageManager(),
                parentView: self
            });

            self.getDiagramRenderingContext().getViewModelMap()[attributeDefinition.id] = annotationAttributeDefinitionView;

            annotationAttributeDefinitionView.render(self.getDiagramRenderingContext());

            $(annotationAttributeDefinitionView.getDeleteButton()).click(function () {
                self._renderAttributeDefinitions(wrapper);
            });

            $(annotationAttributeDefinitionView.getWrapper()).click({
                modelID: attributeDefinition.getID()
            }, function (event) {
                self._renderAttributeDefinitions(wrapper);
                var annotationAttributeDefinitionView = self.getDiagramRenderingContext()
                    .getViewModelMap()[event.data.modelID];
                annotationAttributeDefinitionView.renderEditView();
            });
        });

        // var attributesDeffs = wrapper
        //     .find(".annotation-variable-definition-identifier");
        //
        // var width = self._getLargestWidth(wrapper);
        // for (let i = 0; i < attributesDeffs.length; i++) {
        //     let element = attributesDeffs[i];
        //     $(element).width(width);
        // }
    }

    /**
     * Get the largest width.
     * @param {object} wrapper
     * @return {int} largestWidth
     * */
    _getLargestWidth(wrapper){
        let attributesDefinitions = $(wrapper).find(".annotation-variable-definition-identifier");
        let largestWidth = 0;
        for(let i = 0; i < attributesDefinitions.length; i++){
            let width = $(attributesDefinitions[i]).width();
            if(largestWidth < width){
                largestWidth = width;
            }
        }
        return largestWidth;
    }

    /**
     * Render the attachments on load.
     * */
    _renderAttachments() {
        _.forEach(this._model.getAttachmentPoints(), function (attachmentPoint) {
            var options = $("#variableIdentifier").find("option");
            _.forEach(options, function (option) {
                if ($(option).text().trim() === attachmentPoint) {
                    $(option).attr("selected", "selected");
                    $("#variableIdentifier").trigger("change");
                }
            });
        });
    }

    /**
     * Update Variable identifier text.
     * @param {string} text
     * */
    updateVariableIdentifierText(text) {
        try {
            let variableDeclaration = text.trim();
            let splicedExpression = variableDeclaration.split("=");
            let leftHandSideExpression = splicedExpression[0].trim();
            let rightHandSideExpression;
            if (splicedExpression.length > 1) {
                rightHandSideExpression = splicedExpression[1].trim();
            }

            if (leftHandSideExpression.split(" ").length <= 1) {
                let errorString = "Invalid variable declaration: " + variableDeclaration;
                Alerts.error(errorString);
                return false;
            }

            let bType = leftHandSideExpression.split(" ")[0];
            if (!this._validateType(bType)) {
                let errorString = "Invalid type for a variable: " + bType;
                Alerts.error(errorString);
                return false;
            }

            let identifier = leftHandSideExpression.split(" ")[1];
            if (!ASTNode.isValidIdentifier(identifier)) {
                let errorString = "Invalid identifier for a variable: " + identifier;
                Alerts.error(errorString);
                return false;
            }

            let defaultValue = "";
            if (rightHandSideExpression) {
                defaultValue = rightHandSideExpression;
            }

            this.getModel().addAnnotationAttributeDefinition(bType, identifier, defaultValue);

            this._renderAttributeDefinitions($(".annotation-content-variables-wrapper"));

            this.expressionEditor._editor.session.setValue("");
        } catch (e) {
            Alerts.error(e);
        }
    }
}
AnnotationDefinitionView.prototype.constructor = Canvas;
export default AnnotationDefinitionView;