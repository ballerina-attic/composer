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
import * as d3 from 'd3';
import D3Utils from 'd3utils';
import Canvas from './canvas';

/**
 * Creates a canvas with an SVG.
 * @class SVGCanvas
 * @extends Canvas
 */
class SVGCanvas extends Canvas {

    /**
     * Constructor for SVGCanvas
     * @param {Object} args - arguments for creating an SVG canvas.
     * @constructor
     */
    constructor(args) {
        super(args);

        /**
         * The <svg> element which is has all svg elements should be drawn on.
         * @type {SVGSVGElement}
         * @private
         */
        this._svg = undefined;

        /**
         * A wrapper SVG <g> element which resides inside {@link _svg}.
         * @type {SVGGElement}
         * @private
         */
        this._rootGroup = undefined;

        /**
         * Minimum height of the SVG
         * @type {number} - Height
         * @private
         */
        this._minSVGHeight = 400;
    }

    /**
     * Draws the main body of the model
     * @param {Object} options - Options for modifying the canvas
     * @param {string} id - The ID of the model.
     * @param {string} name - The type of model.
     * @param {string} title - The identifier of the model.
     * @override
     */
    drawAccordionCanvas(options, id, name, title) {
        super.drawAccordionCanvas(options, id, name, title);

        //// Creating the SVG.
        this._svg = $('<svg class=\'' + _.get(options, 'cssClass.svg_container', '') + '\'></svg>')
            .appendTo(this.getBodyWrapper());

        this._rootGroup = D3Utils.group(d3.select(this._svg.get(0)));

        // Setting initial height of the SVG.
        this.setSVGHeight(this._minSVGHeight);

        $(this.getBodyWrapper()).mCustomScrollbar({
            theme: 'dark',
            axis: 'x',
            scrollInertia: 0,
            autoHideScrollbar: true,
            mouseWheel: {
                enable: false
            }
        });
    }

    /**
     * Set canvas container height
     * @param {number} newHeight - Height
     */
    setSVGHeight(newHeight) {
        var dn = newHeight < this._minSVGHeight ? this._minSVGHeight : newHeight;
        this._svg.attr('height', dn);
        this.getBoundingBox().h(dn);

        // If service container's height is lesser than the height of the svg
        // Increase the height of the service container and the inner div
        if ($(this._container).closest('svg').attr('height')) {
            if ($(this._container).closest('.panel-body').height() < $(this._container).closest('svg')
                    .attr('height')) {
                $(this._container).closest('.panel-body').height($(this._container).closest('svg').attr('height'));
                $(this._container).closest('.panel-body').find('#' + $(this._container).closest('.panel-body')
                        .attr('id')).height($(this._container).closest('svg').attr('height'));
            }
        } else {
            if ($(this._container).height() < $(this._container).find('svg').attr('height')) {
                $(this._container).height($(this._container).find('svg').attr('height'));
                $(this._container).find('#' + $(this._container).attr('id')).height($(this._container).find('svg')
                    .attr('height'));
            }
        }
    }

    /**
     * Set canvas container width
     * @param {number} newWidth - The width.
     */
    setSVGWidth(newWidth) {
        this._svg.attr('width', newWidth);
        this.getBoundingBox().w(newWidth);
        $(this._container).closest('.panel-body').find('.outer-box').mCustomScrollbar('update');
    }

    getSVG() {
        return this._svg;
    }

    getRootGroup() {
        return this._rootGroup;
    }
}

export default SVGCanvas;

    