import './App.css';
import {Component, useEffect, useState} from 'react';
// import { BrowserRouter } from 'react-router-dom';
import {Link, Route, Routes} from 'react-router-dom';
import storage from "./Storage";
import actions, {loadProfile, toggleHabitProgress} from "./actions";
import {FieldAdder} from "./UI/FieldAdder";
import {isHabitDoneOnDayX, patchWithIDs} from "./utils";


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

function HabitEditor({habit, onCloseEditor}) {
  var [timeFrom, setTimeFrom] = useState(habit?.from)
  var [timeTo, setTimeTo] = useState(habit?.to)

  if (!habit)
    return ''

  const close = () => {
    setTimeFrom("")
    setTimeTo("")
    onCloseEditor()
  }

  const onToChange = (ev) => {
    var time = ev.target.value;

    setTimeTo(time)
    actions.editHabitTime(habit.id, time, 'to')
  }
  const onFromChange = (ev) => {
    var time = ev.target.value;

    setTimeFrom(time)
    actions.editHabitTime(habit.id, time, 'from')
  }

  var days = [0, 1, 2, 3, 4, 5, 6]

  return <div className="popup" key={"habit" + habit.id}>
    <h2 className={"title"}>Edit habit {habit.name}</h2>
    <br/>
    <div>
      <div className="popup-label">From {habit.from}</div>
      <input className="new-habit-input" type="time" value={timeFrom} required onChange={onFromChange}/>
    </div>
    <div>
      <div className="popup-label">To {habit.to}</div>
      <input className="new-habit-input" type="time" value={timeTo} required onChange={onToChange}/>
    </div>
    <br/>
    <div className="popup-label">Schedule</div>
    <center>
    <table>
      <tr>
        {days.map(d => <td>{getLiteralDayOfWeek(d)}</td>)}
      </tr>
      <tr>
        {days.map(d => {
          // var checked = !!habit.schedule.filter(vvv => {
          //   var res = vvv === d
          //   console.log({vvv, d}, vvv, d, res)
          //   return res
          // }).length
          var checked = habit.schedule[d]
          console.log('checked ', checked, d)

          return <td>
            {/*{d}*/}
            <input
              className="habit-checkbox" type="checkbox"
              checked={checked}
              onChange={() => actions.toggleHabitSchedule(habit.id, d)}
            />
          </td>
        })}
      </tr>
      {/*<tr>*/}
      {/*  <td>{JSON.stringify(habit.schedule)}</td>*/}
      {/*</tr>*/}
      {/*<tr>*/}
      {/*  <td>{JSON.stringify(days)}</td>*/}
      {/*</tr>*/}
    </table>
    </center>
    <br/>
    <br/>
    <button onClick={close}>Close</button>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <button onClick={() => {
      close();
      actions.removeHabit(habit.id)
    }}>Remove habit
    </button>
  </div>
}

function HabitAdder({isOpen, onCloseAddingPopup}) {
  // var [expanded, expandHabit] = useState(false)
  var [text, setText] = useState("")
  var [timeFrom, setTimeFrom] = useState("11:00")
  var [timeTo, setTimeTo] = useState("12:00")

  if (!isOpen)
    return ''

  var hasText = text.length
  var hasFromTime = timeFrom.length
  var canSave = hasText && hasFromTime && timeTo.length

  // if (!expanded) {
  //   return <button className="new-habit-button" onClick={() => {
  //     expandHabit(true)
  //     onShowAddingPopup()
  //   }}>+ new habit</button>
  // }

  var onFromChange = ev => {
    var v = ev.target.value;
    console.log(v, typeof (v))
    setTimeFrom(v)
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
      <input className="new-habit-input" type="time" value={timeFrom} required onChange={onFromChange} />
    </div>
  }

  if (hasText && hasFromTime) {
    toForm = <div>
      <label>To</label>
      <input className="new-habit-input" type="time" value={timeTo} required onChange={onToChange} />
    </div>
  }

  var onAdd = () => {
    onCloseAddingPopup()
    actions.addHabit(text, timeFrom, timeTo)
    setText("")
    setTimeTo("00:00")
    setTimeFrom(timeTo)
  }

  var onTextChange = ev => setText(ev.target.value)
  // {/*min="09:00" max="18:00"*/}
  return <div className="popup">
    <h1>New habit</h1>
    <br />
    {/*<br />*/}
    <input autoFocus className="new-habit-input" type="text" placeholder="add new habit" value={text} onChange={onTextChange} />
    {fromForm}
    {toForm}
    {/*<FieldAdder*/}
    {/*  placeholder="add new habit"*/}
    {/*  onAdd={val => actions.addHabit(val)}*/}
    {/*  defaultButtonClass="new-habit-button"*/}
    {/*  defaultWord={"+ new habit"}*/}
    {/*  defaultState={true}*/}
    {/*/>*/}

    <button className={"new-habit-button"} onClick={onAdd} disabled={!canSave}>Add habit</button>
    <br />
    <br />
    <button className={""} onClick={onCloseAddingPopup}>Cancel</button>
  </div>
}

var getHour = h => {
  var sp = h.split(':')

  return parseInt(sp[0]) * 10000 + parseInt(sp[1])
}

const getErrorStats2 = habits => {
  console.log({habits})

  var dots = []
  habits.forEach(h => {
    dots.push({id: h.id, from: h.from,  val: getHour(h.from)})
    dots.push({id: h.id, to:   h.to,    val: getHour(h.to)})
  })

  dots.sort((d1, d2) => {
    var diff = d1.val - d2.val
    if (diff === 0) {
      // if (d1.id === d2.id)
      //   return
      return d1.id - d2.id
    }

    return diff
  })

  var errorStats = {}
  const saveErr = (h, from, to) => {
    if (from)
      errorStats[h.id + '.from'] = 1

    if (to)
      errorStats[h.id + '.to'] = 1
  }

  const saveInt = (h1, h2, from1, to1, from2, to2) => {
    saveErr(h1, from1, to1)
    saveErr(h2, from2, to2)
  }

  var openedHabits = []
  dots.forEach(d => {
    if (openedHabits.filter(o => o.id === d.id).length) {
      // have already, remove it
      openedHabits = openedHabits.filter(o => o.id !== d.id)
    } else {
      // first occasion
      openedHabits.push(d)

      // if (!d.from) // ends faster than starts?
      //   saveErr(d, true, true)

      // if there are other opened dots, this means, that this habit intersects with other habits
      openedHabits.filter(o => o.id !== d.id).forEach(otherHabit => {
        saveInt(d, otherHabit, true, true, true, true)
      })
    }
  })

  return errorStats
}

class MainPage extends Component {
  state = {
    habits: [],
    habitProgress: [],
    isAddingHabitPopupOpened: false,
    editingHabitID: -1
  }

  saveHabits() {
    this.setState({
      habits: storage.getHabits(),
      habitProgress: storage.getHabitProgress()
    })
  }

  setEditingHabit = id => {
    this.setState({editingHabitID: id})
  }
  unsetEditingHabit = () => {
    this.setEditingHabit(-1)
  }

  toggleAddingPopup = value => this.setState({isAddingHabitPopupOpened: value})

  componentWillMount() {
    storage.addChangeListener(() => {
      console.log('store listener')
      this.saveHabits()
    })

    this.saveHabits()
    actions.loadProfile(storage.getTelegramId())
  }




  render() {
    const dow = (name, number) => {
      var isToday = number === new Date().getDate()

      return <div>
        {name}
        <br/>
        <div className={`calendar-day ${isToday ? 'current-day' : ''}`}>{number}</div>
        {/*<br/>*/}
      </div>
    }

    var {habits} = this.state

    var days = []
    for (var i = -4; i <= 0; i++) {
      days.push(new Date(Date.now() + i * 24 * 3600 * 1000))
    }

    const twoDigit = num => num < 10 ? '0'+num : num

    var habitsMapped = []
    var errorStats = getErrorStats2(habits)

    habits
      .sort((h1, h2) => getHour(h1.from) - getHour(h2.from))
      .forEach(h => {
        var eFrom = errorStats[h.id + '.from']
        var eTo   = errorStats[h.id + '.to']

        var intersects = eFrom || eTo
        var erroredFrom = eFrom ? 'habit-date-error' : ''
        var erroredTo   = eTo ? 'habit-date-error' : ''

        habitsMapped.push(<div className={`left habit-container ${intersects ? 'intersects' : ''}`}>
          {h.name}
          <br />
          <div className="habit-date">
            {/*{twoDigit(h.fromHour)}-{twoDigit(h.fromMinutes)} : {twoDigit(h.toHour)}-{twoDigit(h.toMinutes)}*/}
            <span className={erroredFrom}>{h.from}</span> -- <span className={erroredTo}>{h.to}</span>
          </div>
          <div className="habit-editing-icon" onClick={() => {this.setEditingHabit(h.id)}}>E</div>
        </div>)

        days.forEach(date => {
          var d = date.getDay()
          var exists = h.schedule[d.toString()];
          console.log(d.toString(), h.schedule)

          var checked = !!this.state.habitProgress.find(p => isHabitDoneOnDayX(p, h.id, date))

          const onToggleProgress = ev => {
            actions.toggleHabitProgress(h.id, date)
          }

          var content;
          if (exists)
            content = <input className="habit-checkbox" type="checkbox" checked={checked} onChange={onToggleProgress} />

          habitsMapped.push(<div>{content}</div>)
        })
    })

    var hasIntersectingHabits = !!Object.keys(errorStats).length;
    var intersectingHabitsWarning;
    if (hasIntersectingHabits)
      intersectingHabitsWarning = <span className="intersecting-habits-warning">Your habits intersect by time!! Fix that!</span>

    var editingHabit = habits.find(h => h.id === this.state.editingHabitID)
    return <div className={"plan-day-container"}>
      <h1>Your daily routine</h1>
      <div className="habits-table">
        <div className="left">
          HABITS
          <br />
          {intersectingHabitsWarning}
        </div>
        {days.map(d => {
          var dayOfWeek = d.getDay()
          var day = d.getDate()

          return <div>{dow(getLiteralDayOfWeek(dayOfWeek), day)}</div>
        })}
        {habitsMapped}
        <div className="left">
          <br />
          <button onClick={() => {this.toggleAddingPopup(true)}} className="new-habit-button">+ new habit</button>
        </div>
        {/*{days.map(d => <div></div>)}*/}
      </div>
      <HabitEditor habit={editingHabit} onCloseEditor={() => {this.unsetEditingHabit()}}/>
      <HabitAdder onCloseAddingPopup={() => this.toggleAddingPopup(false)} isOpen={this.state.isAddingHabitPopupOpened} />
      {/*{JSON.stringify(this.state.habitProgress)}*/}
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
