/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import Statement from './statement';
import TryStatement from './try-statement';
import CatchStatement from './catch-statement';

/**
 * Class for try-catch statement in ballerina.
 * @constructor
 */
class TryCatchStatement extends Statement {
    constructor(args) {
        super();
        this.type = "TryCatchStatement";
    }

    /**
     * setter for catch block exception
     * @param exception
     */
    setExceptionType(exception, options) {
        if (!_.isNil(exception)) {
            this.setAttribute('_exceptionType', exception, options);
        } else {
            log.error("Cannot set undefined to the exception.");
        }
    }

    /**
    * getter for catch block exception type
    */
    getExceptionType() {
        return this._exceptionType;
    }

    initFromJson(jsonNode) {
        var self = this;
        _.each(jsonNode.children, function (childNode) {
            var child = self.getFactory().createFromJson(childNode);
            self.addChild(child);
            child.initFromJson(childNode);
        });
    }
}

export default TryCatchStatement;

