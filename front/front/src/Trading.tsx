import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import TradeModal from "./components/TradeModal.tsx";
import { Users } from "./api/UserApi";
import { Trades } from "./api/TradingApi.ts";

interface TradesResponse {
  trades: number[];
  current_user_accept: boolean[];
  user2_name: string[];
  current_user_rarities: Record<string, number>[];
  other_user_rarities: Record<string, number>[];
}

interface LiveTrade {
  id: number;
  otherUser: string;
  waitingOnOtherUser: boolean;
  offeredRarities: Record<string, number>;
  requestedRarities: Record<string, number>;
}

const rarityColors: Record<string, string> = {
  Bronze: "#A97142",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Diamond: "#B9F2FF",
};

const rarityOrder = ["Diamond", "Gold", "Silver", "Bronze"];

export default function Trading() {
  const [open, setOpen] = React.useState(false);
  const [allUsers, setAllUsers] = React.useState<string[]>([]);
  const [liveTrades, setLiveTrades] = React.useState<LiveTrade[]>([]);
  const [tradeIndex, setTradeIndex] = React.useState<number | undefined>();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadTradingPage = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [usersResult, tradesResult] = await Promise.all([
          Users() as Promise<string[]>,
          Trades() as Promise<TradesResponse>,
        ]);

        if (cancelled) {
          return;
        }

        setAllUsers(usersResult);
        setLiveTrades(
          tradesResult.trades.map((id, index) => ({
            id,
            otherUser: tradesResult.user2_name[index],
            waitingOnOtherUser: tradesResult.current_user_accept[index],
            offeredRarities: tradesResult.current_user_rarities[index] ?? {},
            requestedRarities: tradesResult.other_user_rarities[index] ?? {},
          })),
        );
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load trades",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadTradingPage();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const openNewTrade = () => {
    setTradeIndex(undefined);
    setOpen(true);
  };

  const openTrade = (tradeId: number) => {
    setTradeIndex(tradeId);
    setOpen(true);
  };

  const renderRarityCounts = (counts: Record<string, number>) => {
    const rarities = rarityOrder.filter((rarity) => counts[rarity] > 0);

    if (rarities.length === 0) {
      return (
        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
          No cards
        </Typography>
      );
    }

    return rarities.map((rarity) => (
      <Chip
        key={rarity}
        size="small"
        label={`${counts[rarity]} ${rarity}`}
        sx={{
          height: 24,
          color: "#ffffff",
          fontSize: "0.72rem",
          fontWeight: 800,
          backgroundColor: "#111827",
          border: `1px solid ${rarityColors[rarity]}`,
        }}
      />
    ));
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 3 },
            color: "#ffffff",
            background:
              "linear-gradient(135deg, #111827 0%, #222831 55%, #303846 100%)",
            border: "1px solid #596273",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <SwapHorizIcon sx={{ color: "#bd9523", fontSize: 34 }} />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Trading Center
                </Typography>
              </Box>
              <Typography sx={{ mt: 0.75, color: "#cbd5e1" }}>
                Review active offers or start a new card trade.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openNewTrade}
              sx={{
                minHeight: 44,
                px: 2.5,
                fontWeight: 800,
                backgroundColor: "#bd9523",
                color: "#111827",
                "&:hover": { backgroundColor: "#d4ad3d" },
              }}
            >
              Create Trade
            </Button>
          </Box>
        </Paper>

        <Box
          component="section"
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            borderRadius: 3,
            border: "1px solid #596273",
            backgroundColor: "#222831",
          }}
        >
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ color: "#ffffff", fontWeight: 800 }}>
                Active Trades
              </Typography>
              <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                Select an offer to review or update its cards.
              </Typography>
            </Box>
            <Chip
              label={`${liveTrades.length} active`}
              sx={{
                color: "#ffffff",
                fontWeight: 800,
                backgroundColor: "#374151",
                border: "1px solid #6b7280",
              }}
            />
          </Box>

          {loadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : liveTrades.length === 0 ? (
            <Box
              sx={{
                minHeight: 240,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                border: "1px dashed #6b7280",
                borderRadius: 2,
                color: "#cbd5e1",
                backgroundColor: "#1b2028",
              }}
            >
              <SwapHorizIcon sx={{ mb: 1, fontSize: 48, color: "#77808f" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                No active trades
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, mb: 2 }}>
                Create an offer to start trading stickers with another user.
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={openNewTrade}>
                Create Your First Trade
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {liveTrades.map((trade) => {
                const needsAction = !trade.waitingOnOtherUser;

                return (
                  <Paper
                    key={trade.id}
                    component="button"
                    type="button"
                    onClick={() => openTrade(trade.id)}
                    elevation={0}
                    sx={{
                      p: 0,
                      width: "100%",
                      overflow: "hidden",
                      display: "grid",
                      gridTemplateColumns: "7px minmax(0, 1fr) auto",
                      alignItems: "stretch",
                      textAlign: "left",
                      color: "#ffffff",
                      cursor: "pointer",
                      border: "1px solid #4b5563",
                      borderRadius: 2,
                      backgroundColor: "#1f2937",
                      transition:
                        "transform 0.16s ease, border-color 0.16s ease, background-color 0.16s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: needsAction ? "#bd9523" : "#77808f",
                        backgroundColor: "#2b3442",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: needsAction ? "#bd9523" : "#64748b",
                      }}
                    />
                    <Box sx={{ p: 2, minWidth: 0 }}>
                      <Typography
                        variant="overline"
                        sx={{ color: "#9ca3af", fontWeight: 800 }}
                      >
                        Trade #{trade.id}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          mt: -0.25,
                          fontWeight: 800,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {trade.otherUser}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1.25,
                          p: 1,
                          display: "grid",
                          gridTemplateColumns: "auto minmax(0, 1fr)",
                          alignItems: "center",
                          gap: 0.75,
                          borderRadius: 1.5,
                          backgroundColor: "#18202b",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#9ca3af", fontWeight: 800 }}
                        >
                          You give
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {renderRarityCounts(trade.offeredRarities)}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#9ca3af", fontWeight: 800 }}
                        >
                          You get
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {renderRarityCounts(trade.requestedRarities)}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          mt: 1.25,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          color: needsAction ? "#f6d365" : "#cbd5e1",
                        }}
                      >
                        {needsAction ? (
                          <TouchAppIcon fontSize="small" />
                        ) : (
                          <HourglassTopIcon fontSize="small" />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {needsAction
                            ? "Your action is required"
                            : `Waiting for ${trade.otherUser}`}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        px: 1.5,
                        display: "grid",
                        placeItems: "center",
                        color: "#cbd5e1",
                      }}
                    >
                      <ArrowForwardIcon />
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      <TradeModal
        open={open}
        onClose={() => {
          setOpen(false);
          setRefreshKey((current) => current + 1);
        }}
        users={allUsers}
        trade_id={tradeIndex}
        setTradeId={setTradeIndex}
      />
    </>
  );
}
