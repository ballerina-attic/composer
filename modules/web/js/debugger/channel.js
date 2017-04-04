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
import EventChannel from 'event_channel';
import log from 'log';

// See http://tools.ietf.org/html/rfc6455#section-7.4.1
const WS_NORMAL_CODE = 1000;
const WS_SSL_CODE = 1015;

class Channel extends EventChannel {
    constructor(args) {
        super();
        if(_.isNil(args.endpoint)){
            throw 'Invalid Endpoint';
        }
        _.assign(this, args);
    }

    connect() {
        const websocket = new WebSocket(this.endpoint);
        websocket.onmessage = (strMessage) => { this.parseMessage(strMessage); };
        websocket.onopen = () => { this.onOpen(); };
        websocket.onclose = (event) => { this.onClose(event); };
        websocket.onerror = () => { this.onError(); };
        this.websocket = websocket;
    }

    parseMessage(strMessage) {
        const message = JSON.parse(strMessage.data);
        this.debugger.processMesssage(message);
    }

    sendMessage(message) {
        this.websocket.send(JSON.stringify(message));
    }

    onClose(event) {
        this.debugger.active = false;
        this.debugger.trigger('session-terminated');
        let reason;
        if (event.code === WS_NORMAL_CODE){
            reason = 'Normal closure';
            this.trigger('session-ended');
            this.debugger.active = false;
            return;
        }
        else if(event.code === WS_SSL_CODE){
            reason = 'Certificate Issue';
        }
        else{
            reason = 'Unknown reason :' + event.code;
        }
        log.error(reason);
    }

    onError() {
        this.debugger.active = false;
        this.debugger.trigger('session-error');
    }

    onOpen() {
        this.debugger.active = true;
        this.debugger.trigger('session-started');
    }
}

export default Channel;
