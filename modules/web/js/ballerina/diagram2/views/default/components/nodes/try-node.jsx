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
import PropTypes from 'prop-types';
import CompoundStatementDecorator from './compound-statement-decorator';
import { getComponentForNodeArray } from './../../../../diagram-util';
import TryNodeModel from './../../../../../model/tree/try-node';
import DropZone from './../../../../../drag-drop/DropZone';
import DefaultNodeFactory from './../../../../../model/default-node-factory';
import AddCompoundBlock from './add-compound-block';
import './try-node.css';

/**
 * Class for try node
 * @extends React.Component
 * @class TryNode
 * */
class TryNode extends React.Component {

    /**
     * Constructor for TryNode class
     * @param {Object} props - properties passed in to the class at creation.
     * */
    constructor(props) {
        super(props);
        this.onAddCatchClick = this.onAddCatchClick.bind(this);
        this.onAddFinallyClick = this.onAddFinallyClick.bind(this);
    }

    /**
     * Add new catch block to the try catch statement.
     * */
    onAddCatchClick() {
        const model = this.props.model;
        const catchBlocks = model.getCatchBlocks();
        if (catchBlocks) {
            const catchBlock = DefaultNodeFactory.createTry().getCatchBlocks()[0];
            model.addCatchBlocks(catchBlock);
        }
    }

    /**
     * Add finally block to the try catch statement.
     * */
    onAddFinallyClick() {
        const model = this.props.model;
        // If no finally blocks available create a final body.
        if (!model.getFinallyBody()) {
            const finallyBlock = DefaultNodeFactory.createTry().getFinallyBody();
            model.setFinallyBody(finallyBlock);
        }
    }

    /**
     * get the view for add blocks button.
     * @return {XML} react component.
     * */
    getAddBlockButton() {
        const model = this.props.model;
        const blocksToBeAdded = [];
        if (!model.getFinallyBody()) {
            const finallyBlock = {
                name: 'Finally',
                addBlock: this.onAddFinallyClick,
            };
            blocksToBeAdded.push(finallyBlock);
        }
        const catchBlock = {
            name: 'Catch',
            addBlock: this.onAddCatchClick,
        };
        blocksToBeAdded.push(catchBlock);
        return (
            <AddCompoundBlock
                blocksToBeAdded={blocksToBeAdded}
                model={model}
            />
        );
    }

    render() {
        const model = this.props.model;
        const bBox = model.viewState.bBox;
        const catchViews = getComponentForNodeArray(model.catchBlocks);
        const dropZone = model.viewState.components['drop-zone'];
        const disableDeleteForFinally = model.catchBlocks.length <= 0 && model.finallyBody;

        return (
            <g>
                <DropZone
                    x={dropZone.x}
                    y={dropZone.y}
                    width={dropZone.w}
                    height={dropZone.h}
                    baseComponent="rect"
                    dropTarget={model.parent}
                    dropBefore={model}
                    renderUponDragStart
                    enableDragBg
                    enableCenterOverlayLine
                />

                <CompoundStatementDecorator
                    dropTarget={model}
                    bBox={bBox}
                    title={'Try'}
                    model={model}
                    body={model.body}
                />

                {this.getAddBlockButton()}
                {catchViews}
                {model.finallyBody &&
                <CompoundStatementDecorator
                    bBox={bBox}
                    title={'Finally'}
                    model={model.finallyBody}
                    body={model.finallyBody}
                    disableButtons={{ delete: disableDeleteForFinally }}
                />
                }
            </g>
        );
    }
}

TryNode.propTypes = {
    model: PropTypes.instanceOf(TryNodeModel).isRequired,
};

TryNode.contextTypes = {
    mode: PropTypes.string,
};

export default TryNode;
