import React from 'react';
import PropTypes from 'prop-types';
import './PencilEdit.css';
import Globals from "./globals";

const PencilInput = (props) => {
  const {type, value, placeholder, onChange, attributes, cssClassPrefix, onFocus, onBlur} = props;
  return (
      <div className={cssClassPrefix + "easy-edit-component-wrapper"}>
        <input
            autoFocus={attributes["autoFocus"] || true}
            type={type}
            value={value ? value : undefined}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={attributes["placeholder"] || placeholder}
            autoComplete={attributes["autoComplete"] || "off"}
            {...attributes}
        />
      </div>
  );
};

PencilInput.propTypes = {
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string,
  placeholder: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  attributes: PropTypes.object,
  cssClassPrefix: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

PencilInput.defaultProps = {
  attributes: {},
  placeholder: Globals.DEFAULT_PLACEHOLDER,
  onfocus: () => { }
};

export default PencilInput;
