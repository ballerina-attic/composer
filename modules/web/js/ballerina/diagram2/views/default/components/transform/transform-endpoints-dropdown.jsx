import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import Autosuggest from 'react-autosuggest';

const getSuggestionValue = suggestion => suggestion;

const renderSuggestion = suggestion => (
    <div>
        {suggestion}
    </div>
);

const shouldRenderSuggestions = () => true;

class SuggestionsDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            suggestions: this.props.suggestionsPool,
        };

        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onSuggestionsFetchRequested(query) {
        const matches = [];
        const substrRegex = new RegExp(_.escapeRegExp(query.value), 'i');

        this.props.suggestionsPool.forEach((sug) => {
            if (substrRegex.test(sug)) {
                matches.push(sug);
            }
        });
        // matches.push({ type: '-- add new variable --', name: '' });
        this.setState({ suggestions: matches });
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: [],
        });
    }

    onKeyDown(event) {
        if (event.keyCode === 13) {
            this.props.onEnter(event);
        }
    }

    render() {
        const { placeholder, value, onChange } = this.props;

        const inputProps = {
            placeholder,
            value,
            onChange,
            onKeyDown: this.onKeyDown,
        };

        return (
            <Autosuggest
                suggestions={this.state.suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.props.onSuggestionSelected}
                shouldRenderSuggestions={shouldRenderSuggestions}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
                focusInputOnSuggestionClick={false}
            />
        );
    }
}

SuggestionsDropdown.propTypes = {
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSuggestionSelected: PropTypes.instanceOf(Object).isRequired,
    suggestionsPool: PropTypes.instanceOf(Object).isRequired,
    onEnter: PropTypes.func.isRequired,
};

export default SuggestionsDropdown;
