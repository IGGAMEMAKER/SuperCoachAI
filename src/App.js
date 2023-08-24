import './App.css';
import {Component, useEffect, useState} from 'react';
import {Link, Route, Routes, redirect} from 'react-router-dom';

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

    // return <button className={`time-picking-button ${isChosen ? 'chosen' : ''}`} onClick={() => {
    return <button className={`${isChosen ? 'primary' : 'secondary'}`} onClick={() => {
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
      <input autoFocus className="new-habit-input" type="text" placeholder="Name" value={text}
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
        var isSenderAI = m.sender === "-2"
        var isUser = !isSenderAdmin

        var style = {
          textAlign: isUser ? 'left' : 'right',
          marginBottom: '5px'
        }

        if (isUser) {
          style.backgroundColor = 'red';
          style.color = 'white'
          style.fontWeight = '900'
        }

        if (isSenderAdmin) {
          style.backgroundColor = 'blue'
        }

        if (isSenderAI) {
          style.backgroundColor = 'lightblue'
        }

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
  state={
    passedQuiz2: true
  }
  saveQuizzes() {
    this.setState({
      passedQuiz2: storage.isPassedQuiz2()
    })
  }
  componentWillMount() {
    storage.addChangeListener(() => {
      console.log('store listener')
      this.saveQuizzes()
    })

    this.saveQuizzes()
    actions.loadProfile()
  }

  render() {
    // return ''
    const menu = (name, text, url, needsClick) => {
      var isChosen = document.location.pathname === url
      var src = `https://supercoach.site/public/${name}${isChosen ? '-chosen' : ''}.png`
      var badge;
      if (needsClick)
        badge = <div className="footer-menu-click-badge" />

      return <Link to={url} className={"footer-menu-wrapper"}>
        <img alt="" className={`footer-menu-img ${name}`} src={src} />
        <div className={"footer-menu-text"}>{text}</div>
        {badge}
      </Link>
    }

    return <div className="footer">
      <div className="footer-grid">
        {menu("home", "Home", "/", false)}
        {menu("coach", "Coach", "/coach", !this.state.passedQuiz2)}
        {menu("habits", "Habits", "/habits", false)}
        {/*{menu("habits", "Quiz", "/quiz/1")}*/}
        {/*{menu("habits", "Quiz2", "/quiz/2")}*/}
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


const onSaveQuiz = (quiz, num) => {
  console.log('onSaveQuiz', num)
  post('/quiz/' + num, {quiz})
    .then(r => {
      console.log('response', r)
    })
    .catch(err => {
      console.error('saving quiz1 failed', err)
    })
}

const Q2_TOPIC_HEALTH = 'Health'
const Q2_TOPIC_EMOTIONS = 'Emotions'
const Q2_TOPIC_PRODUCTIVITY = 'Productivity'
const Q2_TOPIC_SOCIAL = 'Social'

class QuizPageBase extends Component {
  state = {
    quiz: {
      '1': [], // if it's just a number, it means, that answer was chosen
      '2': [],
      '3': [], // multiple answers

      // '4': 'input text'
    },

    passed: false,
    topic: Q2_TOPIC_HEALTH
  }

  isFirstQuiz = () => this.props.num === 1;
  isSecondQuiz = () => this.props.num === 2;

  getTopics = () => {
    if (this.isFirstQuiz())
      return []

    if (this.isSecondQuiz())
      return [Q2_TOPIC_HEALTH, Q2_TOPIC_EMOTIONS, Q2_TOPIC_PRODUCTIVITY, Q2_TOPIC_SOCIAL];
  }

  isAnsweredAll = (ids = []) => {
    return ids.every(id => {
      var a = this.state.quiz[id]

      return a?.length
      // return a?.id || a?.length
    })
  }

  getGoNextButton = (quiz, num, questions) => {
    var canSaveQuiz
    if (this.isFirstQuiz())
      canSaveQuiz = this.isAnsweredAll([1, 2, 3]); // quiz[1].length && quiz[2].length && quiz[3].length
    else
      canSaveQuiz = this.isAnsweredAll([18, 19]) // TODO assuming, that other questions are filled!

    var saveQuizButton = <button
      disabled={!canSaveQuiz}
      className={`quiz-done-button ${canSaveQuiz ? '' : 'disabled'} full ${canSaveQuiz ? 'primary' : 'secondary'}`}
      onClick={() => {
        onSaveQuiz(this.state.quiz, num)
        this.setState({passed: true})}
      }
    >Done</button>

    if (this.isFirstQuiz())
      return saveQuizButton;

    const goToTopic = topic => () => {
      window.scrollTo(0, 0);
      this.setState({topic})
    }

    var goNext = topic => {
      var disabled = !this.isAnsweredAll(questions.map(q => q.id))
      return <button disabled={disabled} className={`primary ${disabled ? 'disabled' : ''}`} onClick={goToTopic(topic)}>Next</button>
    }
    var goPrevious = topic => <button className="secondary" onClick={goToTopic(topic)}>Previous</button>

    switch (this.state.topic) {
      case Q2_TOPIC_HEALTH:
        return <div className="quiz-navigation-container">
          {goNext(Q2_TOPIC_EMOTIONS)}
        </div>

      case Q2_TOPIC_EMOTIONS:
        return <div className="quiz-navigation-container two">
          {goPrevious(Q2_TOPIC_HEALTH)}
          {goNext(Q2_TOPIC_PRODUCTIVITY)}
        </div>

      case Q2_TOPIC_PRODUCTIVITY:
        return <div className="quiz-navigation-container two">
          {goPrevious(Q2_TOPIC_EMOTIONS)}
          {goNext(Q2_TOPIC_SOCIAL)}
        </div>

      case Q2_TOPIC_SOCIAL:
        return <div className="quiz-navigation-container">
          {saveQuizButton}
        </div>
    }
  }

  render() {
    var {questions, num} = this.props;

    if (this.isSecondQuiz()) {
      questions = this.props.questions.filter(q => q.topic === this.state.topic)
    }

    if (this.state.passed) {
      return <div>
        <div className="wrapper">
          <img alt="habit created" className="thumbs-up" src="https://supercoach.site/public/thumbs_up_symbol.png" />
          <div className="habit-created-title" style={{marginBottom: '42px'}}>Thank you!</div>
          <Link to={"/"}>
            <button onClick={() => {actions.loadProfile()}} className="secondary full habit-created-close">{this.isFirstQuiz() ? 'Start' : 'Close'}</button>
          </Link>
        </div>
      </div>
    }

    const isAnswerChosen = (questionId, answerId) => {
      try {
        return this.state.quiz[questionId].includes(answerId)
      } catch (e) {
        return false;
      }
    }

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

    var goNextButton = this.getGoNextButton(quiz, num, questions)
    var topicsTab = this.getTopics().map(t => <div className={`quiz-topics-item ${this.state.topic === t ? 'chosen' : ''}`}>{t}</div>)
    var chosenTopicOffset = 0
    if (this.isSecondQuiz()) {
      chosenTopicOffset = this.getTopics().findIndex(t => t === this.state.topic);
    }

    //
    return <div className="wrapper">
      <div className="quiz-lets-start">Let's start!</div>
      <div className="quiz-topics-container" style={{marginLeft: `calc(50% - ${chosenTopicOffset * 84}px - 50px)`}} >{topicsTab}</div>
      {questions.map(q => {
        var answers;
        var maxLength = 86

        if (!q.answers.length) {
          const onSaveInput = ev => {
            var val = ev.target.value.substring(0, maxLength)
            console.log("save input", q.id, val)

            this.state.quiz[q.id] = val
            this.setState({quiz: this.state.quiz})
          }

          // input
          answers = <div style={{position: 'relative'}}>
            <textarea maxLength={maxLength} onChange={onSaveInput} className="quiz-input-answer" placeholder="Write here" />
            <span className={"quiz-input-answer-remaining-symbols"}>{quiz[q.id]?.length || 0}/{maxLength}</span>
          </div>
        } else {
          answers = q.answers.map(a => <button
            className={`${isAnswerChosen(q.id, a.id) ? 'primary' : 'secondary'}`}
            onClick={() => {onToggleAnswer(q, q.id, a.id)}}
          >{a.text}
          </button>)
        }

        return <div>
          <div className="quiz-question-title">{q.text}</div>
          <div className={`quiz-answers-container ${q.vertical ? 'vertical' : ''}`}>
            {answers}
          </div>
        </div>
      })}

      {goNextButton}
    </div>
  }
}

class QuizPage extends Component {
  render() {
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

    return <QuizPageBase questions={questions} num={1} />
  }
}

class QuizPage2 extends Component {
  render() {
    const ANSWERS_NEVER_TO_OFTEN = [
      {id: 1, text: 'Never'},
      {id: 2, text: 'Rarely'},
      {id: 3, text: 'Sometimes'},
      {id: 4, text: 'Often'},
    ]
    const ANSWERS_EMOJI = [
      {id: 1, text: '😫'},
      {id: 2, text: '😞'},
      {id: 3, text: '😐'},
      {id: 4, text: '🙂'},
      {id: 5, text: '😍'},
    ]
    const ANSWERS_INPUT_TEXT = []

    var questions = [
      {
        id: 1,
        topic: Q2_TOPIC_HEALTH,
        text: 'How many hours of uninterrupted sleep do you get on an average night?',
        answers: [
          {id: 1, text: '<4'},
          {id: 2, text: '5'},
          {id: 3, text: '6'},
          {id: 4, text: '7'},
          {id: 5, text: '8+'},
        ]
      },
      {
        id: 2,
        topic: Q2_TOPIC_HEALTH,
        text: 'Do you often wake up feeling refreshed and rested?',
        answers: [
          {id: 1, text: 'Yes'},
          {id: 2, text: 'No'},
        ]
      },
      {
        id: 3,
        topic: Q2_TOPIC_HEALTH,
        text: 'How many times a week do you engage in physical activity for more than 30 minutes?',
        answers: [
          {id: 1, text: '<4'},
          {id: 2, text: '5'},
          {id: 3, text: '6'},
          {id: 4, text: '7'},
          {id: 5, text: '8+'},
        ]
      },
      {
        id: 4,
        topic: Q2_TOPIC_HEALTH,
        text: 'How would you describe your average daily diet in terms of nutritional balance? Are you happy with your diet?',
        answers: ANSWERS_INPUT_TEXT
      },
      {
        id: 5,
        topic: Q2_TOPIC_HEALTH,
        text: 'How many cups of coffee do you usually \ndrink daily?',
        answers: [
          {id: 1, text: '1'},
          {id: 2, text: '2'},
          {id: 3, text: '3'},
          {id: 4, text: '4'},
          {id: 5, text: '5+'},
        ]
      },
      {
        id: 6,
        topic: Q2_TOPIC_HEALTH,
        text: 'How many ml of water do you usually drink?',
        answers: [
          {id: 1, text: '0'},
          {id: 2, text: '500'},
          {id: 3, text: '1000'},
          {id: 4, text: '1500'},
          {id: 5, text: '2000+'},
        ]
      },
      {
        id: 7,
        topic: Q2_TOPIC_HEALTH,
        text: 'How often do you consume alcoholic beverages?',
        answers: ANSWERS_NEVER_TO_OFTEN
      },
      {
        id: 8,
        topic: Q2_TOPIC_HEALTH,
        text: 'How often do you consume tobacco products?',
        answers: ANSWERS_NEVER_TO_OFTEN
      },

      {
        id: 9,
        topic: Q2_TOPIC_EMOTIONS,
        text: 'How would you describe your mood \n' +
          'on most days?',
        answers: ANSWERS_EMOJI
      },
      {
        id: 10,
        topic: Q2_TOPIC_EMOTIONS,
        text: 'How often in a week do you feel emotions that seem uncontrollable or overwhelming?',
        answers: ANSWERS_NEVER_TO_OFTEN
      },
      {
        id: 11,
        topic: Q2_TOPIC_EMOTIONS,
        text: 'How often do you feel truly motivated \n' +
          'to pursue your goals?',
        answers: ANSWERS_NEVER_TO_OFTEN
      },
      {
        id: 12,
        topic: Q2_TOPIC_EMOTIONS,
        text: 'How often do you feel comfortable expressing your emotions to others?',
        answers: ANSWERS_NEVER_TO_OFTEN
      },
      {
        id: 13,
        topic: Q2_TOPIC_EMOTIONS,
        text: 'What activities or hobbies bring you the most happiness or satisfaction?',
        answers: ANSWERS_INPUT_TEXT
      },


      {
        id: 14,
        topic: Q2_TOPIC_PRODUCTIVITY,
        text: 'How often do you end your day feeling like you\'ve accomplished what you set out to do?',
        answers: ANSWERS_NEVER_TO_OFTEN
      },
      {
        id: 15,
        topic: Q2_TOPIC_PRODUCTIVITY,
        text: 'How often do you set daily goals, and how frequently are they met?',
        answers: ANSWERS_NEVER_TO_OFTEN
      },
      {
        id: 16,
        topic: Q2_TOPIC_PRODUCTIVITY,
        text: 'What is a goal that you’ve wanted to achieve but haven’t yet taken steps towards?',
        answers: ANSWERS_INPUT_TEXT
      },
      {
        id: 17,
        topic: Q2_TOPIC_PRODUCTIVITY,
        text: 'How would you rate your ability to relax and switch off from work or responsibilities?',
        answers: ANSWERS_EMOJI
      },

      {
        id: 18,
        topic: Q2_TOPIC_SOCIAL,
        text: 'How often do you engage in social activities or meet with friends/family?',
        answers: ANSWERS_NEVER_TO_OFTEN
      },
      {
        id: 19,
        topic: Q2_TOPIC_SOCIAL,
        text: 'How would you rate the quality of your social interactions and connections?',
        answers: ANSWERS_EMOJI
      },
    ]

    return <QuizPageBase questions={questions} num={2} />
  }
}

class CoachPage extends Component {
  saveQuizzes() {
    this.setState({
      passedQuiz2: storage.isPassedQuiz2()
    })
  }
  componentWillMount() {
    storage.addChangeListener(() => {
      console.log('store listener')
      this.saveQuizzes()
    })

    this.saveQuizzes()
    actions.loadProfile()
  }

  render() {
    if (this.state.passedQuiz2) {
      return <div className={"plan-day-container"}>
        <div>
          <div className="menu-title">Coach</div>
        </div>
        <div className="wrapper">
          <img alt="session started" className="coach-session-started-already-img" src="https://supercoach.site/public/mobile.png" />
          <div className="coach-title">
            You've already started a coaching session in Telegram chat!
          </div>
          <div className="coach-session-description">
            Close the app and send a message in telegram chat
          </div>
        </div>
        <Footer />
      </div>
    }

    return <div className={"plan-day-container"}>
      <div>
        <div className="menu-title">Coach</div>
      </div>
      <div className="wrapper">
        <div className="coach-title">
          Engage in a coaching session with <span>ChatGPT</span>, trained in line with ICF standards:
        </div>
        <div className="coach-goals">
          <div className="coach-goals-item">Targeted questions for self-reflection</div>
          <div className="coach-goals-item">Clear goals, actionable insights, in less time</div>
          <div className="coach-goals-item">Seamless integration into your day</div>
        </div>
        <div className="coach-session-description">
          Sessions take place in the Telegram chat.
          It's recommended to allocate about 25 minutes per session, but you can also respond throughout the day. If no reply is given within 12 hours, the coach will conclude the session.
        </div>
        {/*<img alt="start session" className="coach-session-start-img" src="https://supercoach.site/public/medical_cross.png" />*/}
        <Link to={"/quiz/2"}>
          <button className="primary full">Start session</button>
        </Link>
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
    passedQuiz1: true,
    profileLoaded: false
  }

  saveHabits() {
    // if (storage.isProfileLoaded() && !storage.isPassedQuiz1()) {
    //   console.log('will redirect')
    //   // const navigate = url => {
    //   //   window.location.href = domain + url
    //   // }
    //   // redirect('/quiz/1')
    // } else {
    // }

    this.setState({
      habits: storage.getHabits(),
      habitProgress: storage.getHabitProgress(),
      passedQuiz1: storage.isPassedQuiz1(),
      profileLoaded: storage.isProfileLoaded()
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
    actions.loadProfile()
  }

  render() {
    var {habits} = this.state

    if (!this.state.profileLoaded)
      return ''

    if (!this.state.passedQuiz1) {
      return <QuizPage />
    }

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

      <div className="new-habit-button-wrapper">
        <button
          onClick={() => {this.toggleAddingPopup(true)}}
          className="primary new-habit-button"
        >Add habit</button>
      </div>
      {/*<div className="left new-habit-button-wrapper">*/}
      {/*  <br />*/}
      {/*  <button*/}
      {/*    onClick={() => {this.toggleAddingPopup(true)}}*/}
      {/*    className="primary new-habit-button"*/}
      {/*  >Add habit</button>*/}
      {/*</div>*/}
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
  var seconds = 0 ; //new Date().getUTCSeconds()

  var theme = seconds % 6 < 3 ? 'light' : 'dark'
  theme = storage.getTheme();

  return <div>
    <div className="App" data-theme={theme}>
      <header className="" style={{height: '100%', minHeight: '100vh'}}>
        <Routes>
          <Route path='/'                     element={<MainPage/>}/>
          <Route path='/quiz/1'                     element={<QuizPage/>}/>
          <Route path='/quiz/2'                     element={<QuizPage2/>}/>
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
