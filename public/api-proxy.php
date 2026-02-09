<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get the URL and Method from the request
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$targetUrl = '';
$method = 'GET';
$body = '';

if ($data) {
    $targetUrl = isset($data['url']) ? $data['url'] : '';
    $method = isset($data['method']) ? strtoupper($data['method']) : 'GET';
    $body = isset($data['body']) ? (is_array($data['body']) ? json_encode($data['body']) : $data['body']) : '';
} elseif (isset($_GET['url'])) {
    $targetUrl = $_GET['url'];
}

if (empty($targetUrl)) {
    echo json_encode(['error' => 'Missing target URL']);
    exit;
}

// Basic security: Check if protocol is http/https
if (!preg_match('/^https?:\/\//', $targetUrl)) {
    echo json_encode(['error' => 'Invalid protocol']);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

if ($method === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    if (!empty($body)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
}

$responseHeaders = [];
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($curl, $header) use (&$responseHeaders) {
    $len = strlen($header);
    $header = explode(':', $header, 2);
    if (count($header) < 2) return $len;
    $responseHeaders[trim($header[0])] = trim($header[1]);
    return $len;
});

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo json_encode(['error' => $error]);
} else {
    $decoded = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $finalData = $decoded;
    } else {
        $finalData = $response;
    }
    
    echo json_encode([
        'data' => $finalData,
        'status' => $httpCode,
        'headers' => $responseHeaders,
        'statusText' => '' // PHP curl doesn't easily give the text (e.g. "OK")
    ]);
}
?>
