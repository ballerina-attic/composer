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
import $ from 'jquery';
import _ from 'lodash';
import EventChannel from 'event_channel';
import DebugManager from './debug-manager';

class Frames extends EventChannel {
    constructor() {
        super();
        var template =
      '<div class="debug-panel-header debug-frame-header">'+
      '   <span><a class="tool-group-header-title">Frames</a></span>'+
      '</div>'+
      '<div class="panel-group" id="frameAccordion">'+
      '<% frames.forEach((frame, index) => { %>'+
      '    <div class="panel panel-default">'+
      '      <div class="panel-heading">'+
      '        <h4 class="panel-title">'+
      '          <a data-toggle="collapse" data-parent="#frameAccordion" href="#<%- frame.frameName %>"><%- frame.frameName %>'+
      '           <span class="debug-frame-pkg-name">'+
      '           <i class="fw fw-package"></i> <%- frame.packageName %>'+
      '           </span>'+
      '          </a>'+
      '        </h4>'+
      '      </div>'+
      '      <div id="debugger-frame-<%- frame.frameName %>" class="panel-collapse collapse <% if(index == 0){%>in<% } %>">'+
      '        <div class="panel-body">'+
      '        <div class="debug-v-tree">'+
      '          <ul>'+
      '          <% frame.variables.forEach( v => { %>'+
      '          <li>'+
      '          <strong><%- v.name %></strong> = <%- v.value %> (<%- v.type %>)'+
      '          <ul>'+
      '            <li>type : <%- v.type %></li>'+
      '            <li>scope : <%- v.scope %></li>'+
      '          </ul>'+
      '          </li>'+
      '          <% }); %>'+
      '          </ul>'+
      '        </div>'+
      '        </div>'+
      '      </div>'+
      '    </div>'+
      '<% }); %>'+
      '</div>';


        this.compiled = _.template(template);

        this.js_tree_options = {
            'core': {
                'themes':{
                    'icons':false
                }
            }
        };

        DebugManager.on('debug-hit', message => { this.render(message); });
        DebugManager.on('resume-execution', () => { this.clear(); });
        DebugManager.on('session-ended', () => { this.clear(); });
        DebugManager.on('session-completed', () => { this.clear(); });
    }

    setContainer(container) {
        this.container = container;
    }

    clear() {
        this.container.empty();
    }

    render(message) {
      //clear duplicate main
        message.frames = _.uniqWith(message.frames, function(obj, other){
            if (_.isEqual(obj.frameName,other.frameName) && _.isEqual(obj.packageName,other.packageName))
                return true;
        });
      // drop unnecessary first frame in services
        var firstFrame = _.head(message.frames);
        if(firstFrame && firstFrame.frameName !== 'main') {
            message.frames.splice(0, 1);
        }
        message.frames = this.process(message.frames);

        var html = this.compiled(message);
        this.container.html(html);

      //render variables tree
        $('.debug-v-tree').jstree(this.js_tree_options);
    }

    process(frames) {
      //reverse order
        frames = _.reverse(frames);

        frames.map(function(frame){
            frame.variables.map( item => {
                switch (item.type) {
                case 'BBoolean':
                    item.type = 'boolean';
                    break;
                case 'BInteger':
                    item.type = 'int';
                    break;
                case 'BFloat':
                    item.type = 'float';
                    break;
                case 'BLong':
                    item.type = 'long';
                    break;
                case 'BDouble':
                    item.type = 'double';
                    break;
                case 'BString':
                    item.type = 'string';
                    break;
                case 'BJSON':
                    item.type = 'json';
                    break;
                case 'BArray':
                    item.type = 'array';
                    break;
                case 'BMessage':
                    item.type = 'message';
                    break;
                case 'BConnector':
                    item.type = 'connector';
                    break;
                case 'BDataTable':
                    item.type = 'datatable';
                    break;
                case 'BXML':
                    item.type = 'xml';
                    break;
                case 'BValue':
                    item.type = 'value';
                    break;
                case 'BMap':
                    item.type = 'map';
                    break;
                case 'BValueType':
                    item.type = 'valuetype';
                    break;
                case 'BStruct':
                    item.type = 'struct';
                    break;
                case 'BException':
                    item.type = 'exception';
                    break;
                case 'BRefType':
                    item.type = 'reftype';
                    break;
                default:

                }
                return item;
            });
            return frame;
        });

        return frames;
    }
}


export default new Frames();
