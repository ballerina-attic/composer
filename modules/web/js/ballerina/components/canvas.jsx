import React from 'react';

class Canvas extends React.Component {

    render() {
        return <svg className="svg-container" width="100%" height={this.props.height}>
            {this.props.children}
        </svg>;
    }
}

export default Canvas;
