import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import {
  createTrade,
  GetTrade,
  DestroyTrade,
  updateTrade,
} from "../api/TradingApi.ts";
import CancelIcon from "@mui/icons-material/Cancel";
import { cld } from "../lib/cloudinary.ts";
import { AdvancedImage, placeholder, lazyload } from "@cloudinary/react";

import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import { TradingCardLookup } from "../api/UserCardApi.ts";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1200,
  height: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
};

type TradeModalProps = {
  open: boolean;
  onClose: () => void;
  users: string[];
  trade_id?: number;
  setTradeId: (id?: number) => void;
};

type CardItem = {
  card_name: string;
  season: number;
  api_id: string;
  uuid: string;
  cardtype: string;
};

export default function TradeModal({
  open,
  onClose,
  users,
  trade_id,
  setTradeId,
}: TradeModalProps) {
  const [user, setUser] = React.useState("");
  const [canSubmit, setCanSubmit] = React.useState(true);
  const [alert, setAlert] = React.useState<number>(0);

  React.useEffect(() => {
    if (!trade_id) {
      setIsVisible(Array(10).fill(false));
      setCards(Array(10).fill(null));
      setImage([]);
      setCanSubmit(true);
      setUser("");
      return;
    }
    GetTrade(trade_id).then((result) => {
      result.user_trade_items.map((card: CardItem, index: number) => {
        setIsVisible((prev) => prev.map((v, i) => (i === index ? true : v)));

        setImage((prev) => {
          const next = [...prev];
          next[index] = {
            card_name: card.card_name,
            season: card.season,
            api_id: card.api_id,
            uuid: card.uuid,
            cardtype: card.cardtype,
          };
          return next;
        });
      });

      result.user2_trade_items.map((card: CardItem, index: number) => {
        index = index + 5;

        setIsVisible((prev) => prev.map((v, i) => (i === index ? true : v)));

        setImage((prev) => {
          const next = [...prev];
          next[index] = {
            card_name: card.card_name,
            season: card.season,
            api_id: card.api_id,
            uuid: card.uuid,
            cardtype: card.cardtype,
          };
          return next;
        });
      });

      setUser(result.user2_name);

      setCanSubmit(result.current_user_accept === false);
    });
  }, [open]);

  const handleChange = (event: SelectChangeEvent) => {
    setUser(event.target.value as string);
    for (let i = 5; i < 10; i++) {
      reset(i);
    }
    setTradeId(undefined);
    setCanSubmit(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const final: string[] = image
      ?.filter((x): x is CardItem => x !== null)
      .map((card) => {
        return card?.uuid;
      });

    if (!trade_id) {
      createTrade(final, user)
        .then((result) => {
          if (result.sender_approve) {
            setCanSubmit(false);
          }
          setAlert(1);
        })
        .catch((_) => {
          setAlert(2);
        });
    } else {
      updateTrade(final, trade_id)
        .then((_) => {
          setCanSubmit(false);
          setAlert(1);
        })
        .catch((_) => {
          setAlert(2);
        });
    }
  };

  React.useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(0);
    }, 1500);

    return () => clearTimeout(timer);
  }, [alert]);

  const handleDelete = () => {
    DestroyTrade(trade_id);
    handleClose();
  };

  const [isVisible, setIsVisible] = React.useState<boolean[]>(
    Array(10).fill(false),
  );

  const [rarity, setRarity] = React.useState<string[]>(Array(10).fill(""));
  const [cards, setCards] = React.useState<CardItem[][]>(Array(10).fill(null));
  const [image, setImage] = React.useState<(CardItem | undefined)[]>(
    Array(10).fill(null),
  );
  const [selectedCardId, setSelectedCardId] = React.useState<string>("");

  async function CardLookup(index: number, rarity: string) {
    const result = await TradingCardLookup(
      rarity,
      index > 4 ? user : undefined,
    );
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

    setRarity((prev) => {
      const newArr = [...prev];
      newArr[index] = newValue;
      return newArr;
    });

    CardLookup(index, newValue);
  };

  const handleCardSelection = (index: number) => (e: SelectChangeEvent) => {
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

    setRarity((prev) => {
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

  const handleClose = () => {
    for (let i = 0; i < 10; i++) {
      reset(i);
    }
    setCanSubmit(true);
    setUser("");
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6">You</Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                placeItems: "center",
              }}
            >
              {isVisible
                .filter((_, index) => index < 5)
                .map((visible, index) => (
                  <Box
                    key={index}
                    sx={{
                      gridColumn: index === 4 ? "span 2" : "auto",
                    }}
                  >
                    {!visible ? (
                      <IconButton
                        onClick={() => {
                          setSelectedCardId("");
                          setIsVisible((prev) =>
                            prev.map((v, i) => (i === index ? !v : v)),
                          );
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    ) : (
                      <>
                        {!image[index] ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <FormControl>
                              <InputLabel id="Rarity">Rarity</InputLabel>
                              <Select
                                labelId="RarityType"
                                id="type"
                                name="type"
                                value={rarity[index]}
                                label="Rarity"
                                onChange={handleRarityChange(index)}
                                sx={{ width: "150px" }}
                              >
                                <MenuItem value={"Bronze"}>Bronze</MenuItem>
                                <MenuItem value={"Silver"}>Silver</MenuItem>
                                <MenuItem value={"Gold"}>Gold</MenuItem>
                                <MenuItem value={"Gold"}>Diamond</MenuItem>
                              </Select>
                            </FormControl>

                            <FormControl
                              variant="standard"
                              sx={{ width: "100%" }}
                            >
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
                                defaultValue=""
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>

                                {cards[index]
                                  ?.filter((card) => {
                                    return !image
                                      .slice(0, 4)
                                      .some(
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
                        )}
                      </>
                    )}
                  </Box>
                ))}
            </Box>
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

            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {alert === 1 && (
                <Alert
                  severity="success"
                  sx={{
                    position: "absolute",
                    top: "100px",
                  }}
                >
                  Success
                </Alert>
              )}
              {alert === 2 && (
                <Alert
                  severity="error"
                  sx={{
                    position: "absolute",
                    top: "100px",
                  }}
                >
                  Failure
                </Alert>
              )}

              <Divider orientation="vertical" flexItem />
            </Box>

            <Button type="button" onClick={handleDelete}>
              Cancel Trade
            </Button>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FormControl variant="standard" sx={{ width: "40%" }}>
                <InputLabel id="demo-simple-select-standard-label">
                  User
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={user}
                  onChange={handleChange}
                  label="User"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {users.map((id) => (
                    <MenuItem key={id} value={id}>
                      {id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                placeItems: "center",
              }}
            >
              {isVisible
                .filter((_, index) => index >= 5)
                .map((visible, index) => {
                  index = index + 5;
                  return (
                    <Box
                      key={index}
                      sx={{
                        gridColumn: index === 9 ? "span 2" : "auto",
                      }}
                    >
                      {!visible ? (
                        <IconButton
                          onClick={() => {
                            setSelectedCardId("");
                            setIsVisible((prev) =>
                              prev.map((v, i) => (i === index ? !v : v)),
                            );
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      ) : (
                        <>
                          {!image[index] ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <FormControl>
                                <InputLabel id="Rarity">Rarity</InputLabel>
                                <Select
                                  labelId="RarityType"
                                  id="type"
                                  name="type"
                                  value={rarity[index]}
                                  label="Rarity"
                                  onChange={handleRarityChange(index)}
                                  sx={{ width: "150px" }}
                                >
                                  <MenuItem value={"Bronze"}>Bronze</MenuItem>
                                  <MenuItem value={"Silver"}>Silver</MenuItem>
                                  <MenuItem value={"Gold"}>Gold</MenuItem>
                                  <MenuItem value={"Diamond"}>Diamond</MenuItem>
                                </Select>
                              </FormControl>

                              <FormControl
                                variant="standard"
                                sx={{ width: "100%" }}
                              >
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
                                  defaultValue=""
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>

                                  {cards[index]
                                    ?.filter((card) => {
                                      return !image
                                        .slice(5, 10)
                                        .some(
                                          (imgCard) =>
                                            imgCard?.card_name ===
                                            card.card_name,
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
                          )}
                        </>
                      )}
                    </Box>
                  );
                })}
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
