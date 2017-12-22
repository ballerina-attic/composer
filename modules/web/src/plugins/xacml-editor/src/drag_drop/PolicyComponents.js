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
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import Target from './Target';
import Rule from './Rule';
import Select from 'react-select';
/**
 * Policy component window of drag and drop window
 */
const policyComponentTarget = {
    drop(props, monitor) {
        props.onDrop(monitor.getItem())
    },
}

class PolicyComponents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connectDropTarget: PropTypes.func.isRequired,
            isOver: PropTypes.bool.isRequired,
            canDrop: PropTypes.bool.isRequired,
            accepts: PropTypes.arrayOf(PropTypes.string).isRequired,
            lastDroppedItem: PropTypes.object,
            onDrop: PropTypes.func.isRequired,
            name: '',

            policy_name: '',
            description: '',
            rule_combine_algorithm: ''
        }
        this.changeAlgorithm = this.changeAlgorithm.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    }

    changeAlgorithm(val) {
        this.setState({rule_combine_algorithm: val.value});
        this.props.addAlgorithm(this.state.rule_combine_algorithm);
    }

    renderDroppedItem(lastDroppedItem) {
        let component;
        console.log(lastDroppedItem);
        switch (lastDroppedItem.name) {
            case 'Target':
                component = (<Target onDelete={this.props.onDelete} onSubmitTarget={this.props.onSubmitTarget}/>);
                break;
            case 'Rule':
                component = (<Rule onDelete={this.props.onDelete} onSubmitRule={this.props.onSubmitRule}
                                   onSubmitCondition={this.props.onSubmitCondition}/>);
                break;
            default:
                component = undefined;
        }
        console.log(component);
        return component

    }

    handleNameChange(event) {
        this.setState({policy_name: event.target.value});
        this.props.addName(this.state.policy_name);
    }

    handleDescriptionChange(event) {
        this.setState({description: event.target.value});
        this.props.addDescription(this.state.description);
    }


    render() {
        var equals = [
            {value: 'Deny-overrides', label: 'Deny-overrides'},
            {value: 'Permit-overrides', label: 'Permit-overrides'},
            {value: 'First-applicable', label: 'First-applicable'}
        ];

        const {
            accepts,
            isOver,
            canDrop,
            connectDropTarget,
            lastDroppedItem,
        } = this.props
        const isActive = isOver && canDrop

        let backgroundColor = 'rgb(95, 89, 89)'
        if (isActive) {
            backgroundColor = 'darkgreen'
        } else if (canDrop) {
            backgroundColor = 'darkkhaki'
        }


        let height = '700px'
        let width = '1300px'
        let marginRight = '1.5rem'
        let marginBottom = '1.5rem'
        let color = 'black'
        let padding = '1rem'
        let textAlign = 'center'
        let fontSize = '2rem'
        let lineHeight = 'normal'
        let float = 'left'

        // const value = lastDroppedItem ? lastDroppedItem.value : "";

        return connectDropTarget(
            <div style={{
                height,
                width,
                marginRight,
                marginBottom,
                color,
                padding,
                textAlign,
                fontSize,
                lineHeight,
                float,
                backgroundColor
            }}>
                {isActive
                    ? 'Release to drop'
                    : `Drag and drop a ${accepts.join(' or ')}`}

                {lastDroppedItem && (
                    <p>Last dropped: {JSON.stringify(lastDroppedItem)}
                    </p>
                )}

                <div style={{overflow: 'hidden', clear: 'both'}}>
                    <form className="form-horizontal">
                        <div className="form-group">
                            <label className="control-label col-sm-6" for="name">Policy
                                Name:</label>
                            <div className="col-sm-3 ">
                                <input type="name" className="form-control" id="name"
                                       placeholder="Enter Policy Name" value={this.props.policy_name}
                                       onChange={this.handleNameChange}/>
                            </div>
                        </div>


                        <div className="form-group">
                            <label className="control-label col-sm-6"
                                   for="pwd">Description:</label>
                            <div className="col-sm-3">
                                <input type="URI" className="form-control" id="URI"
                                       placeholder="Enter Description" value={this.state.description}
                                       onChange={this.handleDescriptionChange}/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="control-label col-sm-6" for="display_name">Rule
                                Combining Algorithm:</label>
                            <div className="col-sm-3">

                                <Select id="equals"
                                        name="form-field-name"
                                        value={this.state.rule_combine_algorithm}
                                        options={equals}
                                        onChange={this.changeAlgorithm}
                                />
                            </div>
                        </div>
                    </form>
                </div>
                {lastDroppedItem && this.renderDroppedItem(lastDroppedItem)}

            </div>,
        )


    }
}

export default DropTarget(props => props.accepts, policyComponentTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
}))(PolicyComponents)
