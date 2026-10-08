const form = document.querySelector(".access-form");
const emailInput = document.querySelector("#email");
const errorMessage = document.querySelector("#email-error");
const statusMessage = document.querySelector("#form-status");
const submitButton = form.querySelector('button[type="submit"]');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  statusMessage.hidden = true;
  emailInput.setAttribute("aria-invalid", "true");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
  emailInput.removeAttribute("aria-invalid");
}

function showStatus(message, state) {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
  statusMessage.hidden = false;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

emailInput.addEventListener("input", () => {
  if (!errorMessage.hidden || !statusMessage.hidden) {
    clearError();
    statusMessage.hidden = true;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (!email) {
    showError("Oops! Please add your email");
    emailInput.focus();
    return;
  }

  if (!isValidEmail(email)) {
    showError("Oops! Please check your email");
    emailInput.focus();
    return;
  }

  clearError();

  const endpoint = form.dataset.endpoint.trim();
  if (!endpoint || window.location.protocol === "file:") {
    showStatus("Open the deployed page to join the early-access list.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting…";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`Signup request failed with status ${response.status}`);
    }

    form.reset();
    showStatus(
      "You’re on the list. Check your inbox for a confirmation and launch updates.",
      "success",
    );
  } catch (error) {
    console.error("Unable to submit early-access signup:", error);
    showStatus(
      "We couldn’t submit your signup. Please try again in a moment.",
      "error",
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Request Access";
  }
});
