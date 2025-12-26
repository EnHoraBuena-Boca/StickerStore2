import type { GridRowId } from "@mui/x-data-grid";

export async function createCard(raw: FormData) {
  const url = "http://localhost:3000/api/v1/original_cards";

  const formData = new FormData();
  formData.append("name", raw.get("CardName") as string);
  formData.append("Cardtype", raw.get("type") as string);
  formData.append("image", raw.get("file") as File);

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
  }
}

export async function UnapprovedCards() {
  const url = "http://localhost:3000/api/v1/unapproved";
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

export async function ApproveCards(ids: Set<GridRowId>) {
  const url = "http://localhost:3000/api/v1/approved";

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
  }
}
