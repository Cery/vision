-- Import Requirements
INSERT OR IGNORE INTO requirements (
      requirement_id, title, public_preview, primary_category, secondary_category, status,
      contact_name, contact_phone, contact_company, contact_email, contact_department,
      contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
      progress, view_password_plain, created_at, updated_at
    ) VALUES (
      'REQ-20250115-001', '某汽车制造有限公司的电子内窥镜需求', '用于发动机缸体内部检测，需高清成像、支持测量功能，能检测直径≥6mm孔洞。', '电子内窥镜', '主机/插入管', '公开',
      '张工程师', '13800001111', '某汽车制造有限公司', NULL, NULL,
      1, 0, '{"ScreenSize":"6英寸","BatteryLife":"8小时","ProbeDiameter":"6.0mm","Resolution":"100万","ViewingDirection":"直视","LightSource":"LED光源","Guidance":"四方向360度导向"}', '2025-01-15T10:30:00Z', '10-20万', '',
      NULL, '', '2025-11-11T01:11:48.185Z', '2025-11-11T01:11:48.185Z'
    );
INSERT OR IGNORE INTO requirements (
      requirement_id, title, public_preview, primary_category, secondary_category, status,
      contact_name, contact_phone, contact_company, contact_email, contact_department,
      contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
      progress, view_password_plain, created_at, updated_at
    ) VALUES (
      'REQ-20250115-002', '航空发动机叶片检测的光纤内窥镜需求', '需要超柔性探头，可通过复杂路径检测；支持冷光源与多种视向。', '光纤内窥镜', '插入管', '在线报价',
      '李经理', '13900002222', '某航空科技公司', NULL, NULL,
      0, 0, '{"ProbeDiameter":"2.8mm","WorkingLength":"2.5m","ViewingDirection":"侧视(90°)","LightSource":"光纤光源","FieldOfView":"110°"}', '2025-01-15T09:15:00Z', '20-50万', '',
      NULL, '', '2025-11-11T01:11:48.207Z', '2025-11-11T01:11:48.207Z'
    );
INSERT OR IGNORE INTO requirements (
      requirement_id, title, public_preview, primary_category, secondary_category, status,
      contact_name, contact_phone, contact_company, contact_email, contact_department,
      contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
      progress, view_password_plain, created_at, updated_at
    ) VALUES (
      'REQ-20250112-003', '精密机械零件检测的光学内窥镜需求', '用于精密机械零件的质量检测，要求成像清晰、操作简便。', '光学内窥镜', '镜头', '公开',
      '王总监', '13700003333', '某精密制造企业', NULL, NULL,
      1, 0, '{"ProbeDiameter":"2.5mm","WorkingLength":"175mm","ViewingDirection":"直视(0°)","LightSource":"冷光源","FieldOfView":"70°"}', '2025-01-12T12:20:00Z', '5-10万', '',
      NULL, '', '2025-11-11T01:11:48.207Z', '2025-11-11T01:11:48.207Z'
    );
INSERT OR IGNORE INTO requirements (
      requirement_id, title, public_preview, primary_category, secondary_category, status,
      contact_name, contact_phone, contact_company, contact_email, contact_department,
      contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
      progress, view_password_plain, created_at, updated_at
    ) VALUES (
      'REQ-20250110-004', '电力设备检修的电子内窥镜需求', '巡检电厂锅炉及管道，需要高温环境下稳定工作，支持高清拍摄。', '电子内窥镜', '插入管', '公开',
      '赵工', '13600004444', '某电力公司', NULL, NULL,
      1, 0, '{"ScreenSize":"7英寸","BatteryLife":"6小时","ProbeDiameter":"4.0mm","Resolution":"200万","ViewingDirection":"直视","LightSource":"LED光源","Guidance":"双向导向"}', '2025-01-10T08:00:00Z', '8-15万', '',
      NULL, '', '2025-11-11T01:11:48.207Z', '2025-11-11T01:11:48.207Z'
    );
INSERT OR IGNORE INTO requirements (
      requirement_id, title, public_preview, primary_category, secondary_category, status,
      contact_name, contact_phone, contact_company, contact_email, contact_department,
      contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
      progress, view_password_plain, created_at, updated_at
    ) VALUES (
      'REQ-20250108-005', '医疗器械厂的光学内窥镜研发配套', '用于新型医疗器械研发验证，需要高质量光学镜头与多视场选项。', '光学内窥镜', '镜头', '在线报价',
      '周博士', '13500005555', '某医疗器械有限公司', NULL, NULL,
      0, 0, '{"ViewingDirection":"变焦镜头","FieldOfView":"60°/90°可选","WorkingLength":"200mm","LightSource":"光纤光源"}', '2025-01-08T16:45:00Z', '30-80万', '',
      NULL, '', '2025-11-11T01:11:48.207Z', '2025-11-11T01:11:48.207Z'
    );

-- Import Suppliers
