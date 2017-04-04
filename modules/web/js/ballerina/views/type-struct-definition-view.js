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
import * as d3 from 'd3';
import VariablesView from './variables-view';
import BallerinaASTFactory from 'ballerina/ast/ballerina-ast-factory';
import TypeMapper from 'typeMapper';
import BallerinaView from './ballerina-view';

class TypeStructDefinitionView extends BallerinaView {
    constructor(args) {
        super(args);
        this._parentView = _.get(args, "parentView");

        if (_.isNil(this.getModel()) || !(BallerinaASTFactory.isTypeStructDefinition(this.getModel()))) {
            log.error("Type Struct definition is undefined or is of different type." + this.getModel());
            throw "Type Struct definition is undefined or is of different type." + this.getModel();
        }

    }

    canVisitTypeStructDefinition(typeStructDefinition) {
        return true;
    }

    /**
     * Rendering the view of the Type struct definition.
     * @param {Object} diagramRenderingContext - the object which is carrying data required for rendering
     */
    render(diagramRenderingContext, mapper) {
        this._diagramRenderingContext = diagramRenderingContext;
        var struct = this.getModel().getSchemaPropertyObj();
        var category = this.getModel().getCategory();
        var selectedStructName = this.getModel().getSelectedStructName();
        if(!mapper) {
            mapper = new TypeMapper(this.getModel().getOnConnectInstance(), this.getModel().getOnDisconnectInstance(), this._parentView);
            this._parentView._typeMapper = mapper;
        }
        mapper.removeType(selectedStructName);
        if (category == "SOURCE"){
            mapper.addSourceType(struct,this.getModel());
        } else{
            mapper.addTargetType(struct,this.getModel());
        }
    }
}

export default TypeStructDefinitionView;
