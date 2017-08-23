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
import { util } from '../sizing-util';

/**
 * Dimension visitor class for Resource definition.
 *
 * @class ResourceDefinitionDimensionCalculatorVisitor
 * */
class ResourceDefinitionDimensionCalculatorVisitor {

    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf ResourceDefinitionDimensionCalculatorVisitor
     * */
    canVisit() {
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @memberOf ResourceDefinitionDimensionCalculatorVisitor
     * */
    beginVisit() {
    }

    /**
     * visit the visitor.
     *
     * @memberOf ResourceDefinitionDimensionCalculatorVisitor
     * */
    visit() {
    }

    /**
     * visit the visitor at the end.
     *
     * @param {ASTNode} node - Resource definition node.
     *
     * @memberOf ResourceDefinitionDimensionCalculatorVisitor
     * */
    endVisit(node) {
        util.populatePanelDecoratorBBox(node, node.getResourceName());
    }
}

export default ResourceDefinitionDimensionCalculatorVisitor;
