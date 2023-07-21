import './App.css';
import {Component, useEffect, useState} from 'react';
// import { BrowserRouter } from 'react-router-dom';
import {Link, Route, Routes} from 'react-router-dom';
import storage from "./Storage";
import actions from "./actions";
import {FieldAdder} from "./UI/FieldAdder";
import {patchWithIDs} from "./utils";


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
const getHabitErrorStats = (habits) => {
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

  for (var i = 0; i < habits.length; i++) {
    var h1 = habits[i];
    var from1 = getHour(h1.from)
    var to1 = getHour(h1.to)

    var badH1 = from1 >= to1

    if (badH1) {
      saveErr(h1, true, true)
    }

    for (var j = i + 1; j < habits.length; j++) {
      var arr = [];

      var h2 = habits[j]
      var from2 = getHour(h2.from)
      var to2 = getHour(h2.to)
      var badH2 = from2 >= to1

      if (badH2) {
        saveErr(h2, true, true)
      }


      arr.push({val: from1, id: h1.id, from1, from: true, isMin: from1 < to1})
      arr.push({val: from2, id: h2.id, from2, from: true, isMin: from2 < to2})
      arr.push({val: to1,   id: h1.id, to1  , to: true,   isMin: to1 })
      arr.push({val: to2,   id: h2.id, to2  , to: true})

      var sorted = arr.sort((s1, s2) => {
        var diff = s1.val - s2.val

        if (diff !== 0) return diff

        return s1.id - s2.id
      })

      var s0 = sorted[0]
      var s1 = sorted[1]
      var s2 = sorted[2]
      var s3 = sorted[3]

      var openedId = s0.id;
      for (var ii = 1; ii < sorted.length; ii++) {
        var s = sorted[ii]
        if (s.id === openedId) {

        }
      }

      // if (s0.id === s1.id) {
      //   // one habit opens and closes
      //   // TODO if all habits start and end at the same time, then program thinks it's ok
      //   if (s0.val === s1.val && s1.val === s2.val && s2.val === s3.val) {
      //     saveInt(h1, h2, true, true, true, true)
      //   }
      // } else {
      //   // habits intersect and we need to know, how
      //
      //   // any1 belongs to (f2, t2)
      //   // any2 belongs to (f1, t1)
      //
      //   if (s1.id !== s2.id) {
      //
      //   } else {
      //
      //   }
      //   if (s0.id === s3.id) {
      //     saveInt(h1, h2, true, true, true, true)
      //   } else if (sorted)
      //
      //   // (f1, t1) (f2, t2) t1 > f2                    --- intersect
      //   // (f1, t1) === (f2, t2)                        --- equal
      //   // (f1, t1) in (f2, t2) or (f2, t2) in (f1, t1) --- contain
      // }
    }
  }
  return errorStats
}

const getInitDataSplit = data => {
  if (!data)
    return ['no data']

  return data.split("&")
}

const parseUserInfo = s => s
    .replaceAll("%7B", "{")
    .replaceAll("%22", '"')
    .replaceAll("%3A", "=")
    .replaceAll("%2C", ",")
    .replaceAll("%7D", "}")

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
        </div>)

        days.forEach(d => {
          habitsMapped.push(<div><input className="habit-checkbox" type="checkbox"/></div>)
        })
    })

    var hasIntersectingHabits = !!Object.keys(errorStats).length;
    var intersectingHabitsWarning;
    if (hasIntersectingHabits)
      intersectingHabitsWarning = <span className="intersecting-habits-warning">Your habits intersect by time!! Fix that!</span>

    var webApp = window?.Telegram?.WebApp;
    var initData = getInitDataSplit(webApp?.initData)
    var userData = initData[1]

    try {
      console.log({userData})
      console.log(parseUserInfo(userData))
    } catch (err) {
      console.error('cannot parse user data', {err})
    }

    return <div>
      <h1>Your daily routine</h1>
      {/*<div>{initData.join("\n")}</div>*/}
      <div>{parseUserInfo(userData)}</div>
      {/*<div>{webApp?.initDataUnsafe}</div>*/}
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
