import { createClient } from "@supabase/supabase-js";

document.addEventListener("DOMContentLoaded", async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  const { createClient } = supabase;
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const logoutButton = document.getElementById("logoutButton");

  async function checkAuth() {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();
    if (error || !user) {
      setTimeout(() => {
        console.log("Returning to homepage. User:", user);
      }, "5000");

      window.location.href = "index.html";
    } else {
      displayUserInfo(user);
    }
  }

  function displayUserInfo(user) {
    const userInfoElement = document.getElementById("userInfo");
    userInfoElement.innerHTML = `
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>User ID:</strong> ${user.id}</p>
      <p><strong>Last Sign In:</strong> ${new Date(
        user.last_sign_in_at
      ).toLocaleString()}</p>
    `;
  }

  async function handleLogout() {
    localStorage.removeItem("supabaseSession");
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      window.location.href = "index.html";
    }
  }

  logoutButton.addEventListener("click", handleLogout);

  await checkAuth();
});
