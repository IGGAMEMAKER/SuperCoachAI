import './App.css';
import {Component, useEffect, useState} from 'react';
// import { BrowserRouter } from 'react-router-dom';
import {Link, Route, Routes} from 'react-router-dom';

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

function MainPage({}) {

  const dow = (name, number) => {
    var isToday = number === new Date().getDate()

    return <div>
      {/*<b>{name}</b>*/}
      {name}
      <br/>
      <span className={`calendar-day ${isToday ? 'current-day' : ''}`}>{number}</span>
      <br/>
    </div>
  }

  var seq = (progress) => progress.map((p, i) => ({
    date: new Date(Date.now() - i * 24 * 3600 * 1000),
    progress: p
  }))

  var clr = (r, g, b) => ({r, g, b})

  var habits = [
    {name: 'Cold shower', progress: seq([true, false, true, false]), color: clr(0, 255, 0)  },
    {name: 'Breathing',   progress: seq([true, true, true, true])  , color: clr(0, 0, 255)   },
    {name: 'Workout',     progress: seq([true, false, true, false]), color: clr(255, 0, 0)   },
    {name: 'Super long habit description for test, omg why',     progress: seq([true, false, true, false]), color: clr(255, 0, 0)   }
  ]

  var offset = 3;
  var days = []
  for (var i = -6; i <= 0; i++) {
    days.push(new Date(Date.now() + i * 24 * 3600 * 1000))
  }

  return <div>
    {/*<div>Main page</div>*/}
    <table>
      <tbody>
        <tr>
          <td className="left" style={{width: '150px'}}>HABITS</td>
          {days.map(d => {
            var dayOfWeek = d.getDay()
            var day = d.getDate()

            var isToday = day === new Date().getDate()
            // style={{backgroundColor: isToday ? 'yellow' : 'white'}}
            return <td>{dow(getLiteralDayOfWeek(dayOfWeek), day)}</td>
          })}
        </tr>
        <tr></tr>
        {habits.map(h => {
          var progressMappedToDays = days.map(d => {

          })
          return <tr>
            <td className="left">{h.name}</td>
            {days.map(d => <td><input type="checkbox" /></td>)}
            {/*{h.progress}*/}
            {/*<td style={{backgroundColor: `rgba(1,1,1,0.49)`}}>{}</td>*/}
          </tr>
        })}
        {/*<tr>*/}
        {/*  <td>Cold shower</td>*/}
        {/*  <td style={{backgroundColor: 'green'}}></td>*/}
        {/*  <td style={{backgroundColor: 'lime'}}></td>*/}
        {/*  <td style={{backgroundColor: 'limegreen'}}></td>*/}
        {/*</tr>*/}
      </tbody>
    </table>
  </div>
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
