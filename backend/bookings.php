<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'db.php';
$conn = getDbConnection();

$userId = intval($_GET['user_id'] ?? 0);

if (!$userId) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT id, event_ext_id, event_title, seats, ticket_count,
            total_price, booking_ref, status, created_at
     FROM bookings
     WHERE user_id = ?
     ORDER BY created_at DESC"
);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) $bookings[] = $row;

echo json_encode(["success" => true, "bookings" => $bookings]);

$stmt->close();
$conn->close();
?>
