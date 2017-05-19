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
import log from 'log';
import _ from 'lodash';
import AbstractSwaggerJsonGenVisitor from './abstract-swagger-json-gen-visitor';

/**
 * The {@link ResourceDefinition} visitor for generating its JSON swagger.
 * @extends AbstractSwaggerJsonGenVisitor
 */
class ResourceDefinitionVisitor extends AbstractSwaggerJsonGenVisitor {
    constructor(parent) {
        super(parent);
    }

    canVisitResourceDefinition(resourceDefinition) {
        return true;
    }

    beginVisitResourceDefinition(resourceDefinition) {
        // Creating path element that maps to the path annotation of the source.
        let pathAnnotation = resourceDefinition.getPathAnnotation();
        let pathValue = '/' + resourceDefinition.getResourceName() ; // default path
        if (!_.isUndefined(pathAnnotation)) {
            pathValue = pathAnnotation.getChildren()[0].getRightValue().replace(/"/g, '');
        }

        // Check if path already exists
        if (!_.has(this.getSwaggerJson(), pathValue)) {
            _.set(this.getSwaggerJson(), pathValue, {});
        }

        let pathJson = _.get(this.getSwaggerJson(), pathValue);

        // Creating http method element that maps to the http:<Method> annotation.
        let httpMethodAnnotation = resourceDefinition.getHttpMethodAnnotation();
        let httpMethodValue = !_.isUndefined(httpMethodAnnotation) ?
                                httpMethodAnnotation.getIdentifier().toLowerCase() : 'get';
        _.set(pathJson, httpMethodValue, {});

        let httpMethodJson = _.get(pathJson, httpMethodValue);

        // Creating annotations
        let existingAnnotations = resourceDefinition.getChildrenOfType(resourceDefinition.getFactory().isAnnotation);
        // Removing http:Path and http:<Method> annotations
        existingAnnotations = _.remove(existingAnnotations.slice(), existingAnnotation => {
            return !(_.isEqual(existingAnnotation.getPackageName(), httpMethodAnnotation.getPackageName()) &&
                    _.isEqual(existingAnnotation.getIdentifier(), httpMethodAnnotation.getIdentifier()) ||
                    _.isEqual(existingAnnotation.getPackageName(), pathAnnotation.getPackageName()) &&
                    _.isEqual(existingAnnotation.getIdentifier(), pathAnnotation.getIdentifier()));
        });

        // Creating default annotations
        _.set(httpMethodJson, 'operationId', resourceDefinition.getResourceName());
        _.set(httpMethodJson, 'responses.default.description', 'Default Response');

        // Creating the annotation
        _.forEach(existingAnnotations, existingAnnotation => {
            if (_.isEqual(existingAnnotation.getPackageName(), 'swagger') && _.isEqual(existingAnnotation.getIdentifier(), 'ResourceConfig')) {
                this.parseResourceConfigAnnotation(existingAnnotation, httpMethodJson);
            } else if (_.isEqual(existingAnnotation.getPackageName(), 'swagger') && _.isEqual(existingAnnotation.getIdentifier(), 'ResourceInfo')) {
                this.parseResourceInfoAnnotation(existingAnnotation, httpMethodJson);
            } else if (_.isEqual(existingAnnotation.getPackageName(), 'swagger') && _.isEqual(existingAnnotation.getIdentifier(), 'ParametersInfo')) {
                this.parseParameterInfoAnnotation(existingAnnotation, httpMethodJson);
            } else if (_.isEqual(existingAnnotation.getPackageName(), 'swagger') && _.isEqual(existingAnnotation.getIdentifier(), 'Responses')) {
                this.parseResponsesAnnotation(existingAnnotation, httpMethodJson);
            } else if (_.isEqual(existingAnnotation.getPackageName(), 'http') && _.isEqual(existingAnnotation.getIdentifier(), 'Consumes')) {
                let consumesAnnotationEntryArray = existingAnnotation.getChildren()[0].getRightValue();
                let consumes = [];
                _.forEach(consumesAnnotationEntryArray.getChildren(), consumesAnnotationEntry => {
                    consumes.push(this.removeDoubleQuotes(consumesAnnotationEntry.getRightValue()));
                });
                _.set(httpMethodJson, 'consumes', consumes);
            } else if (_.isEqual(existingAnnotation.getPackageName(), 'http') && _.isEqual(existingAnnotation.getIdentifier(), 'Produces')) {
                let producesAnnotationEntryArray = existingAnnotation.getChildren()[0].getRightValue();
                let produces = [];
                _.forEach(producesAnnotationEntryArray.getChildren(), producesAnnotationEntry => {
                    produces.push(this.removeDoubleQuotes(producesAnnotationEntry.getRightValue()));
                });
                _.set(httpMethodJson, 'produces', produces);
            }
        });
        log.debug('Begin Visit Resource Definition');
    }

    visitResourceDefinition(resourceDefinition) {
        log.debug('Visit ResourceDefinition');
    }

    endVisitResourceDefinition(resourceDefinition) {
        log.debug('End Visit ResourceDefinition');
    }

    /**
     * Creates the swagger JSON using the @ResourceConfig annotation..
     * @param {Annotation} existingAnnotation The @ResourceConfig annotation of the resource definition.
     * @param {object} httpMethodJson The swagger json to be updated.
     */
    parseResourceConfigAnnotation(existingAnnotation, httpMethodJson) {
        // Setting values.
        _.forEach(existingAnnotation.getChildren(), annotationEntry => {
            if (_.isEqual(annotationEntry.getLeftValue(), 'schemes')) {
                let schemesAnnotationEntryArray = annotationEntry.getRightValue();
                let schemes = [];
                _.forEach(schemesAnnotationEntryArray.getChildren(), schemesAnnotationEntry => {
                    schemes.push(schemesAnnotationEntry.getRightValue());
                });
                _.set(httpMethodJson, 'schemes', schemes);
            } else if (_.isEqual(annotationEntry.getLeftValue(), 'authorizations')) {
                // TODO : Implement authorizations
            }
        });
    }

    /**
     * Creates the swagger JSON using the @ResourceInfo annotation..
     * @param {Annotation} resourceInfoAnnotation The @ResourceInfo annotation of the resource definition.
     * @param {object} httpMethodJson The swagger json to be updated.
     */
    parseResourceInfoAnnotation(resourceInfoAnnotation, httpMethodJson) {
        // Setting values.
        _.forEach(resourceInfoAnnotation.getChildren(), annotationEntry => {
            if (_.isEqual(annotationEntry.getLeftValue(), 'tags')) {
                let tagsAnnotationEntryArray = annotationEntry.getRightValue();
                let tags = [];
                _.forEach(tagsAnnotationEntryArray.getChildren(), tagsAnnotationEntry => {
                    tags.push(tagsAnnotationEntry.getRightValue());
                });
                _.set(httpMethodJson, 'tags', tags);
            } else if (_.isEqual(annotationEntry.getLeftValue(), 'summary')) {
                _.set(httpMethodJson, 'summary', this.removeDoubleQuotes(annotationEntry.getRightValue()));
            } else if (_.isEqual(annotationEntry.getLeftValue(), 'description')) {
                _.set(httpMethodJson, 'description', this.removeDoubleQuotes(annotationEntry.getRightValue()));
            } else if (_.isEqual(annotationEntry.getLeftValue(), 'operationId')) {
                _.set(httpMethodJson, 'operationId', this.removeDoubleQuotes(annotationEntry.getRightValue()));
            } else if (_.isEqual(annotationEntry.getLeftValue(), 'externalDocs')) {
                // TODO : Implement externalDocs
            }
        });
    }

    /**
     * Creates the swagger JSON using the @ParametersInfo annotation..
     * @param {Annotation} parametersAnnotation The @ParametersInfo annotation of the resource definition.
     * @param {object} httpMethodJson The swagger json to be updated.
     */
    parseParameterInfoAnnotation(parametersAnnotation, httpMethodJson) {
        let parametersAnnotationArray = parametersAnnotation.getChildren()[0].getRightValue();
        let parameters = [];
        _.forEach(parametersAnnotationArray.getChildren(), parametersAnnotationArrayEntry => {
            let tempParameterObj = {};
            _.forEach(parametersAnnotationArrayEntry.getRightValue().getChildren(), responseAnnotationEntry => {
                if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'in')) {
                    _.set(tempParameterObj, 'in', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'name')) {
                    _.set(tempParameterObj, 'name', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'description')) {
                    _.set(tempParameterObj, 'description', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'required')) {
                    if(_.isString(responseAnnotationEntry.getRightValue())) {
                        _.set(tempParameterObj, 'required', responseAnnotationEntry.getRightValue() === 'true');
                    } else {
                        _.set(tempParameterObj, 'required', responseAnnotationEntry.getRightValue());
                    }
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'allowEmptyValue')) {
                    _.set(tempParameterObj, 'allowEmptyValue', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'type')) {
                    _.set(tempParameterObj, 'type', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'format')) {
                    _.set(tempParameterObj, 'format', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'schema')) {
                    _.set(tempParameterObj, 'schema', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'collectionFormat')) {
                    _.set(tempParameterObj, 'collectionFormat', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'items')) {
                    // TODO : Implement items annotation.
                }

            });

            parameters.push(tempParameterObj);
        });

        _.set(httpMethodJson, 'parameters', parameters);
    }

    /**
     * Creates the swagger JSON using the @Responses annotation..
     * @param {Annotation} responsesAnnotation The @Responses annotation of the resource definition.
     * @param {object} httpMethodJson The swagger json to be updated.
     */
    parseResponsesAnnotation(responsesAnnotation, httpMethodJson) {
        // Removing default responses
        _.unset(httpMethodJson, 'responses');

        // Creating the responses according the responses annotation.
        let responsesAnnotationArray = responsesAnnotation.getChildren()[0].getRightValue();
        let responses = {};
        _.forEach(responsesAnnotationArray.getChildren(), responseAnnotationArrayEntry => {
            let tempCodesObj = {};
            let codesObjects = [];
            _.forEach(responseAnnotationArrayEntry.getRightValue().getChildren(), responseAnnotationEntry => {
                if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'code')) {
                    _.set(tempCodesObj, 'code', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'description')) {
                    _.set(tempCodesObj, 'description', this.removeDoubleQuotes(responseAnnotationEntry.getRightValue()));
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'response')) {
                    // TODO : support response annotation
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'headers')) {
                    // TODO : support headers annotation
                } else if (_.isEqual(responseAnnotationEntry.getLeftValue(), 'examples')) {
                    // TODO : support examples annotation
                }
            });

            codesObjects.push(tempCodesObj);

            _.forEach(codesObjects, codeObj => {
                let responseCode = codeObj.code;
                _.unset(codeObj, 'code');
                _.set(responses, responseCode, codeObj);
            });
        });

        _.set(httpMethodJson, 'responses', responses);
    }
}

export default ResourceDefinitionVisitor;

