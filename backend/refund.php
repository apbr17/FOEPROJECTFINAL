<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'db.php';

define('RAZORPAY_KEY_ID',     'rzp_test_SSXe5CloBVKPtA');
define('RAZORPAY_KEY_SECRET', 'CTX0wNVY92ja4JsQG33dOKBO');

$conn   = getDbConnection();
$raw    = json_decode(file_get_contents('php://input'), true);
$userId      = intval($raw['user_id']      ?? 0);
$bookingRef  = $raw['booking_ref']         ?? '';
$reason      = $raw['reason']              ?? 'customer_request';

if (!$userId || !$bookingRef) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

// 1. Get booking + payment details
$stmt = $conn->prepare(
    "SELECT b.id, b.total_price, b.status, p.razorpay_payment_id, p.amount_paise
     FROM bookings b
     LEFT JOIN payments p ON p.booking_ref = b.booking_ref
     WHERE b.booking_ref = ? AND b.user_id = ?"
);
$stmt->bind_param("si", $bookingRef, $userId);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(["success" => false, "message" => "Booking not found"]);
    $conn->close(); exit;
}
if ($row['status'] === 'cancelled') {
    echo json_encode(["success" => false, "message" => "Booking already cancelled"]);
    $conn->close(); exit;
}

$paymentId  = $row['razorpay_payment_id'];
$amountPaise = intval($row['amount_paise']);

// 2. If real payment ID exists → call Razorpay refund API
$refundId = null;
if ($paymentId && strpos($paymentId, 'pay_') === 0) {
    $ch = curl_init("https://api.razorpay.com/v1/payments/{$paymentId}/refund");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(["amount" => $amountPaise, "notes" => ["reason" => $reason]]),
        CURLOPT_HTTPHEADER     => ["Content-Type: application/json"],
        CURLOPT_USERPWD        => RAZORPAY_KEY_ID . ":" . RAZORPAY_KEY_SECRET,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $refund   = json_decode($response, true);
        $refundId = $refund['id'] ?? null;
    } else {
        $err = json_decode($response, true);
        echo json_encode(["success" => false, "message" => "Razorpay refund error: " . ($err['error']['description'] ?? 'unknown')]);
        $conn->close(); exit;
    }
}

// 3. Update booking status to cancelled
$upd = $conn->prepare("UPDATE bookings SET status='cancelled' WHERE booking_ref=? AND user_id=?");
$upd->bind_param("si", $bookingRef, $userId);
$upd->execute();
$upd->close();

// 4. Update payment status
$upd2 = $conn->prepare("UPDATE payments SET status='failed' WHERE booking_ref=?");
$upd2->bind_param("s", $bookingRef);
$upd2->execute();
$upd2->close();

echo json_encode([
    "success"     => true,
    "message"     => "Booking cancelled and refund initiated",
    "refund_id"   => $refundId,
    "booking_ref" => $bookingRef,
    "amount"      => "₹" . number_format($amountPaise / 100, 2),
    "note"        => $refundId
        ? "Refund of ₹" . number_format($amountPaise/100,2) . " will reflect in 5–7 business days"
        : "Booking cancelled. If payment was made, contact support with ref: $bookingRef",
]);

$conn->close();
?>
