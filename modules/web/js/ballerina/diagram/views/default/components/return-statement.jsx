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
import StatementDecorator from './statement-decorator';

/**
 * Return statement decorator.
 * */
class ReturnStatement extends React.Component {

    constructor(props) {
        super(props);
        this.editorOptions = {
            propertyType: 'text',
            key: 'Expression',
            model: this.props.model,
            getterMethod: this.props.model.getStatementString,
            setterMethod: this.props.model.setStatementFromString,
        };
        this.designer = _.get(props, 'designer');
        this.mode = _.get(props, 'mode');
    }

    /**
     * Render function for the return statement.
     * */
    render() {
        const model = this.props.model;
        const expression = model.viewState.expression;
        return (
            <StatementDecorator
                model={model}
                viewState={model.viewState}
                expression={expression}
                editorOptions={this.editorOptions}
                designer={this.props.designer}
                mode={this.props.mode}
            />);
    }
}

ReturnStatement.propTypes = {
    bBox: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
    }),
    expression: PropTypes.shape({
        expression: PropTypes.string,
    }),
};

export default ReturnStatement;
