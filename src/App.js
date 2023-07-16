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

    var habitsMapped = []
    habits.forEach(h => {
      habitsMapped.push(<div className="left">{h.name}</div>)
      days.forEach(d => {
        habitsMapped.push(<div><input className="habit-checkbox" type="checkbox"/></div>)
      })
    })

    return <div>
      <div className="habits-table">
        <div className="left">HABITS</div>
        {days.map(d => {
          var dayOfWeek = d.getDay()
          var day = d.getDate()

          return <div>{dow(getLiteralDayOfWeek(dayOfWeek), day)}</div>
        })}
        {habitsMapped}
        <div className="left">
          <FieldAdder placeholder="add new habit" onAdd={val => actions.addHabit(val)} defaultButtonClass="new-habit-button" defaultWord={"+ new habit"}/>
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
