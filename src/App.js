import './App.css';
import {Component, useEffect, useState} from 'react';
// import { BrowserRouter } from 'react-router-dom';
import {Link, Route, Routes} from 'react-router-dom';
import storage from "./Storage";
import actions from "./actions";
import {getByID, isHabitDoneOnDayX, patchWithIDs} from "./utils";
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

function HabitSchedulePicker({onToggle, schedule}) {
  var days = [0, 1, 2, 3, 4, 5, 6]
            console.log(schedule)

  return <div>
    <center>
      <table>
        <tr>
          {days.map(d => <td>{getLiteralDayOfWeek(d)}</td>)}
        </tr>
        <tr>
          {days.map(d => {
            var checked = schedule[d]; // habit.schedule[d]
            // console.log(schedule, {checked}, d)

            return <td>
              <input
                className="habit-checkbox" type="checkbox"
                checked={!!checked}
                onChange={() => onToggle(d)}
              />
            </td>
          })}
        </tr>
      </table>
    </center>
  </div>
}
function HabitEditor({habit, onCloseEditor}) {
  var [timeFrom, setTimeFrom] = useState(habit?.from)
  var [timeTo, setTimeTo]     = useState(habit?.to)
  var [name, setHabitName]    = useState(habit?.name)

  if (!habit)
    return ''

  const close = () => {
    setTimeFrom("")
    setTimeTo("")
    onCloseEditor()
  }

  var hasName = name.length > 0

  const removeAndExit = () => {
    close();
    actions.removeHabit(habit.id)
  }

  const onEditHabitTime = (fr, to) => {
    actions.editHabitTime(habit.id, fr, to)
  }

  const onRenameHabit = ev => {
    var newName = ev.target.value;
    setHabitName(newName)

    if (newName.length)
      actions.renameHabit(habit.id, newName)
  }

  return <div key={"habit" + habit.id}>
    <div className="menu-title">{habit.name}</div>
    <br/>
    <div className="wrapper">
      <div className="habit-name-editing">
        <label>Name</label>
        <input placeholder="habit name" className="habit-name-editing-input" value={name}
               onInput={onRenameHabit} />
      </div>
      <div style={{visibility: hasName ? 'hidden' : 'visible'}} className={"error"}>{name.length} Fill in the field</div>
      <HabitTimePicker defaultFrom={timeFrom} defaultTo={timeTo} onSave={onEditHabitTime}/>
      <br/>
      <HabitSchedulePicker schedule={habit.schedule} onToggle={d => actions.toggleHabitSchedule(habit.id, d)} />

      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>

      <div className="new-habit-footer-wrapper">
        <div className="new-habit-footer">
          <button className="remove" onClick={removeAndExit}>
            <img alt="delete habit" src="https://supercoach.site/public/can.png" />
            Delete</button>
          <button className="primary" onClick={close}>Save</button>
        </div>
      </div>
    </div>
  </div>
}

function HabitTimePicker({onSave, defaultFrom = TIME_FROM_MORNING, defaultTo="12:00"}) {
  var [timeFrom, setTimeFrom] = useState(defaultFrom)
  var [timeTo, setTimeTo] = useState(defaultTo)

  const timeButton = (time, fr, to) => {
    var isChosen = timeFrom === fr;

    return <button className={`time-picking-button ${isChosen ? 'chosen' : ''}`} onClick={() => {
      setTimeFrom(fr)
      setTimeTo(to)
      onSave(fr, to)
    }}>{time}</button>
  }

  return <div className="time-picking-container">
    {timeButton('Morning',    TIME_FROM_MORNING,    '12:00')}
    {timeButton('Afternoon',  TIME_FROM_AFTERNOON,  '16:00')}
    {timeButton('Evening',    TIME_FROM_EVENING,    '20:00')}
  </div>
}

function HabitAdder({isOpen, onCloseAddingPopup}) {
  var [text, setText]         = useState("Habit 1")
  var [timeFrom, setTimeFrom] = useState(TIME_FROM_MORNING)
  var [timeTo, setTimeTo]     = useState(TIME_FROM_AFTERNOON)
  var [schedule, setSchedule] = useState({0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1})
  var [isHabitCreated, setHabitCreated] = useState(false)

  if (!isOpen)
    return ''

  if (isHabitCreated) {
    return <div className="wrapper">
      <img alt="habit created" className="thumbs-up" src="https://supercoach.site/public/thumbs_up_symbol.png" />
      {/*<div className="thumbs-up" />*/}
      <div className="habit-created-title">Habit added!</div>
      <div className="habit-created-description">You can edit this any time</div>
      <button className="secondary full habit-created-close" onClick={() => {
        onCloseAddingPopup()
        setHabitCreated(false)
      }}>Close</button>
    </div>
  }

  var hasText = text.length
  var hasFromTime = timeFrom.length
  var canSave = hasText && hasFromTime && timeTo.length


  var onAdd = () => {
    actions.addHabit(text, timeFrom, timeTo, schedule)
    setHabitCreated(true)
    setText("")
    setTimeTo("00:00")
    setTimeFrom(timeTo)
  }

  var onTextChange = ev => setText(ev.target.value)
  var onScheduleToggle = d => {
    var oldVal = schedule[d]
    var newVal = !schedule[d];

    schedule[d] = newVal
    console.log({oldVal, newVal, schedule})
    setSchedule(JSON.parse(JSON.stringify(schedule)))
  }

  return <div>
    <div className="menu-title">New habit</div>
    <br/>
    <div className="wrapper">
      <input autoFocus className="new-habit-input" type="text" placeholder="add new habit" value={text}
             onChange={onTextChange}/>
      <div className={"from-to-form"}>
        <HabitTimePicker defaultFrom={TIME_FROM_MORNING} defaultTo={TIME_FROM_AFTERNOON} onSave={(fr, to) => {
          setTimeFrom(fr)
          setTimeTo(to)
        }}/>
      </div>
      <div>
        <HabitSchedulePicker schedule={schedule} onToggle={onScheduleToggle} />
      </div>
      <br />
      <br />
      <br />
      <br />
      <div className="new-habit-footer-wrapper">
        <div className={"new-habit-footer"}>
          <button className="secondary" onClick={onCloseAddingPopup}>Cancel</button>
          <button
            // className={`primary new-habit-button new-habit-button-confirm ${canSave ? '' : 'disabled'}`}
            className={`primary ${canSave ? '' : 'disabled'}`}
            onClick={onAdd}
            disabled={!canSave}
          >Save
          </button>
        </div>
      </div>
    </div>
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

  return <div className={`calendar-day ${isToday ? 'current-day' : ''}`}>
    {name}
    <br/>
    <div>{number}</div>
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

class EditHabitPage extends Component {
  render() {
    return 'EDIT HABIT PAGE'
  }
}

class Footer extends Component {
  render() {
    const menu = (src, text, url, needsClick) => {
      // var isChosen =
      return <Link to={url} className={"footer-menu-wrapper"}>
        <img alt="" className={`footer-menu-img ${src}`}
             src={`https://supercoach.site/public/${src}${document.location.pathname === url ? '-chosen' : ''}.png`}/>
        <div className={"footer-menu-text"}>{text}</div>
      </Link>
    }

    return <div className="footer">
      <div className="footer-grid">
        {menu("home", "Home", "/")}
        {menu("coach", "Coach", "/coach")}
        {/*{menu("habits", "Habits", "/habits")}*/}
        {menu("habits", "Quiz", "/quiz")}
        {/*{menu("account", "Account")}*/}
      </div>
    </div>
  }
}

class HabitsPage extends Component {
  render() {
    return <div>
      <div>
        <div className="menu-title">Habits</div>
      </div>
      <Footer />
    </div>
  }
}

class QuizPage extends Component {
  state = {
    quiz: {
      '1': [], // if it's just a number, it means, that answer was chosen
      '2': [],
      '3': [], // multiple answers

      // '4': 'input text'
    },

    passed: false
  }

  render() {
    const onSaveQuiz = (name) => {
      console.log('onSaveQuiz', name)
      post('/quiz/1', {quiz: this.state.quiz})
        .then(r => {
          console.log('response', r)
        })
        .catch(err => {
          console.error('saving quiz1 failed', err)
        })
    }

    if (this.state.passed) {
      return <div>
        <div className="wrapper">
          <img alt="habit created" className="thumbs-up" src="https://supercoach.site/public/thumbs_up_symbol.png" />
          <div className="habit-created-title" style={{marginBottom: '42px'}}>Thank you!</div>
          <Link to={"/"}>
            <button className="secondary full habit-created-close">Start</button>
          </Link>
        </div>
      </div>
    }

    var questions = [
      {
        id: 1,
        text: 'Age',
        answers: [
          {id: 1, text: 'Under 20'},
          {id: 2, text: '20-29'},
          {id: 3, text: '30-39'},
          {id: 4, text: '40-49'},
          {id: 5, text: '50+'},
        ]
      },
      {
        id: 2,
        text: 'Gender',
        answers: [
          {id: 1, text: 'Male'},
          {id: 2, text: 'Female'},
          {id: 3, text: 'Other'},
        ]
      },
      {
        id: 3,
        text: 'Which of these do you often struggle with?',
        vertical: true,
        multiple: true,
        answers: [
          {id: 1, text: 'Low productivity'},
          {id: 2, text: 'Lack of strategy/planning'},
          {id: 3, text: 'Problems with concentration'},
          {id: 4, text: 'Procrastination'},
          {id: 5, text: 'Forgetting to do things'},
          {id: 6, text: 'High level of stress'},
          {id: 7, text: 'Mood swings'},
        ]
      },
    ]

    const isAnswerChosen = (questionId, answerId) => this.state.quiz[questionId].includes(answerId)
    const onToggleAnswer = (question, questionId, answerId) => {
      if (isAnswerChosen(questionId, answerId)) {
        // if was chosen => remove
        this.state.quiz[questionId] = this.state.quiz[questionId].filter(a => a !== answerId);
      } else {
        if (!question.multiple)
          this.state.quiz[questionId] = []

        this.state.quiz[questionId].push(answerId)
      }

      this.setState({quiz: this.state.quiz})
    }

    const quiz = this.state.quiz
    const canSaveQuiz = quiz[1].length && quiz[2].length && quiz[3].length

    return <div className="wrapper">
      <div className="quiz-lets-start">Let's start!</div>
      {questions.map(q => {
        return <div>
          <div className="quiz-question-title">{q.text}</div>
          <div className={`quiz-answers-container ${q.vertical ? 'vertical' : ''}`}>
            {q.answers.map(a => <button className={`${isAnswerChosen(q.id, a.id) ? 'primary' : 'secondary'}`} onClick={() => {onToggleAnswer(q, q.id, a.id)}}>{a.text}</button>)}
            {!q.answers.length ? <input/> : ''}
          </div>
        </div>
      })}

      <button
        disabled={!canSaveQuiz}
        className={`quiz-done-button ${canSaveQuiz ? '' : 'disabled'} full ${canSaveQuiz ? 'primary' : 'secondary'}`}
        onClick={() => {
          onSaveQuiz("link")
          this.setState({passed: true})}
        }
      >Done</button>
    </div>
  }
}

class CoachPage extends Component {
  render() {
    return <div>
      <div>
        <div className="menu-title">Coach</div>
      </div>
      <Footer />
    </div>
  }
}

class MainPage extends Component {
  state = {
    habits: [],
    habitProgress: [],
    isAddingHabitPopupOpened: false,
    editingHabitID: -1,
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

    var startAddingHabitsImage;
    if (!habits.length) {
      startAddingHabitsImage = <div className="wrapper">
        <img alt="no habits yet" className="no-habits-img" src="https://supercoach.site/public/magnifying_glass.png" />
        <div className="habit-created-description">Here's nothing yet...</div>
      </div>
    }

    const mainPage = <div>
      <div className="menu-title">Daily routine</div>
      <div className="habits-table">
        <div className="left">
          HABITS
          <br />
          {/*<a href="edit">Edit</a>*/}
          {/*<Link to="/edit">Edit</Link>*/}
        </div>
        {renderTableOfDays()}
        {getMappedHabits(habits, this.state.habitProgress, this.setEditingHabit)}
      </div>
      {startAddingHabitsImage}
      <div className="left new-habit-button-wrapper">
        <br />
        <button
          onClick={() => {this.toggleAddingPopup(true)}}
          className="primary new-habit-button"
        >Add habit</button>
      </div>
    </div>

    if (editingHabit)
      return <HabitEditor habit={editingHabit} onCloseEditor={this.unsetEditingHabit} />

    var {isAddingHabitPopupOpened} = this.state
    if (isAddingHabitPopupOpened) {
      return <HabitAdder
        onCloseAddingPopup={() => this.toggleAddingPopup(false)}
        isOpen={isAddingHabitPopupOpened}
      />
    }

    return <div className={"plan-day-container"}>
      {mainPage}
      <Footer />
    </div>
  }
}

function App() {
  // App-header
  // style={{backgroundColor: '#282c34'}}
  var seconds = 0 ; //new Date().getUTCSeconds()

  var theme = seconds % 6 < 3 ? 'light' : 'dark'

  return <div>
    <div className="App" data-theme={theme}>
      <header className="" style={{height: '100%', minHeight: '100vh'}}>
        <Routes>
          <Route path='/'                     element={<MainPage/>}/>
          <Route path='/quiz'                     element={<QuizPage/>}/>
          <Route path='/coach'                     element={<CoachPage/>}/>
          <Route path='/habits'                     element={<HabitsPage/>}/>
          <Route path='/edit'                 element={<EditHabitPage/>}/>
          <Route path='/admin'                element={<AdminPage/>}/>
        </Routes>
      </header>
    </div>
  </div>
}

export default App;
