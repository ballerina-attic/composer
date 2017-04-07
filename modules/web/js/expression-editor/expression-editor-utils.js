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
import _ from 'lodash';
import $ from 'jquery';
import 'ace/ace';
import 'ace/ext-language_tools';
import 'ace/ext-searchbox';
import '../ballerina/utils/ace-mode';
import ballerina from 'ballerina';
var ace = global.ace;
var Range = ace.require('ace/range');


// require possible themes
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}
requireAll(require.context('ace', false, /theme-/));

// require ballerina mode
var mode = ace.require('ace/mode/ballerina');
var langTools = ace.require("ace/ext/language_tools");


class ExpressionEditor{

    constructor(editorWrapper, wrapperClass, property, callback) {
        this._property = property;
        this.default_with = $(editorWrapper).width();
        var propertyWrapper = $("<div/>", {
            "class": wrapperClass
        }).appendTo(editorWrapper);

        var propertyValue = _.isNil(property.getterMethod.call(property.model)) ? "" : property.getterMethod.call(property.model);
        var propertyInputValue = $("<div class='expression_editor'>").appendTo(propertyWrapper);
        var editorContainer = $("<div class='expression_editor_container'>").appendTo(propertyInputValue);
        $(propertyInputValue).css('border', '2px solid #333333');
        $(propertyInputValue).css('padding-top', '6px');
        $(propertyInputValue).css('background', 'white');
        $(editorContainer).css('height', '22px');
        $(editorContainer).text(propertyValue);

        this._editor =  ace.edit(editorContainer[0]);

        var mode = ace.require("ace/mode/ballerina").Mode;
        this._editor.getSession().setMode("ace/mode/ballerina");
        //Avoiding ace warning
        this._editor.$blockScrolling = Infinity;

        var editorTheme = ace.require("ace/theme/chrome");
        this._editor.setTheme(editorTheme);

        // set OS specific font size to prevent Mac fonts getting oversized.
        if(this.isRunningOnMacOS()){
            this._editor.setFontSize("10pt");
        }else{
            this._editor.setFontSize("12pt");
        }

        var rhymeCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                console.log(prefix, pos);
                if (prefix.length === 0) { callback(null, []); return }
                // wordList like [{"word":"flow","freq":24,"score":300,"flags":"bc","syllables":"1"}]
                //callback(null, [{"word":"flosw","freq":24,"score":300000,"flags":"bc","syllables":"1"}]);
                var completions = [];
                 completions.push({ name:"testing1", value:"testing1", meta: "code1" });
                 completions.push({ name:"testing2", value:"testing2", meta: "code2" });
                 callback(null, completions);
            }
        };
        langTools.setCompleters([rhymeCompleter]);

        this._editor.setOptions({
            enableBasicAutocompletion:true,
            highlightActiveLine: false,
            showGutter: false
        });

        this._editor.setBehavioursEnabled(true);
        this._editor.focus();

        //we need to place the cursor at the end of the text
        this._editor.gotoLine(1, propertyValue.length);

        // resize the editor to the text width.
        $(propertyInputValue).css("width", this.getNecessaryWidth(propertyValue));
        $(propertyInputValue).focus();
        this._editor.resize();

        //bind auto complete to key press
        this._editor.commands.on('afterExec', (event) =>  {
            if (event.command.name === 'insertstring'&&/^[\w.]$/.test(event.args)) {
                this._editor.execCommand('startAutocomplete');
            }
        });

        // remove newlines in pasted text
        this._editor.on("paste", function(e) {
            e.text = e.text.replace(/[\r\n]+/g, " ");
        });

        // when enter is pressed we will commit the change.
        this._editor.commands.bindKey("Enter|Shift-Enter", (e)=>{
            let text = this._editor.getSession().getValue();
            property.model.trigger('update-property-text', text , property.key);
            property.model.trigger('focus-out');
            if(_.isFunction(callback)){
                callback();
            }
        });

        // When the user is typing text we will resize the editor.
        this._editor.on('change', (event) => {
            var text = this._editor.getSession().getValue();
            $(propertyInputValue).css("width" , this.getNecessaryWidth(text));
            this._editor.resize();
        });

        // following snipet is to handle adding ";" at the end of statement.
        this.end_check = /^([^"]|"[^"]*")*?(;)/;
        this._editor.commands.addCommand({
            name: "semicolon",
            exec: (e) => {
                // get the value and append ';' to get the end result of the key action
                let curser = this._editor.selection.getCursor().column;
                let text = this._editor.getSession().getValue();
                text = [text.slice(0, curser), ";" , text.slice(curser)].join('');
                if(this.end_check.exec(text)){
                    //close the expression editor
                    if(_.isFunction(callback)){
                        callback();
                    }
                }else{
                    this._editor.insert(";");
                }
            },
            bindKey: ";"
        });
    }

    distroy(){
        //commit if there are any changes
        let text = this._editor.getSession().getValue();
        this._property.model.trigger('update-property-text', text , this._property.key);
        //distroy the editor
        //this._editor.distroy();
    }

    getNecessaryWidth(text) {
        let width = text.length * 8 + 40;
        if(width < this.default_with ){
            return this.default_with;
        };
        return width;
    }


    getOperatingSystem() {
        var operatingSystem = "Unknown OS";
        if (navigator.appVersion.indexOf("Win") != -1) {
            operatingSystem = "Windows";
        }
        else if (navigator.appVersion.indexOf("Mac") != -1) {
            operatingSystem = "MacOS";
        }
        else if (navigator.appVersion.indexOf("X11") != -1) {
            operatingSystem = "UNIX";
        }
        else if (navigator.appVersion.indexOf("Linux") != -1) {
            operatingSystem = "Linux";
        }
        return operatingSystem;
    }

    isRunningOnMacOS() {
        return _.isEqual(this.getOperatingSystem(), 'MacOS');
    }

}

export default ExpressionEditor;
