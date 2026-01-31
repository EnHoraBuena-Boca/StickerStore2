import { api } from "../lib/api.ts";

export async function createTrade(
  Cards: string[] = [],
  receiver: string
) {
  const url = `${api}/api/v1/trades`;

  const combinedCards = [...Cards];

  const TradeProps = {
    combinedCards: combinedCards,
    receiver: receiver,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TradeProps),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("error, go fuck yourself", error);
    throw error;
  }
}

export async function Trades() {
  const url = `${api}/api/v1/trades`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const result = await response.json();

  return result;
}

export async function GetTrade(trade_id?: number) {
  const url = `${api}/api/v1/trades/${trade_id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const result = await response.json();

  return result;
}

export async function DestroyTrade(trade_id?: number) {
  const url = `${api}/api/v1/trades/${trade_id}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();

  return result;
}

export async function updateTrade(
  Cards: string[] = [],
  trade_id: number
) {
  const url = `${api}/api/v1/trades/${trade_id}`;

  const combinedCards = [...Cards,];

  const TradeProps = {
    combinedCards: combinedCards,
  };

  try {
    const response = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TradeProps),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("error, go fuck yourself", error);
    throw error;
  }
}
