import {useState} from "react";

export function FieldPicker({value, onAction, onRemove, placeholder, autoFocus=true, normalValueRenderer}) {
  var [editName, onChangeName] = useState(false)
  var [newValue, onValueChange] = useState(value)

  if (value.length && !editName) {
    if (!normalValueRenderer)
      return <span className="editable" onClick={onChangeName}>{value}</span>

    return <div className="editable">{normalValueRenderer(onChangeName)}</div>
  }

  var saveButton = ''
  if (newValue?.length || value?.length) {
    const onSave = () => {
      if (onRemove) {
        if (!newValue.length)
          onRemove()
        else
          onAction(newValue)
      } else {
        onAction(newValue)
      }

      onChangeName(false)
    }

    saveButton = <button onClick={onSave}>save</button>
  }

  return <div key={value}>
    <textarea
      autoFocus={autoFocus}
      value={newValue}
      placeholder={placeholder}
      onChange={event => onValueChange(event.target.value)}
    />
    {saveButton}
  </div>
}

export function NumberPicker({value, onAction, placeholder, normalValueRenderer, defaultState=false}) {
  var [editName, onChangeName] = useState(defaultState)
  var [newValue, onValueChange] = useState(value)

  if (!editName) {
    if (normalValueRenderer)
      return <div className="editable">{normalValueRenderer(onChangeName)}</div>


    return <label className="editable" onClick={() => onChangeName(true)}>{value}</label>
  }

  var saveButton = ''
  const onSave = () => {
    onAction(newValue);
    // onValueChange("")
    // onEditDescriptionStatus(false)
    onChangeName(false)
  }

  saveButton = <button onClick={onSave}>save</button>

  return <div>
    <textarea
      value={newValue}
      placeholder={placeholder}
      onChange={event => onValueChange(parseFloat(event.target.value))}
    />
    {saveButton}
  </div>
}