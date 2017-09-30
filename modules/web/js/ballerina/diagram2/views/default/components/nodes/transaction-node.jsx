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
import _ from 'lodash';
import CompoundStatementDecorator from './compound-statement-decorator';
import { getComponentForNodeArray } from './../../../../diagram-util';
import ASTFactory from '../../../../../ast/ast-factory';
import TreeUtil from './../../../../../model/tree-util';
import './if-node.css';

class TransactionNode extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            innerDropZoneActivated: false,
            innerDropZoneDropNotAllowed: false,
            innerDropZoneExist: false,
            active: 'hidden',
        };
    }

    render() {
        const model = this.props.model;
        const bBox = model.viewState.bBox;
        const transactionBody = model.transactionBody;
        const failedBody = model.failedBody;
        const abortedBody = model.abortedBody;
        const committedBody = model.committedBody;
        const dropZone = model.viewState.components['drop-zone'];
        const innerDropZoneActivated = this.state.innerDropZoneActivated;
        const innerDropZoneDropNotAllowed = this.state.innerDropZoneDropNotAllowed;
        const dropZoneClassName = ((!innerDropZoneActivated) ? 'inner-drop-zone' : 'inner-drop-zone active')
            + ((innerDropZoneDropNotAllowed) ? ' block' : '');
        const fill = this.state.innerDropZoneExist ? {} : { fill: 'none' };

        return (
            <g>
                <rect
                    x={dropZone.x}
                    y={dropZone.y}
                    width={dropZone.w}
                    height={dropZone.h}
                    className={dropZoneClassName}
                    {...fill}
                    onMouseOver={this.onDropZoneActivate}
                    onMouseOut={this.onDropZoneDeactivate}
                />
                <CompoundStatementDecorator
                    dropTarget={model}
                    bBox={transactionBody.viewState.bBox}
                    title={'Transaction'}
                    model={transactionBody}
                />
                {failedBody &&
                    <CompoundStatementDecorator
                        dropTarget={failedBody}
                        bBox={failedBody.viewState.bBox}
                        title={'Failed'}
                        model={failedBody}
                    />
                }
                {abortedBody &&
                    <CompoundStatementDecorator
                        bBox={abortedBody.viewState.bBox}
                        title={'Aborted'}
                        model={abortedBody}
                    />
                }
                {committedBody &&
                    <CompoundStatementDecorator
                        bBox={committedBody.viewState.bBox}
                        title={'Committed'}
                        model={committedBody}
                    />
                }
            </g>
        );
    }
}

TransactionNode.propTypes = {
    bBox: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
    }),
};

TransactionNode.contextTypes = {
    mode: PropTypes.string,
};

export default TransactionNode;
