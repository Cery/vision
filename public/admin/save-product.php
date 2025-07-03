<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['fileName']) || !isset($input['content'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing fileName or content']);
    exit;
}

$fileName = $input['fileName'];
$content = $input['content'];
$basePath = $input['path'] ?? 'content/products/';

// 安全检查：确保文件名只包含安全字符
if (!preg_match('/^[a-zA-Z0-9_-]+\.md$/', $fileName)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file name']);
    exit;
}

// 构建完整路径
$projectRoot = dirname(dirname(__DIR__)); // 从static/admin回到项目根目录
$fullPath = $projectRoot . '/' . $basePath . $fileName;
$directory = dirname($fullPath);

// 确保目录存在
if (!is_dir($directory)) {
    if (!mkdir($directory, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create directory']);
        exit;
    }
}

// 保存文件
if (file_put_contents($fullPath, $content) !== false) {
    echo json_encode([
        'success' => true, 
        'message' => "File saved to {$basePath}{$fileName}",
        'path' => $fullPath
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
}
?>
