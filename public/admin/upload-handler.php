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

// 检查是否有文件上传
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['file'];
$uploadType = $_POST['type'] ?? 'image'; // image, document, media

// 文件验证
$allowedTypes = [
    'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'document' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar'],
    'media' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx']
];

$fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$fileName = pathinfo($file['name'], PATHINFO_FILENAME);

if (!in_array($fileExtension, $allowedTypes[$uploadType] ?? [])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File type not allowed']);
    exit;
}

// 确定上传目录
$projectRoot = dirname(dirname(__DIR__));
$uploadDirs = [
    'image' => 'static/images/uploads/',
    'document' => 'static/uploads/',
    'media' => 'static/images/media/'
];

$uploadDir = $projectRoot . '/' . $uploadDirs[$uploadType];

// 确保目录存在
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create upload directory']);
        exit;
    }
}

// 生成唯一文件名
$timestamp = date('YmdHis');
$uniqueFileName = $fileName . '_' . $timestamp . '.' . $fileExtension;
$filePath = $uploadDir . $uniqueFileName;

// 移动上传的文件
if (move_uploaded_file($file['tmp_name'], $filePath)) {
    // 生成相对路径
    $relativePath = '/' . $uploadDirs[$uploadType] . $uniqueFileName;
    
    // 获取文件大小
    $fileSize = formatFileSize(filesize($filePath));
    
    // 返回成功响应
    echo json_encode([
        'success' => true,
        'fileName' => $uniqueFileName,
        'originalName' => $file['name'],
        'path' => $relativePath,
        'size' => $fileSize,
        'type' => $uploadType,
        'url' => $relativePath // 用于直接访问
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
}

function formatFileSize($bytes) {
    if ($bytes === 0) return '0 Bytes';
    $k = 1024;
    $sizes = ['Bytes', 'KB', 'MB', 'GB'];
    $i = floor(log($bytes) / log($k));
    return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
}
?>
