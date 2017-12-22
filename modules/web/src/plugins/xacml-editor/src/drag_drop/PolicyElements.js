import React from 'react';
import update from 'immutability-helper';
import Box from './Box';
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
import ItemTypes from './ItemTypes';
import Rule from './Rule';
import Condition from './Condition';
import Target from './Target';
/**
 * Policy elements of a xacml policy
 */
export default class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            boxes: [
                { name: 'Target', type: ItemTypes.TARGET },
                { name: 'Rule', type: ItemTypes.RULE },
                { name: 'Condition', type: ItemTypes.CONDITION },
                { name: 'Obligation',type: ItemTypes.OBLIGATION },
            ],
            droppedBoxNames: [],
        }
    }

    isDropped(boxName) {
        return this.state.droppedBoxNames.indexOf(boxName) > -0,
        this.state.droppedBoxNames.indexOf(boxName) > -0
    }

    render() {
        const { boxes } = this.state

        return (
            <div className="container-fluid">                <div className="col-lg-3">
                    <div style={{ overflow: 'hidden', clear: 'both' }}>
                        {boxes.map(({name, type }, index) => (
                            <Box
                                name={name}
                                type={type}
                                isDropped={this.isDropped(name)}
                                key={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }


    handleDrop(index, item) {
        const { name } = item
        const droppedBoxNames = name ? { $push: [name] } : {}

        this.setState(
            update(this.state, {
                    policycomponents: {
                        [index]: {
                            lastDroppedItem: {
                                $set: item,
                            },
                        },
                    },
                    droppedBoxNames
                },
            ),
        )
    }
}
