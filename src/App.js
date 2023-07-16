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

  return <div>
    {/*<div>Main page</div>*/}
    <table>
      <tbody>
        <tr>
          <td style={{width: '150px'}}>HABITS</td>
          <td>{dow('MON', 1)}</td>
          <td>{dow('TUE', 2)}</td>
          <td>{dow('WED', 3)}</td>
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
