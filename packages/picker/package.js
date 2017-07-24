Package.describe({
  name: 'picker',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md',
});

Package.onUse(api => {
  api.versionsFrom('1.4.2.3');
  api.use('ecmascript');
  api.mainModule('picker.js', 'client');
});

Package.onTest(api => {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('picker');
  api.mainModule('picker-tests.js');
});
