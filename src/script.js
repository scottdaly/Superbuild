import { createClient } from "@supabase/supabase-js";

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  let currentSession = null;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  // Initialize Supabase client
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
      console.log("User signed in:", session.user);
      currentSession = session;
      localStorage.setItem("supabaseSession", JSON.stringify(session));
      updateAuthButtonText(session.user);
    } else if (event === "SIGNED_OUT") {
      console.log("User signed out");
      currentSession = null;
      localStorage.removeItem("supabaseSession");
      updateAuthButtonText(null);
    }
  });

  // Homepage Elements
  const authButton = document.getElementById("authButton");
  const startBuildingButton = document.getElementById("startBuildingButton");

  const signInWithGoogleButton = document.getElementById(
    "signInWithGoogleButton"
  );
  const signInWithEmailButton = document.getElementById(
    "signInWithEmailButton"
  );

  const modal = document.getElementById("signInModal");
  const closeModalButton = document.getElementById("closeModalButton");

  function updateAuthButtonText(user) {
    console.log("Updating auth button. User:", user);
    if (user) {
      authButton.textContent = "Go to Dashboard";
      authButton.setAttribute("data-action", "dashboard");
    } else {
      authButton.textContent = "Sign In";
      authButton.setAttribute("data-action", "signin");
    }
  }

  // Function to handle sign in with Google
  async function signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // Redirect back to your site after auth
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error.message);
    } else {
      console.log("Signed in with Google:", data);
    }
  }

  // Add click event listener to the auth button
  authButton.addEventListener("click", async () => {
    const action = authButton.getAttribute("data-action");

    if (action === "dashboard") {
      console.log("Redirecting to dashboard");
      window.location.href = "dashboard.html";
    } else if (action === "signin") {
      console.log("Initiating sign in");
      // await signInWithGoogle();
      modal.style.display = "block";
    }
  });

  //Handle Start Building Button Click
  startBuildingButton.addEventListener("click", async () => {
    console.log("Start Building Pressed!");

    if (currentSession && currentSession.user) {
      // User is logged in, redirect to dashboard
      console.log("User is logged in. Redirecting to dashboard.");
      window.location.href = "dashboard.html";
    } else {
      // User is not logged in, initiate sign in
      console.log("User is not logged in. Initiating sign in.");
      modal.style.display = "block";
    }
  });

  // Handle initial load and OAuth redirect
  async function handleInitialLoad() {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();
    console.log("user?", user);
    if (user) {
      updateAuthButtonText(user);
    } else {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (session) {
        currentSession = session;
        localStorage.setItem("supabaseSession", JSON.stringify(session));
        updateAuthButtonText(session.user);
      } else {
        updateAuthButtonText(null);
      }
    }
  }

  closeModalButton.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  signInWithGoogleButton.onclick = function () {
    signInWithGoogle();
  };

  // Call handleInitialLoad when the script runs
  await handleInitialLoad();
});
