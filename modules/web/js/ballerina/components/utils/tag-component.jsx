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
import EditableText from './../editable-text';
import SuggestionsText from './../suggestions-text';
import './tag-component.css';

const DEFAULT_INPUT_VALUE = "+ Add Value";

/**
 * Common Tag Controller to render tag input box.
 * */
class TagController extends React.Component {

    constructor() {
        super();
        this.state = {editing: false, editValue: ''};
    }

    onSelectClick() {
        this.setState({editing: true, editValue: ''});
    }

    onEnter(input) {
        let setter = this.props.setter;
        setter(input);
        this.setState({editing: false, editValue: ''});
    }

    onSelectBlur() {
        this.setState({editing: false, editValue: ''});
    }

    /**
     * Click event handler for input
     * */
    onInputClick() {
        this.setState({editing: true, editValue: ''});
    }

    /**
     * Blur event handler for input
     * @param {object} e - Event
     * */
    onInputBlur(e) {
        let setter = this.props.setter;
        if (DEFAULT_INPUT_VALUE !== this.state.editValue && this.state.editValue !== "") {
            if (!setter(this.state.editValue)) {
                e.preventDefault();
            }
        }
        this.setState({editing: false, editValue: ''});
    }

    /**
     * Handle key down event of the tag controller.
     * @param {object} e - Event
     * */
    onKeyDown(e) {
        if (e.keyCode === 13) {
            let validate = this.props.validateInput;
            let variableDeclaration = this.state.editValue.replace("=", "").replace(";", "");

            if (!validate(variableDeclaration)) {
                return;
            }

            let setter = this.props.setter;
            if (!setter(this.state.editValue)) {
                return;
            }
            this.setState({editing: false, editValue: ''});
        }
    }

    /**
     * Change event handler for input
     * @param {object} e - Event
     * */
    onInputChange(e) {
        this.setState({editing: true, editValue: e.target.value});
    }

    render() {
        let modelComponents = this.props.modelComponents;
        let componentData = this.props.componentData;
        if (this.props.isSelectBox) {
            return (<g key={componentData.title}>
                <rect x={componentData.components.openingBracket.x - 3} y={componentData.components.openingBracket.y}
                      width={componentData.components.closingBracket.x - (componentData.components.openingBracket.x - 3)
                      + componentData.components.closingBracket.w}
                      height={25} className={this.props.groupClass}/>
                <text x={componentData.components.openingBracket.x}
                      y={componentData.components.openingBracket.y + 3 }
                      className={componentData.openingBracketClassName}>(
                </text>
                {modelComponents}

                <g onClick={() => {
                    this.onSelectClick()
                }}>
                    <rect x={componentData.components.closingBracket.x - 100}
                          y={componentData.components.closingBracket.y + 2 } width={90} height={20}
                          className="text-placeholder"/>
                    <text x={componentData.components.closingBracket.x - 98}
                          y={componentData.components.closingBracket.y + 18}
                          className="tag-component-attachment-text">
                        {DEFAULT_INPUT_VALUE}
                    </text>
                    <SuggestionsText x={componentData.components.closingBracket.x - 102}
                                     y={componentData.components.closingBracket.y + 2}
                                     width={93}
                                     height={20}
                                     className="tag-component-editable-text-box"
                                     onEnter={input => {
                                         this.onEnter(input)
                                     }}
                                     onBlur={() => {
                                         this.onSelectBlur()
                                     }}
                                     show={this.state.editing}
                                     suggestionsPool={this.props.suggestions}>
                    </SuggestionsText>
                </g>
                <text x={componentData.components.closingBracket.x}
                      y={componentData.components.closingBracket.y + 2 }
                      className={componentData.closingBracketClassName}>)
                </text>
            </g>);
        } else {
            if (componentData.components.typesIcon) {
                return (
                    <g key={componentData.title}>
                        <rect x={componentData.components.typesIcon.x - 3} y={componentData.components.openingBracket.y}
                              width={componentData.components.closingBracket.x - (componentData.components.openingBracket.x - 3)
                              + componentData.components.closingBracket.w + componentData.components.typesIcon.w}
                              height={25} className={this.props.groupClass}/>
                        <text x={componentData.components.typesIcon.x} y={componentData.components.typesIcon.y}>returns
                        </text>
                        <text x={componentData.components.openingBracket.x}
                              y={componentData.components.openingBracket.y + 2 }
                              className={componentData.openingBracketClassName}>(
                        </text>
                        {modelComponents}

                        <g>
                            <rect x={componentData.components.closingBracket.x - 100}
                                  y={componentData.components.closingBracket.y + 2 } width={90} height={21}
                                  className="text-placeholder"
                                  onClick={() => {
                                      this.onInputClick()
                                  }}/>
                            <EditableText x={componentData.components.closingBracket.x - 102}
                                          y={componentData.components.closingBracket.y + 25 / 2}
                                          width={93}
                                          height={20}
                                          labelClass={"tag-component-label"}
                                          inputClass={"tag-component-input-text-box"}
                                          displayText={DEFAULT_INPUT_VALUE}
                                          placeholder={DEFAULT_INPUT_VALUE}
                                          onKeyDown={e => {
                                              this.onKeyDown(e)
                                          }}
                                          onBlur={e => {
                                              this.onInputBlur(e)
                                          }}
                                          onClick={() => {
                                              this.onInputClick()
                                          }}
                                          editing={this.state.editing}
                                          onChange={e => {
                                              this.onInputChange(e)
                                          }}>
                                {this.state.editValue}
                            </EditableText>
                        </g>
                        <text x={componentData.components.closingBracket.x}
                              y={componentData.components.closingBracket.y + 3}
                              className={componentData.closingBracketClassName}>)
                        </text>
                    </g>
                );
            } else {
                return (
                    <g key={componentData.title}>
                        <rect x={componentData.components.openingBracket.x - 3}
                              y={componentData.components.openingBracket.y}
                              width={componentData.components.closingBracket.x - (componentData.components.openingBracket.x - 3)
                              + componentData.components.closingBracket.w}
                              height={25} className={this.props.groupClass}/>
                        <text x={componentData.components.openingBracket.x}
                              y={componentData.components.openingBracket.y + 3 }
                              className={componentData.openingBracketClassName}>(
                        </text>
                        {modelComponents}

                        <g>
                            <rect x={componentData.components.closingBracket.x - 100}
                                  y={componentData.components.closingBracket.y + 2} width={90} height={21}
                                  className="text-placeholder"
                                  onClick={() => {
                                      this.onInputClick()
                                  }}/>
                            <EditableText x={componentData.components.closingBracket.x - 102}
                                          y={componentData.components.closingBracket.y + 25 / 2 }
                                          width={93}
                                          height={20}
                                          labelClass={"tag-component-label"}
                                          inputClass={"tag-component-input-text-box"}
                                          displayText={DEFAULT_INPUT_VALUE}
                                          placeholder={DEFAULT_INPUT_VALUE}
                                          onKeyDown={e => {
                                              this.onKeyDown(e);
                                          }}
                                          onBlur={e => {
                                              this.onInputBlur(e)
                                          }}
                                          onClick={() => {
                                              this.onInputClick()
                                          }}
                                          editing={this.state.editing}
                                          onChange={e => {
                                              this.onInputChange(e)
                                          }}>
                                {this.state.editValue}
                            </EditableText>
                        </g>
                        <text x={componentData.components.closingBracket.x}
                              y={componentData.components.closingBracket.y + 3 }
                              className={componentData.closingBracketClassName}>)
                        </text>
                    </g>
                );
            }
        }

    }
}

export default TagController;
