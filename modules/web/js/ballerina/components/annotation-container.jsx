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
import ASTFactory from '../ast/ast-factory';
import BallerinaASTRoot from './../ast/ballerina-ast-root';
import { getComponentForNodeArray } from './utils';
import AnnotationContainerUtil from '../components/utils/annotation-container';
import AnnotationHelper from './../env/helpers/annotation-helper';
import AutoSuggestHtml from './utils/autosuggest-html';

/**
 * React component for the annotation container.
 *
 * @class AnnotationContainer
 * @extends {React.Component}
 */
class AnnotationContainer extends React.Component {
    /**
     * Creates an instance of AnnotationContainer.
     * @param {Object} props The react properties for the component.
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

        this.onAnnotationPackageNameChange = this.onPackageNameChange.bind(this);
        this.onAnnotationPackageNameBlur = this.onPackageNameBlur.bind(this);
        this.onAnnotationPackageNameSelected = this.onPackageNameSelected.bind(this);

        this.onAnnotationIdentifierChange = this.onIdentifierChange.bind(this);
        this.onAnnotationIdentifierKeyDown = this.onIdentifierKeyDown.bind(this);
        this.onAnnotationIdentifierSelected = this.onIdentifierSelected.bind(this);
    }

    /**
     * Event handler when an identifier is changed from the dropdown.
     *
     * @param {Object} event The actual select event.
     * @param {string} newValue The selected value.
     * @memberof AnnotationContainer
     */
    onIdentifierChange(event, { newValue }) {
        this.setState({
            selectedIdentifierValue: newValue,
        });
    }

    /**
     * On keydown event for annotation identifier.
     *
     * @param {Object} e The event of keydown.
     * @memberof AnnotationContainer
     */
    onIdentifierKeyDown(e) {
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
     * @memberof AnnotationContainer
     */
    onIdentifierSelected(event, { suggestionValue }) {
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
     * Focus out event for annotation package textbox.
     *
     * @memberof AnnotationContainer
     */
    onPackageNameBlur() {
        this.setState({
            hasPackageNameSelected: false,
        });
    }

    /**
     * The event when the value of the package textbox changes.
     *
     * @param {Object} event The actual event object.
     * @param {string} newValue The current value of the packagename in the text box.
     * @memberof AnnotationContainer
     */
    onPackageNameChange(event, { newValue }) {
        this.setState({
            selectedPackageNameValue: newValue,
            hasPackageNameSelected: false,
        });
    }

    /**
     * Event when a package name is selected.
     * @param {string} selectedValue The selected value(full package path).
     * @memberof AnnotationContainer
     */
    onPackageNameSelected(selectedValue) {
        this.setState({
            selectedPackageNameValue: selectedValue,
            hasPackageNameSelected: true,
        });
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
        const annotations = getComponentForNodeArray(this.props.model.getAnnotations());

        if (this.state.hasPackageNameSelected) {
            return (<div style={style} className="annotation-container">
                {annotations}
                <div className="annotation-add-wrapper">
                    <span className="annotation-add-at-sign">@</span>
                    <span className="annotation-package-name">
                        {this.state.selectedPackageNameValue.split('.').pop()}:</span>
                    <AutoSuggestHtml
                        items={AnnotationHelper.getNames(
                            this.context.environment, this.props.model.parentNode, this.state.selectedPackageNameValue)}
                        onSuggestionSelected={this.onIdentifierSelected}
                        placeholder='Identifier'
                        onChange={this.onIdentifierChange}
                        onKeyDown={this.onIdentifierKeyDown}
                    />
                </div>
            </div>);
        }

        return (<div style={style} className="annotation-container">
            {annotations}
            <div className="annotation-add-wrapper">
                <span className="annotation-add-at-sign">@</span>
                <AutoSuggestHtml
                    placeholder='Add Annotation'
                    items={AnnotationHelper.getPackageNames(
                        this.context.environment, this.props.model.parentNode)}
                    onSuggestionSelected={(event, { suggestionValue }) => {
                        this.onPackageNameSelected(suggestionValue);
                    }}
                    onChange={this.onPackageNameChange}
                    onBlur={this.onPackageNameBlur}
                    disableAutoFocus
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
