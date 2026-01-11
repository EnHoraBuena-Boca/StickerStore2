export async function PackCards() {
  const url = "http://localhost:3000/api/v1/pack";
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

export async function CommitCards(ids: string[]) {
  const url = "http://localhost:3000/api/v1/commit_to_users_folder";

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
  }
}
