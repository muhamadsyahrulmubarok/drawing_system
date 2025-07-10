<?php
header('Content-Type: application/json');
$dataFile = __DIR__ . '/data.json';
$action = $_GET['action'] ?? '';

if ($action === 'read') {
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        echo json_encode([]);
    }
    exit;
}

if ($action === 'write' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if ($data !== null) {
        $fp = fopen($dataFile, 'w');
        if (flock($fp, LOCK_EX)) {
            fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            fflush($fp);
            flock($fp, LOCK_UN);
        }
        fclose($fp);
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
