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

import log from 'log';
import _ from 'lodash';
import * as DesignerDefaults from './../../configs/designer-defaults';
import SimpleBBox from './../../ast/simple-bounding-box';
import ASTFactory from './../../ast/ballerina-ast-factory';
import {util} from './../sizing-utils';

class ServiceDefinitionDimensionCalculatorVisitor {

    canVisit(node) {
        log.debug('can visit ServiceDefinitionDimensionCalc');
        return true;
    }

    beginVisit(node) {

        log.debug('begin visit ServiceDefinitionDimensionCalc');
    }

    visit(node) {
        log.debug('visit ServiceDefinitionDimensionCalc');
    }

    endVisit(node) {
        util.populateOuterPanelDecoratorBBox(node);

        const viewState = node.viewState;

        const textWidth = util.getTextWidth(node.getServiceName());
        viewState.titleWidth = textWidth.w;
        viewState.trimmedTitle = textWidth.text;
    }
}

export default ServiceDefinitionDimensionCalculatorVisitor;
