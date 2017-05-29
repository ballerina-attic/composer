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
/* eslint-env es6 */

import _ from 'lodash';
import log from 'log';
import $ from 'jquery';
import Ballerina from 'ballerina';
import fs from 'fs';
import { expect } from 'chai';
import path from 'path';

var testFileList = require('../../resources/BalList.json');

var getModelBackend = 'http://localhost:8289/ballerina/model/content';
var getFileContentBackend = 'http://localhost:8289/service/workspace';

//Ballerina AST Deserializer
function ballerinaASTDeserializer(fileContent){
    var backend = new Ballerina.views.Backend({'url' : getModelBackend});
    var response = backend.parse(fileContent);
    var ASTModel = Ballerina.ast.BallerinaASTDeserializer.getASTModel(response);
    var sourceGenVisitor = new Ballerina.visitors.SourceGen.BallerinaASTRootVisitor();
    ASTModel.accept(sourceGenVisitor);
    var source = sourceGenVisitor.getGeneratedSource();
    return source;
}

function readFile(filePath, callback){
    var workspaceServiceURL = getFileContentBackend;
    var saveServiceURL = workspaceServiceURL + '/read';

    return fs.readFileSync(filePath, 'utf8');
}

var sourceList = testFileList.sources.source;

describe('Ballerina Tests', function() {
    sourceList.forEach(function(testFile) {

        // TODO: following path resolution only works if tests are run from the root directory of the project
        // To avoid that we need to use __dirname or __filename
        // but mocha-webpack does not seem to provide correct values for them. So using path.resolve for now.
        var sourceFile = path.resolve('js/tests/resources/' + testFile);

        it(sourceFile.replace(/^.*[\\\/]/, '') + ' Service Test', function() {
            var expectedSource = readFile(sourceFile);
            var generatedSource = ballerinaASTDeserializer(expectedSource);
            expectedSource = expectedSource.replace(/\s/g, '');
            generatedSource = generatedSource.replace(/(\r\n|\n|\r)/gm,'');
            generatedSource = generatedSource.replace(/\s/g, '');
            if(generatedSource!=expectedSource){
                log.error('error');
            }
            expect(generatedSource).to.equal(expectedSource);
        });
    });
});
