详细说明新品推荐的手动编辑方法：
一、更换推荐产品的方法
直接编辑模板文件：
打开文件：layouts/partials/homepage/new_product_recommendations.html
找到产品定义部分（文件开头）：
   {{ $product1 := $.Site.GetPage "/products/product-dz60" }}
   {{ $product2 := $.Site.GetPage "/products/product-p2810" }}
   {{ $product3 := $.Site.GetPage "/products/WS-K09510-a" }}

修改产品路径，例如：
   {{ $product1 := $.Site.GetPage "/products/your-new-product" }}

产品路径说明：
路径格式：/products/产品文件夹名
例如：/products/WS-K09510-a
确保产品文件夹在 content/products/ 目录下

二、删除推荐产品的方法
删除单个产品：
打开模板文件
找到要删除的产品定义行
删除该行，例如删除第三个产品：
   {{ $product1 := $.Site.GetPage "/products/product-dz60" }}
   {{ $product2 := $.Site.GetPage "/products/product-p2810" }}
   // 删除第三行

同时需要修改产品遍历部分：
   {{ range slice $product1 $product2 }}  // 改为只遍历两个产品

删除所有产品：
删除所有产品定义
修改遍历部分为空
系统会自动显示占位产品

三、添加新产品的步骤
准备产品内容：
在 content/products/ 下创建产品文件夹
创建 index.md 文件
确保包含必要的参数：
   ---
   title: "产品名称"
   model: "产品型号"
   gallery:
     - image: "/images/products/产品图片.jpg"
       is_main: true
       alt: "产品图片描述"
   primary_category: "主分类"
   secondary_category: "子分类"
   ---
   
添加到推荐列表：
在模板文件中添加产品定义
确保产品路径正确
四、注意事项
产品内容要求：
必须包含主图（is_main: true）
必须设置主分类和次分类
必须设置产品型号
图片要求：
图片路径正确
建议使用统一尺寸
确保图片清晰
路径格式：
使用正斜杠 /
不要包含文件扩展名
路径区分大小写
常见问题处理：
如果产品不显示，检查路径是否正确
如果图片不显示，检查图片路径
如果分类不显示，检查分类参数名称
五、最佳实践
产品管理：
保持产品文件夹命名规范
定期更新产品信息
及时删除过期产品
图片管理：
使用统一的图片尺寸
压缩图片大小
使用有意义的文件名
分类管理：
使用统一的分类名称
保持分类层级清晰
避免重复分类