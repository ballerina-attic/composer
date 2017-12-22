import React from 'react';
import SortableTree, { addNodeUnderParent, removeNodeAtPath, changeNodeAtPath } from 'react-sortable-tree';
import Sample_policy_1 from '../Sample_policy_1';
import Sample_policy_2 from '../Sample_policy_2';
import DragDrop from './/Container.js';
// import Index from '../drag_drop1/index.js';

class policy_creating_window extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            treeData: [{ title: 'User', children: [{ title: 'Name' }, { title: 'Tenant' }] },
                { title: 'Environment', children: [{ title: 'IP' }, { title: 'Time' }] }],
            value: 'select',
            tabIndex: 0,

            treeData2: [{ title: 'Drag an attribute' }],
            shouldCopyOnOutsideDrop: true,

            treeData3: [{ title: 'Drag an attribute' }],
            shouldCopyOnOutsideDrop: true,
        };
        this.change = this.change.bind(this);
    }

    change(event) {
        this.setState({ value: event.target.value });
    }

    render() {
        const externalNodeType = 'yourNodeType';
        const { shouldCopyOnOutsideDrop } = this.state;

        const foo = ['Select policy template', 'Sample_policy_1', 'Sample_policy_2'];


        return (

            <div className='tabbable tabs-bottom'>
                <div className='tab-content'>
                    <button type='button' className='btn btn-warning btn-arrow-left pull-right'>Try It!</button>


                    <div className='tab-pane active' id='ui'>

                        <div className='jumbotron'>
                            <div id='policy_ui'>
                                <form className='form-actions form-horizontal center_div'>
                                    <div className='form-group'>
                                        <label className='control-label col-sm-6' htmlFor='name'>Policy
                                            Name:</label>
                                        <div className='col-sm-6 '>
                                            <input
                                                type='name'
                                                className='form-control'
                                                id='name'
                                                placeholder='Enter Policy Name'
                                            />
                                        </div>
                                    </div>
                                    <div className='form-group'>
                                        <label
                                            className='control-label col-sm-6'
                                            htmlFor='pwd'
                                        >Description:</label>
                                        <div className='col-sm-6'>
                                            <input
                                                type='URI'
                                                className='form-control'
                                                id='URI'
                                                placeholder='Enter Description'
                                            />
                                        </div>
                                    </div>

                                    <div className='form-group'>
                                        <label className='control-label col-sm-6' htmlFor='display_name'>Rule
                                            Combining Algorithm:</label>
                                        <div className='col-sm-2'>
                                            <button
                                                className='btn btn-default dropdown-toggle'
                                                type='button'
                                                data-toggle='dropdown'
                                            >Select Rule Combining Algorithm
                                            </button>
                                            <ul className='dropdown-menu'>
                                                <li><a href='#'>Global (All tenants)</a></li>
                                                <li><a href='#'>Global (Current tenant)</a></li>
                                                <li><a href='#'>Template</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <br />
                                    <br />

                                    <form className='form-inline'>
                                        <fieldset className='fsStyle'>
                                            <legend className='legendStyle'>
                                                <a data-toggle='collapse' data-target='#demo' href='#'><b>Policy
                                                    is evaluated only if following matched only if following
                                                    matched</b></a>
                                            </legend>

                                            <div className='col collapse in' id='demo'>
                                                <div className='row'>
                                                    <div className='col-md-3'>
                                                        <div className='form-group'>
                                                            <div
                                                                id='tree2'
                                                                style={{
                                                                    height: 75,
                                                                    width: 300,
                                                                    float: 'left',
                                                                    border: 'solid black 1px',

                                                                }}
                                                            >
                                                                <SortableTree
                                                                    treeData={this.state.treeData2}
                                                                    onChange={treeData2 => this.setState({ treeData2 })}
                                                                    dndType={externalNodeType}
                                                                    shouldCopyOnOutsideDrop={shouldCopyOnOutsideDrop}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                                    <div className='col-md-1'>
                                                        <div className='col-sm-2'>
                                                            <button
                                                                className='btn btn-default dropdown-toggle'
                                                                type='button'
                                                                data-toggle='dropdown'
                                                            >equals
                                                            </button>
                                                            <ul className='dropdown-menu'>
                                                                <li><a href='#'>Global (All tenants)</a>
                                                                </li>

                                                            </ul>
                                                        </div>
                                                    </div>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;


                                                    <br />

                                                    <div className='col-md-3'>
                                                        <div className='col-sm-6'>
                                                            <input
                                                                type='URI'
                                                                className='form-control'
                                                                id='URI'
                                                                placeholder='Enter Value'
                                                            />
                                                        </div>
                                                    </div>
                                                    <br />
                                                    <div className='col-md-2'>
                                                        <button
                                                            className='btn btn-default dropdown-toggle'
                                                            type='button'
                                                            data-toggle='dropdown'
                                                        >AND
                                                        </button>
                                                        <ul className='dropdown-menu'>
                                                            <li><a href='#'>OR</a>
                                                            </li>
                                                            <li><a href='#'>END</a>
                                                            </li>

                                                        </ul>
                                                    </div>

                                                    <div className='col-md-1'>
                                                        <button>
                                                            <img
                                                                src='/images/add.png'
                                                                alt='my image'
                                                                width='15'
                                                                height='15'
                                                            />
                                                        </button>
                                                    </div>
                                                </div>


                                            </div>
                                        </fieldset>
                                        <br />
                                        <br />

                                        <fieldset className='fsStyle'>
                                            <legend className='legendStyle'>
                                                <a data-toggle='collapse' data-target='#demo1' href='#'><b>Rules</b></a>
                                            </legend>


                                            <div className='form-group col collapse in'>
                                                <label className='control-label col-sm-6' htmlFor='name'>
                                                    Rule Name:</label>
                                                <div className='col-sm-6 '>
                                                    <input
                                                        type='name'
                                                        className='form-control'
                                                        id='name'
                                                        placeholder='Enter Rule Name'
                                                    />
                                                </div>
                                            </div>
                                            <br />

                                            <div className='form-group'>
                                                <label
                                                    className='control-label col-sm-6'
                                                    htmlFor='display_name'
                                                >Effect:</label>
                                                <div className='col-sm-2'>
                                                    <button
                                                        className='btn btn-default dropdown-toggle'
                                                        type='button'
                                                        data-toggle='dropdown'
                                                    >Select Effect
                                                    </button>
                                                    <ul className='dropdown-menu'>
                                                        <li><a href='#'>Permit</a></li>
                                                        <li><a href='#'>Deny</a></li>
                                                        <li><a href='#'>Not Applicable</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <br />
                                            <br />


                                            <div className='col collapse in' id='demo1'>
                                                <div className='row'>
                                                    <div className='col-md-3'>
                                                        <div className='form-group'>
                                                            <div
                                                                id='tree2'
                                                                style={{
                                                                    height: 75,
                                                                    width: 300,
                                                                    float: 'left',
                                                                    border: 'solid black 1px',

                                                                }}
                                                            >
                                                                <SortableTree
                                                                    treeData={this.state.treeData3}
                                                                    onChange={treeData3 => this.setState({ treeData3 })}
                                                                    dndType={externalNodeType}
                                                                    shouldCopyOnOutsideDrop={shouldCopyOnOutsideDrop}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                                    <div className='col-md-1'>
                                                        <div className='col-sm-2'>
                                                            <button
                                                                className='btn btn-default dropdown-toggle'
                                                                type='button'
                                                                data-toggle='dropdown'
                                                            >equals
                                                            </button>
                                                            <ul className='dropdown-menu'>
                                                                <li><a href='#'>Global (All tenants)</a>
                                                                </li>

                                                            </ul>
                                                        </div>
                                                    </div>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;


                                                    <br />

                                                    <div className='col-md-3'>
                                                        <div className='col-sm-6'>
                                                            <input
                                                                type='URI'
                                                                className='form-control'
                                                                id='URI'
                                                                placeholder='Enter Value'
                                                            />
                                                        </div>
                                                    </div>
                                                    <br />

                                                    <div className='form-group'>
                                                        <div className='col-sm-2'>
                                                            <button
                                                                className='btn btn-default dropdown-toggle'
                                                                type='button'
                                                                data-toggle='dropdown'
                                                            >AND
                                                            </button>
                                                            <ul className='dropdown-menu'>
                                                                <li><a href='#'>OR</a></li>
                                                                <li><a href='#'>END</a></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <br />
                                                    <br />
                                                    <br />
                                                    <br />

                                                    <div className='col-md-1'>
                                                        <button>
                                                            <img
                                                                src='/images/add.png'
                                                                alt='my image'
                                                                width='15'
                                                                height='15'
                                                            />
                                                        </button>
                                                    </div>
                                                </div>


                                            </div>
                                            <br />
                                            <br />

                                        </fieldset>

                                        <fieldset className='fsStyle'>
                                            <legend className='legendStyle'>
                                                <a data-toggle='collapse' data-target='#demo2' href='#'><b>Obligations
                                                    or Advices</b></a>
                                            </legend>

                                            <div className='form-group'>
                                                <label className='control-label col-sm-6' htmlFor='display_name'>Obligation
                                                    Type:</label>
                                                <div className='col-sm-2'>
                                                    <button
                                                        className='btn btn-default dropdown-toggle'
                                                        type='button'
                                                        data-toggle='dropdown'
                                                    >Select Obligation Type
                                                    </button>
                                                    <ul className='dropdown-menu'>
                                                        <li><a href='#'>Obligation</a></li>
                                                        <li><a href='#'>Advice</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <br />
                                            <br />


                                            <div className='form-group'>
                                                <label className='control-label col-sm-6' htmlFor='obligationid'>
                                                    Id:</label>
                                                <div className='col-sm-6 '>
                                                    <input
                                                        type='obligationid'
                                                        className='form-control'
                                                        id='obligationid'
                                                        placeholder='Enter obligation/advice ID'
                                                    />
                                                </div>
                                            </div>
                                            <br />
                                            <br />

                                            <div className='form-group'>
                                                <label
                                                    className='control-label col-sm-6'
                                                    htmlFor='display_name'
                                                >Effect:</label>
                                                <div className='col-sm-2'>
                                                    <button
                                                        className='btn btn-default dropdown-toggle'
                                                        type='button'
                                                        data-toggle='dropdown'
                                                    >Select Effect
                                                    </button>
                                                    <ul className='dropdown-menu'>
                                                        <li><a href='#'>Permit</a></li>
                                                        <li><a href='#'>Deny</a></li>
                                                        <li><a href='#'>Not Applicable</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <br />
                                            <br />


                                            <div className='form-group'>
                                                <label className='control-label col-sm-6' htmlFor='obligationvalue'>
                                                    Value:</label>
                                                <div className='col-sm-6 '>
                                                    <input
                                                        type='obligationvalue'
                                                        className='form-control'
                                                        id='obligationvalue'
                                                        placeholder='Enter value'
                                                    />
                                                </div>
                                            </div>

                                            <div className='col collapse in' id='demo2'>
                                                <div className='row'>
                                                    <div className='col-md-3'>
                                                        <div className='form-group'>
                                                            <div
                                                                id='tree2'
                                                                style={{
                                                                    height: 75,
                                                                    width: 300,
                                                                    float: 'left',
                                                                    border: 'solid black 1px',

                                                                }}
                                                            >
                                                                <SortableTree
                                                                    treeData={this.state.treeData2}
                                                                    onChange={treeData2 => this.setState({ treeData2 })}
                                                                    dndType={externalNodeType}
                                                                    shouldCopyOnOutsideDrop={shouldCopyOnOutsideDrop}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                                    <div className='col-md-1'>
                                                        <div className='col-sm-2'>
                                                            <button
                                                                className='btn btn-default dropdown-toggle'
                                                                type='button'
                                                                data-toggle='dropdown'
                                                            >equals
                                                            </button>
                                                            <ul className='dropdown-menu'>
                                                                <li><a href='#'>Global (All tenants)</a>
                                                                </li>

                                                            </ul>
                                                        </div>
                                                    </div>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;


                                                    <br />

                                                    <div className='col-md-3'>
                                                        <div className='col-sm-6'>
                                                            <input
                                                                type='URI'
                                                                className='form-control'
                                                                id='URI'
                                                                placeholder='Enter Value'
                                                            />
                                                        </div>
                                                    </div>
                                                    <br />
                                                    <div className='col-md-2'>
                                                        <button
                                                            className='btn btn-default dropdown-toggle'
                                                            type='button'
                                                            data-toggle='dropdown'
                                                        >AND
                                                        </button>
                                                        <ul className='dropdown-menu'>
                                                            <li><a href='#'>OR</a>
                                                            </li>
                                                            <li><a href='#'>END</a>
                                                            </li>

                                                        </ul>
                                                    </div>

                                                    <div className='col-md-1'>
                                                        <button>
                                                            <img
                                                                src='/images/add.png'
                                                                alt='my image'
                                                                width='15'
                                                                height='15'
                                                            />
                                                        </button>
                                                    </div>
                                                </div>


                                            </div>
                                        </fieldset>
                                    </form>


                                    <div className='form-group'>
                                        <div className='col-sm-6'>
                                            <button type='submit' className='btn btn-primary'>Submit
                                            </button>
                                        </div>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>

                    <div className='tab-pane' id='xml'>
                        <div className='jumbotron'>

                            <div>
                                <select id='policy_list' onChange={this.change} value={this.state.value}>
                                    {foo.map(item => <option value={item}>{item}</option>)}

                                </select>
                                {(this.state.value == 'Sample_policy_1') && (
                                    <div><Sample_policy_1 /></div>)}
                                {(this.state.value == 'Sample_policy_2') && (
                                    <div><Sample_policy_2 /></div>)}
                            </div>

                        </div>
                    </div>
                    <br />

                    <div className='tab-pane' id='drag'>
                        <div className='jumbotron' />
                    </div>
                </div>

                <ul className='nav nav-tabs'>
                    <li className='active'><a href='#ui' data-toggle='tab'>Design View</a></li>
                    <li><a href='#xml' data-toggle='tab'>XML View</a></li>
                    <li><a href='#drag' data-toggle='tab'>Drag View</a></li>
                </ul>

            </div>

        );
    }
}

export default policy_creating_window;
