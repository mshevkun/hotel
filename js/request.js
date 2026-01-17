
// Convert text input into date picker on click
document.getElementById("dates").addEventListener("focus", function() {
  this.type = "date";
});

// Popup control
function showPopup() {
  document.getElementById("thankYouPopup").style.display = "flex";
}
function closePopup() {
  document.getElementById("thankYouPopup").style.display = "none";
}

// AJAX form submit
document.getElementById("rfpForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const form = e.target;

  if (document.getElementById("website").value !== "") return; // SPAM bot

  fetch(form.action, {
    method: "POST",
    body: new FormData(form)
  }).then(() => {
    showPopup();
    form.reset();
  });
});

