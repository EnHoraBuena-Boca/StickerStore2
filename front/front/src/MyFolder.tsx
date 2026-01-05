import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import { UserCards, UserCardCount, CardsWithParams } from "./components/UserCardApi.ts";
import { cld } from "./lib/cloudinary.ts";
import { AdvancedImage, placeholder, lazyload } from "@cloudinary/react";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

interface Cards {
  card_name: string;
  api_id: string;
  cardtype: string;
}
const style = {
  display: "grid",
  gridTemplateRows: "auto auto",
  gap: 2,
  justifyContent: "center",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: 700,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

async function getUserCards(page: number, rows: number): Promise<Cards[]> {
  const result = await UserCards(page, rows);
  return result;
}
async function getUserCardCount(): Promise<number> {
  const result = await UserCardCount();
  return result;
}
export default function FixedBottomNavigation() {
  const [value, setValue] = React.useState(0);
  const [cardCount, setcardCount] = React.useState(0);
  const [link, setLink] = React.useState<string | undefined>(undefined);
  const [cardName, setcardName] = React.useState<string | undefined>(undefined);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [cards, setCards] = React.useState<Cards[]>([]);
  const [open, setOpen] = React.useState(false);
  const [rarity, setRarity] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setRarity(event.target.value as string);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = new FormData(event.currentTarget);
    CardsWithParams(raw).then((result: any) => {
      setCards(result);
      setcardCount(result.length);

    });
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const ref = React.useRef<HTMLDivElement>(null);
  async function loadCards() {
    const data = await getUserCards(page + 1, rowsPerPage);
    setCards(data);
  }
  async function getCardCount() {
    const result = await getUserCardCount();
    setcardCount(result);
  }
  React.useEffect(() => {
    getCardCount();
    loadCards();
  }, [value]);

  React.useEffect(() => {
    loadCards();
  }, [page, rowsPerPage]);

  const cardTypeColor: Record<string, string> = {
    Common: "blue",
    Uncommon: "green",
    Rare: "purple",
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null, // Keep or it breaks the code, idk why
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Box
        sx={{
          pb: 7,
          height: "90vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
        }}
        ref={ref}
      >
        <CssBaseline />
        <List>
          {cards.map(({ card_name, api_id, cardtype }) => (
            <ListItemButton
              onClick={() => {
                setLink(`Stickers/${cardtype}/${api_id}`);
                setcardName(card_name);
                handleOpen();
              }}
              sx={{
                width: 500,
                height: 200,
                backgroundColor: cardTypeColor[cardtype] ?? "grey",
              }}
            >
              <ListItemAvatar>
                <AdvancedImage
                  cldImg={cld.image(`Stickers/${cardtype}/${api_id}`)}
                  height="150px"
                  plugins={[lazyload(), placeholder()]}
                />
              </ListItemAvatar>
              <ListItemText
                primary={card_name}
                secondary={cardtype}
                sx={{ textAlign: "center", width: "100vw" }}
              />
            </ListItemButton>
          ))}
          <TablePagination
            component="div"
            count={cardCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </List>

        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100vw",
              gap: 2,
            }}
          >
            <FormControl>
              <InputLabel id="Rarity">Rarity</InputLabel>
              <Select
                labelId="RarityType"
                id="type"
                name="type"
                value={rarity}
                label="Rarity"
                onChange={handleChange}
                sx={{ width: "100px" }}
              >
                <MenuItem value={"Common"}>Common</MenuItem>
                <MenuItem value={"Uncommon"}>Uncommon</MenuItem>
                <MenuItem value={"Rare"}>Rare</MenuItem>
              </Select>
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="CardName"
              label="Card Name"
              variant="filled"
            />
            <Button variant="contained" type="submit" sx={{ height: "25px" }}>
              Search
            </Button>
            <Button variant="contained" sx={{ height: "25px" }} onClick={() => {window.location.reload()}}>
              Reset
            </Button>
          </Box>
        </Paper>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <AdvancedImage
            cldImg={cld.image(link)}
            style={{
              height: "500px",
              border: "3px solid black",
              display: "block",
              margin: "0 auto",
            }}
          />
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ textAlign: "center" }}
          >
            {cardName}
          </Typography>
        </Box>
      </Modal>
    </>
  );
}
