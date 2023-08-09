import './App.css';
import {Component, useEffect, useState} from 'react';
// import { BrowserRouter } from 'react-router-dom';
import {Link, Route, Routes} from 'react-router-dom';
import storage from "./Storage";
import actions from "./actions";
import {isHabitDoneOnDayX, patchWithIDs} from "./utils";
import {ping, post} from "./PingBrowser";

const TIME_FROM_MORNING = "9:00"
const TIME_FROM_AFTERNOON = "12:00"
const TIME_FROM_EVENING = "16:00"

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
    <HabitTimePicker defaultFrom={timeFrom} defaultTo={timeTo} onSave={(fr, to) => {
      actions.editHabitTime(habit.id, fr, to)
    }} />
    {/*<div>*/}
    {/*  <div className="popup-label">From {habit.from}</div>*/}
    {/*  <input className="new-habit-input" type="time" value={timeFrom} required onChange={onFromChange}/>*/}
    {/*</div>*/}
    {/*<div>*/}
    {/*  <div className="popup-label">To {habit.to}</div>*/}
    {/*  <input className="new-habit-input" type="time" value={timeTo} required onChange={onToChange}/>*/}
    {/*</div>*/}
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
    <button className="close" onClick={close}>Close</button>
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

function HabitTimePicker({onSave, defaultFrom = TIME_FROM_MORNING, defaultTo="12:00"}) {
  var [timeFrom, setTimeFrom] = useState(defaultFrom)
  var [timeTo, setTimeTo] = useState(defaultTo)

  const timeButton = (time, fr, to) => {
    var st = {}
    var isChosen = timeFrom === fr;

    if (isChosen) {
      st.backgroundColor = 'green';
      st.color = 'white'
      st.fontWeight = '800'
    } else {
      st.backgroundColor = 'buttonface'
    }

    return <button style={st} onClick={() => {
      setTimeFrom(fr)
      setTimeTo(to)
      onSave(fr, to)
    }}>{time}</button>
  }

  return <div>
    {timeButton('Morning',    TIME_FROM_MORNING,    '12:00')}
    {timeButton('Afternoon',  TIME_FROM_AFTERNOON,  '16:00')}
    {timeButton('Evening',    TIME_FROM_EVENING,    '20:00')}
  </div>
}

function HabitAdder({isOpen, onCloseAddingPopup}) {
  var [text, setText] = useState("")
  var [timeFrom, setTimeFrom] = useState(TIME_FROM_MORNING)
  var [timeTo, setTimeTo] = useState(TIME_FROM_AFTERNOON)

  if (!isOpen)
    return ''

  var hasText = text.length
  var hasFromTime = timeFrom.length
  var canSave = hasText && hasFromTime && timeTo.length

  var fromForm;
  if (hasText) {
    fromForm = <HabitTimePicker defaultFrom={TIME_FROM_MORNING} defaultTo={TIME_FROM_AFTERNOON} onSave={(fr, to) => {
      setTimeFrom(fr)
      setTimeTo(to)
    }} />
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
    <input autoFocus className="new-habit-input" type="text" placeholder="add new habit" value={text} onChange={onTextChange} />
    <div className={"from-to-form"}>
      {fromForm}
    </div>
    {/*<FieldAdder*/}
    {/*  placeholder="add new habit"*/}
    {/*  onAdd={val => actions.addHabit(val)}*/}
    {/*  defaultButtonClass="new-habit-button"*/}
    {/*  defaultWord={"+ new habit"}*/}
    {/*  defaultState={true}*/}
    {/*/>*/}

    <button className={`new-habit-button new-habit-button-confirm ${canSave ? '' : 'disabled'}`} onClick={onAdd} disabled={!canSave}>Add habit</button>
    <br />
    <br />
    <br />
    <button className="close" onClick={onCloseAddingPopup}>Close</button>
  </div>
}

var getHour = h => {
  var sp = h.split(':')

  return parseInt(sp[0]) * 10000 + parseInt(sp[1])
}

function AdminSender({onSend}) {
  var [text, setText] = useState("")

  return <div>
    <input value={text} onChange={ev => setText(ev.target.value)} />
    {text.length ? <button onClick={() => {onSend(text); setText("")}}>Answer</button> : ''}
  </div>
}
class UserView extends Component {
  state = {
    showMessages: false,
    showProgress: false,
    messages: [],

    response: {}
  }

  loadMessages = () => {
    var telegramId = this.props.user.telegramId

    ping('/messages/' + telegramId)
      .then(r => {
        console.log('got messages', r);
        this.setState({
          messages: r.messages,
          showMessages: true,
          showProgress: false,
        })
      })
      .catch(err => {
        console.error('cannot load messages for user')
        console.error(err)
        console.error(telegramId)
      })
  }

  answerAsAdmin = (chatId, text) => {
    var message = {chatId, text}
    post('/answer', message)
      .then(r => {
        console.log('saveMessage', r)
        this.loadMessages()
      })
      .catch(err => {
        console.error('saving message failed', err)
      })
  }

  renderChatHistory = (user) => {
    var showHistory = (n = 'Show chat') => <button onClick={() => {this.loadMessages()}}>{n}</button>

    var needsResponse = !user.hasAnswer

    var unanswered = <div style={{backgroundColor: 'red'}}>
      Needs your response {showHistory()}
    </div>

    var answered = <div>
      ANSWERED {showHistory()}
    </div>

    var messageForm = <div>
      {this.state.messages.map(m => {
        var isSenderAdmin = m.sender.length < 3
        var style = {textAlign: isSenderAdmin ? 'right' : 'left'}
        return <div style={style}>{m.text}</div>
      })}
      <br />
      <AdminSender onSend={(text) => {
        this.answerAsAdmin(user.telegramId, text)
        this.props.onAnswer()
      }} />
    </div>

    return <div>
      {needsResponse ? unanswered : answered}
      {this.state.showMessages ? messageForm : ''}
    </div>
  }

  showProgress = () => {
    this.setState({
      showMessages: false,
      showProgress: true
    })
  }

  renderHabitProgress = (user) => {
    if (!this.state.showProgress)
      return ''

    return <div>
      <div className="habits-table">
        <div className="left">
          HABITS
          <br />
        </div>
        {renderTableOfDays()}
        {getMappedHabits(user.habits, user.progress)}
      </div>
    </div>
  }

  render() {
    var user = this.props.user
    var lastProgress;
    if (user.progress.length) {
      var last = user.progress[user.progress.length - 1]
      console.log({last})

      if (!last) {
        console.error('UNDEFINED LAST', {user})
      } else {
        lastProgress = <p>Last action: {new Date(last.date).toLocaleString()}</p>
      }
    }

    var progressButton;
    if (user.habits.length) {
      progressButton = <button onClick={this.showProgress}>Show progress</button>
    }

    return <div>
      <b>{user.telegramId}</b> UTC:{user.timeZone} [{user.habits.length}] habits [{user.progress.length}] marks {progressButton}
      <br/>{user.habits.map(h => h.name).join(', ')}
      <br />
      {lastProgress}
      <br/>
      <br/>
      {this.renderChatHistory(user)}
      {this.renderHabitProgress(user)}
      <br />
      <hr />
    </div>
  }
}

class AdminPage extends Component {
  state = {
    users: []
  }

  saveUsers() {
    this.setState({
      users: storage.getUsers()
    })
  }

  componentWillMount() {
    storage.addChangeListener(() => {
      console.log('store listener')
      this.saveUsers()
    })

    this.loadUsers()

    setInterval(this.loadUsers, 10 * 1000)
  }

  loadUsers = () => {
    actions.loadUsersInAdminPanel(storage.getTelegramId())
  }

  render() {
    var users = this.state.users;

    return <div>
      {users.map(u => <UserView user={u} onAnswer={() => {this.loadUsers()}} />)}
    </div>
  }
}

const getRecentDays = () => {
  var days = []

  for (var i = -4; i <= 0; i++) {
    days.push(new Date(Date.now() + i * 24 * 3600 * 1000))
  }

  return days;
}

const getMappedHabits = (habits, habitProgress, setEditingHabit) => {
  var habitsMapped = []
  var days = getRecentDays()

  habits
    .sort((h1, h2) => getHour(h1.from) - getHour(h2.from))
    .forEach(h => {
      var isOnUserScreen = !!setEditingHabit
      const getTimePeriod = () => {
        switch (h.from) {
          case TIME_FROM_MORNING: return "Morning";
          case TIME_FROM_AFTERNOON: return "Afternoon"
          case TIME_FROM_EVENING: return "Evening"

          default: return "???Choose time of day, please " + h.from
        }
      }

      const onEditHabit = () => {
        if (isOnUserScreen)
          setEditingHabit(h.id)
      }
      // habitsMapped.push(<div onClick={() => {this.setEditingHabit(h.id)}} className={`left habit-container`}>
      habitsMapped.push(<div onClick={onEditHabit} className={`left habit-container`}>
        {h.name}
        <br />
        <div className="habit-date"><span>{getTimePeriod()}</span></div>
        {/*{getHour(h.from)}, {h.from},*/}
      </div>)

      days.forEach(date => {
        var d = date.getDay()
        var exists = h.schedule[d.toString()];

        var checked = !!habitProgress.find(p => isHabitDoneOnDayX(p, h.id, date))

        const onToggleProgress = ev => {
          if (isOnUserScreen)
            actions.toggleHabitProgress(h.id, date)
        }

        var content;
        if (exists)
          content = <input className="habit-checkbox" type="checkbox" checked={checked} onChange={onToggleProgress} />

        habitsMapped.push(<div>{content}</div>)
      })
    })

  return habitsMapped
}

const dow = (name, number) => {
  var isToday = number === new Date().getDate()

  return <div>
    {name}
    <br/>
    <div className={`calendar-day ${isToday ? 'current-day' : ''}`}>{number}</div>
  </div>
}
const renderTableOfDays = () => {
  var days = getRecentDays()

  return days.map(d => {
    var dayOfWeek = d.getDay()
    var day = d.getDate()

    return <div>{dow(getLiteralDayOfWeek(dayOfWeek), day)}</div>
  })
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
    var {habits} = this.state

    var editingHabit = habits.find(h => h.id === this.state.editingHabitID)
    return <div className={"plan-day-container"}>
      <div className="menu-title">Your daily routine</div>
      <div className="habits-table">
        <div className="left">
          HABITS
          <br />
        </div>
        {renderTableOfDays()}
        {getMappedHabits(habits, this.state.habitProgress, this.setEditingHabit)}
        <div className="left">
          <br />
          <button onClick={() => {this.toggleAddingPopup(true)}} className="new-habit-button">+ new habit</button>
        </div>
      </div>
      <HabitEditor habit={editingHabit} onCloseEditor={() => {this.unsetEditingHabit()}}/>
      <HabitAdder onCloseAddingPopup={() => this.toggleAddingPopup(false)} isOpen={this.state.isAddingHabitPopupOpened} />
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
          <Route path='/admin'                     element={<AdminPage/>}/>
        </Routes>
      </header>
    </div>
  </div>
}

export default App;
