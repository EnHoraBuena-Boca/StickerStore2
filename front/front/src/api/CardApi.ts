import type { GridRowId } from "@mui/x-data-grid";
import {api} from  "../lib/api.ts"

export async function createCard(raw: FormData) {
  const url = `${api}/api/v1/original_cards`;

  const formData = new FormData();
  formData.append("zip", raw.get("file") as File);

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

export async function UnapprovedCards() {
  const url = `${api}/api/v1/unapproved`;
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
    throw error;
  }
}

export async function ApproveCards(ids: Set<GridRowId> | number[]) {
  const url = `${api}0/api/v1/approved`;

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(ids) }),
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

export async function DeleteCards(ids: Set<GridRowId> | number[]) {
  const url = `${api}/api/v1/delete_cards`;

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(ids) }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response.status;
  } catch (error) {
    console.log("error, go fuck yourself", error);
    throw error;
  }
}
