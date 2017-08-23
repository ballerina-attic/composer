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

import AbstractVisitor from './../../../abstract-visitor';
import SizingUtil from './../sizing-util';

/**
 * class for dimension calc NamespaceDeclarationStatement
 * @class NamespaceDeclarationStatement
 * */
class NamespaceDeclarationStatementDimensionCalculatorVisitor {

    /**
     * Constructor for Abort statement dimensions
     * @param {object} options - options
     */
    constructor(options) {
        this.sizingUtil = new SizingUtil(options);
    }

    /**
     * can visit the NamespaceDeclarationStatement
     * @return {boolean} true
     * */
    canVisit() {
        return true;
    }

    /**
     * begin visiting NamespaceDeclarationStatement
     * */
    beginVisit() {
    }

    /**
     * visit NamespaceDeclarationStatement
     * */
    visit() {
    }

    /**
     * end visit NamespaceDeclarationStatement
     * @param {ASTNode} node - NamespaceDeclarationStatement node
     * */
    endVisit(node) {
        this.sizingUtil.populateSimpleStatementBBox(node.getStatementString(), node.getViewState());
    }
}

export default NamespaceDeclarationStatementDimensionCalculatorVisitor;
