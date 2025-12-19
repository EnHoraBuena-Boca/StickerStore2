import { useEffect } from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Sticker from './assets/Sticker.svg'
import Sticker1 from './assets/Sticker1.svg'
import Sticker2 from './assets/Sticker2.svg'
import Menu from './Menu.tsx'
import './App.css'


function App() {
  useEffect(() => {
    document.title = 'SSL-Sticker-Store'
  }, [])

  return (
    <>
    <header className="site-header">
      <div className='Title'>SSL Sticker Store</div>
      <Menu/>
    </header>
     <Box  sx={{ display: 'flex', justifyContent: 'center',  alignItems: 'center', width: '100vw', height: "30vh"}}>
      <Grid container spacing={4} sx={{ width: 500, height: 250 }} justifyContent="center" alignItems="center" >
        <Grid display="flex" justifyContent="center" alignItems="center" size="grow">
          <img src={Sticker} />
        </Grid>
        <Grid display="flex" justifyContent="center" alignItems="center" size = "grow">
           <img src={Sticker1} />
        </Grid>
        <Grid display="flex" justifyContent="center" alignItems="center" size="grow">
           <img src={Sticker2} />
        </Grid>
      </Grid>
    </Box>
    <Box  sx={{ display: 'flex', justifyContent: 'center',  alignItems: 'center', width: '100vw', height: "30vh"}}>
      <Grid container spacing={4} sx={{ width: 500, height: 100 }} justifyContent="center" alignItems="center" >
        <Grid display="flex" justifyContent="center" alignItems="center" size = "grow">
           <img src={Sticker2} />
        </Grid>
        <Grid display="flex" justifyContent="center" alignItems="center" size = "grow">
           <img src={Sticker1} />
        </Grid>
        <Grid display="flex" justifyContent="center" alignItems="center" size="grow">
           <img src={Sticker} />
        </Grid>
      </Grid>
    </Box>
    </>
  )
}

export default App

