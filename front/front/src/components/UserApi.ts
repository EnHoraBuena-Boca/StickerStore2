export async function getUser(username: any, password: any) {
    const url = 'http://localhost:3000/api/v1/login';
    try {
        const response = await fetch(url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({first_name: username, password: password})
          }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("error, go fuck yourself", error);
    }
}

export async function WhoAmI() {
  const url = "http://localhost:3000/api/v1/me";
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

