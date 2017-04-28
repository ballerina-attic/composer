import React from 'react';
import PropTypes from 'prop-types';

const padding = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    },
    statementGap = 50;

class StatementContainer extends React.Component {

    constructor(props) {
        super(props);
        this.model = props.model;
    }

    setModel(model) {
        this.model = model;
    }

    getModel() {
        return this.model;
    }

    render() {
        return (<g className="statement_container">
                  {this.props.children}
              </g>);
    }
}

StatementContainer.propTypes = {
  children: PropTypes.node.isRequired
}


export default StatementContainer;
