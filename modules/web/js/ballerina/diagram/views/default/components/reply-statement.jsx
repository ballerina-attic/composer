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
import _ from 'lodash';
import PropTypes from 'prop-types';
import StatementDecorator from './statement-decorator';
import MessageManager from './../../../../visitors/message-manager';
import * as DesignerDefaults from './../../../../configs/designer-defaults';
import ASTFactory from '../../../../ast/ast-factory';

class ReplyStatement extends React.Component {

    constructor(props) {
        super(props);
        this.designer = _.get(props, 'designer');
        this.mode = _.get(props, 'mode');
        this.editorOptions = {
            propertyType: 'text',
            key: 'Response Message',
            model: this.props.model,
            getterMethod: this.props.model.getReplyMessage,
            setterMethod: this.props.model.setReplyMessage,
        };
    }

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


    onArrowStartPointMouseOver(e) {
        e.target.style.fill = '#444';
        e.target.style.fillOpacity = 0.5;
        e.target.style.cursor = 'url(images/BlackHandwriting.cur), pointer';
    }

    onArrowStartPointMouseOut(e) {
        e.target.style.fill = '#444';
        e.target.style.fillOpacity = 0;
    }

    onMouseDown(e) {
        const messageManager = this.context.messageManager;
        const model = this.props.model;
        const bBox = model.getViewState().bBox;
        const messageStartX = bBox.getLeft();
        const messageStartY = bBox.getTop() + (bBox.h + DesignerDefaults.statement.gutter.v) / 2;
        messageManager.setSource(model.getParent());
        messageManager.setIsOnDrag(true);
        messageManager.setMessageStart(messageStartX, messageStartY);
        messageManager.setTargetValidationCallback(destination => model.messageDrawTargetAllowed(destination));

        messageManager.startDrawMessage((destination, source) => {
            /**
             * Message manager's source is the destination for the worker reply statement
             */
            const replyStatement = `m <- ${destination.getWorkerName()}`;
            const args = {
                destination,
                source: model.getParent(),
                message: 'm',
                replyStatement,
            };
            const workerReplyStatement = ASTFactory.createWorkerReplyStatement(args);
            source.addChild(workerReplyStatement);
        });
    }

    onMouseUp(e) {
        const messageManager = this.context.messageManager;
        messageManager.reset();
    }
}


ReplyStatement.contextTypes = {
    messageManager: PropTypes.instanceOf(MessageManager).isRequired,
};

ReplyStatement.propTypes = {
    bBox: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
    }),
};


export default ReplyStatement;
