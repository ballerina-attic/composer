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
import log from 'log';
import PropTypes from 'prop-types';
import CanvasDecorator from './canvas-decorator';
import AnnotationRenderingVisitor from '../visitors/annotation-rendering-visitor';
import { getComponentForNodeArray } from './utils';
import BallerinaASTRoot from './../ast/ballerina-ast-root';
import ActiveArbiter from './active-arbiter';
import SourceGenVisitor from '../visitors/source-gen/ballerina-ast-root-visitor';

/**
 * React component for diagram.
 *
 * @class Diagram
 * @extends {React.Component}
 */
class Diagram extends React.Component {

    /**
     * Creates an instance of Diagram.
     * @param {Object} props React properties.
     * @memberof Diagram
     */
    constructor(props) {
        super(props);
        this.sourceGen = new SourceGenVisitor();
    }

    /**
     * @override
     * @memberof Diagram
     */
    getChildContext() {
        return {
            astRoot: this.props.model,
            activeArbiter: new ActiveArbiter(),
        };
    }

    componentWillMount() {
        this.visitModel(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.visitModel(nextProps);
    }


    visitModel(nextProps) {
        try {
            // 1 , 1.5 and 2 steps has been moved up to ballerina-file-editor.
            // 3. Now we need to create component for each child of root node.
            let [others] = [undefined, [], [], []];
            const otherNodes = [];
            nextProps.model.children.forEach((child) => {
                switch (child.constructor.name) {
                case 'ImportDeclaration':
                    break;
                case 'ConstantDefinition':
                    break;
                case 'GlobalVariableDefinition':
                    break;
                default:
                    otherNodes.push(child);
                }
            });
            others = getComponentForNodeArray(otherNodes);
            this.setState({ others });
            // 3.1 lets filter out annotations so we can overlay html on top of svg.
            const annotationRenderer = new AnnotationRenderingVisitor();
            nextProps.model.accept(annotationRenderer);
            let annotations = [];
            if (annotationRenderer.getAnnotations()) {
                annotations = getComponentForNodeArray(annotationRenderer.getAnnotations());
            }
            this.setState({ annotations });
            // 4. Ok we are all set, now lets render the diagram with React. We will create
            //    s CsnvasDecorator and pass child components for that.
        } catch (e) {
            log.error('Error in render calculation.', e);
            const { editor } = this.context;
            editor.setActiveView('SOURCE_VIEW');
        }
    }

    /**
     * @override
     * @memberof Diagram
     */
    render() {
        const viewState = this.props.model.getViewState();
        if (this.props.show && this.state.annotations) {
            return (<CanvasDecorator
                dropTarget={this.props.model}
                title="StatementContainer"
                bBox={viewState.bBox}
                annotations={this.state.annotations}
            >
                {this.state.others}
            </CanvasDecorator>);
        } else {
            return <div>Diagram error.</div>;
        }
    }
}

Diagram.propTypes = {
    model: PropTypes.instanceOf(BallerinaASTRoot).isRequired,
    show: PropTypes.bool.isRequired,
};

Diagram.contextTypes = {
    editor: PropTypes.instanceOf(Object).isRequired,
    getDiagramContainer: PropTypes.instanceOf(Object).isRequired,
};

Diagram.childContextTypes = {
    astRoot: PropTypes.instanceOf(BallerinaASTRoot).isRequired,
    activeArbiter: PropTypes.instanceOf(ActiveArbiter).isRequired,
};

export default Diagram;
