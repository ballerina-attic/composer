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
import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import ASTFactory from '../../../../ast/ast-factory';
import BallerinaASTRoot from './../../../../ast/ballerina-ast-root';
import { getComponentForNodeArray } from './../../../diagram-util';
import AnnotationContainerUtil from './utils/annotation-container';
import AnnotationHelper from './../../../../env/helpers/annotation-helper';

/**
 * React component for the annotation container.
 *
 * @class AnnotationContainer
 * @extends {React.Component}
 */
class AnnotationContainer extends React.Component {
    /**
     * Creates an instance of AnnotationContainer.
     * @param {any} props The react properties for the component.
     *
     * @memberof AnnotationContainer
     */
    constructor(props) {
        super(props);
        this.state = {
            // Annotation package name states
            selectedPackageNameValue: '',
            shownPackageNameSuggestions: [],
            hasPackageNameSelected: false,

            // Annotation identifier states
            selectedIdentifierValue: '',
            shownIdentifierSuggestions: [],
        };
        this.designer = _.get(props, 'designer');
        this.mode = _.get(props, 'mode');

        this.onAnnotationPackageNameChange = this.onAnnotationPackageNameChange.bind(this);
        this.onAnnotationPackageNameBlur = this.onAnnotationPackageNameBlur.bind(this);
        this.onAnnotationPackageNameSuggestionsFetchRequested =
                                                    this.onAnnotationPackageNameSuggestionsFetchRequested.bind(this);
        this.onAnnotationPackageNameSuggestionsClearRequested =
                                                    this.onAnnotationPackageNameSuggestionsClearRequested.bind(this);
        this.onAnnotationPackageNameSelected = this.onAnnotationPackageNameSelected.bind(this);

        this.onAnnotationIdentifierChange = this.onAnnotationIdentifierChange.bind(this);
        this.onAnnotationIdentifierKeyDown = this.onAnnotationIdentifierKeyDown.bind(this);
        this.onAnnotationIdentifierSuggestionsFetchRequested =
                                                        this.onAnnotationIdentifierSuggestionsFetchRequested.bind(this);
        this.onAnnotationIdentifierSuggestionsClearRequested =
                                                        this.onAnnotationIdentifierSuggestionsClearRequested.bind(this);
        this.onAnnotationIdentifierSelected = this.onAnnotationIdentifierSelected.bind(this);
        this.renderAnnotationPackageNameSuggestion = this.renderAnnotationPackageNameSuggestion.bind(this);

        this.storeCurrentInputReference = (autosuggest) => {
            if (autosuggest !== null) {
                this.currentInput = autosuggest.input;
            }
        };
    }

    /**
     * {@inheritDoc}
     *
     * @memberof AnnotationContainer
     */
    componentDidUpdate() {
        if (this.currentInput) {
            this.currentInput.focus();
        }
    }

    /**
     * Event handler when an identifier is changed from the dropdown.
     *
     * @param {Object} event The actual select event.
     * @param {string} newValue The selected value.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationIdentifierChange(event, { newValue }) {
        this.setState({
            selectedIdentifierValue: newValue,
        });
    }

    /**
     * On keydown event for annotation identifier.
     *
     * @param {Object} e The event of keydown.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationIdentifierKeyDown(e) {
        if (e.keyCode === 8 && this.state.selectedIdentifierValue === '') {
            this.setState({
                hasPackageNameSelected: false,
                selectedIdentifierValue: '',
            });
            e.preventDefault();
        }
    }

    /**
     * Event for selecting an item for identifier.
     *
     * @param {Object} event The actual event.
     * @param {string} suggestionValue The selected value.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationIdentifierSelected(event, { suggestionValue }) {
        // Add annotation to the node(serviceDefinition, resourceDefinition, etc)
        // http://jsbin.com/orokep/edit?html,css,js,output
        const match = /([^.;+_]+)$/.exec(this.state.selectedPackageNameValue);

        const packagePrefix = match && match[1];

        let newAnnotationAttachment;
        if (this.state.selectedPackageNameValue !== 'Current Package') {
            // Add import if not imported to AST-Root.
            const importToBeAdded = ASTFactory.createImportDeclaration({
                packageName: this.state.selectedPackageNameValue,
            });

            importToBeAdded.setParent(this.context.astRoot);

            this.context.astRoot.addImport(importToBeAdded, { doSilently: true });

            newAnnotationAttachment = ASTFactory.createAnnotationAttachment({
                fullPackageName: this.state.selectedPackageNameValue,
                packageName: packagePrefix,
                name: suggestionValue,
            });
        } else {
            newAnnotationAttachment = ASTFactory.createAnnotationAttachment({
                fullPackageName: '.',
                packageName: undefined,
                name: suggestionValue,
            });
        }

        this.props.model.parentNode.addChild(newAnnotationAttachment);

        // Resetting the state of the component.
        this.setState({
            selectedPackageNameValue: '',
            hasPackageNameSelected: false,
            selectedIdentifierValue: '',
        });
    }

    /**
     * Event when the text input for annotation identifier is empty.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationIdentifierSuggestionsClearRequested() {
        this.setState({
            shownIdentifierSuggestions: [],
        });
    }

    /**
     * Event for getting new items for the identifier dropdown.
     *
     * @param {any} value The current value of the dropdown.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationIdentifierSuggestionsFetchRequested({ value }) {
        this.setState({
            shownIdentifierSuggestions: this.getAnnotationIdentifierSuggestions(value),
        });
    }

    /**
     * Focus out event for annotation package textbox.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationPackageNameBlur() {
        this.setState({
            hasPackageNameSelected: false,
        });
    }

    /**
     * The event when the value of the package textbox changes.
     *
     * @param {Object} event The actual event object.
     * @param {string} newValue The current value of the packagename in the text box.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationPackageNameChange(event, { newValue }) {
        this.setState({
            selectedPackageNameValue: newValue,
            hasPackageNameSelected: false,
        });
    }

    /**
     * Event when a package name is selected.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationPackageNameSelected() {
        this.setState({
            hasPackageNameSelected: true,
        });
    }

    /**
     * Event when the package name textbox is empty.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationPackageNameSuggestionsClearRequested() {
        this.setState({
            shownPackageNameSuggestions: [],
        });
    }

    /**
     * The event for getting the matching package names for a given value.
     *
     * @param {any} value The current value on the textbox.
     *
     * @memberof AnnotationContainer
     */
    onAnnotationPackageNameSuggestionsFetchRequested({ value }) {
        this.setState({
            shownPackageNameSuggestions: this.getAnnotationPackageNameSuggestions(value),
        });
    }

    /**
     * Get the annotation identifier value from a suggestion object for autosuggest.
     *
     * @param {Object} suggestion The suggestion object.
     * @returns {string} The value of the suggestion.
     *
     * @memberof AnnotationContainer
     */
    getAnnotationIdentifierSuggestionValue(suggestion) {
        return suggestion.name;
    }

    /**
     * Gets the annotation identifier suggestions.
     *
     * @param {string} value The current value of the identifier textbox.
     * @returns {string[]} Matching annotation names.
     *
     * @memberof AnnotationContainer
     */
    getAnnotationIdentifierSuggestions(value) {
        const escapedValue = this.escapeRegexCharacters(value.trim());
        const regex = new RegExp(`^${escapedValue}`, 'i');

        // Get the list of annotations that belongs to the selected package. this.supportedAnnotations is already
        // filtered by attatchment points.
        let names = AnnotationHelper.getNames(
                    this.context.environment, this.props.model.parentNode, this.state.selectedPackageNameValue);
        names = names.map((name) => {
            return {
                name,
            };
        });

        // Filtering the annotations with the typed in value.
        return names.filter(nameObject => regex.test(nameObject.name));
    }

    /**
     * Get the annotation package value from a suggestion object for autosuggest.
     *
     * @param {Object} suggestion The suggestion object.
     * @returns {string} The value of the suggestion.
     *
     * @memberof AnnotationContainer
     */
    getAnnotationPackageNameSuggestionValue(suggestion) {
        return suggestion.name;
    }

    /**
     * Gets the annotation package name suggestions.
     *
     * @param {any} value The current value of the package name textbox.
     * @returns {string[]} The matching package names.
     *
     * @memberof AnnotationContainer
     */
    getAnnotationPackageNameSuggestions(value) {
        const escapedValue = this.escapeRegexCharacters(value.trim());

        let packageNameSuggestions = AnnotationHelper.getPackageNames(
                                                                this.context.environment, this.props.model.parentNode);

        packageNameSuggestions = packageNameSuggestions.map((name) => {
            return {
                name,
            };
        });

        return packageNameSuggestions.filter((sug) => { return sug.name.includes(escapedValue); });
    }

    /**
     * Gets the list of package names for suggestions
     *
     * @param {AnnotationDefinition[]} supportedAnnotations The supported annotations.
     * @returns {AnnotationDefinition} Package names
     *
     * @memberof AnnotationContainer
     */
    getPackageNameSuggestions(supportedAnnotations) {
        const tempPackageNameSuggestions = supportedAnnotations.map(supportedAnnotation => ({
            name: supportedAnnotation.packageName,
        }));

        return tempPackageNameSuggestions.filter(
                                        (obj, pos, arr) => arr.map(mapObj => mapObj.name).indexOf(obj.name) === pos);
    }

    /**
     * Escpaes regex characters from string.
     *
     * @param {string} str String to escape from.
     * @returns {string} Escaped string.
     *
     * @memberof AnnotationContainer
     */
    escapeRegexCharacters(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * The view of a dropdown item for identifiers.
     *
     * @param {Object} suggestion The suggestion object.
     * @returns {ReactElement} The view.
     *
     * @memberof AnnotationContainer
     */
    renderAnnotationIdentifierSuggestion(suggestion) {
        return (
            <span>{suggestion.name}</span>
        );
    }

    /**
     * The view of a dropdown item for package name.
     *
     * @param {Object} suggestion The suggestion object.
     * @returns {ReactElement} The view.
     */
    renderAnnotationPackageNameSuggestion(suggestion) {
        const value = this.state.selectedPackageNameValue;
        const sugName = suggestion.name;
        const parts = sugName.split(value);
        const highlightedString = [];

        parts.forEach((p, i) => {
            highlightedString.push(<span key={i}>{p}</span>);
            if (i < parts.length - 1) {
                highlightedString.push(<span key={i + 100}><b>{value}</b></span>);
            }
        });

        return (
            <span>
                {highlightedString}
            </span>
        );
    }

    /**
     * Rendering the annotation editor view.
     *
     * @returns {ReactElement} annotation editor view jsx
     *
     * @memberof AnnotationContainer
     */
    render() {
        // Creating style object for positioning the annotation container.
        const bBox = this.props.model.bBox;
        const style = {
            position: 'absolute',
            top: bBox.y,
            left: bBox.x,
            width: bBox.w,
            height: bBox.h,
        };

        // Getting the components for the annotation of the current model.
        const annotations = getComponentForNodeArray(this.props.model.getAnnotations(), this.props.designer, this.props.mode);

        if (this.state.hasPackageNameSelected) {
            // Input properties for the package name
            const inputProps = {
                placeholder: 'Identifier',
                value: this.state.selectedIdentifierValue,
                onChange: this.onAnnotationIdentifierChange,
                onKeyDown: this.onAnnotationIdentifierKeyDown,
            };

            return (<div style={style} className="annotation-container">
                {annotations}
                <div className="annotation-add-wrapper">
                    <span className="annotation-add-at-sign">@</span>
                    <span className="annotation-package-name">
                        {this.state.selectedPackageNameValue.split('.').pop()}:</span>
                    <Autosuggest
                        suggestions={this.state.shownIdentifierSuggestions}
                        onSuggestionsFetchRequested={this.onAnnotationIdentifierSuggestionsFetchRequested}
                        onSuggestionsClearRequested={this.onAnnotationIdentifierSuggestionsClearRequested}
                        onSuggestionSelected={this.onAnnotationIdentifierSelected}
                        getSuggestionValue={this.getAnnotationIdentifierSuggestionValue}
                        renderSuggestion={this.renderAnnotationIdentifierSuggestion}
                        ref={this.storeCurrentInputReference}
                        shouldRenderSuggestions={() => true}
                        inputProps={inputProps}
                    />
                </div>
            </div>);
        }
            // Input properties for the package name
        const inputProps = {
            placeholder: 'Add Annotation',
            value: this.state.selectedPackageNameValue,
            onChange: this.onAnnotationPackageNameChange,
            onBlur: this.onAnnotationPackageNameBlur,
        };

        return (<div style={style} className="annotation-container">
            {annotations}
            <div className="annotation-add-wrapper">
                <span className="annotation-add-at-sign">@</span>
                <Autosuggest
                    suggestions={this.state.shownPackageNameSuggestions}
                    onSuggestionsFetchRequested={this.onAnnotationPackageNameSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onAnnotationPackageNameSuggestionsClearRequested}
                    onSuggestionSelected={this.onAnnotationPackageNameSelected}
                    getSuggestionValue={this.getAnnotationPackageNameSuggestionValue}
                    renderSuggestion={this.renderAnnotationPackageNameSuggestion}
                    shouldRenderSuggestions={() => true}
                    inputProps={inputProps}
                />
            </div>
        </div>);
    }
}

AnnotationContainer.propTypes = {
    model: PropTypes.instanceOf(AnnotationContainerUtil).isRequired,
};

AnnotationContainer.contextTypes = {
    // Used for accessing ast-root to add imports
    astRoot: PropTypes.instanceOf(BallerinaASTRoot).isRequired,
    environment: PropTypes.instanceOf(Object).isRequired,
};

export default AnnotationContainer;
