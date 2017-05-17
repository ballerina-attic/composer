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
import ReactDOM from 'react-dom';
import {getCanvasOverlay} from '../configs/app-context';
import './text-input.css';
import CreateStruct from './create-struct';

class TextBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.initialValue,
            display: true
        };
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentDidMount() {
        this.textInput.focus();
    }

    componentDidUpdate() {
        this.textInput.focus();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.initialValue,
            display: nextProps.display
        });
    }

    onChange(e) {
        this.setState({
            value: this.textInput.value
        });
        this.props.onChange(e.target.value);
    }

    onBlur(e) {
        this.setState({
            display: false
        });
    }

    render() {
        const inputStyle = {
            position: 'absolute',
            top: this.props.bBox.y,
            left: this.props.bBox.x,
            width: this.props.bBox.w,
            height: this.props.bBox.h
        };

        if (this.state.display === false) {
            inputStyle.display = 'none';
        }

        Object.assign(inputStyle, this.props.styles);

        return (
            <input
                className='text-input'
                ref={i => {
                    this.textInput = i
                }}
                style={inputStyle}
                onChange={this.onChange}
                onBlur={this.onBlur}
                value={this.state.value}
            />
        )
    }
}


class Dropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.initialValue,
            display: true
        };
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentDidMount() {
        this.dropDown.focus();
    }

    componentDidUpdate() {
        this.dropDown.focus();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.initialValue,
            display: nextProps.display
        });
    }

    onChange(e) {
        this.setState({
            value: this.dropDown.value
        });
        this.props.onChange(e.target.value);
    }

    onBlur(e) {
        this.setState({
            display: false
        });
    }

    render() {
        const inputStyle = {
            position: 'absolute',
            top: this.props.bBox.y,
            left: this.props.bBox.x,
            width: this.props.bBox.w,
            height: this.props.bBox.h
        };

        if (this.state.display === false) {
            inputStyle.display = 'none';
        }

        const { options = [] } = this.props;

        return (
            <select
                style={inputStyle}
                className='text-input'
                ref={i => {
                    this.dropDown = i
                }}
                onChange={this.onChange}
                onBlur={this.onBlur}
                value={this.state.value}
                >
                {
                    options.map( option =>{
                        return <option key={option} value={option}>{option}</option>;
                    })
                }
            </select>
        )
    }
}

export default class Renderer {
    constructor(overlay) {
        this.overlay = overlay;
    }

    renderTextBox(options) {
        ReactDOM.render(
            <TextBox {...options}/>,
            this.overlay);
    }
    renderDropdown(options) {
        ReactDOM.render(
            <Dropdown {...options}/>,
            this.overlay);
    }
    renderStructOperations(options) {
        ReactDOM.render(
            <CreateStruct {...options}/>,
            this.overlay);
    }
}
