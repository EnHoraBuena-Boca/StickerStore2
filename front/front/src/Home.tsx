import { useEffect } from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Sticker from './assets/Sticker.svg'
import Sticker1 from './assets/Sticker1.svg'
import Sticker2 from './assets/Sticker2.svg'

export default function Home() {
  return (
    <>
     <Box  sx={{ display: 'flex', justifyContent: 'center',  alignItems: 'center', width: '50vw', height: "30vh"}}>
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
    <Box  sx={{ display: 'flex', justifyContent: 'center',  alignItems: 'center', width: '50vw', height: "30vh"}}>
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
  );
}
