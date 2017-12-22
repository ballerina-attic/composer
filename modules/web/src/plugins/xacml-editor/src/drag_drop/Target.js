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
import { SortableTreeWithoutDndContext as SortableTree1 } from 'react-sortable-tree';
import Select from 'react-select';
import { ReactDOM, findDOMNode } from 'react-dom';
import ItemTypes from './ItemTypes';
/**
 * Target xacml policy component
 */
class Target extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            policycomponents: [
                { accepts: [ItemTypes.RULE, ItemTypes.TARGET], lastDroppedItem: null },
            ],

            treeData: [{ title: 'User', children: [{ title: 'Name' }, { title: 'Tenant' }] },
                { title: 'Environment', children: [{ title: 'IP' }, { title: 'Time' }] }],

            treeData4: [{ title: 'Drag an attribute' }],
            shouldCopyOnOutsideDrop: true,

            valueselect2: '',
            valueselect3: '',
            targetvalue: '',
            attribute_value: [],
        };
        this.logChange2 = this.logChange2.bind(this);
        this.logChange3 = this.logChange3.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.submitdata = this.submitdata.bind(this);
    }

    handleInputChange(event) {
        this.setState({ targetvalue: event.target.value });
    }

    logChange2(val) {
        this.setState({ valueselect2: val.value });
    }

    logChange3(val) {
        this.setState({ valueselect3: val.value });
    }

    submitdata(e) {
        console.log('hi');
        e.preventDefault();
        const attribute_value = (JSON.stringify(this.state.treeData4[1, 1])).split(':');
        attribute_value[1] = attribute_value[1].replace(/[{}]/g, '');
        this.props.onSubmitTarget(attribute_value[1], this.state.valueselect2, this.state.targetvalue, this.state.valueselect3);
    }

    render() {
        const equals = [
            { value: 'equals', label: 'equals' },
            { value: 'equals-with-regexp-match', label: 'equals-with-regexp-match' },
        ];

        const ENDANDOR = [
            { value: 'END', label: 'END' },
            { value: 'AND', label: 'AND' },
            { value: 'OR', label: 'OR' },
        ];

        const externalNodeType = 'yourNodeType';
        const { shouldCopyOnOutsideDrop } = this.state;
        const getNodeKey = ({ treeIndex }) => treeIndex;

        return (
            <form>
                <button onClick={this.submitdata}>
                    <i className='fw fw-add' />
                </button>

                <button onClick={this.props.onDelete}>
                    <i className='fw fw-delete' />
                </button>

                <label className='col-sm-6' htmlFor='Target'> Target:</label>
                <br />
                <div
                    id='tree2'
                    style={{
                        height: 50,
                        width: 200,
                        float: 'left',
                        border: 'solid black 1px',
                    }}
                >
                    <SortableTree1
                        treeData={this.state.treeData4}
                        onChange={treeData4 => this.setState({ treeData4 })}
                        dndType={externalNodeType}
                        shouldCopyOnOutsideDrop={shouldCopyOnOutsideDrop}
                    />

                </div>

                <div
                    className='col-sm-6'
                    style={{
                        height: 20,
                        width: 150,
                        float: 'left',
                    }}
                >
                    <Select
                        id='equals'
                        name='form-field-name'
                        value={this.state.valueselect2}
                        options={equals}
                        onChange={this.logChange2}
                    />
                </div>

                <div
                    className='col-sm-6'
                    style={{
                        height: 20,
                        width: 200,
                        float: 'left',
                        _fontSize: '8px',

                    }}
                >
                    <input
                        className='form-control'
                        id='value'
                        placeholder='Value'
                        value={this.state.targetvalue}

                        onChange={this.handleInputChange}
                    /></div>

                <div
                    className='col-sm-6'
                    style={{
                        height: 20,
                        width: 150,
                        float: 'left',

                    }}
                >
                    <Select
                        id='ENDANDOR'
                        name='form-field-name'
                        value={this.state.valueselect3}
                        options={ENDANDOR}
                        onChange={this.logChange3}
                    />
                </div>
            </form>
        );
    }
}
export default Target;

