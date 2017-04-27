import React from "react"
import PropTypes from 'prop-types';

const sampleStyles = {
	stroke: "#000"
};

class Sample extends React.Component {

	render() {
		let bottom_y = this.props.y + this.props.height;

		let line_x1 = this.props.x + (this.props.width / 2);
		let line_y1 = this.props.width / 2;
		let line_x2 = line_x1;
		let line_y2 = bottom_y;

		return (
				<line x1={line_x1} y1={ line_y1 } x2={line_x2} y2={ line_y2 } style={sampleStyles}/>
		)
  }
}

Sample.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
	x: PropTypes.number,
	y: PropTypes.number
}

Sample.defaultProps = {
	width: 0,
	height: 0,
	x: 0,
	y: 0
}

export default Sample;
