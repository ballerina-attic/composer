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
import EventChannel from 'event_channel';
import UndoableOperationFactory from './undoable-operation-factory';

/**
 * Class to represent undo/redo manager
 * @class UndoManager
 * @augments EventChannel
 * @param args
 * @constructor
 */
class UndoManager extends EventChannel {
    constructor(args) {
        super();
        this._limit = _.get(args, 'limit', 20);
        this._undoStack = [];
        this._redoStack = [];
    }

    reset() {
        this._undoStack = [];
        this._redoStack = [];
        this.trigger('reset');
    }

    _push(undoableOperation) {
        if(this._undoStack.length === this._limit){
            // remove oldest undoable operation
            this._undoStack.splice(0, 1);
        }
        this._undoStack.push(undoableOperation);
        this.trigger('undoable-operation-added', undoableOperation);
    }

    hasUndo() {
        return !_.isEmpty(this._undoStack);
    }

    undoStackTop() {
        return _.last(this._undoStack);
    }

    redoStackTop() {
        return _.last(this._redoStack);
    }

    undo() {
        var taskToUndo = this._undoStack.pop();
        taskToUndo.undo();
        this._redoStack.push(taskToUndo);
    }

    hasRedo() {
        return !_.isEmpty(this._redoStack);
    }

    redo() {
        var taskToRedo = this._redoStack.pop();
        taskToRedo.redo();
        this._undoStack.push(taskToRedo);
    }

    getOperationFactory() {
        return UndoableOperationFactory;
    }

    onUndoableOperation(event) {
        var undoableOperation = UndoableOperationFactory.getOperation(event);
        this._push(undoableOperation);
    }
}

export default UndoManager;
