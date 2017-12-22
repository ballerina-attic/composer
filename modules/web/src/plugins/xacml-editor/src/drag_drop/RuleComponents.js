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
import Select from 'react-select';
import Condition from './Condition';
import Obligation from "./Obligation";
/**
 * Rule component window of drag and drop window
 */
const ruleComponentTarget = {
    drop(props, monitor) {
        props.onDrop(monitor.getItem())
    },
}

class RuleComponents extends React.Component {
    constructor(props) {

        super(props);
        this.state = {
            connectDropTarget: PropTypes.func.isRequired,
            isOver: PropTypes.bool.isRequired,
            canDrop: PropTypes.bool.isRequired,
            accepts: PropTypes.arrayOf(PropTypes.string).isRequired,
            lastDroppedItem: PropTypes.object,
            onDrop: PropTypes.func.isRequired,

            rule_effects: "",
            rulename: ''
        }

        this.logChange1 = this.logChange1.bind(this);
        this.submitdata = this.submitdata.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        this.setState({rulename: event.target.value});
    }

    renderDroppedItem(lastDroppedItem) {
        let component;
        console.log(lastDroppedItem);
        switch (lastDroppedItem.name) {
            case 'Condition':
                component = (
                    <Condition onDelete={this.props.onDelete} onSubmitCondition={this.props.onSubmitCondition}/>);
                break;
            case 'Obligation':
                component = (<Obligation onDelete={this.props.onDelete}/>);
                break;
            default:
                component = undefined;
        }
        console.log(component);
        return component
    }

    logChange1(val) {
        this.setState({rule_effects: val.value});
    }

    submitdata(e) {
        console.log("hi");
        e.preventDefault();
        this.props.onSubmitRule(this.state.rulename, this.state.rule_effects);
    }

    render() {

        var rule_effects = [
            {value: 'permit', label: 'permit'},
            {value: 'deny', label: 'deny'},
            {value: 'not applicable', label: 'not applicable'}
        ];

        const {
            accepts,
            isOver,
            canDrop,
            connectDropTarget,
            lastDroppedItem,
        } = this.props
        const isActive = isOver && canDrop

        let backgroundColor = '#d9d9d9'
        if (isActive) {
            backgroundColor = 'darkblue'
        } else if (canDrop) {
            backgroundColor = 'darkblue'
        }

        let height = '400px'
        let width = '1000px'
        let marginRight = '1.5rem'
        let marginBottom = '1.5rem'
        let color = 'black'
        let padding = '1rem'
        let textAlign = 'center'
        let fontSize = '2rem'
        let lineHeight = 'normal'
        let float = 'left'

        return connectDropTarget(
            <div
                style={{
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
                }}
            >
                Rule
                <form>
                    <button onClick={this.submitdata}>
                        <i className="fw fw-add"/>
                    </button>

                    <button onClick={this.props.onDelete}>
                        <i className="fw fw-delete"/>
                    </button>

                    <label className="col-sm-6" for="rule_name"> Rule Name:</label>
                    <div className="col-sm-6"
                         style={{
                             height: 20,
                             width: 200,
                             float: 'left',
                             _fontSize: '8px'
                         }}>
                        <input className="form-control" id="value"
                               placeholder="Value"
                               value={this.state.rulename}
                               onChange={this.handleInputChange}
                        /></div>

                    <br/> <br/>
                    <label className="col-sm-6" for="rule_effect">Effect:</label>
                    <div className="col-sm-6"
                         style={{
                             height: 20,
                             width: 200,
                             float: 'left',
                         }}
                    >
                        <Select id="rule_effects"
                                name="form-field-name"
                                value={this.state.rule_effects}
                                options={rule_effects}
                                onChange={this.logChange1}
                        />
                    </div>
                </form>

                {isActive
                    ? 'Release to drop'
                    : `Drag and drop a ${accepts.join(' or ')}`}

                {lastDroppedItem && this.renderDroppedItem(lastDroppedItem)}

            </div>,
        );
    }
}

export default DropTarget(props => props.accepts, ruleComponentTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
}))(RuleComponents)
