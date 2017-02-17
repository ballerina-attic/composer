/*
*  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing,
*  software distributed under the License is distributed on an
*  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
*  KIND, either express or implied.  See the License for the
*  specific language governing permissions and limitations
*  under the License.
*/

package org.ballerinalang.composer.service.workspace.rest.datamodel;

public class BLangJSONModelConstants {

    public static final String ROOT = "root";

    public static final String CHILDREN = "children";

    public static final String DEFINITION_TYPE = "type";

    public static final String CONNECTOR_DEFINITION = "connector";

    public static final String FUNCTION_DEFINITION = "function_definition";

    public static final String TYPE_MAPPER_DEFINITION = "type_mapper_definition";

    public static final String ACTION_DEFINITION = "action";

    public static final String FUNCTIONS_NAME = "function_name";

    public static final String TYPE_MAPPER_NAME = "type_mapper_name";

    public static final String IS_PUBLIC_FUNCTION = "is_public_function";

    public static final String ANNOTATION_NAME = "annotation_name";

    public static final String ANNOTATION_VALUE = "annotation_value";

    public static final String PACKAGE_DEFINITION = "package";

    public static final String PACKAGE_NAME = "package_name";

    public static final String IMPORT_DEFINITION = "import";

    public static final String IMPORT_PACKAGE_NAME = "import_package_name";

    public static final String IMPORT_PACKAGE_PATH = "import_package_path";
    
    public static final String CONSTANT_DEFINITION = "constant_definition";
    
    public static final String CONSTANT_DEFINITION_BTYPE = "constant_definition_btype";
    
    public static final String CONSTANT_DEFINITION_IDENTIFIER = "constant_definition_identifier";
    
    public static final String CONSTANT_DEFINITION_VALUE = "constant_definition_value";
    
    public static final String SERVICE_DEFINITION = "service_definition";

    public static final String SERVICE_NAME = "service_name";

    public static final String RESOURCE_DEFINITION = "resource_definition";

    public static final String ANNOTATION_DEFINITION = "annotation";

    public static final String ANNOTATION_DEFINITIONS = "annotations";

    public static final String PARAMETER_DEFINITION = "argument_declaration";

    public static final String CONNECTOR_DECLARATION = "connector_declaration";

    public static final String VARIABLE_DECLARATION = "variable_declaration";

    public static final String VARIABLE_DEFINITION = "variable_definition";

    public static final String VARIABLE_DEFINITION_STATEMENT = "variable_definition_statement";

    public static final String LEFT_EXPRESSION = "left_operand_expression";

    public static final String RIGHT_EXPRESSION = "right_operand_expression";

    public static final String RESOURCE_NAME = "resource_name";

    public static final String WORKER_DEFINITION = "worker";

    public static final String WORKER_INVOCATION_STATEMENT = "worker_invocation_statement";

    public static final String WORKER_REPLY_STATEMENT = "worker_reply_statement";

    public static final String WORKER_NAME = "worker_name";

    public static final String INVOKE_MESSAGE = "invoke_message";

    public static final String REPLY_MESSAGE = "reply_message";

    public static final String PARAMETER_NAME = "parameter_name";

    public static final String PARAMETER_TYPE = "parameter_type";

    public static final String CONNECTOR_DCL_NAME = "connector_name";

    public static final String CONNECTOR_DCL_PKG_NAME = "connector_pkg_name";

    public static final String CONNECTOR_DCL_VARIABLE = "connector_variable";

    public static final String VARIABLE_NAME = "variable_name";

    public static final String VARIABLE_TYPE = "variable_type";

    public static final String BLOCK_STATEMENT = "block_statement";

    public static final String CONNECTOR_NAME = "connector_name";

    public static final String ACTION_NAME = "action_name";

    public static final String ACTION_PKG_NAME = "action_pkg_name";

    public static final String ACTION_CONNECTOR_NAME = "action_connector_name";

    public static final String STATEMENT_TYPE = "type";

    public static final String EXPRESSION_TYPE = "type";

    public static final String COMMENT_STATEMENT = "comment_statement";

    public static final String COMMENT_STRING = "comment_string";

    public static final String ASSIGNMENT_STATEMENT = "assignment_statement";

    public static final String WHILE_STATEMENT = "while_statement";

    public static final String FUNCTION_INVOCATION_STATEMENT = "function_invocation_statement";

    public static final String RETURN_TYPE = "return_type";

    public static final String RETURN_ARGUMENT = "return_argument";

    public static final String REPLY_STATEMENT = "reply_statement";

    public static final String RETURN_STATEMENT = "return_statement";
    
    public static final String BREAK_STATEMENT = "break_statement";

    public static final String FUNCTION_INVOCATION_EXPRESSION = "function_invocation_expression";

    public static final String ACTION_INVOCATION_EXPRESSION = "action_invocation_expression";

    public static final String ACTION_INVOCATION_STATEMENT = "action_invocation_statement";

    public static final String BASIC_LITERAL_EXPRESSION = "basic_literal_expression";

    public static final String BASIC_LITERAL_VALUE = "basic_literal_value";

    public static final String BASIC_LITERAL_TYPE = "basic_literal_type";

    public static final String UNARY_EXPRESSION = "unary_expression";

    public static final String ADD_EXPRESSION = "add_expression";

    public static final String SUBTRACT_EXPRESSION = "subtract_expression";

    public static final String MULTIPLY_EXPRESSION = "multiplication_expression";

    public static final String DIVISION_EXPRESSION = "division_expression";

    public static final String MOD_EXPRESSION = "mod_expression";

    public static final String AND_EXPRESSION = "and_expression";

    public static final String OR_EXPRESSION = "or_expression";

    public static final String EQUAL_EXPRESSION = "equal_expression";

    public static final String NOT_EQUAL_EXPRESSION = "not_equal_expression";

    public static final String GREATER_EQUAL_EXPRESSION = "greater_equal_expression";

    public static final String GREATER_THAN_EXPRESSION = "greater_than_expression";

    public static final String LESS_EQUAL_EXPRESSION = "less_equal_expression";

    public static final String LESS_THAN_EXPRESSION = "less_than_expression";

    public static final String VARIABLE_REFERENCE_EXPRESSION = "variable_reference_expression";

    public static final String VARIABLE_REFERENCE_TYPE = "type";

    public static final String VARIABLE_REFERENCE_NAME = "variable_reference_name";

    public static final String ARRAY_INIT_EXPRESSION = "array_init_expression";

    public static final String ARRAY_MAP_ACCESS_EXPRESSION = "array_map_access_expression";

    public static final String ARRAY_MAP_ACCESS_EXPRESSION_NAME = "array_map_access_expression_name";

    public static final String ARRAY_MAP_ACCESS_EXPRESSION_INDEX = "array_map_access_expression_index";

    public static final String BACK_QUOTE_EXPRESSION = "back_quote_expression";

    public static final String BACK_QUOTE_ENCLOSED_STRING = "back_quote_enclosed_string";

    public static final String MAP_INIT_EXPRESSION = "map_init_expression";

    public static final String INSTANCE_CREATION_EXPRESSION = "instance_creation_expression";

    public static final String INSTANCE_CREATION_EXPRESSION_INSTANCE_TYPE = "instance_type";

    public static final String IF_ELSE_STATEMENT = "if_else_statement";

    public static final String IF_STATEMENT = "if_statement";

    public static final String IF_STATEMENT_THEN_BODY = "then_body";

    public static final String IF_STATEMENT_IF_CONDITION = "if_condition";

    public static final String ELSE_STATEMENT = "else_statement";

    public static final String STATEMENT = "statement";

    public static final String EXPRESSION = "expression";
    
    public static final String STRUCT_DEFINITION = "struct_definition";
    
    public static final String STRUCT_NAME = "struct_name";

    public static final String KEY_VALUE_EXPRESSION_KEY = "key_value_key";

    public static final String KEY_VALUE_EXPRESSION = "key_value_expression";

    public static final String QUOTED_LITERAL_STRING = "quoted_literal_string";

    public static final String TYPE_CASTING_EXPRESSION = "type_casting_expression";

    public static final String TARGET_TYPE = "target_type";

    public static final String TYPE_NAME = "type_name";

    public static final String CONNECTOR_INIT_EXPR = "connector_init_expr";

    public static final String ARGUMENTS = "arguments";

    public static final String FILE_NAME = "file_name";

    public static final String LINE_NUMBER = "line_number";

    public static final String VARIABLE_DEF_OPTIONS = "variable_def_options";

    public static final String REFERENCE_TYPE_INIT_EXPR = "reference_type_init_expression";

    public static final String EXPRESSION_OPERATOR = "operator";

    public static final String STRUCT_FIELD_ACCESS_EXPRESSION = "struct_field_access_expression";
}