import './App.css';
import {Component, useEffect, useState} from 'react';
// import { BrowserRouter } from 'react-router-dom';
import {Link, Route, Routes} from 'react-router-dom';

function MainPage({}) {
  const dow = (name, number) => <div>
    <b>{name}</b>
    <br />
    {number}
  </div>

  var seq = (progress) => progress.map((p, i) => ({
    date: new Date(Date.now() - i * 24 * 3600 * 1000),
    progress: p
  }))

  var clr = (r, g, b) => ({r, g, b})

  var habits = [
    {name: 'Cold shower', progress: seq([true, false, true, false]), color: clr(0, 255, 0)  },
    {name: 'Breathing',   progress: seq([true, true, true, true])  , color: clr(0, 0, 255)   },
    {name: 'Workout',     progress: seq([true, false, true, false]), color: clr(255, 0, 0)   }
  ]

  return <div>
    {/*<div>Main page</div>*/}
    <table>
      <tbody>
        <tr>
          <td style={{width: '150px'}}>HABITS</td>
          <td>{dow('MON', 1)}</td>
          <td>{dow('TUE', 2)}</td>
          <td>{dow('WED', 3)}</td>
          <td>{dow('THU', 4)}</td>
          <td>{dow('FRI', 5)}</td>
          <td>{dow('SAT', 6)}</td>
          <td>{dow('SUN', 7)}</td>
        </tr>
        {habits.map(h => {
          return <tr>
            <td>{h.name}</td>
            {/*{h.progress}*/}
            {/*<td style={{backgroundColor: `rgba(1,1,1,0.49)`}}>{}</td>*/}
          </tr>
        })}
        <tr>
          <td>Cold shower</td>
          <td style={{backgroundColor: 'green'}}></td>
          <td style={{backgroundColor: 'lime'}}></td>
          <td style={{backgroundColor: 'limegreen'}}></td>
          {/*<td style={{backgroundColor: 'greenyellow'}}></td>*/}
        </tr>
      </tbody>
    </table>
  </div>
}

function App() {
  return <div>
    <div className="App">
      <header className="App-header" style={{height: '100%', minHeight: '100vh'}}>
        <Routes>
          <Route path='/'                     element={<MainPage/>}/>
        </Routes>
      </header>
    </div>
  </div>
}

export default App;
