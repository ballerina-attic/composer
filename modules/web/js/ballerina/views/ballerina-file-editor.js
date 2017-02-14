/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
define(['lodash', 'jquery', 'log', './ballerina-view', './service-definition-view',  './function-definition-view', './../ast/ballerina-ast-root',
        './../ast/ballerina-ast-factory', './../ast/package-definition', './source-view', './swagger-view',
        './../visitors/source-gen/ballerina-ast-root-visitor','./../visitors/symbol-table/ballerina-ast-root-visitor', './../tool-palette/tool-palette',
        './../undo-manager/undo-manager','./backend', './../ast/ballerina-ast-deserializer', './connector-definition-view', './struct-definition-view',
        './../env/package', './../env/package-scoped-environment', './../env/environment', './constant-definitions-pane-view', './../item-provider/tool-palette-item-provider',
        './package-definition-pane-view','./import-declaration-view', './type-mapper-definition-view', 'alerts', 'typeahead'],
    function (_, $, log, BallerinaView, ServiceDefinitionView, FunctionDefinitionView, BallerinaASTRoot, BallerinaASTFactory,
              PackageDefinition, SourceView, SwaggerView, SourceGenVisitor, SymbolTableGenVisitor, ToolPalette, UndoManager, Backend, BallerinaASTDeserializer,
              ConnectorDefinitionView, StructDefinitionView, Package, PackageScopedEnvironment, BallerinaEnvironment,
              ConstantsDefinitionsPaneView, ToolPaletteItemProvider, PackageDefinitionView, ImportDeclarationView, TypeMapperDefinitionView, alerts, typeahead) {

        /**
         * The view to represent a ballerina file editor which is an AST visitor.
         * @param {Object} args - Arguments for creating the view.
         * @param {BallerinaASTRoot} args.model - The model for ballerina file editor.
         * @param {Object} args.container - The HTML container to which the view should be added to.
         * @param {Object} [args.viewOptions={}] - Configuration values for the view.
         * @constructor
         */
        var BallerinaFileEditor = function (args) {
            // need to set this before super constructor invoke
            this._parseFailed = _.get(args, "parseFailed");
            BallerinaView.call(this, args);
            this._canvasList = _.get(args, 'canvasList', []);
            this._debugger = _.get(args, 'debugger');
            this._file = _.get(args, 'file');
            this._id = _.get(args, "id", "Ballerina File Editor");

            if (!this._parseFailed && (_.isNil(this._model) || !(this._model instanceof BallerinaASTRoot))) {
                log.error("Ballerina AST Root is undefined or is of different type." + this._model);
                throw "Ballerina AST Root is undefined or is of different type." + this._model;
            }

           if (!_.has(args, 'viewOptions.backend')){
               log.error("Backend is not defined.");
               // not throwing an exception for now since we need to work without a backend.
           }

           if (!_.has(args, 'backendEndpointsOptions')){
               log.error("Backend endpoints options not defined.");
               // not throwing an exception for now since we need to work without a backend.
           }
           this.backend = new Backend(_.get(args, 'viewOptions.backend', {}));
           this._isInSourceView = false;
           this._isInSwaggerView = false;
           this._constantDefinitionsPane = undefined;
           this.deserializer = BallerinaASTDeserializer;
           this.init();
       };

        BallerinaFileEditor.prototype = Object.create(BallerinaView.prototype);
        BallerinaFileEditor.prototype.constructor = BallerinaFileEditor;

        BallerinaFileEditor.prototype.getContent = function(){
            if (this.isInSourceView()) {
                return this._sourceView.getContent();
            } else if (this.isInSwaggerView()) {
                return this._swaggerView.getContent();
            } else {
                var generatedSource = this.generateSource();
                this._sourceView.setContent(generatedSource);
                this._sourceView.format(true);
                return this._sourceView.getContent();
            }
        };

        BallerinaFileEditor.prototype.isInSourceView = function(){
            return _.isEqual(this._activeView, 'source');
        };

        BallerinaFileEditor.prototype.isInSwaggerView = function(){
            return _.isEqual(this._activeView, 'swagger');
        };

        BallerinaFileEditor.prototype.isInDesignView = function(){
            return _.isEqual(this._activeView, 'design');
        };

        BallerinaFileEditor.prototype.setActiveView = function(activeView){
           this._activeView = activeView;
           switch (activeView){
               case "source": this.trigger("source-view-activated"); break;
               case "design": this.trigger("design-view-activated"); break;
               case "swagger": this.trigger("swagger-view-activated"); break;
           }
        };

        BallerinaFileEditor.prototype.setModel = function (model) {
            if(this._parseFailed){
                return;
            }
            if ((!_.isNil(model) && model instanceof BallerinaASTRoot)) {
                this._model = model;
                //Registering event listeners
                this._model.on('child-added', function(child){
                    this.visit(child);
                }, this);
                // make undo-manager capture all tree modifications after initial rendering
                this._model.on('tree-modified', function(event){
                    this.getUndoManager().onUndoableOperation(event);
                    this.trigger("content-modified");
                }, this);
            } else {
                log.error("Ballerina AST Root is undefined or is of different type." + model);
                throw "Ballerina AST Root is undefined or is of different type." + model;
            }
        };

        BallerinaFileEditor.prototype.setCanvasList = function (canvases) {
            if (!_.isNil(canvases)) {
                this._canvasList = canvases;
            } else {
                log.error("Canvas list cannot be undefined or empty." + canvases);
                throw "Canvas list cannot be undefined or empty." + canvases;
            }
        };

        BallerinaFileEditor.prototype.setId = function (id) {
            this._id = id;
        };

        BallerinaFileEditor.prototype.setViewOptions = function (viewOptions) {
            this._viewOptions = viewOptions;
        };

        BallerinaFileEditor.prototype.getModel = function () {
            return this._model;
        };

        BallerinaFileEditor.prototype.getCanvasList = function () {
            return this._canvasList;
        };

        BallerinaFileEditor.prototype.getId = function () {
            return this._id;
        };

        BallerinaFileEditor.prototype.getViewOptions = function () {
            return this._viewOptions;
        };

        BallerinaFileEditor.prototype.canVisitBallerinaASTRoot = function (ballerinaASTRoot) {
            return true;
        };
        BallerinaFileEditor.prototype.visitBallerinaASTRoot = function (ballerinaASTRoot) {

        };

        BallerinaFileEditor.prototype.canVisitServiceDefinition = function (serviceDefinition) {
            return false;
        };

        BallerinaFileEditor.prototype.canVisitFunctionDefinition = function (functionDefinition) {
            return false;
        };

        BallerinaFileEditor.prototype.canVisitPackageDefinition = function (packageDefinition) {
            return false;
        };

        BallerinaFileEditor.prototype.visitPackageDefinition = function (packageDefinition) {
            return true;
        };

        /**
         * Creates a packge definition view for a package definition model and calls it's render.
         * @param packageDefinition
         */
        BallerinaFileEditor.prototype.visitPackageDefinition = function (packageDefinition) {
            var packageDefinitionView = new PackageDefinitionView({
                viewOptions: this._viewOptions,
                container: this._$canvasContainer,
                model: packageDefinition,
                parentView: this,
                toolPalette: this.toolPalette
            });
            this.diagramRenderingContext.getViewModelMap()[packageDefinition.id] = packageDefinitionView;
            packageDefinitionView.render(this.diagramRenderingContext);
        };

        BallerinaFileEditor.prototype.visitImportDeclaration = function (importDeclaration) {
            var importDeclarationView = new ImportDeclarationView({
                viewOptions: this._viewOptions,
                container: this._$canvasContainer,
                model: importDeclaration,
                parentView: this,
            });
            this.diagramRenderingContext.getViewModelMap()[importDeclaration.id] = importDeclarationView;
            importDeclarationView.render(this.diagramRenderingContext);
        };

        /**
         * Creates a service definition view for a service definition model and calls it's render.
         * @param serviceDefinition
         */
        BallerinaFileEditor.prototype.visitServiceDefinition = function (serviceDefinition) {
            var serviceDefinitionView = new ServiceDefinitionView({
                viewOptions: this._viewOptions,
                container: this._$canvasContainer,
                model: serviceDefinition,
                parentView: this,
                toolPalette: this.toolPalette
            });
            this.diagramRenderingContext.getViewModelMap()[serviceDefinition.id] = serviceDefinitionView;
            serviceDefinitionView.render(this.diagramRenderingContext);

        };

        /**
         * Creates a connector definition view for a connector definition model and calls it's render.
         * @param connectorDefinition
         */
        BallerinaFileEditor.prototype.visitConnectorDefinition = function (connectorDefinition) {
            var connectorDefinitionView = new ConnectorDefinitionView({
                viewOptions: this._viewOptions,
                container: this._$canvasContainer,
                model: connectorDefinition,
                parentView: this,
                toolPalette: this.toolPalette
            });
            this.diagramRenderingContext.getViewModelMap()[connectorDefinition.id] = connectorDefinitionView;
            connectorDefinitionView.render(this.diagramRenderingContext);
        };

        /**
         * Visits FunctionDefinition
         * @param functionDefinition
         */
        BallerinaFileEditor.prototype.visitFunctionDefinition = function (functionDefinition) {
            var functionDefinitionView = new FunctionDefinitionView({
                viewOptions: this._viewOptions,
                container: this._$canvasContainer,
                model: functionDefinition,
                parentView: this,
                toolPalette: this.toolPalette
            });
            this.diagramRenderingContext.getViewModelMap()[functionDefinition.id] = functionDefinitionView;
            functionDefinitionView.render(this.diagramRenderingContext);
        };

        BallerinaFileEditor.prototype.visitStructDefinition = function (structDefinition) {
            var structDefinitionView = new StructDefinitionView({
                viewOptions: this._viewOptions,
                container: this._$canvasContainer,
                model: structDefinition,
                parentView: this,
                toolPalette: this.toolPalette
            });
            this.diagramRenderingContext.getViewModelMap()[structDefinition.id] = structDefinitionView;
            structDefinitionView.render(this.diagramRenderingContext);
        };

        /**
         * Creates a TypeMapperDefinition view for a TypeMapper Definition model and calls it's render.
         * @param typeMapperDefinition
         */
        BallerinaFileEditor.prototype.visitTypeMapperDefinition = function (typeMapperDefinition) {
            var typeMapperDefinitionView = new TypeMapperDefinitionView({
                viewOptions: this._viewOptions,
                container: this._$canvasContainer,
                model: typeMapperDefinition,
                parentView: this,
                toolPalette: this.toolPalette
            });
            typeMapperDefinitionView.render(this.diagramRenderingContext);
            this.diagramRenderingContext.getViewModelMap()[typeMapperDefinition.id] = typeMapperDefinitionView;
        };

        /**
         * Adds the service definitions, function definitions and connector definitions to
         * {@link BallerinaFileEditor#_canvasList} and calls {@link BallerinaFileEditor#render}.
         */
        BallerinaFileEditor.prototype.init = function () {
            var viewOptions = this._viewOptions;
            var errMsg;
            if (!_.has(viewOptions, 'design_view.container')) {
                errMsg = 'unable to find configuration for container';
                log.error(errMsg);
                throw errMsg;
            }
            // this._viewOptions.container is the root div for tab content
            var container = $(this._container).find(_.get(viewOptions, 'design_view.container'));
            this._$designViewContainer = container;
            var canvasContainer = $('<div></div>');
            canvasContainer.addClass(_.get(viewOptions, 'cssClass.canvas_container'));
            var canvasTopControlsContainer = $('<div></div>')
                .addClass(_.get(viewOptions, 'cssClass.canvas_top_controls_container'))
                .append($('<div></div>').addClass(_.get(viewOptions, 'cssClass.canvas_top_control_package_define')))
                .append($('<div></div>').addClass(_.get(viewOptions, 'cssClass.canvas_top_control_packages_import')))
                .append($('<div></div>').addClass(_.get(viewOptions, 'cssClass.canvas_top_control_constants_define')));
            canvasContainer.append(canvasTopControlsContainer);
            
            this._$designViewContainer.append(canvasContainer);
            this._$canvasContainer = canvasContainer;
            // check whether container element exists in dom
            if (!container.length > 0) {
                errMsg = 'unable to find container for file editor with selector: ' + _.get(viewOptions, 'design_view.container');
                log.error(errMsg);
                throw errMsg;
            }

            var toolPaletteItemProvider = new ToolPaletteItemProvider();
            var toolPaletteContainer = $(this._container)
                                        .find(_.get(viewOptions, 'design_view.tool_palette.container'))
                                        .get(0);
            var toolPaletteOpts = _.clone(_.get(viewOptions, 'design_view.tool_palette'));
            toolPaletteOpts.itemProvider = toolPaletteItemProvider;
            toolPaletteOpts.container = toolPaletteContainer;
            toolPaletteOpts.ballerinaFileEditor = this;
            this.toolPalette = new ToolPalette(toolPaletteOpts);

            this._createImportDeclarationPane(canvasContainer);

            // init undo manager
            this._undoManager = new UndoManager();

            this._environment =  new PackageScopedEnvironment();
            this._package = this._environment.getCurrentPackage();
        };

        /**
         * Rendering the view for each canvas in {@link BallerinaFileEditor#_canvasList}.
         * @param parent - The parent container.
         * @param options - View options of the file editor.
         */
        BallerinaFileEditor.prototype.render = function (diagramRenderingContext, parent, options) {
            var self = this;
            this.diagramRenderingContext = diagramRenderingContext;
            //TODO remove this for adding filecontext to the map
            this.diagramRenderingContext.ballerinaFileEditor = this;
            this.diagramRenderingContext.packagedScopedEnvironemnt = this._environment;

            if(!this._parseFailed){
                // adding current package to the tool palette with functions, connectors, actions etc. of the current package
                this.addCurrentPackageToToolPalette();
            }

            var importDeclarations = [];
            if(!this._parseFailed){
                // Creating the constants view.
                this._createConstantDefinitionsView(this._$canvasContainer);
                this._model.accept(this);
                importDeclarations = this._model.getImportDeclarations();
            }

            // render tool palette
            this.toolPalette.render();

            // add current imported packages to tool pallet
            _.forEach(importDeclarations, function (importDeclaration) {
                var package = BallerinaEnvironment.searchPackage(importDeclaration.getPackageName());
                self.toolPalette.getItemProvider().addImportToolGroup(package[0]);
            });

            // container for per-tab source view TODO improve source view to wrap this logic
            var sourceViewContainer = $(this._container).find(_.get(this._viewOptions, 'source_view.container'));
            var aceEditorContainer = $('<div></div>');
            aceEditorContainer.addClass(_.get(this._viewOptions, 'cssClass.text_editor_class'));
            sourceViewContainer.append(aceEditorContainer);
            var sourceViewOpts = _.clone(_.get(this._viewOptions, 'source_view'));
            _.set(sourceViewOpts, 'container', aceEditorContainer.get(0));
            _.set(sourceViewOpts, 'content', "");
            _.set(sourceViewOpts, 'debugger', this._debugger);
            this._sourceView = new SourceView(sourceViewOpts);

            this._sourceView.on('add-breakpoint', function (row) {
                self.trigger('add-breakpoint', row);
            });

            this._sourceView.on('modified', function () {
                self._undoManager.reset();
                self.trigger('content-modified');
            });

            this._sourceView.on('remove-breakpoint', function (row) {
                self.trigger('remove-breakpoint', row);
            });

            this._sourceView.on('dispatch-command', function (id) {
                self.trigger('dispatch-command', id);
            });

            this._sourceView.render();

            var lastRenderedTimestamp = this._file.getLastPersisted();

            // container for per-tab swagger view TODO improve swagger view to wrap this logic
            var swaggerViewContainer = $(this._container).find(_.get(this._viewOptions, 'swagger_view.container'));
            var swaggerViewOpts = _.clone(_.get(this._viewOptions, 'swagger_view'));
            _.set(swaggerViewOpts, 'container', swaggerViewContainer);
            _.set(swaggerViewOpts, 'content', "");
            _.set(swaggerViewOpts, 'backend', new Backend({url : _.get(this._backendEndpointsOptions, 'swagger.endpoint')}));
            this._swaggerView = new SwaggerView(swaggerViewOpts);
            this._swaggerView.render();

            var sourceViewBtn = $(this._container).find(_.get(this._viewOptions, 'controls.view_source_btn'));
            sourceViewBtn.click(function () {
                lastRenderedTimestamp = self._file.getLastPersisted();
                var generatedSource = self.generateSource();
                self.toolPalette.hide();
                // Get the generated source and append it to the source view container's content
                self._sourceView.setContent(generatedSource);
                self._sourceView.format(true);
                sourceViewContainer.show();
                swaggerViewContainer.hide();
                self._$designViewContainer.hide();
                designViewBtn.show();
                swaggerViewBtn.show();
                sourceViewBtn.hide();
                self.setActiveView('source');
            });

            var swaggerViewBtn = $(this._container).find(_.get(this._viewOptions, 'controls.view_swagger_btn'));
            swaggerViewBtn.click(function () {
                var isSourceChanged = !self._sourceView.isClean(),
                    savedWhileInSourceView = lastRenderedTimestamp < self._file.getLastPersisted();
                if (isSourceChanged || savedWhileInSourceView || self._parseFailed) {
                    var source = self._sourceView.getContent();
                    var response = self.backend.parse(source);
                    //if there are errors display the error.
                    //@todo: proper error handling need to get the service specs
                    if (response.error != undefined && response.error) {
                        alerts.error('cannot switch to swagger view due to parse errors');
                        return;
                    } else if (!_.isUndefined(response.errorMessage)) {
                        alerts.error("Unable to parse the source: " + response.errorMessage);
                        return;
                    }
                    self._parseFailed = false;
                    //if no errors display the design.
                    //@todo
                    var root = self.deserializer.getASTModel(response);
                    self.setModel(root);
                    self._sourceView.markClean();
                    self._createConstantDefinitionsView(self._$canvasContainer);
                    self.addCurrentPackageToToolPalette();
                }
                self.toolPalette.hide();
                var generatedSource = self.generateSource();

                self.toolPalette.hide();
                // Get the generated swagger and append it to the swagger view container's content
                self._swaggerView.setContent(generatedSource);
                self._swaggerView.setNodeTree(self.generateNodeTree());//setting fallback node tree

                swaggerViewContainer.show();
                sourceViewContainer.hide();
                self._$designViewContainer.hide();
                designViewBtn.show();
                sourceViewBtn.show();
                swaggerViewBtn.hide();
                self.setActiveView('swagger');
            });

            var designViewBtn = $(this._container).find(_.get(this._viewOptions, 'controls.view_design_btn'));
            designViewBtn.click(function () {
                // re-parse if there are modifications to source
                var isSourceChanged = !self._sourceView.isClean(),
                    savedWhileInSourceView = lastRenderedTimestamp < self._file.getLastPersisted();
                var isSwaggerChanged = !self._swaggerView.isClean();
                if (isSourceChanged || savedWhileInSourceView || self._parseFailed) {
                    var source = self._sourceView.getContent();
                    var root = self.generateNodeTree();
                    self.setModel(root);
                    // reset source editor delta stack
                    self._sourceView.markClean();
                    self._createConstantDefinitionsView(self._$canvasContainer);
                    self.addCurrentPackageToToolPalette();
                } else if (isSwaggerChanged) {
                    var astModal = self._swaggerView.getContent();
                    if(!_.isNil(astModal)){
                        self.setModel(self.deserializer.getASTModel(astModal));
                    }
                    // reset source editor delta stack
                    self._swaggerView.markClean();
                }
                //canvas should be visible before you can call reDraw. drawing dependednt on attr:offsetWidth
                self.toolPalette.show();
                sourceViewContainer.hide();
                swaggerViewContainer.hide();
                self._$designViewContainer.show();
                sourceViewBtn.show();
                swaggerViewBtn.show();
                designViewBtn.hide();
                self.setActiveView('design');
                if(isSourceChanged || isSwaggerChanged || savedWhileInSourceView){
                    // reset undo manager for the design view
                    self.getUndoManager().reset();
                    self.reDraw();
                }
            });

            this.initDropTarget();

            if(this._parseFailed){
                this._swaggerView.hide();
                this._$designViewContainer.hide();
                this._sourceView.show();
                self._sourceView.setContent(self._file.getContent());
                self.setActiveView('source');
            }else{
                designViewBtn.hide();
                sourceViewContainer.hide();
                swaggerViewContainer.hide();
                self.setActiveView('design');
            }

    };

        /**
         * Returns a package object with functions, connectors,
         * actions etc. of the current package
         * @returns {Object}
         */
        BallerinaFileEditor.prototype.generateCurrentPackage = function () {
            var symbolTableGenVisitor = new SymbolTableGenVisitor(this._package, this._model);
            this._model.accept(symbolTableGenVisitor);
            return symbolTableGenVisitor.getPackage();
        };

        /**
         * adding current package to the tool palette with functions, connectors,
         * actions etc. of the current package
         */
        BallerinaFileEditor.prototype.addCurrentPackageToToolPalette = function () {
            this.toolPalette.getItemProvider().addImport(this.generateCurrentPackage(), 0);
        };

    BallerinaFileEditor.prototype.initDropTarget = function() {
        var self = this,
            dropActiveClass = _.get(this._viewOptions, 'cssClass.design_view_drop');

        // on hover over canvas area
        this._$canvasContainer
            .mouseover(function(event){

            //if someone is dragging a tool from tool-palette
            if(self.toolPalette.dragDropManager.isOnDrag()){

                if(_.isEqual(self.toolPalette.dragDropManager.getActivatedDropTarget(), self)){
                    return;
                }

                // register this as a drop target and validate possible types of nodes to drop - second arg is a call back to validate
                // tool view will use this to provide feedback on impossible drop zones
                self.toolPalette.dragDropManager.setActivatedDropTarget(self._model);

                // indicate drop area
                self._$canvasContainer.addClass(dropActiveClass);

                // reset ui feed back on drop target change
                self.toolPalette.dragDropManager.once("drop-target-changed", function(){
                    self._$canvasContainer.removeClass(dropActiveClass);
                });
            }
            event.stopPropagation();
        }).mouseout(function(event){
            // reset ui feed back on hover out
            if(self.toolPalette.dragDropManager.isOnDrag()){
                if(_.isEqual(self.toolPalette.dragDropManager.getActivatedDropTarget(), self._model)){
                    self.toolPalette.dragDropManager.clearActivatedDropTarget();
                }
            }
            event.stopPropagation();
        })
    };

        /**
         * generate Ballerina source for this editor page
         * @returns {*}
         */
        BallerinaFileEditor.prototype.generateSource = function () {
            // Visit the ast model and generate the source
            var sourceGenVisitor = new SourceGenVisitor();
            this._model.accept(sourceGenVisitor);
            return sourceGenVisitor.getGeneratedSource();
        };

        /**
         * Generates Ballerina node tree for design view
         * @returns {BallerinaASTRoot} generated node tree
         */
        BallerinaFileEditor.prototype.generateNodeTree = function () {
            var root;
            var source = this._sourceView.getContent();
            if (!_.isEmpty(source.trim())) {
               var response = this.backend.parse(source);
               //if there are errors display the error.
               //@todo: proper error handling need to get the service specs
               if (response.error != undefined && response.error) {
                   alerts.error('cannot switch to design view due to parse errors');
                   return;
               } else if (!_.isUndefined(response.errorMessage)) {
                   alerts.error("Unable to parse the source: " + response.errorMessage);
                   return;
               }
               this._parseFailed = false;
               //if no errors display the design.
               //@todo
               root = this.deserializer.getASTModel(response);
           } else {
               root = BallerinaASTFactory.createBallerinaAstRoot();
        
               //package definition
               var packageDefinition = BallerinaASTFactory.createPackageDefinition();
               packageDefinition.setPackageName("");
               root.addChild(packageDefinition);
               root.setPackageDefinition(packageDefinition);
           }
           return root;
        };
       
        /**
         * Creating the package view of a ballerina-file-editor.
         * @param canvasContainer - The canvas container.
         * @private
         */
        BallerinaFileEditor.prototype._createImportDeclarationPane = function (canvasContainer) {
            var self = this;

            var _paneAppendElement = $(canvasContainer).find('.package-imports-wrapper');
            // Creating import button.
            this._importDeclarationButton = $("<div class='imports-btn' data-toggle='tooltip' title='Imports' " +
                "data-placement='bottom'></div>")
                .appendTo(_paneAppendElement);

            $("<span class='btn-icon'> Imports </span>").appendTo(this._importDeclarationButton).tooltip();

            this._importDeclarationMainWrapper = $("<div class='imports-pane'/>").appendTo(_paneAppendElement);

            var importDeclarationWrapper = $("<div class='imports-wrapper'/>").appendTo(this._importDeclarationMainWrapper);

            var collapserWrapper = $("<div class='imports-pane-collapser-wrapper' data-placement='bottom' " +
                " title='Close Import Pane' data-toggle='tooltip'/>")
                .data("collapsed", "false")
                .appendTo(importDeclarationWrapper).hide();

            $("<i class='fw fw-left'></i>").appendTo(collapserWrapper);

            var importDeclarationActionWrapper = $("<div class='imports-action-wrapper'/>").appendTo(importDeclarationWrapper);

            // Creating add imports editor button.
            var addImportButton = $("<div class='action-icon-wrapper import-add-icon-wrapper' title='Add Import'" +
                "data-toggle='tooltip' data-placement='bottom'/>")
                .appendTo(importDeclarationActionWrapper);
            $("<i class='fw fw-add'></i>").appendTo(addImportButton);

            var importsAddPane = $("<div class='action-import-wrapper-heading import-add-action-wrapper'/>")
                .appendTo(importDeclarationActionWrapper);

            var importValueText = $("<input id='import-package-text' placeholder='Enter Package Name'/>").appendTo(importsAddPane);

            // Creating cancelling add new import button.
            var importAddCancelButtonPane = $("<div class='action-icon-wrapper import-add-cancel-action-wrapper' " +
                "data-placement='bottom' title='Cancel' data-toggle='tooltip'/>")
                .appendTo(importsAddPane);
            $("<span class='fw-stack fw-lg'><i class='fw fw-square fw-stack-2x'></i>" +
                "<i class='fw fw-cancel fw-stack-1x fw-inverse'></i></span>").appendTo(importAddCancelButtonPane);
            // Creating add new import button.
            var importAddCompleteButtonPane = $("<div class='action-icon-wrapper " +
                "import-add-complete-action-wrapper' title='Import' data-placement='bottom' data-toggle='tooltip'/>")
                .appendTo(importsAddPane);
            $("<span class='fw-stack fw-lg'><i class='fw fw-square fw-stack-2x'></i>" +
                "<i class='fw fw-add fw-stack-1x fw-inverse'></i></span>").appendTo(importAddCompleteButtonPane);


            // Add new constant activate button.
            $(addImportButton).click(function () {
                $(importsAddPane).show();
                $(this).hide();
                $(importValueText).focus();
            });

            // Cancel adding a new constant.
            $(importAddCancelButtonPane).click(function () {
                $(importsAddPane).hide();
                $(addImportButton).show();
            });

            var importsDeclarationContentWrapper = $("<div class='imports-content-wrapper'/>")
                .appendTo(importDeclarationWrapper);

            var substringMatcher = function(strs) {
                return function findMatches(q, cb) {
                    var matches, substringRegex;

                    // an array that will be populated with substring matches
                    matches = [];

                    // regex used to determine if a string contains the substring `q`
                    substrRegex = new RegExp(q, 'i');

                    // iterate through the pool of strings and for any string that
                    // contains the substring `q`, add it to the `matches` array
                    $.each(strs, function(i, str) {
                        if (substrRegex.test(str)) {
                            matches.push(str);
                        }
                    });

                    cb(matches);
                };
            };

            //add import suggestions
            var packages = BallerinaEnvironment.getPackages();
            var packageNames = _.map(packages, function(p){return p._name});

            importValueText.typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'packages',
                    source: substringMatcher(packageNames)
                }
            );

            // Click event for adding an import.
            importAddCompleteButtonPane.click(function () {
                // TODO : Validate new import package name.
                if (!_.isEmpty(importValueText.val().trim())) {
                    var currentASTRoot = self.getModel();
                    log.debug("Adding new import");

                    // Creating new import.
                    var newImportDeclaration = BallerinaASTFactory.createImportDeclaration();
                    newImportDeclaration.setPackageName(importValueText.val());

                    try {
                        newImportDeclaration.setParent(currentASTRoot);
                        currentASTRoot.addImport(newImportDeclaration);

                        //Clear the import value box
                        importValueText.val("");
                        self.visit(newImportDeclaration);

                    } catch (error) {
                        alerts.error(error);
                    }
                }
            });

            // Add new import upon enter key.
            $(importValueText).on("change paste keydown", function (e) {
                if (e.which == 13) {
                    importAddCompleteButtonPane.click();
                }
            });
        };

        BallerinaFileEditor.prototype.reDraw = function (args) {
            var self = this;
            var viewOptions = this._viewOptions;
            if (!_.has(this._viewOptions, 'design_view.container')) {
                var errMsg = 'unable to find configuration for container';
                log.error(errMsg);
                throw errMsg;
            }
            // this._viewOptions.container is the root div for tab content
            var container = $(this._container).find(_.get(this._viewOptions, 'design_view.container'));
            //remove the old canves before creating a new one.
            var canvas = container.find('div.canvas-container');
            canvas.remove();

            this._$designViewContainer = container;
            var canvasContainer = $('<div></div>');
            canvasContainer.addClass(_.get(viewOptions, 'cssClass.canvas_container'));
            var canvasTopControlsContainer = $('<div></div>')
                .addClass(_.get(viewOptions, 'cssClass.canvas_top_controls_container'))
                .append($('<div></div>').addClass(_.get(viewOptions, 'cssClass.canvas_top_control_package_define')))
                .append($('<div></div>').addClass(_.get(viewOptions, 'cssClass.canvas_top_control_packages_import')))
                .append($('<div></div>').addClass(_.get(viewOptions, 'cssClass.canvas_top_control_constants_define')));
            canvasContainer.append(canvasTopControlsContainer);
            this._$designViewContainer.append(canvasContainer);
            this._$canvasContainer = canvasContainer;
            // check whether container element exists in dom
            if (!container.length > 0) {
                errMsg = 'unable to find container for file editor with selector: ' + _.get(this._viewOptions, 'design_view.container');
                log.error(errMsg);
                throw errMsg;
            }
            this._createImportDeclarationPane(this._$canvasContainer);
            // Creating the constants view.
            this._createConstantDefinitionsView(this._$canvasContainer);

            // adding current package to the tool palette with functions, connectors, actions etc. of the current package
            this.addCurrentPackageToToolPalette();
            this._model.accept(this);

            // adding declared import packages to tool palette
            _.forEach(this._model.getImportDeclarations(), function (importDeclaration) {
                var package = BallerinaEnvironment.searchPackage(importDeclaration.getPackageName());
                self.toolPalette.getItemProvider().addImport(package[0]);
            });

            this.initDropTarget();
            this.trigger('redraw');
        };

        BallerinaFileEditor.prototype.getUndoManager = function(){
            return this._undoManager;
        };

        BallerinaFileEditor.prototype.getSourceView = function(){
            return this._sourceView;
        };

        BallerinaFileEditor.prototype._createConstantDefinitionsView = function(canvasContainer) {
            
            var costantDefinitionWrapper = _.get(this._viewOptions, 'cssClass.canvas_top_control_constants_define');
            var constantsWrapper = canvasContainer.find('.' +costantDefinitionWrapper);

            var constantsDefinitionPaneProperties = {
                model: this.getModel(),
                paneAppendElement: constantsWrapper,
                view: this
            };

            this._constantDefinitionsPane = new ConstantsDefinitionsPaneView(constantsDefinitionPaneProperties);

            this._constantDefinitionsPane.createConstantDefinitionPane();
        };

        BallerinaFileEditor.prototype.highlightExecutionPoint = function () {
            this._sourceView._editor.selection.moveCursorToPosition({row: 1, column: 0});
            this._sourceView._editor.selection.selectLine();
        };


        BallerinaFileEditor.prototype.debugHit = function (position) {
            this._sourceView.debugHit(position);
        };

        return BallerinaFileEditor;
    });
