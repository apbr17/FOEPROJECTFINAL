<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'db.php';
$conn = getDbConnection();

$raw         = json_decode(file_get_contents('php://input'), true);
$userId      = intval($raw['user_id']      ?? 0);
$eventExtId  = $raw['event_ext_id']        ?? '';
$eventTitle  = $raw['event_title']         ?? '';
$seats       = $raw['seats']               ?? '';
$ticketCount = intval($raw['ticket_count'] ?? 1);
$totalPrice  = floatval($raw['total_price'] ?? 0);
$bookingRef  = $raw['booking_ref']         ?? '';

if (!$userId || !$eventExtId || !$bookingRef) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$stmt = $conn->prepare(
    "INSERT IGNORE INTO bookings
     (user_id, event_ext_id, event_title, seats, ticket_count, total_price, booking_ref, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')"
);
$stmt->bind_param("isssisd",
    $userId, $eventExtId, $eventTitle, $seats, $ticketCount, $totalPrice, $bookingRef
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "booking_ref" => $bookingRef]);
} else {
    echo json_encode(["success" => false, "message" => "Could not save booking"]);
}

$stmt->close();
$conn->close();
?>
