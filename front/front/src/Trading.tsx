import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TradeModal from "./components/TradeModal.tsx";
import { Users } from "./api/UserApi";
import { Trades } from "./api/TradingApi.ts";
import Alert from "@mui/material/Alert";

export default function Trading() {
  const [open, setOpen] = React.useState(false);
  const [allUsers, setallUsers] = React.useState<string[]>([]);
  const [tradeId, setTradeID] = React.useState<number[]>([]);
  const [currentUserAccept, setCurrentUserAccept] = React.useState<boolean[]>(
    [],
  );
  const [userTwo, setUserTwo] = React.useState<string[]>([]);
  const [tradeIndex, setTradeIndex] = React.useState<number | undefined>(
    undefined,
  );
  const [alert, setAlert] = React.useState<number>(0);
  const [state, setState] = React.useState(0);

  React.useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(0);
    }, 1500);

    return () => clearTimeout(timer);
  }, [alert]);

  React.useEffect(() => {
    Users().then((result: any) => {
      setallUsers(result);
    });

    Trades().then((result: any) => {
      const tradeIds: number[] = [];
      const accepts: boolean[] = [];
      const users: string[] = [];

      result.trades.forEach((trade: any, index: number) => {
        if (trade.sender_approve && trade.receiver_approve) return;
        if (tradeIds.includes(trade.id)) return;

        tradeIds.push(trade.id);
        accepts.push(result.current_user_accept[index]);
        users.push(result.user2_name[index]);
      });

      setTradeID(tradeIds);
      setCurrentUserAccept(accepts);
      setUserTwo(users);
    });
  }, [state]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100vw",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "flex-start",
            width: 1000,
            height: 500,
            bgcolor: "background.paper",
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              width: "100%",
            }}
          >
            <Typography variant="h4">Current Live Trades</Typography>

            <Button
              variant="contained"
              onClick={() => {
                setOpen(true);
                setTradeIndex(undefined);
              }}
            >
              Create Trade
            </Button>
          </Box>
          <Divider sx={{ width: "100%" }} />

          <List sx={{ width: "100%", overflowY: "auto", height: "100%" }}>
            {tradeId.map((trade, index) => (
              <ListItemButton
                key={trade}
                sx={{
                  width: "100%",
                  border: 2,
                  borderColor: "divider",
                }}
                onClick={() => {
                  setOpen(true);
                  setTradeIndex(trade);
                }}
              >
                Trade With: {userTwo[index]},
                {currentUserAccept[index] ? ` Their Turn` : " Your Turn"}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>
      {alert == 1 && (
        <Alert severity="success" sx={{ mt: 20, justifySelf: "center" }}>
          Success, cards saved into folder!
        </Alert>
      )}
      {alert == 2 && (
        <Alert severity="error" sx={{ mt: 20, justifySelf: "center" }}>
          Error, contact admin
        </Alert>
      )}
      <TradeModal
        open={open}
        onClose={() => {
          setOpen(false);
          setState((state) => state + 1);
        }}
        users={allUsers}
        trade_id={tradeIndex}
        setTradeId={setTradeIndex}
      />
    </>
  );
}
