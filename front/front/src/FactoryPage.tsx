import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import { cld } from "./lib/cloudinary.ts";
import { AdvancedImage, placeholder, lazyload } from "@cloudinary/react";
import Grid from "@mui/material/Grid";
import { AnimatePresence, motion } from "motion/react";

import { TradingCardLookup, FactoryPack } from "./api/UserCardApi.ts";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import RequirementsTable from "./components/RequirementsTable.tsx";
import type { SelectChangeEvent } from "@mui/material/Select";

type CardItem = {
  card_name: string;
  season: number;
  api_id: string;
  uuid: string;
  cardtype: string;
};

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: 100,
  height: 160,
  position: "relative",
};

const button: React.CSSProperties = {
  backgroundColor: "#0cdcf7",
  borderRadius: "10px",
  padding: "10px 20px",
  color: "#0f1115",
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
};

export default function FactoryPage() {
  const [rarity, setRarity] = React.useState("");
  const [tradeRarity, setTradeRarity] = React.useState(Array(3).fill(""));
  const [isVisible, setIsVisible] = React.useState<boolean[]>(
    Array(3).fill(false),
  );
  const [cards, setCards] = React.useState<CardItem[][]>(
    Array(3).fill(undefined),
  );
  const [image, setImage] = React.useState<(CardItem | undefined)[]>(
    Array(3).fill(undefined),
  );
  const [selectedCardId, setSelectedCardId] = React.useState<string>("");
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [packVisible, setPackVisible] = React.useState(false);

  const [newCard, setNewCard] = React.useState<CardItem | undefined>(undefined);
  const handleChange = (event: SelectChangeEvent) => {
    setRarity(event.target.value);
    setCanSubmit(true);
  };

  async function CardLookup(index: number, rarity: string) {
    const result = await TradingCardLookup(rarity, undefined);
    setCards((prev) => {
      const next = [...prev];
      next[index] = result.map((card: any) => ({
        card_name: card[0],
        season: card[1],
        api_id: card[2],
        uuid: card[3],
        cardtype: card[4],
      }));
      return next;
    });
  }

  const handleRarityChange = (index: number) => (e: SelectChangeEvent) => {
    e.preventDefault();

    const newValue = e.target.value;

    setSelectedCardId("");

    setTradeRarity((prev) => {
      const newArr = [...prev];
      newArr[index] = newValue;
      return newArr;
    });

    CardLookup(index, newValue);
  };

  const handleCardSelection = (index: number) => (e: SelectChangeEvent) => {
    console.log(e.target.name);
    console.log(cards[index].find((card) => card.card_name === e.target.value));
    e.preventDefault();
    setSelectedCardId(e.target.value);
    setImage((prev) => {
      const next = [...prev];
      next[index] = cards[index].find(
        (card) => card.card_name === e.target.value,
      );
      return next;
    });
  };

  const reset = (index: number) => {
    setIsVisible((prev) => prev.map((v, i) => (i === index ? false : v)));

    setSelectedCardId("");

    setTradeRarity((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });

    setCards((prev) => {
      const next = [...prev];
      next[index] = [];
      return next;
    });

    setImage((prev) => {
      const next = [...prev];
      next[index] = undefined;
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const final: string[] = image
      ?.filter((x): x is CardItem => x !== null)
      .map((card) => {
        return card?.uuid;
      });
    FactoryPack(final, rarity).then((result) => {
      if (result) {
        setNewCard({
          card_name: result.name,
          season: result.season,
          api_id: result.api_id,
          uuid: result.uuid,
          cardtype: result.cardtype,
        });
      }
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
          width: 1000,
          height: 500,
          background: "white",
          mb: 2,
          p: 3,
          mx: "auto",
          marginTop: "1%",
        }}
      >
        {!newCard ? (
          <>
            <FormControl
              variant="standard"
              sx={{
                m: 1,
                minWidth: 120,
                textAlign: "center",
                mb: 14,
              }}
            >
              <InputLabel id="demo-simple-select-standard-label">
                Rarity
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                value={rarity}
                onChange={handleChange}
                label="Rarity"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Bronze">Bronze</MenuItem>
                <MenuItem value="Silver">Silver</MenuItem>
                <MenuItem value="Gold">Gold</MenuItem>
                <MenuItem value="Diamond">Diamond</MenuItem>
              </Select>
            </FormControl>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 24,
                mb: 8,
              }}
            >
              {isVisible.map((visible, index) =>
                !visible ? (
                  <IconButton
                    key={index}
                    onClick={() => {
                      setSelectedCardId("");
                      setIsVisible((prev) =>
                        prev.map((v, i) => (i === index ? !v : v)),
                      );
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                ) : !image[index] ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <FormControl>
                      <InputLabel id="tradeRarity">Trade Rarity</InputLabel>
                      <Select
                        labelId="tradeRarityType"
                        id="type"
                        name="type"
                        value={tradeRarity[index]}
                        label="tradeRarity"
                        onChange={handleRarityChange(index)}
                        sx={{ width: "150px" }}
                      >
                        <MenuItem value={"Bronze"}>Bronze</MenuItem>
                        <MenuItem value={"Silver"}>Silver</MenuItem>
                        <MenuItem value={"Gold"}>Gold</MenuItem>
                        <MenuItem value={"Gold"}>Diamond</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl variant="standard" sx={{ width: "100%" }}>
                      <InputLabel id={`card-select-label-${index}`}>
                        Card Name
                      </InputLabel>

                      <Select
                        labelId={`card-select-label-${index}`}
                        value={selectedCardId || ""}
                        onChange={handleCardSelection(index)}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 250,
                              overflowY: "auto",
                            },
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>

                        {cards[index]
                          ?.filter((card) => {
                            return !image.some(
                              (imgCard) =>
                                imgCard?.card_name === card.card_name,
                            );
                          })
                          .map((card) => {
                            return (
                              <MenuItem
                                key={card.card_name}
                                value={card.card_name}
                              >
                                {card.card_name}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                    <IconButton
                      onClick={() => {
                        reset(index);
                      }}
                      sx={{ justifySelf: "center" }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <AdvancedImage
                        cldImg={cld.image(
                          `${image?.[index]?.season}/${image?.[index]?.cardtype}/${image?.[index]?.api_id}`,
                        )}
                        height="150px"
                        plugins={[lazyload(), placeholder()]}
                      />

                      <IconButton
                        onClick={() => {
                          reset(index);
                        }}
                        sx={{ justifySelf: "center" }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  </>
                ),
              )}
            </Box>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button type="submit" disabled={!canSubmit}>
                Submit Trade
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              size="grow"
            >
              <div style={container}>
                <AnimatePresence initial={false}>
                  {packVisible ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.5,
                        ease: [0, 0.71, 0.2, 1.01],
                      }}
                    >
                      <AdvancedImage
                        rel="preload"
                        height="200px"
                        cldImg={cld.image(
                          `${newCard?.season}/${newCard?.cardtype}/${newCard?.api_id}`,
                        )}
                        plugins={[placeholder({ mode: "blur" })]}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {!packVisible ? (
                  <motion.button
                    style={button}
                    onClick={() => setPackVisible(true)}
                    whileTap={{ y: 1 }}
                  >
                    {packVisible ? "Hide" : "Show"}
                  </motion.button>
                ) : null}
              </div>
            </Grid>
          </>
        )}
      </Box>
      <RequirementsTable />
    </Box>
  );
}
