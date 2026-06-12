import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { AdvancedImage, placeholder, lazyload } from "@cloudinary/react";
import {
  createTrade,
  GetTrade,
  DestroyTrade,
  updateTrade,
} from "../api/TradingApi.ts";
import { TradeCardOptions } from "../api/UserCardApi.ts";
import { cld } from "../lib/cloudinary.ts";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "min(1180px, 96vw)",
  maxHeight: "92vh",
  bgcolor: "#111827",
  color: "#ffffff",
  border: "1px solid #4b5563",
  borderRadius: 3,
  boxShadow: 24,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const rarityColors: Record<string, string> = {
  Bronze: "#A97142",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Diamond: "#B9F2FF",
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

type TradeCardOption = Omit<CardItem, "uuid"> & {
  owned_count: number;
  uuids: string[];
};

type TradeSide = "mine" | "theirs";

export default function TradeModal({
  open,
  onClose,
  users,
  trade_id,
  setTradeId,
}: TradeModalProps) {
  const [user, setUser] = React.useState("");
  const [canSubmit, setCanSubmit] = React.useState(true);
  const [alert, setAlert] = React.useState(0);
  const [myCards, setMyCards] = React.useState<CardItem[]>([]);
  const [theirCards, setTheirCards] = React.useState<CardItem[]>([]);
  const [pickerSide, setPickerSide] = React.useState<TradeSide | null>(null);
  const [pickerCards, setPickerCards] = React.useState<TradeCardOption[]>([]);
  const [pickerRarity, setPickerRarity] = React.useState("All");
  const [pickerSearch, setPickerSearch] = React.useState("");
  const [duplicatesOnly, setDuplicatesOnly] = React.useState(false);
  const [pickerLoading, setPickerLoading] = React.useState(false);
  const [pickerError, setPickerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (!trade_id) {
      setMyCards([]);
      setTheirCards([]);
      setCanSubmit(true);
      setUser("");
      return;
    }

    GetTrade(trade_id).then((result) => {
      setMyCards(result.user_trade_items);
      setTheirCards(result.user2_trade_items);
      setUser(result.user2_name);
      setCanSubmit(result.current_user_accept === false);
    });
  }, [open, trade_id]);

  React.useEffect(() => {
    if (!alert) {
      return;
    }

    const timer = window.setTimeout(() => setAlert(0), 2000);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const handleClose = () => {
    setMyCards([]);
    setTheirCards([]);
    setPickerSide(null);
    setCanSubmit(true);
    setAlert(0);
    setUser("");
    onClose();
  };

  const handleUserChange = (_event: React.SyntheticEvent, value: string | null) => {
    setUser(value ?? "");
    setTheirCards([]);
    setTradeId(undefined);
    setCanSubmit(true);
  };

  const openCardPicker = async (side: TradeSide) => {
    setPickerSide(side);
    setPickerRarity("All");
    setPickerSearch("");
    setDuplicatesOnly(false);
    setPickerLoading(true);
    setPickerError(null);

    try {
      const result = (await TradeCardOptions(
        side === "theirs" ? user : undefined,
      )) as TradeCardOption[];
      setPickerCards(result);
    } catch (error) {
      setPickerError(
        error instanceof Error ? error.message : "Unable to load cards",
      );
    } finally {
      setPickerLoading(false);
    }
  };

  const closeCardPicker = () => {
    setPickerSide(null);
    setPickerCards([]);
    setPickerError(null);
  };

  const selectPickerCard = (card: TradeCardOption) => {
    if (pickerSide === null) {
      return;
    }

    const selectedCards = pickerSide === "mine" ? myCards : theirCards;
    const selectedUuids = new Set(
      selectedCards.map((selected) => selected.uuid),
    );
    const availableUuid = card.uuids.find((uuid) => !selectedUuids.has(uuid));

    if (!availableUuid) {
      return;
    }

    const selectedCard = {
      card_name: card.card_name,
      season: card.season,
      api_id: card.api_id,
      cardtype: card.cardtype,
      uuid: availableUuid,
    };

    if (pickerSide === "mine") {
      setMyCards((current) => [...current, selectedCard]);
    } else {
      setTheirCards((current) => [...current, selectedCard]);
    }
    closeCardPicker();
  };

  const filteredPickerCards = pickerCards.filter((card) => {
    const matchesRarity =
      pickerRarity === "All" || card.cardtype === pickerRarity;
    const matchesSearch = card.card_name
      .toLocaleLowerCase()
      .includes(pickerSearch.trim().toLocaleLowerCase());
    const matchesDuplicates = !duplicatesOnly || card.owned_count > 1;
    return matchesRarity && matchesSearch && matchesDuplicates;
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedCardIds = [...myCards, ...theirCards].map(
      (card) => card.uuid,
    );

    const request = trade_id
      ? updateTrade(selectedCardIds, trade_id)
      : createTrade(selectedCardIds, user);

    request
      .then(() => {
        handleClose();
      })
      .catch(() => setAlert(2));
  };

  const handleDelete = () => {
    void DestroyTrade(trade_id);
    handleClose();
  };

  const renderTradeSide = (
    title: string,
    subtitle: string,
    side: TradeSide,
    selectedCards: CardItem[],
  ) => {
    const setSelectedCards = side === "mine" ? setMyCards : setTheirCards;
    const addDisabled = side === "theirs" && !user;

    return (
      <Box
        component="section"
        sx={{
          minWidth: 0,
          p: 2,
          border: "1px solid #374151",
          borderRadius: 2.5,
          backgroundColor: "#0f172a",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af" }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {selectedCards.map((card, index) => (
            <Box
              key={card.uuid}
              sx={{
                minHeight: 48,
                display: "grid",
                gridTemplateColumns: "8px minmax(0, 1fr) auto auto",
                alignItems: "center",
                gap: 1.25,
                pr: 0.5,
                overflow: "hidden",
                border: "1px solid #4b5563",
                borderRadius: 1.5,
                backgroundColor: "#1f2937",
              }}
            >
              <Box
                sx={{
                  alignSelf: "stretch",
                  backgroundColor:
                    rarityColors[card.cardtype] ?? "#6b7280",
                }}
              />
              <Typography
                sx={{
                  minWidth: 0,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {card.card_name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af", fontWeight: 700 }}
              >
                {card.cardtype}
              </Typography>
              <IconButton
                aria-label={`Remove ${card.card_name}`}
                size="small"
                onClick={() =>
                  setSelectedCards((current) =>
                    current.filter((_, cardIndex) => cardIndex !== index),
                  )
                }
                sx={{
                  color: "#d1d5db",
                  "&:hover": { color: "#ffffff", backgroundColor: "#991b1b" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            disabled={addDisabled}
            onClick={() => void openCardPicker(side)}
            sx={{
              minHeight: 48,
              color: "#e5e7eb",
              borderColor: "#6b7280",
              borderStyle: "dashed",
              "&:hover": {
                borderColor: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.06)",
              },
            }}
          >
            Add card
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="trade-modal-title"
        disableEnforceFocus={pickerSide !== null}
      >
        <Box sx={modalStyle}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            backgroundColor: "#1f2937",
          }}
        >
          <Box>
            <Typography id="trade-modal-title" variant="h5" fontWeight={800}>
              {trade_id ? "Edit Trade" : "Create New Trade"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Add as many cards as needed from either collection.
            </Typography>
          </Box>
          <IconButton
            aria-label="Close trade"
            onClick={handleClose}
            sx={{ color: "#ffffff" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "#374151" }} />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: "flex",
              alignItems: { xs: "stretch", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              backgroundColor: "#111827",
            }}
          >
            <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              Trade with
            </Typography>
            <Autocomplete
              options={users}
              value={user || null}
              onChange={handleUserChange}
              autoHighlight
              openOnFocus
              noOptionsText="No users found"
              slotProps={{
                paper: {
                  sx: { maxHeight: 320 },
                },
                listbox: {
                  sx: { maxHeight: 280 },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Search users"
                  placeholder="Start typing a username"
                />
              )}
              sx={{
                width: { xs: "100%", sm: 280 },
                "& .MuiInputLabel-root": { color: "#9ca3af" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#ffffff" },
                "& .MuiInputBase-input": { color: "#ffffff" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6b7280",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9ca3af",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#ffffff",
                  },
                "& .MuiSvgIcon-root": { color: "#ffffff" },
              }}
            />
            {!user && (
              <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                Select a user to choose cards from their collection.
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              minHeight: 0,
              overflowY: "auto",
              p: 2.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              backgroundColor: "#111827",
            }}
          >
            {renderTradeSide(
              "You offer",
              "Cards leaving your collection",
              "mine",
              myCards,
            )}
            {renderTradeSide(
              user ? `${user} offers` : "They offer",
              user
                ? `Cards requested from ${user}`
                : "Select a user before adding requested cards",
              "theirs",
              theirCards,
            )}
          </Box>

          <Divider sx={{ borderColor: "#374151" }} />

          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.25,
              backgroundColor: "#1f2937",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit || !user}
              sx={{ minWidth: 150 }}
            >
              {trade_id ? "Save Trade" : "Submit Trade"}
            </Button>
            {trade_id && (
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={handleDelete}
              >
                Delete Trade
              </Button>
            )}
            <Button
              type="button"
              color="inherit"
              onClick={handleClose}
              sx={{ color: "#d1d5db" }}
            >
              Cancel
            </Button>
            <Box sx={{ flex: 1 }} />
            {alert === 1 && (
              <Alert severity="success">Trade saved successfully.</Alert>
            )}
            {alert === 2 && (
              <Alert severity="error">Trade could not be saved.</Alert>
            )}
          </Box>
        </Box>
        </Box>
      </Modal>

      <Dialog
        open={pickerSide !== null}
        onClose={closeCardPicker}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              height: "min(800px, 90vh)",
              backgroundColor: "#111827",
              color: "#ffffff",
              border: "1px solid #4b5563",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            backgroundColor: "#1f2937",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Choose a card
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              {pickerSide === "theirs"
                ? `${user}'s collection`
                : "Your collection"}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close card picker"
            onClick={closeCardPicker}
            sx={{ color: "#ffffff" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "#111827",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "minmax(220px, 1fr) 180px auto",
              },
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <TextField
              size="small"
              label="Search by player name"
              value={pickerSearch}
              onChange={(event) => setPickerSearch(event.target.value)}
              sx={{
                "& .MuiInputLabel-root": { color: "#9ca3af" },
                "& .MuiInputBase-input": { color: "#ffffff" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6b7280",
                },
              }}
            />
            <Select
              size="small"
              value={pickerRarity}
              onChange={(event: SelectChangeEvent) =>
                setPickerRarity(event.target.value)
              }
              inputProps={{ "aria-label": "Filter by rarity" }}
              sx={{
                color: "#ffffff",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6b7280",
                },
                "& .MuiSvgIcon-root": { color: "#ffffff" },
              }}
            >
              <MenuItem value="All">All rarities</MenuItem>
              <MenuItem value="Diamond">Diamond</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
              <MenuItem value="Silver">Silver</MenuItem>
              <MenuItem value="Bronze">Bronze</MenuItem>
            </Select>
            <FormControlLabel
              control={
                <Switch
                  checked={duplicatesOnly}
                  onChange={(event) =>
                    setDuplicatesOnly(event.target.checked)
                  }
                />
              }
              label="Duplicates Only"
              sx={{ m: 0, whiteSpace: "nowrap" }}
            />
          </Box>

          {pickerError && <Alert severity="error">{pickerError}</Alert>}

          {pickerLoading ? (
            <Box
              sx={{
                flex: 1,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(145px, 1fr))",
                gap: 1.5,
                pr: 0.5,
              }}
            >
              {filteredPickerCards.map((card) => {
                const selectedCards =
                  pickerSide === "theirs" ? theirCards : myCards;
                const selectedUuids = new Set(
                  selectedCards.map((selected) => selected.uuid),
                );
                const availableCopies = card.uuids.filter(
                  (uuid) => !selectedUuids.has(uuid),
                ).length;

                return (
                  <Button
                    key={`${card.season}-${card.cardtype}-${card.api_id}`}
                    disabled={availableCopies === 0}
                    onClick={() => selectPickerCard(card)}
                    sx={{
                      p: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: 0.75,
                      textTransform: "none",
                      color: "#ffffff",
                      border: `2px solid ${
                        rarityColors[card.cardtype] ?? "#6b7280"
                      }`,
                      borderRadius: 2,
                      backgroundColor: "#1f2937",
                      position: "relative",
                      "&:hover": {
                        backgroundColor: "#374151",
                        transform: "translateY(-2px)",
                      },
                      "&.Mui-disabled": {
                        color: "#9ca3af",
                        opacity: 0.4,
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        top: 5,
                        left: 5,
                        zIndex: 1,
                        minWidth: 28,
                        height: 28,
                        px: 0.75,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 14,
                        backgroundColor: "#111827",
                        border: `2px solid ${
                          rarityColors[card.cardtype] ?? "#6b7280"
                        }`,
                        fontSize: "0.75rem",
                        fontWeight: 800,
                      }}
                    >
                      x{card.owned_count}
                    </Box>
                    <AdvancedImage
                      cldImg={cld.image(
                        `${card.season}/${card.cardtype}/${card.api_id}`,
                      )}
                      plugins={[lazyload(), placeholder()]}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "contain",
                      }}
                    />
                    <Typography
                      component="span"
                      sx={{
                        minHeight: "2.5rem",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        textAlign: "center",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {card.card_name}
                    </Typography>
                  </Button>
                );
              })}
              {!pickerLoading && filteredPickerCards.length === 0 && (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    py: 8,
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  No cards match these filters.
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
