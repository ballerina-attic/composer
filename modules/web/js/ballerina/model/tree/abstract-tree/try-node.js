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

class TryNodeAbstract extends Node {


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
        if (this.finallyBody) {
            this.finallyBody.viewState.alias = 'Finally';
        }
    }

    setCatchBlocks(newValue, silent, title) {
        const oldValue = this.catchBlocks;
        title = (_.isNil(title)) ? `Modify ${this.kind}` : title;
        this.catchBlocks = newValue;

        if (!silent) {
            this.trigger('tree-modified', {
                origin: this,
                type: 'modify-node',
                title,
                data: {
                    attributeName: 'catchBlocks',
                    newValue,
                    oldValue,
                },
            });
        }
    }

    getCatchBlocks() {
        return this.catchBlocks;
    }


    addCatchBlocks(node, i = -1, silent){
        node.parent = this;
        let index = i;
        if (i === -1) {
            this.catchBlocks.push(node);
            index = this.catchBlocks.length;
        } else {
            this.catchBlocks.splice(i, 0, node);
        }
        if(!silent) {
            this.trigger('tree-modified', {
                origin: this,
                type: 'child-added',
                title: `Add ${node.kind}`,
                data: {
                    node,
                    index,
                },
            });
        }
    }

    removeCatchBlocks(node, silent){
        const index = this.getIndexOfCatchBlocks(node);
        this.removeCatchBlocksByIndex(index);
        if(!silent) {
            this.trigger('tree-modified', {
                origin: this,
                type: 'child-removed',
                title: `Removed ${node.kind}`,
                data: {
                    node,
                    index,
                },
            });
        }        
    }

    removeCatchBlocksByIndex(index, silent){
        this.catchBlocks.splice(index, 1);
        if(!silent) {
            this.trigger('tree-modified', {
                origin: this,
                type: 'child-removed',
                title: `Removed ${this.kind}`,
                data: {
                    node: this,
                    index,
                },
            });
        }
    }

    replaceCatchBlocks(oldChild, newChild, silent) {
        const index = this.getIndexOfCatchBlocks(oldChild);
        this.catchBlocks[index] = newChild;
    }

    getIndexOfCatchBlocks(child) {
        return _.findIndex(this.catchBlocks, ['id', child.id]);
    }

    filterCatchBlocks(predicateFunction) {
        return _.filter(this.catchBlocks, predicateFunction);
    }


    setFinallyBody(newValue, silent, title) {
        const oldValue = this.finallyBody;
        title = (_.isNil(title)) ? `Modify ${this.kind}` : title;
        this.finallyBody = newValue;

        this.finallyBody.parent = this;

        if (!silent) {
            this.trigger('tree-modified', {
                origin: this,
                type: 'modify-node',
                title,
                data: {
                    attributeName: 'finallyBody',
                    newValue,
                    oldValue,
                },
            });
        }
    }

    getFinallyBody() {
        return this.finallyBody;
    }



}

export default TryNodeAbstract;
