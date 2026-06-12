import { api } from "../lib/api.ts";

export type CardRarity = "Bronze" | "Silver" | "Gold" | "Diamond";

export interface PackCard {
  public_id: string;
  rarity: CardRarity;
  new_card: boolean;
}

export interface PackResponse {
  cards: PackCard[];
  packs_available: number;
}

export async function OpenPack() {
  const url = `${api}/api/v1/pack`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      throw new Error(result?.error || `Response status: ${response.status}`);
    }
    return (await response.json()) as PackResponse;
  } catch (error) {
    console.log("error, go fuck yourself", error);
    throw error;
  }
}

export async function GetPackCount() {
  const url = `${api}/api/v1/pack_count`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error || `Response status: ${response.status}`);
  }

  return (await response.json()) as Pick<PackResponse, "packs_available">;
}
