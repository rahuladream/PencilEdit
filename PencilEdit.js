import React from 'react';
import PropTypes from 'prop-types';
import './PencilEdit.css';

// local modules
import Globals from './globals';
import PencilInput from "./PencilInput.jsx";
import PencilCustom from './PencilCustom.jsx';

export default class PencilEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editing: props.editMode || false,
      hover: false,
      value: props.value,
      tempValue: props.value,
      isValid: true,
      isHidden: false
    };

    this.saveButton = React.createRef();
    this.cancelButton = React.createRef();
    this.deleteButton = React.createRef();
  }

  isNullish(value) {
    return value === null || value === undefined;
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({
        tempValue: this.props.value,
        value: this.props.value,
      });
    }

    if (this.props.editMode !== prevProps.editMode && !this.props.editMode) {
      this._onSave();
    }
  }

  onKeyDown = (e) => {
    const { type, disableAutoSubmit, disableAutoCancel } = this.props;
    if (!disableAutoCancel && e.keyCode === 27) {
      this._onCancel();
    }

    if (!disableAutoSubmit) {
      if ((e.keyCode === 13 && type !== Types.TEXTAREA)
        || (e.keyCode === 13 && e.ctrlKey && type === Types.TEXTAREA)) {
        this._onSave();
      }
    }
  };

  _onSave = () => {
    const { onSave, onValidate } = this.props;
    const tempValue = this.state.tempValue;
    if (onValidate(tempValue)) {
      this.setState({ editing: false, value: tempValue, isValid: true, hover: false },
        () => onSave(this.state.value));
    } else {
      this.setState({ isValid: false });
    }
  };

  
  _onFocus = () => {
    const { onFocus } = this.props;
    if (onFocus) {
      onFocus(this.state.tempValue);
    }
  };

  _onCancel = () => {
    const { onCancel } = this.props;
    const value = this.state.value;
    this.setState({ editing: false, tempValue: value, hover: false }, () => onCancel());
  };

  _onDelete = () => {
    const { onDelete } = this.props;
    const value = this.state.value;
    this.setState({ editing: false, tempValue: value, hover: false, isHidden: true }, () => onDelete());
  };

  onChange = e => {
    this.setState({ tempValue: e.target ? e.target.value : e });
  };

  onCheckboxChange = e => {
    const { options } = this.props;
    let values = this.state.tempValue || [];
    if (e.target.checked && !values.includes(e.target.value)) {
      values.push(e.target.value);
    } else {
      values.splice(values.indexOf(e.target.value), 1);
    }
    // filter out the orphaned values that have no option entry
    let optionValues = options.map(o => o.value);
    values = values.filter((value) => {
      return optionValues.includes(value);
    });
    this.setState({ tempValue: values });
  };

  onClick = () => {
    const { allowEdit } = this.props;
    if (allowEdit) {
      this.setState({ editing: true });
    }
  };

  hoverOn = () => {
    const { allowEdit } = this.props;
    if (allowEdit) {
      this.setState({ hover: true });
    }
  };

  hoverOff = () => {
    this.setState({ hover: false });
  };

  renderInput() {
    const { type, placeholder, attributes, editComponent, cssClassPrefix } = this.props;
    const editing = this.state.editing;
    this.cullAttributes();

    if (React.isValidElement(editComponent)) {
      return (
        <PencilCustom
          setValue={this.onChange}
          onBlur={this._onBlur}
          onFocus={this._onFocus()}
          value={this.state.tempValue}
          cssClassPrefix={cssClassPrefix}
        >
          {editComponent}
        </ PencilCustom>
      );
    }

    switch (type) {
      case Types.TEXT:
        return (
          <PencilInput
            value={editing ? this.state.tempValue : this.state.value}
            placeholder={placeholder}
            onChange={this.onChange}
            onFocus={this._onFocus()}
            onBlur={this._onBlur}
            type={type}
            attributes={attributes}
            cssClassPrefix={cssClassPrefix}
          />
        );
      default: {
        throw new Error(Globals.ERROR_UNSUPPORTED_TYPE);
      }
    }
  }

  renderButtons() {
    const { saveOnBlur, saveButtonLabel, saveButtonStyle, cancelButtonLabel, cancelButtonStyle, deleteButtonLabel,
      deleteButtonStyle, cssClassPrefix, hideSaveButton, hideCancelButton, hideDeleteButton } = this.props;
    return (
      <div className={cssClassPrefix + "easy-edit-button-wrapper"}>
        {!hideSaveButton && PencilEdit.generateButton(this.saveButton, this._onSave, saveButtonLabel,
          (saveButtonStyle === null ? cssClassPrefix + Globals.DEFAULT_BUTTON_CSS_CLASS : saveButtonStyle), "save", saveOnBlur)}
        {!hideCancelButton && PencilEdit.generateButton(this.cancelButton, this._onCancel, cancelButtonLabel,
          (cancelButtonStyle === null ? cssClassPrefix + Globals.DEFAULT_BUTTON_CSS_CLASS : cancelButtonStyle), "cancel", saveOnBlur)}
        {!hideDeleteButton && PencilEdit.generateButton(this.deleteButton, this._onDelete, deleteButtonLabel,
          (deleteButtonStyle === null ? cssClassPrefix + Globals.DEFAULT_BUTTON_CSS_CLASS : deleteButtonStyle), "delete", saveOnBlur)}
      </div>
    )
  }

  setCssClasses(existingClasses) {
    const { viewAttributes, cssClassPrefix, onHoverCssClass } = this.props;

    if (viewAttributes["class"]) {
      existingClasses += " " + viewAttributes["class"];
    }
    if (viewAttributes["className"]) {
      existingClasses += " " + viewAttributes["className"];
    }

    if (!this.props.allowEdit) {
      return cssClassPrefix + 'easy-edit-not-allowed ' + existingClasses;
    } else if (this.state.hover) {
      return onHoverCssClass === Globals.DEFAULT_ON_HOVER_CSS_CLASS ?
        cssClassPrefix + 'easy-edit-hover-on ' + existingClasses + ' pencil-icon':
        onHoverCssClass + ' ' + existingClasses;
    } else {
      return existingClasses;
    }
  }

  static generateButton(ref, onClick, label, cssClass, name, saveOnBlur) {
    if (saveOnBlur) {
      return "";
    }
    return (
      <button ref={ref} onClick={onClick} className={cssClass} name={name}>
        {label}
      </button>
    )
  }

  renderPlaceholder() {
    const { type, placeholder, displayComponent, viewAttributes, cssClassPrefix } = this.props;
    this.cullAttributes();
    const cssWrapperClass = cssClassPrefix + 'easy-edit-wrapper';

    if (React.isValidElement(displayComponent)) {
      return (
        <div
          {...viewAttributes}
          className={this.setCssClasses(cssWrapperClass)}
          onClick={this.onClick}
          onMouseEnter={this.hoverOn}
          onMouseLeave={this.hoverOff}
        >
          {!this.isNullish(this.state.value) ?
            React.cloneElement(displayComponent, { value: this.state.value }) :
            placeholder}
        </div>
      );
    }

    switch (type) {
      case Types.TEXT: {
        return (
          <div
            {...viewAttributes}
            className={this.setCssClasses(cssWrapperClass)}
            onClick={this.onClick}
            onMouseEnter={this.hoverOn}
            onMouseLeave={this.hoverOff}
          >
            {!this.isNullish(this.state.value) ? (type === Types.PASSWORD ? "••••••••" : this.state.value) : placeholder}
          </div>
        );
      }
      default: {
        throw new Error(Globals.ERROR_UNSUPPORTED_TYPE);
      }
    }
  }

  

  cullAttributes() {
    const { attributes } = this.props;
    delete attributes["type"];
    delete attributes["onChange"];
    delete attributes["value"];
  }

  render() {
    const { cssClassPrefix, buttonsPosition, editMode } = this.props;
    if (this.state.isHidden) {
      return "";
    }

    if (this.state.editing || editMode) {
      return (
        <div className={cssClassPrefix + "easy-edit-inline-wrapper"} tabIndex="0"
             onKeyDown={(e) => this.onKeyDown(e)}>
          {buttonsPosition === Globals.POSITION_BEFORE && this.renderButtons()}
          {this.renderInput()}
          {buttonsPosition === Globals.POSITION_AFTER && this.renderButtons()}
        </div>)
    } else {
      return this.renderPlaceholder()
    }
  }
}

export const Types = {
  TEXT: 'text',
};

Object.freeze(Types);

PencilEdit.propTypes = {
  type: PropTypes.oneOf([
    'text',]).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
    PropTypes.object
  ]),
  options: PropTypes.array,
  saveButtonLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  saveButtonStyle: PropTypes.string,
  cancelButtonLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  cancelButtonStyle: PropTypes.string,
  deleteButtonLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  deleteButtonStyle: PropTypes.string,
  buttonsPosition: PropTypes.oneOf(['after', 'before']),
  placeholder: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onValidate: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  validationMessage: PropTypes.string,
  allowEdit: PropTypes.bool,
  attributes: PropTypes.object,
  viewAttributes: PropTypes.object,
  instructions: PropTypes.string,
  editComponent: PropTypes.element,
  displayComponent: PropTypes.element,
  disableAutoSubmit: PropTypes.bool,
  disableAutoCancel: PropTypes.bool,
  cssClassPrefix: PropTypes.string,
  hideSaveButton: PropTypes.bool,
  hideCancelButton: PropTypes.bool,
  hideDeleteButton: PropTypes.bool,
  onHoverCssClass: PropTypes.string,
  saveOnBlur: PropTypes.bool,
  cancelOnBlur: PropTypes.bool,
  editMode: PropTypes.bool
};

PencilEdit.defaultProps = {
  value: null,
  saveButtonLabel: Globals.DEFAULT_SAVE_BUTTON_LABEL,
  saveButtonStyle: null,
  cancelButtonLabel: Globals.DEFAULT_CANCEL_BUTTON_LABEL,
  cancelButtonStyle: null,
  deleteButtonLabel: Globals.DEFAULT_DELETE_BUTTON_LABEL,
  deleteButtonStyle: null,
  buttonsPosition: Globals.POSITION_AFTER,
  placeholder: Globals.DEFAULT_PLACEHOLDER,
  allowEdit: true,
  onCancel: () => { },
  onDelete: () => { },
  onfocus: () => { },
  onBlur: () => { },
  onValidate: value => true,
  validationMessage: Globals.FAILED_VALIDATION_MESSAGE,
  attributes: {},
  viewAttributes: {},
  instructions: null,
  editComponent: null,
  placeholderComponent: null,
  disableAutoSubmit: false,
  disableAutoCancel: false,
  cssClassPrefix: '',
  hideSaveButton: false,
  hideCancelButton: false,
  hideDeleteButton: true,
  onHoverCssClass: Globals.DEFAULT_ON_HOVER_CSS_CLASS,
  saveOnBlur: false,
  cancelOnBlur: false,
  editMode: false
};
