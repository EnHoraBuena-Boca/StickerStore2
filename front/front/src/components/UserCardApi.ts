export async function UserCards(page: number, per_page: number) {
  const part1 = "http://localhost:3000/api/v1/user_cards?page=";
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
  const url = "http://localhost:3000/api/v1/get_user_card_count";
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
  const url = "http://localhost:3000/api/v1/cards_with_params";

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
  }
}
