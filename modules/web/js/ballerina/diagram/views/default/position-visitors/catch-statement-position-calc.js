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
import * as Utils from '../positioning-util';

/**
 * Position visitor class for Catch statement.
 *
 * @class CatchStatementPositionCalcVisitor
 * */
class CatchStatementPositionCalcVisitor {

    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf CatchStatementPositionCalcVisitor
     * */
    canVisit() {
        log.debug('can visit CatchStatementPositionCalcVisitor');
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @param {ASTNode} node - Catch statement node.
     *
     * @memberOf CatchStatementPositionCalcVisitor
     * */
    beginVisit(node) {
        log.debug('visit CatchStatementPositionCalcVisitor');
        Utils.getCompoundStatementChildPosition(node);
    }

    /**
     * visit the visitor.
     *
     * @memberOf CatchStatementPositionCalcVisitor
     * */
    visit() {
        log.debug('visit CatchStatementPositionCalcVisitor');
    }

    /**
     * visit the visitor at the end.
     *
     * @memberOf CatchStatementPositionCalcVisitor
     * */
    endVisit() {
        log.debug('end visit CatchStatementPositionCalcVisitor');
    }
}

export default CatchStatementPositionCalcVisitor;
