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
import _ from 'lodash';
import log from 'log';
import AbstractSourceGenVisitor from './abstract-source-gen-visitor';

class AnnotationDefinitionVisitor extends AbstractSourceGenVisitor {
    constructor(parent) {
        super(parent);
    }

    canVisitAnnotationDefinition(annotationDefinition) {
        return true;
    }

    beginVisitAnnotationDefinition(annotationDefinition) {
        const spaces = annotationDefinition.whiteSpaceDescriptor.regions;
        const childSpaces = annotationDefinition.whiteSpaceDescriptor.children.attachmentPoints.children;
        let constructedSourceSegment = 'annotation' + spaces[0] + annotationDefinition.getAnnotationName();
        let self = this;
        let attachmentPoints = annotationDefinition.getAttachmentPoints();
        if (attachmentPoints.length > 0) {
            constructedSourceSegment += spaces[1] + 'attach';
            for (let i = 0; i < attachmentPoints.length; i++) {
                let attachment = attachmentPoints[i];
                let childSpace = childSpaces && childSpaces[attachment] && childSpaces[attachment].regions;
                constructedSourceSegment += ( childSpace ? childSpace[0] : ' ' ) + attachment +
                    ( childSpace ? childSpace[1] : '' );
                if (i !== attachmentPoints.length - 1) {
                    constructedSourceSegment += ',';
                }
            }
        }
        constructedSourceSegment += '{';
        _.each(annotationDefinition.getAnnotationAttributeDefinitions(), function (attrDefinition, count) {
            constructedSourceSegment += (self.getIndentation() + attrDefinition.getAttributeStatementString() + ';');
            if (count < annotationDefinition.getAnnotationAttributeDefinitions().length) {
                constructedSourceSegment += '\n';
            }
        });

        this.appendSource(constructedSourceSegment);
        log.debug('Begin Visit Annotation Definition');
    }

    visitAnnotationDefinition(annotationDefinition) {
        log.debug('Visit Annotation Definition');
    }

    endVisitAnnotationDefinition(annotationDefinition) {
        const spaces = annotationDefinition.whiteSpaceDescriptor.regions;
        this.outdent();
        this.appendSource("}" + spaces[3]);
        this.getParent().appendSource(this.getIndentation() + this.getGeneratedSource());
        log.debug('End Visit Annotation Definition');
    }
}

export default AnnotationDefinitionVisitor;
