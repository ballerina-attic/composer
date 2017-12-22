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
 *
 */
import React from 'react';
import update from 'immutability-helper';

import PolicyComponents from './PolicyComponents';
import ItemTypes from './ItemTypes';
import Rule from './Rule';
import Condition from './Condition';
import Target from './Target';
import Xml_view from '../containers/xml_view';
import PropTypes from 'prop-types';
import fileDownload from 'react-file-download';

/**
 * Drag and drop main window
 */
class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            policycomponents: [
                {accepts: [ItemTypes.RULE, ItemTypes.TARGET], lastDroppedItem: null}
            ],

            boxes: [
                {name: 'Target', type: ItemTypes.TARGET},
                {name: 'Rule', type: ItemTypes.RULE},
                {name: 'Condition', type: ItemTypes.CONDITION},
                {name: 'Obligation', type: ItemTypes.OBLIGATION}
            ],
            droppedBoxNames: [],
            showXmlView: false,
            showDesignView: true,
            showXMLButton: true,
            showComponent: true,

            treeData4: [{title: 'Drag an attribute'}],
            shouldCopyOnOutsideDrop: true,

            valueselect2: "",
            valueselect3: "",
            targetvalue: '',
            rulename: '',
            rule_effects: '',
            valueselect5: "",
            valueselect6: "",
            attribute_value: "",
            condition_attribute: "",
            condition_attribute_value: "",
            policy_name: '',
            description: '',
            rule_combine_algorithm: ''
        }
        this.onDelete = this.onDelete.bind(this);
        this.showXmlView = this.showXmlView.bind(this);
        this.onSubmitTarget = this.onSubmitTarget.bind(this);
        this.onSubmitRule = this.onSubmitRule.bind(this);
        this.onSubmitCondition = this.onSubmitCondition.bind(this);
        this.addName = this.addName.bind(this);
        this.addDescription = this.addDescription.bind(this);
        this.addAlgorithm = this.addAlgorithm.bind(this);
    }

    isDropped(boxName) {
        return this.state.droppedBoxNames.indexOf(boxName) > -0

    }

    onSubmitRule(e, f) {
        console.log("rule");
        this.setState({
                rulename: e,
                rule_effects: f,
            }
        );
        console.log(this.state.rulename);
        console.log(e, f);
    }


    onSubmitTarget(a, b, c, d) {
        console.log("target");
        this.setState({
                attribute_value: a,
                targetvalue: c,
            }
        );

        console.log(this.state.targetvalue);
        console.log(a, b, c, d);
    }

    onSubmitCondition(a, b, c, d) {
        console.log("condition");
        this.setState({
                condition_attribute: a,
                valueselect5: b,
                condition_attribute_value: c,
            }
        );

        console.log(this.state.valueselect5);
        console.log(a, b, c, d);
    }

    addName(a) {
        console.log(a);
        this.setState({
                policy_name: a,
            }
        );
    }

    addDescription(a) {
        console.log(a);
        this.setState({
                description: a,
            }
        );
    }

    addAlgorithm(a) {
        console.log(a);
        this.setState({
                rule_combine_algorithm: a,
            }
        );
    }

    showXmlView(a) {
        this.setState({
            showXmlView: true,
            showDesignView: false,
            showXMLButton: false
        });

        var xml =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<Policy PolicyId="' + this.state.policy_name + '" RuleCombiningAlgId="' + this.state.rule_combine_algorithm + '" Version="1.0">' +
            '<Target>' +
            '<AnyOf>' +
            '<AllOf>' +
            '<Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">' +
            '<AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">' + this.state.targetvalue + '</AttributeValue>' +
            '<AttributeDesignator AttributeId=' + this.state.attribute_value + ' Category="http://wso2.org/identity/user" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="true"/>' +
            '</Match>' +
            '</AllOf>' +
            '</AnyOf>' +
            '</Target>' +
            '<Rule Effect="' + this.state.rule_effects + '" RuleId="' + this.state.rulename + '">' +
            '<Target>' +
            '<AnyOf>' +
            '<AllOf>' +
            '<Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">' +
            '<AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">xyz.com</AttributeValue>' +
            '<AttributeDesignator AttributeId="http://wso2.org/identity/user/username" Category="http://wso2.org/identity/user" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="true"/>' +
            '</Match>' +
            '</AllOf>' +
            '</AnyOf>' +
            '</Target>' +
            '<Condition>' +
            '<Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:not">' +
            '<Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-equal">' +
            '<Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-one-and-only">' +
            '<AttributeDesignator AttributeId=' + this.state.condition_attribute + ' Category="http://wso2.org/identity/user" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="true"/>' +
            '</Apply>' +
            '<AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">' + this.state.condition_attribute_value + '</AttributeValue>' +
            '</Apply>' +
            '</Apply>' +
            '</Condition>' +
            '</Rule>' +
            '</Policy>';

        fileDownload(xml, 'filename.xml');
    }

    render() {
        const {
            policycomponents
        } = this.state

        return (
            <div className="container-fluid">
                <div style={{overflow: 'hidden', clear: 'both', background: this.context.color}}>
                    {policycomponents.map(({accepts, lastDroppedItem}, index) => (
                        this.state.showDesignView && this.state.showComponent ?

                            <PolicyComponents
                                accepts={accepts}
                                lastDroppedItem={lastDroppedItem}
                                onDrop={item => this.handleDrop(index, item)}
                                key={index}
                                onDelete={this.onDelete}
                                onSubmitTarget={this.onSubmitTarget}
                                onSubmitRule={this.onSubmitRule}
                                onSubmitCondition={this.onSubmitCondition}
                                showXmlView={this.showXmlView}
                                addName={this.addName}
                                addDescription={this.addDescription}
                                addAlgorithm={this.addAlgorithm}
                            />
                            : ''
                    ))}
                    {this.state.showXMLButton ?
                        <button id="open_file_button" type="button" className="btn btn-warning pull-right"
                                onClick={this.showXmlView}><i className="fw fw-xml fw-2x"></i>&nbsp;&nbsp;XML View
                        </button>
                        : ''}
                    {this.state.showXmlView ?
                        <Xml_view/> :
                        ''}
                </div>
            </div>
        )
    }

    handleDrop(index, item) {
        const {name} = item
        const droppedBoxNames = name ? {$push: [name]} : {}
        console.log('drop', index, item);
        this.setState(
            update(this.state, {
                    policycomponents: {
                        [index]: {
                            lastDroppedItem: {
                                $set: item,
                            },
                        },
                    },
                    droppedBoxNames
                },
            ),
        )
    }

    onDelete() {
        this.setState({showComponent: false});
    }
}
export default Container;
