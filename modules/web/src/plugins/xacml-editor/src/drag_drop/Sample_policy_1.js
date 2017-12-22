import React, { Component } from 'react';


const ContentEditable = require('react-contenteditable');

const Sample_policy_1 = React.createClass({
    getInitialState() {
        return {
            html: '&lt;xml view of the policy is generated and displayed here&gt;' +
            '' +
            '' +
            '' +
            "  '<?xml version=\"1.0\" encoding=\"utf-8\"?>' +\n" +
            "        '<Policy PolicyId=\"'+this.state.policy_name+'\" RuleCombiningAlgId=\"'+this.state.rule_combine_algorithm+'\" Version=\"1.0\">'+\n" +
            "        '<Target>'+\n" +
            "        '<AnyOf>'+\n" +
            "        '<AllOf>'+\n" +
            "        '<Match MatchId=\"urn:oasis:names:tc:xacml:1.0:function:string-equal\">'+\n" +
            "        '<AttributeValue DataType=\"http://www.w3.org/2001/XMLSchema#string\">'+this.state.targetvalue+'</AttributeValue>'+\n" +
            "        '<AttributeDesignator AttributeId='+this.state.attribute_value+' Category=\"http://wso2.org/identity/user\" DataType=\"http://www.w3.org/2001/XMLSchema#string\" MustBePresent=\"true\"/>'+\n" +
            "        '</Match>'+\n" +
            "        '</AllOf>'+\n" +
            "        '</AnyOf>'+\n" +
            "        '</Target>'+\n" +
            "        '<Rule Effect=\"'+this.state.rule_effects+'\" RuleId=\"'+this.state.rulename+'\">'+\n" +
            "        '<Target>'+\n" +
            "        '<AnyOf>'+\n" +
            "        '<AllOf>'+\n" +
            "        '<Match MatchId=\"urn:oasis:names:tc:xacml:1.0:function:string-equal\">'+\n" +
            "        '<AttributeValue DataType=\"http://www.w3.org/2001/XMLSchema#string\">xyz.com</AttributeValue>'+\n" +
            "        '<AttributeDesignator AttributeId=\"http://wso2.org/identity/user/username\" Category=\"http://wso2.org/identity/user\" DataType=\"http://www.w3.org/2001/XMLSchema#string\" MustBePresent=\"true\"/>'+\n" +
            "        '</Match>'+\n" +
            "        '</AllOf>'+\n" +
            "        '</AnyOf>'+\n" +
            "        '</Target>'+\n" +
            "        '<Condition>'+\n" +
            "        '<Apply FunctionId=\"urn:oasis:names:tc:xacml:1.0:function:not\">'+\n" +
            "        '<Apply FunctionId=\"urn:oasis:names:tc:xacml:1.0:function:string-equal\">'+\n" +
            "        '<Apply FunctionId=\"urn:oasis:names:tc:xacml:1.0:function:string-one-and-only\">'+\n" +
            "        '<AttributeDesignator AttributeId='+this.state.condition_attribute+' Category=\"http://wso2.org/identity/user\" DataType=\"http://www.w3.org/2001/XMLSchema#string\" MustBePresent=\"true\"/>'+\n" +
            "        '</Apply>'+\n" +
            "        '<AttributeValue DataType=\"http://www.w3.org/2001/XMLSchema#string\">'+this.state.condition_attribute_value+'</AttributeValue>'+\n" +
            "        '</Apply>'+\n" +
            "        '</Apply>'+\n" +
            "        '</Condition>'+\n" +
            "        '</Rule>'+\n" +
            "        '</Policy>';" +
            '<br/>',

        };
    },

    handleChange(evt) {
        this.setState({ html: evt.target.value });
    },

    render() {
        return (<div id='policy_template_window'><ContentEditable
            html={this.state.html} // innerHTML of the editable div
            disabled={false}       // use true to disable edition
            onChange={this.handleChange} // handle innerHTML change
        />
        </div>);
    },
});
export default Sample_policy_1;
