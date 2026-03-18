<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'db.php';
$conn = getDbConnection();

// Accept JSON body (same as register.php)
$raw         = json_decode(file_get_contents('php://input'), true);
$email       = trim($raw['email'] ?? '');
$passwordRaw = $raw['password'] ?? '';

if (!$email || !$passwordRaw) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, first_name, last_name, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    $stmt->close(); $conn->close(); exit;
}

$user = $result->fetch_assoc();

if (password_verify($passwordRaw, $user['password'])) {
    echo json_encode([
        "success" => true,
        "user" => [
            "id"        => $user['id'],
            "firstName" => $user['first_name'],
            "lastName"  => $user['last_name'],
            "email"     => $email
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
}

$stmt->close();
$conn->close();
?>
