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
import _ from 'lodash';
import Alerts from 'alerts';
import LifeLine from './lifeline.jsx';
import StatementContainer from './statement-container';
import PanelDecorator from './panel-decorator';
import {getComponentForNodeArray} from './utils';
import {lifeLine} from './../configs/designer-defaults';
import './struct-definition.css';
import PropTypes from 'prop-types';
import StructOperationsRenderer from './struct-operations-renderer';
import Renderer from './renderer';
import ASTNode from './../ast/node';
import * as DesignerDefaults from './../configs/designer-defaults';

const submitButtonWidth = 40;
const columnPadding = 5;
const panelPadding = 10;
import EditableText from './editable-text';
import ImageUtil from './image-util';

class StructDefinition extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            newType: "",
            newIdentifier: "",
            newValue: ""
        }
    }

    deleteStatement(node) {
        node.remove();
    }

    componentWillUnmount() {
        this.context.structOperationsRenderer.hideOverlay();
    }

    renderTextBox(textValue, bBox, callback) {
        const self = this;
        this.context.renderer.renderTextBox({
          bBox: bBox,
          display: true,
          initialValue: textValue || "",
          onChange(value){
            callback(value);
          }
        });
    }

    handleIdentifierClick(textValue, elementBBox, model) {
        const bBox = {x: elementBBox.x, y: elementBBox.y , h: elementBBox.height, w: elementBBox.width };
        const self = this;
        this.renderTextBox(
            textValue,
            bBox,
            (value) => {
                this.validateIdentifierName(value);
                if(model) {
                    model.setIdentifier(value);
                } else {
                    self.setState({
                        newIdentifier: value
                    });
                }

            }
        );
    }

    handleValueClick(textValue, elementBBox, model) {
        const bBox = {x: elementBBox.x, y: elementBBox.y , h: elementBBox.height, w: elementBBox.width};
        const self = this;
        this.renderTextBox(
            textValue,
            bBox,
            (value) => {
                if(model) {
                    model.setValue(value);
                } else {
                    self.setState({
                        newValue: value
                    });
                }

            }
        );
    }

    handleTypeClick(currentSelection, elementBBox, model) {
        const { renderingContext } = this.context;
        const self = this;
        const bBox = {x: elementBBox.x, y: elementBBox.y , h: elementBBox.height, w: elementBBox.width};
        this.context.renderer.renderDropdown({
          bBox: bBox,
          display: true,
          initialValue: currentSelection || "",
          options: renderingContext.environment.getTypes(),
          onChange(value){
              if(model) {
                  model.setBType(value);
              } else {
                  self.setState({
                      newType: value
                  });
              }
          }
        });
    }

    createNew() {
        this.addVariableDefinitionStatement(this.state.newType, this.state.newIdentifier, this.state.newValue);
        this.setState({
            newType: "",
            newIdentifier: "",
            newValue: ""
        });
    }

    renderContentOperations({x, y, w, h}, columnSize) {
        const placeHolderPadding = 10;
        const submitButtonPadding = 2;
        const typeCellbox = {
          x: x + panelPadding,
          y: y + panelPadding,
          width: columnSize - panelPadding - columnPadding /2,
          height: h - panelPadding * 2
        };

        const identifierCellBox = {
            x: x + columnSize + columnPadding/2,
            y: y + panelPadding,
            width: columnSize - columnPadding,
            height: h - panelPadding * 2
        };

        const defaultValueBox = {
            x: x + columnSize * 2 + columnPadding/2,
            y: y + panelPadding,
            width: columnSize - columnPadding/2,
            height: h - panelPadding * 2
        };


        return (
          <g>
                <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    className="struct-content-operations-wrapper"
                    fill="#3d3d3d"
                 />
                 <g
                    onClick={ (e)=> this.handleTypeClick(this.state.newType, typeCellbox) }
                 >
                     <rect
                        {...typeCellbox}
                         className="new-type-drop-rect"
                      />
                      <text
                          x={typeCellbox.x + placeHolderPadding}
                          y={y + DesignerDefaults.contentOperations.height/2}
                          className="struct-variable-definition-type-text"
                          >
                          {this.state.newType || "Select Type"}
                      </text>
                  </g>
                  <g
                      onClick={(e)=> this.handleIdentifierClick(this.state.newIdentifier, identifierCellBox) }
                  >
                      <rect
                          {...identifierCellBox}
                          className="new-identifier-rect"
                       />
                       <text
                           x={identifierCellBox.x + placeHolderPadding}
                           y={y + DesignerDefaults.contentOperations.height/2}
                           className="struct-variable-definition-identifier-text"
                           >
                           {this.state.newIdentifier || "Identifier"}
                       </text>
                   </g>
                   <g
                        onClick={(e)=> this.handleValueClick(this.state.newValue, defaultValueBox) }
                   >
                       <rect
                            {...defaultValueBox}
                           className="new-value-rect"
                        />
                        <text
                            x={defaultValueBox.x + placeHolderPadding}
                            y={y + DesignerDefaults.contentOperations.height/2}
                            className="struct-variable-definition-value-text"
                            >
                            {this.state.newValue || "Default Value"}
                        </text>
                    </g>
                    <rect
                        x={x + DesignerDefaults.structDefinitionStatement.width - 30}
                        y={y + 10}
                        width={20}
                        height={20}
                        className="struct-content-operations-submit-wrapper"
                     />
                    <image
                        x={x + DesignerDefaults.structDefinitionStatement.width - 30 + submitButtonPadding}
                        style={{cursor:"pointer"}}
                        y={y + 10 + submitButtonPadding}
                        width={20 - submitButtonPadding * 2}
                        height={20 - submitButtonPadding * 2}
                        onClick={ ()=> this.createNew() }
                        xlinkHref={ImageUtil.getSVGIconString('check')}>
                      >
                    </image>
            </g>
        );
    }
    validateIdentifierName (identifier) {
        const {model} = this.props;
        if (!identifier || !identifier.length) {
            const errorString = "Identifier cannot be empty";
            Alerts.error(errorString);
            throw errorString;
        }

        if (!ASTNode.isValidIdentifier(identifier)) {
            const errorString = `Invalid identifier for a variable: ${identifier}`;
            Alerts.error(errorString);
            throw errorString;
        }

        const identifierAlreadyExists = _.findIndex(model.getVariableDefinitionStatements(), function (variableDefinitionStatement) {
            return variableDefinitionStatement.getIdentifier() === identifier;
        }) !== -1;
        if (identifierAlreadyExists) {
            const errorString = `A variable with identifier ${identifier} already exists.`;
            Alerts.error(errorString);
            throw errorString;
        }
    }
    addVariableDefinitionStatement(bType, identifier, defaultValue) {
        if(!bType) {
            const errorString = "Struct Type Cannot be empty";
            Alerts.error(errorString);
            throw errorString;
        }
        this.validateIdentifierName(identifier);
        this.props.model.addVariableDefinitionStatement(bType, identifier, defaultValue);
    }

    render() {

        const { model } = this.props;
				const { bBox, components: {body} } = model.getViewState();
        const children = model.getChildren() || [];
        const title = model.getStructName();

        const coDimensions = {
            x: body.x + DesignerDefaults.panel.body.padding.left,
            y: body.y + DesignerDefaults.panel.body.padding.top,
            w: DesignerDefaults.contentOperations.width,
            h: DesignerDefaults.contentOperations.height
        };

        const columnSize = (coDimensions.w - submitButtonWidth) / 3;

				return (
					<PanelDecorator icon="tool-icons/struct" title={title} bBox={bBox} model={model}>
              { this.renderContentOperations(coDimensions, columnSize) }
              <g>
                {
                    children.map( (child, i) => {
                        const type = child.getBType();
                        const identifier = child.getIdentifier();
                        const value = child.getValue();
                        const y = coDimensions.y + DesignerDefaults.contentOperations.height + DesignerDefaults.structDefinitionStatement.height * i;

                        const typeCellbox = {
                            x: coDimensions.x,
                            y: y,
                            width: columnSize,
                            height: DesignerDefaults.structDefinitionStatement.height
                        };

                        const identifierCellBox = {
                            x: coDimensions.x + columnSize,
                            y: y,
                            width: columnSize,
                            height: DesignerDefaults.structDefinitionStatement.height
                        };

                        const defaultValueBox = {
                            x: coDimensions.x + columnSize * 2,
                            y: y,
                            width: columnSize + submitButtonWidth,
                            height: DesignerDefaults.structDefinitionStatement.height
                        };

                        return (<g key={i} className="struct-definition-statement">

                          <g
                              className="struct-variable-definition-type"
                              onClick={ (e)=> this.handleTypeClick(type, typeCellbox, child) }
                              >
                              <rect
                                  {...typeCellbox}
                                  className="struct-variable-definition-type-rect"
                               />
                              <text
                                  x={panelPadding + coDimensions.x}
                                  y={y + DesignerDefaults.structDefinitionStatement.height/2}
                                  className="struct-variable-definition-type-text"
                                  >
                                  {type}
                              </text>
                          </g>

                          <g
                              className="struct-variable-definition-identifier"
                              onClick={(e)=> this.handleIdentifierClick(identifier, identifierCellBox, child) }
                              >
                              <rect
                                  {...identifierCellBox}
                                  className="struct-variable-definition-identifier-rect"

                              />
                              <text
                                  x={coDimensions.x + panelPadding + columnSize}
                                  y={y + DesignerDefaults.structDefinitionStatement.height/2}
                                  className="struct-variable-definition-identifier-text"
                              >
                                  {identifier}
                              </text>
                          </g>

                          <g
                              className="struct-variable-definition-value"
                              onClick={(e)=> this.handleValueClick(value, defaultValueBox, child) }
                              >
                              <rect
                                  {...defaultValueBox}
                                  className="struct-variable-definition-value-rect"

                              />
                              <text
                                  x={coDimensions.x + panelPadding + columnSize * 2}
                                  y={y + DesignerDefaults.structDefinitionStatement.height/2}
                                  className="struct-variable-definition-value-text"
                              >
                                  {value}
                              </text>

                          </g>
                          <text
                              x={coDimensions.x + DesignerDefaults.structDefinitionStatement.width - DesignerDefaults.structDefinitionStatement.deleteButtonOffset}
                              y={y + DesignerDefaults.structDefinitionStatement.height/2}
                              onClick={ ()=> this.deleteStatement(child) }
                              className="struct-statement-delete">
                              ×
                          </text>
                          </g>
                        )
                    })
                }
              </g>
					</PanelDecorator>
				);
    }
}

StructDefinition.contextTypes = {
    structOperationsRenderer: PropTypes.instanceOf(StructOperationsRenderer).isRequired,
    renderingContext: PropTypes.instanceOf(Object).isRequired,
    renderer: PropTypes.instanceOf(Renderer).isRequired,
};

export default StructDefinition;
