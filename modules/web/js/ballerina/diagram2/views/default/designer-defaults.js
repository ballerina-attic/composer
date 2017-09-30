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


export const panel = {
    wrapper: {
        gutter: {
            v: 50,
            h: 50,
        },
    },
    heading: {
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        height: 30,
        title: {
            margin: {
                right: 15,
            },
        },
    },
    body: {
        padding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        },
        height: 200,
    },
    annotation: {
        body: {
            height: 25,
        },
    },
};

export const innerPanel = {
    wrapper: {
        gutter: {
            v: 50,
            h: 50,
        },
    },
    heading: {
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
    },
    body: {
        height: 300,
        padding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        },
    },
};

export const lifeLine = {
    width: 120,
    head: {
        height: 30,
    },
    footer: {
        height: 30,
    },
    line: {
        // set the default line height as two time of a statement
        height: 135,
    },
    gutter: {
        v: 50,
        h: 50,
    },
};

export const actionBox = {
    width: 66,
    height: 21,
    padding: {
        top: 2,
    },
};

export const statement = {
    width: 120,
    height: 30,
    gutter: {
        v: 25,
        h: 0,
    },
    padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
    },
    maxWidth: 300,
};

export const blockStatement = {
    width: 140,
    heading: {
        width: 50,
        height: statement.height,
        paramPaddingX: 5,
        paramSeparatorOffsetX: 20, // blockStatement.heading.width - 40
        paramEndOffsetX: 6,
    },
    body: {
        padding: {
            top: 25,
            right: 25,
            bottom: 25,
            left: 25,
        },
        height: 100,
    },
};

export const fork = {
    padding: {
        top: statement.gutter.v,
        bottom: statement.gutter.v,
        left: 15,
        right: 15,
    },
    lifeLineGutterH: 6,
};

export const canvas = {
    padding: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
    },
};

// TODO: Need to remove statement container, using the block node with the new implementation
export const statementContainer = {
    width: 120,
    // Default statement container height is the height of two simple statements
    height: 135,
    padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20,
    },
};

export const blockNode = {
    width: 120,
    height: 115,
    padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20,
    },
};

export const packageDefinition = {
    header: {
        height: 35,
        padding: {
            top: 0,
            right: 5,
            bottom: 0,
            left: 5,
        },
    },

    labelWidth: 60,
    textWidth: 245,

    importDeclaration: {
        itemHeight: 30,
    },
};

export const structDefinition = {
    body: {
        height: 100,
    },
    submitButtonWidth: 40,
    columnPadding: 5,
    panelPadding: 10,
};

export const annotationAttributeDefinition = {
    heading: {
        height: 30,
        width: 330,
    },
    text: {
        padding: {
            top: 15,
        },
        width: 331,
        height: 31,
    },
    body: {
        width: 300,
        height: 30,
        padding: {
            bottom: 10,
        },
    },
};

export const contentOperations = {
    height: 45,
    width: 600,
};

export const structDefinitionStatement = {
    width: 600,
    height: 30,
    margin: {
        bottom: 2,
    },
    padding: {
        left: 10,
    },
    deleteButtonOffset: 30,
};

export const panelHeading = {
    wrapper: {
        gutter: {
            v: 50,
            h: 50,
        },
    },
    heading: {
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        height: 25,
    },
    body: {
        padding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        },
        height: 200,
    },
    iconSize: {
        width: 14,
        heading: 14,
        padding: 3,
    },
};

export const timeout = {
    title: {
        w: 75,
        paramSeparatorOffsetX: 35, //timeout.title.w - 40
    },
};

export const iconForTool = {
    height: 30,
    width: 30,
    padding: {
        left: 5,
    },
};

export const connectorDeclaration = {
    gutter: {
        v: 40,
        h: 40,
    },
};

export const actionInvocationDelete = {
    iconSize: {
        width: 14,
        padding: 5,
    },
    outerRect: {
        width: 50,
        height: 30,
    },
};

export const variablesPane = {
    headerHeight: 35,
    topBarHeight: 25,
    inputHeight: 40,
    noOfGlobalsBGHeight: 18,
    leftRightPadding: 10,
    iconSize: 20,
    globalsNoFontSize: 13,
    globalItemHeight: 30,
    globalItemLeftPadding: 10,
    iconLeftPadding: 12,
    noOfGlobalsLeftPadding: 12,
    noOfGlobalsTextPadding: 10,
    globalDeclarationWidth: 310,
    globalDefDecorationWidth: 3,
};
