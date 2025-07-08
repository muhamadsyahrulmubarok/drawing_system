<?php
header('Content-Type: application/json');
$data_file = __DIR__ . '/data.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($data_file)) {
        echo file_get_contents($data_file);
    } else {
        echo json_encode([
            'team1' => 'Nusumma Jateng',
            'team2' => 'Nusumma Jabar',
            'score1' => 0,
            'score2' => 0,
            'half' => 'First-Half',
            'timer' => '00:00'
        ]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        $data = [
            'team1' => $input['team1'] ?? 'Nusumma Jateng',
            'team2' => $input['team2'] ?? 'Nusumma Jabar',
            'score1' => intval($input['score1'] ?? 0),
            'score2' => intval($input['score2'] ?? 0),
            'half' => $input['half'] ?? 'First-Half',
            'timer' => $input['timer'] ?? '00:00'
        ];
        $fp = fopen($data_file, 'w');
        if (flock($fp, LOCK_EX)) {
            fwrite($fp, json_encode($data));
            fflush($fp);
            flock($fp, LOCK_UN);
        }
        fclose($fp);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
    }
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
exit;
