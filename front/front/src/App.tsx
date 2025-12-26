import { useEffect } from 'react'
import Menu from './Menu.tsx'
import CardUpload from './CardUpload.tsx';
import Home from './Home.tsx';
import {Routes, Route} from 'react-router-dom';
import {Link} from 'react-router-dom';


import './App.css'


function App() {
  useEffect(() => {
    document.title = 'SSL-Sticker-Store'
  }, [])

  return (
    <>
    <Routes>
      <Route path="/CardUpload" element={<CardUpload />} />
      <Route path="/" element={<Home />} />
    </Routes>

    <header className="site-header">
      <Link to= "/" className='Title'>SSL Sticker Store</Link>
      <Menu/>
    </header>
    </>
  )
}

export default App

