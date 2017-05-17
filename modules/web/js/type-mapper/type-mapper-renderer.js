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
import $ from 'jquery';
import jsPlumbLib from 'jsplumb';
import alerts from 'alerts';
import './transform-statement.css';
/**
 * Renderer constructor for TypeMapper
 * @param {function} onConnectionCallback call back function when connection made
 * @param {function} onDisconnectCallback call back function when connection removed
 * @param {object} typeConverterView Type Mapper View reference object
 * @constructor
 */
var jsPlumb = jsPlumbLib.jsPlumb;

class TypeMapperRenderer {
    constructor(onConnectionCallback, onDisconnectCallback, typeConverterView) {
        this.references = [];
        this.viewId = typeConverterView._model.id;
        this.contextMenu = "typeMapperContextMenu";
        this.jsTreePrefix = "jstree-container";
        this.viewIdSeperator = "___";
        this.sourceTargetSeperator = "_--_";
        this.idNameSeperator = "_-_-_-";
        this.nameTypeSeperator = "---";
        this.placeHolderName = "data-mapper-container" + this.viewIdSeperator + this.viewId;
        this.onConnection = onConnectionCallback;
        this.typeConverterView = typeConverterView;
        this.midpoint = 0.1;
        this.midpointVariance = 0.05;
        this.disconnectCallback = onDisconnectCallback;
        this.connectCallback = onConnectionCallback;
        this.connectionPool = [];
        this.existingJsTrees = [];
        var self = this;

        this.jsPlumbInstance = jsPlumb.getInstance({
            Connector: self.getConnectorConfig(self.midpoint),
            Container: this.placeHolderName,
            PaintStyle: {
                strokeWidth: 2,
                //todo : load colors from css
                stroke: "#3d3d3d",
                cssClass: "plumbConnect",
                outlineStroke: "#F7F7F7",
                outlineWidth: 2
            },
            HoverPaintStyle: {
                strokeWidth: 3,
                stroke: "#ff9900",
                outlineWidth: 3,
                outlineStroke: "#ffe0b3"
            },
            EndpointStyle: {radius: 1},
            ConnectionOverlays: [
                ["Arrow", {
                    location: 1,
                    visible: true,
                    width: 11,
                    length: 11
                }],
                ["Custom", {
                    create: function (component) {
                        return $("<select id='typeMapperList" + self.viewIdSeperator + self.viewId + "'></select>");
                    },
                    location: 0.5,
                    id: "typeMapperDropdown",
                    cssClass: "typeMapperList"
                }]
            ]
        });

        $('#' + self.contextMenu).hide();
        this.jsPlumbInstance.bind('contextmenu', (connection, e) => {
            var contextMenuDiv = $('#' + self.contextMenu);
            var anchorTag = $('<a>').attr('id', 'typeMapperConRemove');
            anchorTag.html($('<i>').addClass('fw fw-delete'));
            anchorTag.html( anchorTag.html() + " Remove");
            contextMenuDiv.html(anchorTag);

            document.addEventListener('click', () => {
                $('#' + self.contextMenu).hide();
            }, false);

            $("#typeMapperConRemove").click(() => {
                self.disconnect(connection);
                $('#' + self.contextMenu).hide();
            });

            contextMenuDiv.css({
                                'top':e.pageY  ,
                                'left': e.pageX,
                                zIndex : 1000
                                });

            contextMenuDiv.show();
            e.preventDefault();
        });


        this.jsPlumbInstance.bind('connection', (info, ev) => {
            self.reposition(self);
            //TODO: for multiple type mappers
            // self.processTypeMapperDropdown(info);
        });
    }

    /**
     * Disconnects the connection created.
     *
     * @param connection
     */
    disconnect(connection) {
        var self = this;
        var propertyConnection = this.getConnectionObject(connection.getParameter("id"),
            connection.sourceId, connection.targetId);
        this.midpoint = this.midpoint - this.midpointVariance;
        this.jsPlumbInstance.importDefaults({Connector: self.getConnectorConfig(self.midpoint)});
        this.jsPlumbInstance.detach(connection);
        this.reposition(this);
        this.disconnectCallback(propertyConnection);
        // this.enableParentsJsTree(connection.sourceId, this, this.jsPlumbInstance.getAllConnections(), true);
        // this.enableParentsJsTree(connection.targetId, this, this.jsPlumbInstance.getAllConnections(), false);
    }

    /**
     * Created the connection object from the sourceId and targetId of the connection elements
     * @param sourceId Id of the source element of the connection
     * @param targetId Id of the target element of the connection
     * @returns connectionObject
     */
    getConnectionObject(id, sourceId, targetId) {
        var sourceName = this.getStructId(sourceId);
        var targetName = this.getStructId(targetId);

        var sourceRefObj;
        var targetRefObj;

        for (var i = 0; i < this.references.length; i++) {
            if (this.references[i].name == sourceName) {
                sourceRefObj = this.references[i].refObj;
            } else if (this.references[i].name == targetName) {
                targetRefObj = this.references[i].refObj;
            }
        }

        return {
            id: id,
            sourceStruct: this.getStructName(sourceName),
            sourceProperty: this.getPropertyNameStack(sourceId),
            sourceType: this.getPropertyType(sourceId),
            sourceReference: sourceRefObj,
            targetStruct: this.getStructName(targetName),
            targetProperty: this.getPropertyNameStack(targetId),
            targetType: this.getPropertyType(targetId),
            targetReference: targetRefObj,
            isComplexMapping: false,
            complexMapperName: null
        };
    }

    /**
     * Get the id of the struct from the propertyId
     * @param propertyId Id of the property
     * @returns {*}
     */
    getStructId(propertyId) {
        var id = propertyId.replace(this.jsTreePrefix + this.viewIdSeperator, "");
        return id.split(this.idNameSeperator)[0]
    }

    /**
     * Get the struct name from the id of the struct
     * @param structId
     * @returns {*}
     */
    getStructName(structId) {
        return structId.split(this.viewIdSeperator)[0];
    }

    /**
     * Get the type of the property from the property ID
     * @param propertyId
     * @returns {*}
     */
    getPropertyType(propertyId) {
        var parts = propertyId.split(this.idNameSeperator);
        return parts[parts.length - 1].split(this.nameTypeSeperator)[1].replace('_anchor', "");
    }

    /**
     * Get the name of the property from the property id
     * @param propertyId
     * @returns {*}
     */
    getPropertyName(propertyId) {
        var parts = propertyId.split(this.idNameSeperator);
        return parts[parts.length - 1].split(this.nameTypeSeperator)[0];
    }

    /**
     * Populate the attribute properties stack from the propertyId
     * @param propertyId
     * @returns {Array}
     */
    getPropertyNameStack(propertyId) {
        var id = propertyId.replace(this.jsTreePrefix + this.viewIdSeperator, "");
        var parts = id.split(this.idNameSeperator);
        var propertyNames = [];
        var self = this;
        var elementId = 0;
        _.forEach(parts, aPart => {
            if (elementId != 0) {
                propertyNames.push(aPart.split(self.nameTypeSeperator)[0])
            } else {
                elementId++;
            }
        });
        return propertyNames;
    }

    /**
     * Process the connection and determines whether to show/hide the dropdown from the connection.
     * @param info connection object.
     */
    processTypeMapperDropdown(info) {
        var sourceType = this.getPropertyType(info.sourceId);
        var targetType = this.getPropertyType(info.targetId);
        var isValidTypes = sourceType == targetType;
        var self = this;
        if (!isValidTypes) {
            var connection = info.connection;
            connection.getOverlay("typeMapperDropdown").show();
            var typeMapperId = '#typeMapperList' + this.viewIdSeperator + this.viewId;
            var updatedTypeMapperId = "typeMapperList" + this.viewIdSeperator + connection.sourceId
                + this.sourceTargetSeperator + connection.targetId;
            var typeMappers = this.getExistingTypeMappers(this.typeConverterView, sourceType, targetType);
            $.each(typeMappers, (i, item) => {
                $(typeMapperId).append($('<option>', {
                    value: item,
                    text: item
                }));
            });
            $(typeMapperId).attr("id", updatedTypeMapperId);
            $("#" + updatedTypeMapperId).change(() => {
                self.onChangeTypeMapper(updatedTypeMapperId)
            });
        } else {
            info.connection.getOverlay("typeMapperDropdown").hide();
        }
    }

    /**
     * Finds the existing type mappers defined.
     * @param typeConverterObj
     * @param sourceType
     * @param targetType
     * @returns {Array}
     */
    getExistingTypeMappers(typeConverterObj, sourceType, targetType) {
        var compatibleTypeConverters = [];
        var typeConverters = typeConverterObj.getPackage().getTypeMapperDefinitions();
        _.forEach(typeConverters, typeConverter => {
            if (typeConverterObj.getModel().getTypeMapperName() !== typeConverter.getTypeMapperName()) {
                if (sourceType == typeConverter.getInputParamAndIdentifier().split(" ")[0] &&
                    targetType == typeConverter.getReturnType()) {
                    compatibleTypeConverters.push(typeConverter.getTypeMapperName());
                }
            }
        });
        return compatibleTypeConverters;
    }

    /**
     * The integrates the source manipluation trigger for the change in the
     * dropdown of the complex mapping.
     *
     * @param listId Id of the dropdown.
     */
    onChangeTypeMapper(listId) {
        var id = listId.replace("typeMapperList" + this.viewIdSeperator, "");
        var sourceId = id.split(this.sourceTargetSeperator)[0];
        var targetId = id.split(this.sourceTargetSeperator)[1];
        var connection = this.getConnectionObject(id, sourceId, targetId);
        this.disconnectCallback(connection);
        connection.isComplexMapping = true;
        connection.complexMapperName = $("#" + listId + " option:selected").val();
        this.connectCallback(connection);
    }

    /**
     * Remove a type from the mapper UI
     * @param {string} name identifier of the type
     */
    removeType(name) {
        var typeId = name + this.viewIdSeperator + this.viewId;
        if ($("#" + typeId).attr('class') != null) {
            var typeConns;
            var lookupClass = "property";

            if ($("#" + typeId).attr('class').includes("struct")) {
                lookupClass = "jstree-anchor";
                typeConns = $('div[id^="' + this.jsTreePrefix + this.viewIdSeperator + typeId + '"]')
                    .find('.' + lookupClass);
            } else {
                typeConns = $('div[id^="' + typeId + '"]');
            }

            var self = this;
            _.forEach(typeConns, structCon => {
                if (_.includes(structCon.className, lookupClass)) {
                    self.jsPlumbInstance.remove(structCon.id);
                }
            });
            $("#" + typeId).remove();
            this.reposition(this);
        }
    }

    /**
     * Add a connection arrow in the mapper UI
     * @param {object} connection connection object which specified source and target
     */
    addConnection(connection) {
        var anchorEnd = '_anchor';
        var sourceId = this.jsTreePrefix + this.viewIdSeperator + connection.sourceStruct
            + this.viewIdSeperator + this.viewId;
        var targetId = this.jsTreePrefix + this.viewIdSeperator + connection.targetStruct
            + this.viewIdSeperator + this.viewId;
        var isSourceExists;
        var isTargetExists;

        if (connection.sourceFunction) {
            sourceId = connection.sourceStruct + connection.sourceId + this.viewIdSeperator + this.viewId;
            isSourceExists = true;
        } else {
            isSourceExists = _.includes(this.existingJsTrees,
                connection.sourceStruct + this.viewIdSeperator + this.viewId)
        }
        if (connection.targetFunction) {
            targetId = connection.targetStruct + connection.targetId + this.viewIdSeperator + this.viewId;
            isTargetExists = true;
        } else {
            isTargetExists = _.includes(this.existingJsTrees,
                connection.targetStruct + this.viewIdSeperator + this.viewId)
        }

        if (isSourceExists && isTargetExists) {
            for (var i = 0; i < connection.sourceProperty.length; i++) {
                sourceId += this.idNameSeperator
                    + connection.sourceProperty[i] + this.nameTypeSeperator + connection.sourceType[i];
            }
            if (!connection.sourceFunction) {
                sourceId += anchorEnd;
            }

            for (var i = 0; i < connection.targetProperty.length; i++) {
                targetId += this.idNameSeperator
                    + connection.targetProperty[i] + this.nameTypeSeperator + connection.targetType[i];
            }

            if (!connection.targetFunction) {
                targetId += anchorEnd;
            }

            this.jsPlumbInstance.connect({
                anchor: ["Continuous", {faces: ["right", "left"]}],
                source: sourceId,
                target: targetId,
                parameters: {id: connection.id}
            });
            this.reposition(this);

        } else {
            this.connectionPool.push({
                connection: connection,
                isSourceExists: isSourceExists,
                isTargetExists: isTargetExists,
                connected: false
            });
        }
    }

    /**
     * Add a source type in the mapper UI
     * @param {object} type definition with parameters to be mapped
     * @param {object} reference AST model reference
     */
    addSourceType(struct, reference) {
        var id = struct.name + this.viewIdSeperator + this.viewId;
        struct.id = id;
        this.makeType(struct, 250, 250, reference, "source");
        var jsTreeId = this.jsTreePrefix + this.viewIdSeperator + id;
        this.addComplexProperty(jsTreeId, struct);
        this.processJSTree(jsTreeId, id, this.addSource)
    }

    /**
     * Manipulates the jstree structure and the jsPlumb connections
     *
     * @param jsTreeId
     * @param structId
     * @param createCallback
     */
    processJSTree(jsTreeId, structId, createCallback) {
        var self = this;
        $("#" + jsTreeId).jstree().on('ready.jstree', () => {
            var sourceElements = $("#" + structId).find('.jstree-anchor');
            _.forEach(sourceElements, element => {
                createCallback(element, self);
            });
            $("#" + jsTreeId).jstree('open_all');
            self.existingJsTrees.push(structId);
            self.reposition(self);
            _.forEach(self.connectionPool, conPoolObj => {
                if (!conPoolObj.connected && structId ==
                    conPoolObj.connection.sourceStruct + self.viewIdSeperator + self.viewId) {
                    conPoolObj.isSourceExists = true;
                } else if (!conPoolObj.connected && structId ==
                    conPoolObj.connection.targetStruct + self.viewIdSeperator + self.viewId) {
                    conPoolObj.isTargetExists = true;
                }
                if (!conPoolObj.connected && conPoolObj.isSourceExists && conPoolObj.isTargetExists) {
                    self.addConnection(conPoolObj.connection);
                    conPoolObj.connected = true;
                }
            });
        }).on('after_open.jstree', (event, data) => {
            self.reposition(self);
            var parentId = data.node.id;
            var sourceElements = $("#" + parentId).find('.jstree-anchor');
            _.forEach(sourceElements, element => {
                createCallback(element, self);
            });
            self.jsPlumbInstance.repaintEverything();
        }).on('after_close.jstree', (event, data) => {
            self.reposition(self);
            self.jsPlumbInstance.repaintEverything();
        }).on('select_node.jstree', (event, data) => {
            data.instance.deselect_node(data.node);
        });
    }

    repaintAll(jsTreeId) {
        var children = $("#" + jsTreeId).jstree().get_node('#').children_d;
        _forEach(children, child => {
            self.jsPlumbInstance.repaint(child.id + "_anchor");
        });
    }

    /**
     * Handles the complex struct properties.
     *
     * @param parentId Id of the parentElement where the element needs to be added.
     * @param struct  Object which specifies the id, name, and type of the struct.
     */
    addComplexProperty(parentId, struct) {
        var self = this;
        _.forEach(struct.properties, property => {
            var buildInTypes = self.typeConverterView.getTypes();
            if (buildInTypes.includes(property.type)) {
                self.makeProperty($('#' + parentId), property.name, property.type);
            } else {
                var complexStructEl = self.makeProperty($('#' + parentId), property.name, property.type);
                var allStructDefn = self.typeConverterView.getPackage().getStructDefinitions();
                var structIndex = _.findIndex(allStructDefn, aStruct => aStruct.getStructName() === property.type);
                self.addComplexProperty(complexStructEl.attr('id'), allStructDefn[structIndex].getAttributesArray())
            }
        });
    }

    /**
     * Add a target struct in the mapper UI
     * @param {object} struct definition with parameters to be mapped
     * @param {object} reference AST model reference
     */
    addTargetType(struct, reference) {
        var id = struct.name + this.viewIdSeperator + this.viewId;
        struct.id = id;
        var placeHolderWidth = document.getElementById(this.placeHolderName).offsetWidth;
        var posY = placeHolderWidth - 400;
        this.makeType(struct, 50, posY, reference, "target");
        var jsTreeId = this.jsTreePrefix + this.viewIdSeperator + id;
        this.addComplexProperty(jsTreeId, struct);
        this.processJSTree(jsTreeId, id, this.addTarget);
    }

    /**
     * Make generic struct div element in the UI
     * @param {object} struct definition with parameters to be mapped
     * @param {int} posX X position cordinate
     * @param {int} posY Y position cordinate
     * @param {object} reference
     */
    makeType(struct, posX, posY, reference, type) {
        this.references.push({name: struct.id, refObj: reference});
        var newStruct = $('<div>').attr('id', struct.id).attr('type', type).addClass('struct');
        var structIcon = $('<i>').addClass('type-mapper-icon fw fw-struct fw-inverse');
        var structName = $('<div>');

//        structName.append(structIcon);
//        structName.append($('<span>').text(struct.name));
//        newStruct.append(structName);
        newStruct.css({
            'top': posX,
            'left': posY
        });
        var jsTreeContainer = $('<div>').attr('id', this.jsTreePrefix + this.viewIdSeperator + struct.id)
            .addClass('tree-container');
        newStruct.append(jsTreeContainer);
        $("#" + this.placeHolderName).append(newStruct);
    }

    /**
     * Add a function in the mapper UI
     * @param {object} function definition with parameters to be mapped
     * @param {object} reference AST model reference
     */
    addFunction(func, reference, onFunctionRemove) {
        var funcText = func.name;
        //Allow multiple functions to drag and drop without conflicting
        var functionInvocationModelId = reference.model.getChildren()[1].getChildren()[0].getID();
        func.name = func.name + functionInvocationModelId;

        var id = func.name + this.viewIdSeperator + this.viewId;
        if ($("#" + id).length === 0) {
            this.references.push({name: id, refObj: reference});
            var newFunc = $('<div>').attr('id', id).addClass('func');
            var self = this;
            var funcName = $('<div>');
            var funcIcon = $('<i>').addClass('type-mapper-icon fw fw-function fw-inverse');
            var closeButton = $('<span>').attr('id', id + "-button").addClass('fw-stack fw-lg btn btn-remove');
            var outputContent = $('<div>').attr('id', id + "func-output").addClass('func-output');

            var square = $('<i>').addClass('fw fw-square fw-stack-1x');
            var del = $('<i>').addClass('fw fw-delete fw-stack-1x fw-inverse');

            funcName.append(funcIcon);
            funcName.append($('<span>').text(funcText));
            closeButton.append(square);
            closeButton.append(del);
            funcName.append(closeButton);
            newFunc.append(funcName);
            newFunc.append(outputContent);

            newFunc.css({
                'top': 0,
                'left': 0
            });

            $("#" + this.placeHolderName).append(newFunc);

            //Remove button functionality
            $("#" + id + "-button").on("click", () => {
                var removedFunction = {name: func.name};
                removedFunction.incomingConnections = [];
                removedFunction.outgoingConnections = [];

                _.forEach(self.jsPlumbInstance.getAllConnections(), connection => {
                    if (connection.target.id.includes(id)) {
                        removedFunction.incomingConnections.push(
                            self.getConnectionObject(connection.getParameter("id"),
                                connection.sourceId, connection.targetId));
                    } else if (connection.source.id.includes(id)) {
                        removedFunction.outgoingConnections.push(
                            self.getConnectionObject(connection.getParameter("id"),
                                connection.sourceId, connection.targetId));
                    }
                });

                for (var i = 0; i < self.references.length; i++) {
                    if (self.references[i].name == id) {
                        removedFunction.reference = self.references[i].refObj;
                    }
                }

                self.removeType(func.name);
                onFunctionRemove(removedFunction);
            });

            _.forEach(func.parameters, parameter => {
                var property = self.makeFunctionAttribute($('#' + id), parameter.name, parameter.type, true);
                self.addTarget(property, self);
            });

            _.forEach(func.returnType, parameter => {
                var property = self.makeFunctionAttribute($('#' + id + "func-output"), parameter.name, parameter.type, false);
                self.addSource(property, self, true);
            });

            self.reposition(this);
        }
    }

    makeFunctionAttribute(parentId, name, type, input) {
        var id = parentId.selector.replace("#", "").replace("func-output","")
        + this.idNameSeperator + name + this.nameTypeSeperator + type;
        var property;
        if (input) {
            property = $('<div>').attr('id', id).addClass('func-in-property');
        } else {
            property = $('<div>').attr('id', id).addClass('func-out-property');
        }
        var propertyName = $('<span>').addClass('property-name').text(name);
        var seperator = $('<span>').addClass('property-name').text(":");
        var propertyType = $('<span>').addClass('property-type').text(type);

        property.append(propertyName);
        property.append(seperator);
        property.append(propertyType);
        $(parentId).append(property);
        return property;
    }

    /**
     * Make Property DIV element
     * @param {string} parentId identifier of the parent of the property
     * @param {string} name property name
     * @param {string} type property type
     * @returns {*|jQuery}
     */
    makeProperty(parentId, name, type) {
        var id = parentId.selector.replace("#", "") + this.idNameSeperator + name + this.nameTypeSeperator + type;
        var ul = $('<ul class="property">');
        var li = $('<li class="property">').attr('id', id).text(name + " : " + type);
        ul.append(li);
        $(parentId).append(ul);
        return li;
    }

    /**
     * Make source property
     *
     * @param element
     * @param self
     */
    addSource(element, self, maxConnections) {
        var connectionConfig = {
            anchor: ["Continuous", {faces: ["right"]}]
        };
        if (maxConnections) {
            connectionConfig.maxConnections = 1;
        }
        self.jsPlumbInstance.makeSource(element, connectionConfig);
    }

    /**
     * Remove the source element
     *
     * @param elements
     * @param self
     */
    removeSource(elements, self) {
        self.jsPlumbInstance.unmakeSource(elements);
    }

    /**
     * Specifies connection has a function
     * @param {object} connection
     * @returns {boolean} has a connection or not
     */
    hasFunction(connection, self) {
        return $("#" + connection.sourceStruct + self.viewIdSeperator + self.viewId).attr('class').includes("func")
            || $("#" + connection.targetStruct + self.viewIdSeperator + self.viewId).attr('class').includes("func");
    }

    /**
     * Make target property
     * @param element
     * @param self
     */
    addTarget(element, self) {
        self.jsPlumbInstance.makeTarget(element, {
            maxConnections: 1,
            anchor: ["Continuous", {faces: ["left"]}],
            beforeDrop: function (params) {
                //Checks property types are equal
                var isValidTypes = self.getPropertyType(params.sourceId) == self.getPropertyType(params.targetId);
                var connection = self.getConnectionObject(params.id, params.sourceId, params.targetId);
                if (isValidTypes) {
                    self.midpoint = self.midpoint + self.midpointVariance;
                    self.jsPlumbInstance.importDefaults({Connector: self.getConnectorConfig(self.midpoint)});
                    self.onConnection(connection);
                    return self.hasFunction(connection, self);
                    // self.disableParentsJsTree(params.sourceId, self);
                    // self.disableParentsJsTree(params.targetId, self);
                } else {
                    var compatibleTypeConverters = self.getExistingTypeMappers(self.typeConverterView,
                        connection.sourceType, connection.targetType);
                    isValidTypes = compatibleTypeConverters.length > 0;
                    if (isValidTypes) {
                        connection.isComplexMapping = true;
                        connection.complexMapperName = compatibleTypeConverters[0];
                        self.jsPlumbInstance.importDefaults({Connector: self.getConnectorConfig(self.midpoint)});
                        self.onConnection(connection);
                        return self.hasFunction(connection, self);
                        // self.disableParentsJsTree(params.sourceId, self);
                        // self.disableParentsJsTree(params.targetId, self);
                    } else {
                        alerts.error("There is no valid type mapper existing to covert from : " + connection.sourceType
                            + " to: " + connection.targetType);
                    }
                }
                return isValidTypes;
            },
            onDrop: function () {
                self.reposition(self);
            }
        })
        ;
    }

    disableParentsJsTree(connectionId, self) {
        var sourceJsTreeId = this.jsTreePrefix + self.viewIdSeperator + self.getStructId(connectionId);
        var sourceJsTree = $("#" + sourceJsTreeId).jstree(true);
        var node = sourceJsTree.get_node(connectionId.replace('_anchor', ''));
        _.forEach(node.parents, parentNodeId => {
            if (parentNodeId !== '#') {
                var parentNode = sourceJsTree.get_node(parentNodeId);
                parentNode.state = 'leaf';
            }
        });
    }

    enableParentsJsTree(connectionId, self, connections, isSource) {
        var sourceJsTreeId = this.jsTreePrefix + self.viewIdSeperator + self.getStructId(connectionId);
        var sourceJsTree = $("#" + sourceJsTreeId).jstree(true);
        var node = sourceJsTree.get_node(connectionId.replace('_anchor', ''));
        _.forEach(node.parents, parentNodeId => {
            if (parentNodeId !== '#' && !self.isChildConnectionExists(sourceJsTree, self, connections, isSource)) {
                var parentNode = sourceJsTree.get_node(parentNodeId);
                parentNode.state = {
                    disabled: false,
                    loaded: true,
                    opened: true,
                    selected: false
                };
            }
        });
    }

    isChildConnectionExists(jsTreeNode, self, connections, isSource) {
        var childNodes = jsTreeNode.children_d;
        var child = _.find(childNodes, childId => {
            var connection = _.find(connections, connection => {
                if (isSource) {
                    return childId.includes(connection.sourceId);
                } else {
                    return childId.includes(connection.targetId);
                }
            });
            if (!_.isUndefined(connection)) {
                return true;
            }
        });
        return !_.isUndefined(child);
    }

    removeTarget(element, self) {
        self.jsPlumbInstance.unmakeTarget(element);
    }

    /**
     * Get list of connections for provided property of a source struct
     * @param {string} structName
     * @param {Array} property name hierarchy of the property
     * @returns {Array} List of connections
     */
    getSourceConnectionsByProperty(structName, property, type) {
        var self = this;
        var connections = [];
        for (var i = 0; i < property.length; i++) {
            _.forEach(self.jsPlumbInstance.getAllConnections(), connection => {
                if (connection.sourceId.includes(structName + self.viewIdSeperator + self.viewId
                    + self.idNameSeperator + property[i] + self.nameTypeSeperator + type[i])) {
                    connections.push(self.getConnectionObject(connection.getParameter("id"),
                        connection.sourceId, connection.targetId));
                }
            });

            _.forEach(connections, connection => {
                self.jsPlumbInstance.detach(connection);
            });
        }

        return connections;
    }

    /**
     * Get list of connections for provided property of a target struct
     * @param {string} structName
     * @param {Array} property name hierarchy of the property
     * @returns {Array} List of connections
     */
    getTargetConnectionsByProperty(structName, property, type) {
        var self = this;
        var connections = [];
        for (var i = 0; i < property.length; i++) {
            _.forEach(self.jsPlumbInstance.getAllConnections(), connection => {
                if (connection.targetId.includes(structName + self.viewIdSeperator + self.viewId
                    + self.idNameSeperator + property[i] + self.nameTypeSeperator + type[i])) {
                    connections.push(self.getConnectionObject(connection.getParameter("id"),
                        connection.sourceId, connection.targetId));
                }
            });

            _.forEach(connections, connection => {
                self.jsPlumbInstance.detach(connection);
            });
        }
        return connections;
    }

    /**
     * Get list of connections for provided source struct
     * @param {string} structName
     * @returns {Array} List of connections
     */
    getSourceConnectionsByStruct(structName) {
        var self = this;
        var connections = [];
        _.forEach(self.jsPlumbInstance.getAllConnections(), connection => {
            if (connection.sourceId.includes(structName)) {
                connections.push(self.getConnectionObject(connection.getParameter("id"),
                    connection.sourceId, connection.targetId));
            }
        });

        _.forEach(connections, connection => {
            self.jsPlumbInstance.detach(connection);
        });

        return connections;
    }

    /**
     * Get list of connections for provided target struct
     * @param {string} structName
     * @returns {Array} List of connections
     */
    getTargetConnectionsByStruct(structName) {
        var self = this;
        var connections = [];
           _.forEach(self.jsPlumbInstance.getAllConnections(), connection => {
                if (connection.targetId.includes(structName)) {
                    connections.push(self.getConnectionObject(connection.getParameter("id"),
                        connection.sourceId, connection.targetId));
                }
            });

        _.forEach(connections, connection => {
            self.jsPlumbInstance.detach(connection);
        });

        return connections;
    }

    /**
     * Reposition function nodes and redraw connections accordingly
     * @param {string} viewId type mapper view identifier
     * @param jsPlumbInstance jsPlumb instance of the type mapper to be repositioned
     */
    reposition(self) {
        var funcs = $("#" + self.placeHolderName + "> .func");
        var structs = $("#" + self.placeHolderName + "> .struct");
        var xPointer = 600;
        var yPointer = 20;
        var bottomGap = 50;
        var functionGap = 20;
        var svgLines = $("#" + self.placeHolderName + "> svg");
        var typeMapperHeight = 0;

        //Traverse through all the connection svg lines
         _.forEach(svgLines, svgLine => {
             //Get bottom and right values relative to the type mapper parent div
            var bottom = svgLine.getBoundingClientRect().bottom - $("#" + self.placeHolderName).offset().top + 10;
            var right = svgLine.getBoundingClientRect().right - $("#" + self.placeHolderName).offset().left + 10;

            //Calculate the yPointer value  based on the bottom value of the direct connections
            if (bottom > yPointer && svgLine.getBoundingClientRect().width > 600) {
                yPointer = bottom;
            }
        });

        //Traverse through all the function divs
        _.forEach(funcs, func => {
            //Position functions and increase yPointer with gaps
            $("#"+ func.id).css("left", xPointer+ "px");
            $("#"+ func.id).css("top", yPointer + "px");
            yPointer +=  $("#"+ func.id).height() + functionGap;

        });

        _.forEach(structs, struct => {
            if (typeMapperHeight < $("#"+ struct.id).height() + bottomGap) {
                typeMapperHeight = $("#"+ struct.id).height() + bottomGap;
            }
        });

        if (typeMapperHeight < yPointer +  bottomGap) {
            typeMapperHeight = yPointer +  bottomGap;
        }

        $("#" + self.placeHolderName).height(typeMapperHeight);

        self.jsPlumbInstance.repaintEverything();
        $(self.viewId).closest(".panel-body").find(".outer-box").mCustomScrollbar("update");
    }

    /**
     * Give the flow chart object array for given midpoint
     * @param {int} midPoint point which flow chart connection should bend
     * @returns {*[]} flow chart object array
     */
    getConnectorConfig(midPoint) {
        return ["Flowchart", {
            midpoint: midPoint,
            stub: [40, 60], cornerRadius: 5, alwaysRespectStubs: true
        }];
    }
}

export default TypeMapperRenderer;
