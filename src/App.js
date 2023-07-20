import './App.css';
import {Component, useEffect, useState} from 'react';
// import { BrowserRouter } from 'react-router-dom';
import {Link, Route, Routes} from 'react-router-dom';
import storage from "./Storage";
import actions from "./actions";
import {FieldAdder} from "./UI/FieldAdder";


const getLiteralDayOfWeek = (val) => {
  switch (val) {
    case 0: return 'SUN'
    case 1: return 'MON'
    case 2: return 'TUE'
    case 3: return 'WED'
    case 4: return 'THU'
    case 5: return 'FRI'
    case 6: return 'SAT'
  }
}

function HabitAdder({}) {
  var [expanded, expandHabit] = useState(false)
  var [text, setText] = useState("")
  var [time, setTime] = useState("11:00")
  var [timeTo, setTimeTo] = useState("12:00")

  var hasText = text.length
  var hasFromTime = time.length
  var canSave = hasText && hasFromTime && timeTo.length

  if (!expanded) {
    return <button onClick={() => expandHabit(true)}>+ new habit</button>
  }

  var onFromChange = ev => {
    var v = ev.target.value;
    console.log(v, typeof (v))
    setTime(v)
  }

  var onToChange = ev => {
    var v = ev.target.value;
    console.log(v, typeof (v))
    setTimeTo(v)
  }

  var fromForm;
  var toForm;
  if (hasText) {
    fromForm = <div>
      <label>From</label>
      <input className="new-habit-input" type="time" value={time} required onChange={onFromChange} />
    </div>
  }

  if (hasText && hasFromTime) {
    toForm = <div>
      <label>To</label>
      <input className="new-habit-input" type="time" value={timeTo} required onChange={onToChange} />
    </div>
  }

  var onTextChange = ev => setText(ev.target.value)
  // {/*min="09:00" max="18:00"*/}
  return <div>
    <input className="new-habit-input" type="text" placeholder="add new habit" value={text} onChange={onTextChange} />
    {fromForm}
    {toForm}
    {/*<FieldAdder*/}
    {/*  placeholder="add new habit"*/}
    {/*  onAdd={val => actions.addHabit(val)}*/}
    {/*  defaultButtonClass="new-habit-button"*/}
    {/*  defaultWord={"+ new habit"}*/}
    {/*  defaultState={true}*/}
    {/*/>*/}

    <button className={"new-habit-button"} onClick={() => {actions.addHabit(text, time, timeTo)}} disabled={!canSave}>Add habit</button>
  </div>
}

class MainPage extends Component {
  state = {
    habits: []
  }

  saveHabits() {
    this.setState({
      habits: storage.getHabits()
    })
  }

  componentWillMount() {
    storage.addChangeListener(() => {
      console.log('store listener')
      this.saveHabits()
    })

    this.saveHabits()
  }

  render() {
    const dow = (name, number) => {
      var isToday = number === new Date().getDate()

      return <div>
        {name}
        <br/>
        <span className={`calendar-day ${isToday ? 'current-day' : ''}`}>{number}</span>
        <br/>
      </div>
    }

    var {habits} = this.state

    var days = []
    for (var i = -4; i <= 0; i++) {
      days.push(new Date(Date.now() + i * 24 * 3600 * 1000))
    }

    const twoDigit = num => num < 10 ? '0'+num : num

    var habitsMapped = []
    var getHour = h => {
      var sp = h.from.split(':')

      return parseInt(sp[0]) * 10000 + parseInt(sp[1])
    }
    habits
      .sort((h1, h2) => getHour(h1) - getHour(h2))
      .forEach(h => {
      habitsMapped.push(<div className="left">
        {h.name}
        <br />
        <div className="habit-date">
          {/*{twoDigit(h.fromHour)}-{twoDigit(h.fromMinutes)} : {twoDigit(h.toHour)}-{twoDigit(h.toMinutes)}*/}
          {h.from} -- {h.to}
        </div>
      </div>)
      days.forEach(d => {
        habitsMapped.push(<div><input className="habit-checkbox" type="checkbox"/></div>)
      })
    })

    return <div>
      <h1>Your daily routine!</h1>
      <div className="habits-table">
        <div className="left">HABITS</div>
        {days.map(d => {
          var dayOfWeek = d.getDay()
          var day = d.getDate()

          return <div>{dow(getLiteralDayOfWeek(dayOfWeek), day)}</div>
        })}
        {habitsMapped}
        <div className="left">
          <HabitAdder />
        </div>
        {days.map(d => <div></div>)}
      </div>
    </div>
  }
}

function App() {
  // App-header
  return <div style={{backgroundColor: '#282c34'}}>
    <div className="App">
      <header className="" style={{height: '100%', minHeight: '100vh'}}>
        <Routes>
          <Route path='/'                     element={<MainPage/>}/>
        </Routes>
      </header>
    </div>
  </div>
}

export default App;
