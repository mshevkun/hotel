<?php
// submit_rfp.php

// ✅ Destination email
$to = "info@hudsonvalleyresort.com";

// ✅ Subject (from hidden field, fallback if missing)
$subject = isset($_POST["subject"]) && trim($_POST["subject"]) !== ""
  ? trim($_POST["subject"])
  : "RFP Request — Hudson Valley Resort & Spa";

// ✅ Simple honeypot (bots fill hidden fields)
if (!empty($_POST["website"])) {
  // Pretend success (don't help spammers)
  header("Location: request-for-proposal.html?sent=1");
  exit;
}
function clean($v) {
  $v = is_string($v) ? $v : "";
  $v = trim($v);
  $v = str_replace(["\r", "\n"], " ", $v); // protect headers
  return $v;
}

$name      = clean($_POST["Name"] ?? "");
$email     = clean($_POST["Email"] ?? "");
$phone     = clean($_POST["Phone"] ?? "");
$guests    = clean($_POST["Guests"] ?? "");
$dates     = clean($_POST["Dates"] ?? "");
$eventType = clean($_POST["EventType"] ?? "");
$message   = trim((string)($_POST["Message"] ?? ""));

// Venues[] (checkboxes)
$venuesArr = $_POST["Venues"] ?? [];
if (!is_array($venuesArr)) $venuesArr = [];
$venuesArr = array_map("clean", $venuesArr);
$venues = count($venuesArr) ? implode(", ", $venuesArr) : "—";

// ✅ Basic validation
if ($name === "" || $email === "" || $phone === "" || $guests === "" || $dates === "" || $eventType === "") {
  // Redirect back with error status
  header("Location: request-for-proposal.html?sent=0&error=missing_fields");
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  header("Location: request-for-proposal.html?sent=0&error=invalid_email");
  exit;
}

// ✅ Build email body
$bodyLines = [
  "New RFP Request",
  "================",
  "Name: $name",
  "Email: $email",
  "Phone: $phone",
  "Number of Guests: $guests",
  "Requested Dates: $dates",
  "Event Type: $eventType",
  "Preferred Venues: $venues",
  "",
  "Additional Details:",
  $message !== "" ? $message : "—",
];

$body = implode("\n", $bodyLines);

// ✅ Headers
$fromName = "Hudson Valley Resort Website";
$headers = [];
$headers[] = "From: $fromName <no-reply@hudsonvalleyresort.com>";
$headers[] = "Reply-To: <$email>";
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

$headersStr = implode("\r\n", $headers);

// ✅ Send email (NOTE: attachments are NOT included in this simple mail() version)
$ok = mail($to, $subject, $body, $headersStr);

// ✅ Redirect back with status
if ($ok) {
  header("Location: request-for-proposal.html?sent=1");
  exit;
}

header("Location: request-for-proposal.html?sent=0");
exit;
