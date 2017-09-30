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

import Node from '../node';
import _ from 'lodash';

class IfNodeAbstract extends Node {


    setBody(newValue, silent, title) {
        const oldValue = this.body;
        title = (_.isNil(title)) ? `Modify ${this.kind}` : title;
        this.body = newValue;

        this.body.parent = this;

        if (!silent) {
            this.trigger('tree-modified', {
                origin: this,
                type: 'modify-node',
                title,
                data: {
                    attributeName: 'body',
                    newValue,
                    oldValue,
                },
            });
        }
    }

    getBody() {
        return this.body;
    }

    setChildrenAlias() {
        const elseStatement = this.elseStatement;
        if (elseStatement.kind === 'Block') {
            elseStatement.viewState.alias = 'Else';
        }
    }

    setCondition(newValue, silent, title) {
        const oldValue = this.condition;
        title = (_.isNil(title)) ? `Modify ${this.kind}` : title;
        this.condition = newValue;

        this.condition.parent = this;

        if (!silent) {
            this.trigger('tree-modified', {
                origin: this,
                type: 'modify-node',
                title,
                data: {
                    attributeName: 'condition',
                    newValue,
                    oldValue,
                },
            });
        }
    }

    getCondition() {
        return this.condition;
    }



    setElseStatement(newValue, silent, title) {
        const oldValue = this.elseStatement;
        title = (_.isNil(title)) ? `Modify ${this.kind}` : title;
        this.elseStatement = newValue;

        this.elseStatement.parent = this;

        if (!silent) {
            this.trigger('tree-modified', {
                origin: this,
                type: 'modify-node',
                title,
                data: {
                    attributeName: 'elseStatement',
                    newValue,
                    oldValue,
                },
            });
        }
    }

    getElseStatement() {
        return this.elseStatement;
    }



}

export default IfNodeAbstract;
