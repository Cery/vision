window.CMS_MANUAL_INIT = true;

// 配置预览样式
CMS.registerPreviewStyle('/css/style.css');

// 配置预览模板
CMS.registerPreviewTemplate('products', createClass({
  render: function() {
    const entry = this.props.entry;
    return h('div', {},
      h('h1', {}, entry.getIn(['data', 'title'])),
      h('div', {"className": "content"}, this.props.widgetFor('body'))
    );
  }
}));

CMS.registerPreviewTemplate('news', createClass({
  render: function() {
    const entry = this.props.entry;
    return h('div', {},
      h('h1', {}, entry.getIn(['data', 'title'])),
      h('div', {"className": "content"}, this.props.widgetFor('body'))
    );
  }
}));

// 初始化 CMS
CMS.init(); 