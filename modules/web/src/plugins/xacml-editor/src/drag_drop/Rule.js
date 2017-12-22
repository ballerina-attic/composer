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
 *
 */
import React from 'react';
import update from 'immutability-helper';
import ItemTypes from './ItemTypes';
import RuleComponents from './RuleComponents';
import Condition from './Condition';
import Obligation from './Obligation';
/**
 * Rule xacml policy component
 */
class Rule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rulecomponents: [
                { accepts: [ItemTypes.CONDITION,ItemTypes.OBLIGATION], lastDroppedItem: null },
            ],

            boxes: [
                { name: 'Target', type: ItemTypes.TARGET },
                { name: 'Rule', type: ItemTypes.RULE },
                { name: 'Condition', type: ItemTypes.CONDITION },
                { name: 'Obligation', type: ItemTypes.OBLIGATION }
            ],

            droppedBoxNames: [],
            showComponent: true,

            valueselect2: "",
            valueselect3: "",
            valueselect4: "",
        }
        this.onDelete = this.onDelete.bind(this);
    }

    isDropped(boxName) {
        return this.state.droppedBoxNames.indexOf(boxName) > -0
    }

    render() {
        const { rulecomponents } = this.state

        return (
            <div className="container-fluid">

                <div style={{ overflow: 'hidden', clear: 'both' }}>
                    {rulecomponents.map(({ accepts, lastDroppedItem }, index) => (

                        this.state.showComponent ?
                        <RuleComponents
                            accepts={accepts}
                            lastDroppedItem={lastDroppedItem}
                            onDrop={item => this.handleDrop(index, item)}
                            key={index}
                            onDelete={this.onDelete}
                            onSubmitRule={this.props.onSubmitRule}
                            onSubmitCondition={this.props.onSubmitCondition}
                        />
                            :''
                    ))}
                </div>
            </div>
        );
    }

    handleDrop(index, item) {
        const { name } = item
        const droppedBoxNames = name ? { $push: [name] } : {}

        this.setState(
            update(this.state, {
                rulecomponents: {
                    [index]: {
                        lastDroppedItem: {
                            $set: item,
                        },
                    },
                },
                droppedBoxNames
            }),
        )
    }

    onDelete() {
        this.setState({ showComponent: false });
    }
}

export default Rule;

