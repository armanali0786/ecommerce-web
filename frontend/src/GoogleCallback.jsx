import { useEffect } from "react";

export default function GoogleCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const verifier = localStorage.getItem("pkce_verifier");

    if (code && verifier) {
      fetch("https://ecommerce-web-4pmx.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, verifier }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          localStorage.setItem("google_access_token", data.access_token);

          window.location.href = "/"; // redirect to homepage after login
        })
        .catch((err) => console.error(err));
    }
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Logging you in...</h1>
    </div>
  );
}
