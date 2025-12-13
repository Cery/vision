#!/usr/bin/env node

/**
 * 全业务流程测试脚本
 * 测试：发布内容、发布需求、回应报价等完整流程
 */

const https = require('https');
const http = require('http');

// 配置
const config = {
  local: {
    api: 'http://localhost:8787',
    frontend: 'http://localhost:1313'
  },
  production: {
    api: 'https://api.visndt.com',
    frontend: 'https://www.visndt.com'
  }
};

// 测试结果
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// 工具函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const urlObj = new URL(url);
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = res.headers['content-type']?.includes('json') ? JSON.parse(data) : data;
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data, raw: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// 测试用例
class TestSuite {
  constructor(env, adminToken) {
    this.env = env;
    this.adminToken = adminToken;
    this.apiBase = config[env].api;
    this.frontendBase = config[env].frontend;
    this.testData = {};
  }

  async test(name, testFn) {
    try {
      console.log(`\n🧪 测试: ${name}`);
      await testFn();
      results.passed.push({ env: this.env, test: name });
      console.log(`✅ 通过: ${name}`);
      return true;
    } catch (error) {
      results.failed.push({ env: this.env, test: name, error: error.message });
      console.log(`❌ 失败: ${name} - ${error.message}`);
      return false;
    }
  }

  // 1. 测试管理员登录
  async testAdminLogin() {
    const response = await makeRequest(`${this.apiBase}/api/admin/login`, {
      method: 'POST',
      body: {
        username: process.env.ADMIN_USER || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123456'
      }
    });

    if (response.status !== 200 || !response.data.ok) {
      throw new Error(`登录失败: ${JSON.stringify(response.data)}`);
    }

    if (!response.data.token) {
      throw new Error('未返回Token');
    }

    this.adminToken = response.data.token;
    this.testData.adminToken = this.adminToken;
    console.log(`   获取Token: ${this.adminToken.substring(0, 20)}...`);
  }

  // 2. 测试发布产品
  async testCreateProduct() {
    const productData = {
      name: `测试产品-${Date.now()}`,
      slug: `test-product-${Date.now()}`,
      model: 'TEST-001',
      series: 'Test Series',
      primary_category: '电子内窥镜',
      secondary_category: '工业视频内窥镜',
      summary: '这是一个测试产品',
      description: '测试产品详细描述',
      status: 'active',
      is_featured: 0
    };

    const response = await makeRequest(`${this.apiBase}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
        'X-Admin-Key': this.adminToken
      },
      body: productData
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`创建产品失败: ${JSON.stringify(response.data)}`);
    }

    this.testData.productId = response.data.product_id || response.data.id;
    console.log(`   产品ID: ${this.testData.productId}`);
  }

  // 3. 测试发布新闻
  async testCreateNews() {
    const newsData = {
      title: `测试新闻-${Date.now()}`,
      slug: `test-news-${Date.now()}`,
      summary: '这是一条测试新闻',
      content: '测试新闻内容',
      category: 'tech-article',
      status: 'published',
      published_at: new Date().toISOString()
    };

    const response = await makeRequest(`${this.apiBase}/api/admin/news`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
        'X-Admin-Key': this.adminToken
      },
      body: newsData
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`创建新闻失败: ${JSON.stringify(response.data)}`);
    }

    this.testData.newsId = response.data.news_id || response.data.id;
    console.log(`   新闻ID: ${this.testData.newsId}`);
  }

  // 4. 测试发布案例
  async testCreateCase() {
    const caseData = {
      title: `测试案例-${Date.now()}`,
      slug: `test-case-${Date.now()}`,
      summary: '这是一个测试案例',
      content: '测试案例详细内容',
      industry: 'aerospace',
      status: 'published',
      published_at: new Date().toISOString()
    };

    const response = await makeRequest(`${this.apiBase}/api/admin/cases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
        'X-Admin-Key': this.adminToken
      },
      body: caseData
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`创建案例失败: ${JSON.stringify(response.data)}`);
    }

    this.testData.caseId = response.data.case_id || response.data.id;
    console.log(`   案例ID: ${this.testData.caseId}`);
  }

  // 5. 测试发布需求
  async testCreateRequirement() {
    const requirementData = {
      Title: `测试需求-${Date.now()}`,
      primaryCategory: '电子内窥镜',
      contactName: '测试联系人',
      contactPhone: '13800138000',
      contactCompany: '测试公司',
      contactEmail: 'test@example.com',
      PublicPreview: '这是一个测试需求',
      Status: '公开',
      Progress: '发布中'
    };

    const response = await makeRequest(`${this.apiBase}/api/markets`, {
      method: 'POST',
      body: requirementData
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`发布需求失败: ${JSON.stringify(response.data)}`);
    }

    if (!response.data.requirement_id && !response.data.RequirementID) {
      throw new Error('未返回需求ID');
    }

    this.testData.requirementId = response.data.requirement_id || response.data.RequirementID;
    this.testData.viewPassword = response.data.ViewPassword || response.data.view_password_plain;
    console.log(`   需求ID: ${this.testData.requirementId}`);
    console.log(`   查看密码: ${this.testData.viewPassword}`);
  }

  // 6. 测试供应商注册
  async testSupplierRegister() {
    const supplierData = {
      name: '测试供应商',
      company: `测试供应商公司-${Date.now()}`,
      contact_phone: '13900139000',
      contact_email: 'supplier@example.com'
    };

    const response = await makeRequest(`${this.apiBase}/api/suppliers/register`, {
      method: 'POST',
      body: supplierData
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`供应商注册失败: ${JSON.stringify(response.data)}`);
    }

    this.testData.supplierId = response.data.supplier_id || response.data.id;
    console.log(`   供应商ID: ${this.testData.supplierId}`);
  }

  // 7. 测试提交报价
  async testSubmitQuote() {
    if (!this.testData.requirementId) {
      throw new Error('需求ID不存在，请先创建需求');
    }

    const quoteData = {
      requirement_id: this.testData.requirementId,
      supplier_name: '测试供应商',
      supplier_phone: '13900139000',
      amount: 10000,
      currency: 'CNY',
      remarks: '这是测试报价'
    };

    const response = await makeRequest(`${this.apiBase}/api/quotes`, {
      method: 'POST',
      body: quoteData
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`提交报价失败: ${JSON.stringify(response.data)}`);
    }

    this.testData.quoteId = response.data.quote_id || response.data.id;
    console.log(`   报价ID: ${this.testData.quoteId}`);
  }

  // 8. 测试前端数据获取
  async testFrontendData() {
    // 测试产品列表
    const productsResponse = await makeRequest(`${this.frontendBase}/api/products?limit=10`);
    if (productsResponse.status !== 200) {
      throw new Error(`获取产品列表失败: ${productsResponse.status}`);
    }
    console.log(`   产品列表: ${productsResponse.data.items?.length || 0} 条`);

    // 测试新闻列表
    const newsResponse = await makeRequest(`${this.frontendBase}/api/news?limit=10`);
    if (newsResponse.status !== 200) {
      throw new Error(`获取新闻列表失败: ${newsResponse.status}`);
    }
    console.log(`   新闻列表: ${newsResponse.data.items?.length || 0} 条`);

    // 测试案例列表
    const casesResponse = await makeRequest(`${this.frontendBase}/api/cases?limit=10`);
    if (casesResponse.status !== 200) {
      throw new Error(`获取案例列表失败: ${casesResponse.status}`);
    }
    console.log(`   案例列表: ${casesResponse.data.items?.length || 0} 条`);

    // 测试需求列表
    const requirementsResponse = await makeRequest(`${this.frontendBase}/api/markets?limit=10`);
    if (requirementsResponse.status !== 200) {
      throw new Error(`获取需求列表失败: ${requirementsResponse.status}`);
    }
    console.log(`   需求列表: ${Array.isArray(requirementsResponse.data) ? requirementsResponse.data.length : 0} 条`);
  }

  // 9. 测试管理后台数据同步
  async testAdminDataSync() {
    // 测试统计接口
    const statsResponse = await makeRequest(`${this.apiBase}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
        'X-Admin-Key': this.adminToken
      }
    });

    if (statsResponse.status !== 200) {
      throw new Error(`获取统计失败: ${statsResponse.status}`);
    }

    console.log(`   统计数据:`);
    console.log(`     - 需求: ${statsResponse.data.requirements?.total || 0}`);
    console.log(`     - 产品: ${statsResponse.data.products || 0}`);
    console.log(`     - 供应商: ${statsResponse.data.suppliers || 0}`);
    console.log(`     - 报价: ${statsResponse.data.quotes || 0}`);

    // 测试数据导出
    const exportResponse = await makeRequest(`${this.apiBase}/api/admin/export?table=requirements&format=json`, {
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
        'X-Admin-Key': this.adminToken
      }
    });

    if (exportResponse.status !== 200) {
      results.warnings.push({ env: this.env, test: '数据导出', message: '导出功能可能未实现' });
    } else {
      console.log(`   数据导出: 成功`);
    }
  }

  // 10. 测试需求撮合
  async testMatchSuppliers() {
    if (!this.testData.requirementId) {
      throw new Error('需求ID不存在，请先创建需求');
    }

    const response = await makeRequest(`${this.apiBase}/api/admin/match-suppliers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
        'X-Admin-Key': this.adminToken,
        'Content-Type': 'application/json'
      },
      body: {
        requirement_id: this.testData.requirementId
      }
    });

    if (response.status !== 200) {
      throw new Error(`需求撮合失败: ${JSON.stringify(response.data)}`);
    }

    console.log(`   匹配结果: ${response.data.matches?.length || 0} 个供应商`);
  }

  // 运行所有测试
  async runAll() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 开始测试环境: ${this.env.toUpperCase()}`);
    console.log(`API地址: ${this.apiBase}`);
    console.log(`前端地址: ${this.frontendBase}`);
    console.log(`${'='.repeat(60)}`);

    // 基础功能测试
    await this.test('管理员登录', () => this.testAdminLogin());
    
    // 内容发布测试
    await this.test('发布产品', () => this.testCreateProduct());
    await this.test('发布新闻', () => this.testCreateNews());
    await this.test('发布案例', () => this.testCreateCase());
    
    // 需求市场测试
    await this.test('发布需求', () => this.testCreateRequirement());
    await this.test('供应商注册', () => this.testSupplierRegister());
    await this.test('提交报价', () => this.testSubmitQuote());
    
    // 前端数据测试
    await this.test('前端数据获取', () => this.testFrontendData());
    
    // 管理后台测试
    await this.test('管理后台数据同步', () => this.testAdminDataSync());
    await this.test('需求撮合', () => this.testMatchSuppliers());

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ ${this.env.toUpperCase()} 环境测试完成`);
    console.log(`${'='.repeat(60)}`);
  }
}

// 主函数
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Vision NDT 全业务流程测试脚本                    ║
╚════════════════════════════════════════════════════════════╝
  `);

  const args = process.argv.slice(2);
  const testEnv = args[0] || 'local'; // local 或 production

  if (!['local', 'production', 'all'].includes(testEnv)) {
    console.error('❌ 错误: 测试环境必须是 local, production 或 all');
    process.exit(1);
  }

  try {
    if (testEnv === 'all' || testEnv === 'local') {
      const localSuite = new TestSuite('local');
      await localSuite.runAll();
    }

    if (testEnv === 'all' || testEnv === 'production') {
      console.log('\n⏳ 等待5秒后测试生产环境...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const prodSuite = new TestSuite('production');
      await prodSuite.runAll();
    }

    // 输出测试结果
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 测试结果汇总');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ 通过: ${results.passed.length} 项`);
    console.log(`❌ 失败: ${results.failed.length} 项`);
    console.log(`⚠️  警告: ${results.warnings.length} 项`);

    if (results.failed.length > 0) {
      console.log(`\n❌ 失败的测试:`);
      results.failed.forEach(f => {
        console.log(`   - [${f.env}] ${f.test}: ${f.error}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log(`\n⚠️  警告:`);
      results.warnings.forEach(w => {
        console.log(`   - [${w.env}] ${w.test}: ${w.message}`);
      });
    }

    // 退出码
    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error) {
    console.error(`\n❌ 测试执行错误: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { TestSuite, makeRequest };
