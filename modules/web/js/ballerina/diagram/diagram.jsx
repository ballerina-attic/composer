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
import CanvasDecorator from '../components/canvas-decorator';
import PositionVisitor from './position-visitor';
import DimensionVisitor from './dimension-visitor';
import ArrowConflictResolver from '../visitors/arrow-conflict-resolver';
import ClearOffset from '../visitors/clear-offset';
import AnnotationRenderingVisitor from '../visitors/annotation-rendering-visitor';
import { getComponentForNodeArray, getDesigner } from './diagram-util';
import BallerinaASTRoot from './../ast/ballerina-ast-root';
import ActiveArbiter from '../diagram/views/default/components/active-arbiter';
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
        this.dimentionVisitor = new DimensionVisitor();
        this.positionCalc = new PositionVisitor();
    }

    /**
     * @override
     * @memberof Diagram
     */
    getChildContext() {
        return {
            astRoot: this.props.model,
            activeArbiter: new ActiveArbiter(),
            mode: this.props.mode,
        };
    }

    /**
     * @override
     * @memberof Diagram
     */
    render() {
        const designer = getDesigner([this.props.mode]);
        // Following is how we render the diagram.
        // 1. We will visit the model tree and calculate width and height of all
        //    the elements. We will use DimensionCalcVisitor.
        // 1.1 First clear any offset values we have set.
        this.props.model.accept(new ClearOffset());
        // 1.2 Run the dimention calculator.
        this.dimentionVisitor.setMode(this.props.mode);
        this.dimentionVisitor.setDesigner(designer);
        this.props.model.accept(this.dimentionVisitor);
        // 1.5 We need to adjest the width of the panel to accomodate width of the screen.
        // - This is done by passing the container width to position calculater to readjest.
        const viewState = this.props.model.getViewState();
        viewState.container = {
            width: $(this.context.getDiagramContainer()).width(),
            height: $(this.context.getDiagramContainer()).height(),
        };
        // 2. Now we will visit the model again and calculate position of each node
        //    in the tree. We will use PositionCalcVisitor for this.
        this.props.model.accept(this.positionCalc);
        // 2.1 Lets resolve arrow conflicts.
        this.props.model.accept(new ArrowConflictResolver());
        // we re run the dimention and possition calculator again there are any conflicts.
        this.props.model.accept(this.dimentionVisitor);
        this.props.model.accept(this.positionCalc);
        // 3. Now we need to create component for each child of root node.
        let [others] = [undefined, [], [], []];
        const otherNodes = [];
        this.props.model.children.forEach((child) => {
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
        others = getComponentForNodeArray(otherNodes, designer, this.props.mode);
        // 3.1 lets filter out annotations so we can overlay html on top of svg.
        const annotationRenderer = new AnnotationRenderingVisitor();
        this.props.model.accept(annotationRenderer);
        let annotations = [];
        if (annotationRenderer.getAnnotations()) {
            annotations = getComponentForNodeArray(annotationRenderer.getAnnotations(), designer, this.props.mode);
        }

        // 4. Ok we are all set, now lets render the diagram with React. We will create
        //    a CsnvasDecorator and pass child components for that.

        return (<CanvasDecorator
            dropTarget={this.props.model}
            title="StatementContainer"
            bBox={viewState.bBox}
            annotations={annotations}
        >
            {others}
        </CanvasDecorator>);
    }
}

Diagram.propTypes = {
    model: PropTypes.instanceOf(BallerinaASTRoot).isRequired,
    mode: PropTypes.string,
};

Diagram.contextTypes = {
    editor: PropTypes.instanceOf(Object).isRequired,
    getDiagramContainer: PropTypes.instanceOf(Object).isRequired,
};

Diagram.childContextTypes = {
    astRoot: PropTypes.instanceOf(BallerinaASTRoot).isRequired,
    mode: PropTypes.string,
    activeArbiter: PropTypes.instanceOf(ActiveArbiter).isRequired,
};

Diagram.defaultProps = {
    mode: 'default',
};

export default Diagram;
