/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var expect = require('chai').expect;
var webDriverIO = require('webdriverio');
var fs = require('fs');
var temp = require('temp');
var path = require('path');
var utils = require('./../../utils/ui-test-common-utils.js');
var models = require('./../../utils/syntax-models.js');
var $ = require('jquery');

console.log('running Test Suit');
describe("Ballerina UI Tests", function () {
    this.timeout(30000);
    var driver = {};

    /**
     * Before the test suit start setup necessary configurations.
     * @return {Object} webDriverIO instance
     * */
    before(function () {
        driver = webDriverIO.remote(utils.getWebDriverConfigurations());
        return driver.init();
    });

    /**
     * Service creation test.
     * */
    it('Create Service', function (done) {
        var connector;
        var expressionEditor;
        var root;
        // navigate to the web page.
        driver.url(utils.getComposerBaseUrl())// navigate to the web page
            .click('.new-welcome-button')
            .pause(3000)
            .then(function () {
                var argument = models.getArgumentDeclarationModel(3, "m", "message");
                var variableDefModel = models.getVariableDefinitionModel(4, 'nyseEP', 'http:ClientConnector', 'http');
                var connectorInitExprModel = models.getConnectorInitExpressionModel(4, 'http:ClientConnector',
                    'http://localhost:9098');
                var variableReferenceExprModel = models.getVariableReferenceExpressionModel(4, 'nyseEP',
                    [variableDefModel]);
                var variableDefStatementModel = models.getVariableDefinitionStatementModel(4,
                    [variableReferenceExprModel, connectorInitExprModel]);
                var resource = models.getResourceModel(2, "resource1", [argument, variableDefStatementModel]);
                var service = models.getServiceModel(1, "service1", [resource]);
                var packages = models.getPackageModel(".");
                root = models.getRootModel();
                root.root.push(packages);
                root.root.push(service);
                utils.renderSyntax(root, driver);
                
            })
            .pause(3000)
            .then(function() {
                utils.clickElementByClass('connector-life-line-top-polygon', driver);
                driver.execute("window.composer.tabController._tabs[1]._fileEditor.diagramRenderingContext.viewModelMap[window.composer.tabController.getActiveTab().getBallerinaFileEditor().getModel().children[1].children[0].children[2].id].expressionEditor._editor.setValue('http:ClientConnector editedEp = create http:ClientConnector(http://localhost:9090)')");
                utils.clickElementByClass('svg-container', driver);
            })
            .pause(1000)
            .then(function () {
                driver.execute("$('.connector-life-line .life-line-title')[1].textContent").should.equal('editedEp');
                done();
            });
    });

    /**
     * After running the test suit stop services that need to be stopped.
     * @return {Object} WebDriverIO
     * */
    after(function () {
        utils.killChildProcess();
        return driver.end();
    })
});
