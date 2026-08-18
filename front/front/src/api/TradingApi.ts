import { api } from "../lib/api.ts";

export const tradesUpdatedEvent = "trades-updated";

function notifyTradesUpdated() {
  window.dispatchEvent(new Event(tradesUpdatedEvent));
}

function tradeRequestError(result: unknown, status: number) {
  const payload = result as { error?: string; card_ids?: string[] } | null;
  const error = new Error(
    payload?.error || `Response status: ${status}`,
  ) as Error & { cardIds?: string[] };
  error.cardIds = payload?.card_ids ?? [];
  return error;
}

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
      const result = await response.json().catch(() => null);
      throw tradeRequestError(result, response.status);
    }
    const result = await response.json();
    notifyTradesUpdated();
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
  if (!response.ok) {
    throw new Error(`Unable to load trades (${response.status})`);
  }

  return response.json();
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
  if (!response.ok) {
    throw new Error(`Unable to load trade (${response.status})`);
  }

  return response.json();
}

export async function DestroyTrade(trade_id?: number) {
  const url = `${api}/api/v1/trades/${trade_id}`;
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  notifyTradesUpdated();
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
      const result = await response.json().catch(() => null);
      throw tradeRequestError(result, response.status);
    }
    const result = await response.json();
    notifyTradesUpdated();
    return result;
  } catch (error) {
    console.log("error, go fuck yourself", error);
    throw error;
  }
}
