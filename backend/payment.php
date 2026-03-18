<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

define('RAZORPAY_KEY_ID',     'rzp_test_SSXe5CloBVKPtA');
define('RAZORPAY_KEY_SECRET', 'CTX0wNVY92ja4JsQG33dOKBO');

$raw    = json_decode(file_get_contents('php://input'), true);
$action = $raw['action'] ?? '';

if ($action === 'create_order') {
    $amountPaise = intval($raw['amount_paise'] ?? 0);
    if ($amountPaise < 100) {
        echo json_encode(["success" => false, "message" => "Invalid amount"]);
        exit;
    }

    $ch = curl_init('https://api.razorpay.com/v1/orders');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(["amount" => $amountPaise, "currency" => "INR", "receipt" => "CPN".uniqid(), "payment_capture" => 1]),
        CURLOPT_HTTPHEADER     => ["Content-Type: application/json"],
        CURLOPT_USERPWD        => RAZORPAY_KEY_ID . ":" . RAZORPAY_KEY_SECRET,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        $err = json_decode($response, true);
        echo json_encode(["success" => false, "message" => $err['error']['description'] ?? 'Razorpay error']);
        exit;
    }

    $order = json_decode($response, true);
    echo json_encode([
        "success"  => true,
        "order_id" => $order['id'],
        "amount"   => $amountPaise,
        "currency" => "INR",
        "key_id"   => RAZORPAY_KEY_ID,
    ]);
    exit;
}

if ($action === 'verify_payment') {
    $orderId     = $raw['razorpay_order_id']   ?? '';
    $paymentId   = $raw['razorpay_payment_id'] ?? '';
    $signature   = $raw['razorpay_signature']  ?? '';
    $bookingRef  = 'CPN' . strtoupper(substr(uniqid(), -8));

    // Verify signature
    $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, RAZORPAY_KEY_SECRET);
    if (!hash_equals($expected, $signature)) {
        echo json_encode(["success" => false, "message" => "Payment verification failed"]);
        exit;
    }

    // Save to DB silently
    try {
        require_once 'db.php';
        $conn        = getDbConnection();
        $userId      = intval($raw['user_id']      ?? 0);
        $eventExtId  = $raw['event_id']            ?? '';
        $eventTitle  = $raw['event_title']         ?? '';
        $seats       = $raw['seats']               ?? '';
        $ticketCount = intval($raw['ticket_count'] ?? 1);
        $totalPrice  = floatval($raw['total_price'] ?? 0);

        if ($userId > 0 && $eventExtId) {
            $stmt = $conn->prepare("INSERT INTO bookings (user_id, event_ext_id, event_title, seats, ticket_count, total_price, booking_ref, status) VALUES (?,?,?,?,?,?,?,'confirmed')");
            $stmt->bind_param("isssisd", $userId, $eventExtId, $eventTitle, $seats, $ticketCount, $totalPrice, $bookingRef);
            $stmt->execute();
            $stmt->close();
        }
        $conn->close();
    } catch (Exception $e) {}

    echo json_encode([
        "success"     => true,
        "booking_ref" => $bookingRef,
        "payment_id"  => $paymentId,
    ]);
    exit;
}

echo json_encode(["success" => false, "message" => "Unknown action"]);
