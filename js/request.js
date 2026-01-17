// Check URL parameters for form feedback
(function() {
  const params = new URLSearchParams(window.location.search);
  const sent = params.get("sent");
  const error = params.get("error");

  if (sent === "1") {
    const popup = document.getElementById("thankYouPopup");
    if (popup) {
      popup.style.display = "flex";
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } else if (sent === "0" || error) {
    let errorMessage = "There was an error submitting your form. Please try again.";
    if (error === "missing_fields") {
      errorMessage = "Please fill in all required fields.";
    } else if (error === "invalid_email") {
      errorMessage = "Please enter a valid email address.";
    }
    showErrorMessage(errorMessage);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
})();

// Convert text input into date picker on click
const datesInput = document.getElementById("dates");
if (datesInput) {
  datesInput.addEventListener("focus", function() {
    this.type = "date";
  });
}

// Popup control
function showPopup() {
  const popup = document.getElementById("thankYouPopup");
  if (popup) {
    popup.style.display = "flex";
  }
}

function closePopup() {
  const popup = document.getElementById("thankYouPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

// Error message display
function showErrorMessage(message) {
  // Remove any existing error messages
  const existing = document.querySelector(".form-error-message");
  if (existing) existing.remove();

  // Create error message element
  const errorDiv = document.createElement("div");
  errorDiv.className = "form-error-message";
  errorDiv.style.cssText = "background: #dc3545; color: white; padding: 12px; border-radius: 6px; margin-bottom: 16px; text-align: center;";
  errorDiv.textContent = message;

  const form = document.getElementById("rfpForm");
  if (form) {
    form.insertBefore(errorDiv, form.firstChild);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
}

// AJAX form submit
const rfpForm = document.getElementById("rfpForm");
if (rfpForm) {
  rfpForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const form = e.target;

    // Honeypot check
    if (document.getElementById("website").value !== "") return; // SPAM bot

    // Remove any existing error messages
    const existing = document.querySelector(".form-error-message");
    if (existing) existing.remove();

    // Show loading state (optional - can add spinner here)

    fetch(form.action, {
      method: "POST",
      body: new FormData(form)
    })
    .then(response => {
      if (response.ok) {
        // Success
        showPopup();
        form.reset();
        // Reset date input type
        if (datesInput) datesInput.type = "text";
      } else {
        // Server error
        showErrorMessage("There was an error submitting your form. Please try again.");
      }
    })
    .catch(error => {
      console.error("Form submission error:", error);
      showErrorMessage("There was an error submitting your form. Please check your connection and try again.");
    });
  });
}

