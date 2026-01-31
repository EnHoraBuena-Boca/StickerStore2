import { api } from "../lib/api.ts";

export async function UserCards(page: number, per_page: number) {
  const part1 = `${api}/api/v1/user_cards?page=`;
  const part2 = "&per_page=";
  const url = `${part1}${page}${part2}${per_page}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("error, go fuck yourself", error);
  }
}

export async function UserCardCount() {
  const url = `${api}/api/v1/get_user_card_count`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("error, go fuck yourself", error);
  }
}

export async function CardsWithParams(raw: FormData) {
  const url = `${api}/api/v1/cards_with_params`;

  const formData = new FormData();
  formData.append("name", raw.get("CardName") as string);
  formData.append("cardtype", raw.get("type") as string);

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: formData,
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

export async function TradingCardLookup(rarity: string, name?: string) {
  const url = `${api}/api/v1/cards_by_rarity`;

  const formData = new FormData();
  formData.append("cardtype", rarity as string);
  formData.append("name", name as string);

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: formData,
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

export async function FactoryPack(cards: string[] = [], rarity: string) {
  const url = `${api}/api/v1/factory_pack`;

  const TradeProps = {
    cards: cards,
    rarity: rarity,
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
      return false;
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("error, go fuck yourself", error);
    throw error;
  }
}
