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
import ASTFactory from './../ast/ast-factory';
import DesignViewCompleterUtils from './design-view-completer-utils';
/**
 * Class to represent design view completer factory
 */
class CompleterFactory {

    /**
     * Return the Design view completer
     * @param {object} langserverController - language server controller
     * @param {object} fileData - object holding file information
     * @param {ASTNode} node - Relevant ASTNode
     * @return {*[]} - array
     */
    getDesignViewCompleter(langserverController, fileData, node) {
        return [{
            getCompletions: (editor, session, pos, prefix, callback) => {
                if (!_.isNil(node.getPosition())) {
                    const cursorPosition = {
                        row: node.getPosition().startLine,
                        column: node.getContentStartCursorPosition() + editor.getValue().length,
                    };
                    this.getCompletions(cursorPosition, fileData, langserverController, callback, node,
                        editor.getValue());
                }
            },
        }];
    }

    /**
     * Get the completions
     * @param {object} cursorPosition - current cursor position
     * @param {object} fileData - file data options
     * @param {LangServerClientController} langserverController - language server client controller instance
     * @param {function} callback - callback function
     * @param {ASTNode} node - ast node
     * @param editorContent
     */
    getCompletions(cursorPosition, fileData, langserverController, callback, node, editorContent) {
        const completions = [];
        const designViewCompleterUtils = new DesignViewCompleterUtils();
        const content = designViewCompleterUtils.getCompletionContent(node, fileData.content, editorContent);

        const options = {
            textDocument: content,
            position: {
                line: cursorPosition.row,
                character: cursorPosition.column,
            },
            fileName: fileData.fileName,
            filePath: fileData.filePath,
            packageName: fileData.packageName,
        };
        langserverController.getCompletions(options, (response) => {
            const sortedArr = _.orderBy(response.result, ['sortText'], ['desc']);
            let score = sortedArr.length;
            this.filterCompletionItems(sortedArr, node, editorContent)
                .forEach((completionItem) => {
                    completions.push(
                        {
                            caption: completionItem.label,
                            snippet: completionItem.insertText,
                            meta: completionItem.detail,
                            score: 100 + (score || 0),
                        });
                    score--;
                });
            callback(null, completions);
        });
    }

    /**
     * Filter retried completion items from lang-server
     *
     * @param {Object[]} items Completion items received from server
     * @param {ASTNode} node ASTNode attached to expression editor
     * @param {string} editorContent Current content of the editor
     */
    filterCompletionItems(items, node, editorContent) {
        return items.filter((item) => {
            // Only suggest BTypes for empty var def statements
            if (ASTFactory.isVariableDefinitionStatement(node) && editorContent.trim() === '') {
                return item.detail === 'BType';
            } else {
                return true;
            }
        });
    }

}

export default CompleterFactory;
