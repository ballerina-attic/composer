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
import BlockStatementDecorator from './block-statement-decorator';
import ASTFactory from '../../../../ast/ast-factory';
import { getComponentForNodeArray } from './../../../diagram-util';
import './try-catch-statement.css';

class TryStatement extends React.Component {

    /**
     * Creates an instance of TryStatement.
     * @param {Object} props React properties.
     * @memberof TryStatement
     */
    constructor(props) {
        super(props);
        this.designer = _.get(props, 'designer');
        this.mode = _.get(props, 'mode');
        this.onAddCatchClick = this.onAddCatchClick.bind(this);
    }

    /**
     * Add a new catch clause
     */
    onAddCatchClick() {
        const parent = this.props.model.parent;
        const model = this.props.model;
        if (parent.getCatchStatements()) {
            const newStatement = ASTFactory.createCatchStatement();
            const thisNodeIndex = parent.getIndexOfChild(model);
            parent.addChild(newStatement, thisNodeIndex + 1);
        } else {
            const newStatement = ASTFactory.createCatchStatement();
            parent.addChild(newStatement);
        }
    }

    /**
     * Renders the view for a try statement.
     *
     * @returns {ReactElement} The view.
     * @memberof TryStatement
     */
    render() {
        const model = this.props.model;
        const bBox = model.viewState.bBox;
        const children = getComponentForNodeArray(this.props.model.getChildren(), this.designer, this.mode);
        const addNewComponentsBtn = (
            <g onClick={this.onAddCatchClick}>
                <rect
                    x={bBox.x + bBox.w + model.viewState.bBox.expansionW - 10}
                    y={bBox.y + bBox.h - 25}
                    width={20}
                    height={20}
                    rx={10}
                    ry={10}
                    className="add-catch-button"
                />
                <text
                    x={bBox.x + bBox.w + model.viewState.bBox.expansionW - 4}
                    y={bBox.y + bBox.h - 15}
                    width={20}
                    height={20}
                    className="add-catch-button-label"
                >
                    +
                </text>
            </g>
        );

        return (
            <BlockStatementDecorator
                dropTarget={model}
                bBox={bBox}
                title={'Try'}
                model={model.parent}
                utilities={addNewComponentsBtn}
            >
                {children}
            </BlockStatementDecorator>);
    }
}

TryStatement.propTypes = {
    bBox: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
    }),
};


export default TryStatement;
