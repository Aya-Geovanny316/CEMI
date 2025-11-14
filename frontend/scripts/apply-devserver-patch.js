const fs = require('fs');

const configPath = require.resolve(
  'react-scripts/config/webpackDevServer.config.js'
);

const originalSnippet = `    onBeforeSetupMiddleware(devServer) {\n      // Keep \`evalSourceMapMiddleware\`\n      // middlewares before \`redirectServedPath\` otherwise will not have any effect\n      // This lets us fetch source contents from webpack for the error overlay\n      devServer.app.use(evalSourceMapMiddleware(devServer));\n\n      if (fs.existsSync(paths.proxySetup)) {\n        // This registers user provided middleware for proxy reasons\n        require(paths.proxySetup)(devServer.app);\n      }\n    },\n    onAfterSetupMiddleware(devServer) {\n      // Redirect to \`PUBLIC_URL\` or \`homepage\` from \`package.json\` if url not match\n      devServer.app.use(redirectServedPath(paths.publicUrlOrPath));\n\n      // This service worker file is effectively a 'no-op' that will reset any\n      // previous service worker registered for the same host:port combination.\n      // We do this in development to avoid hitting the production cache if\n      // it used the same host and port.\n      // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432\n      devServer.app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));\n    },`;

const previousPatchedSnippet = `    onBeforeSetupMiddleware(devServer) {\n      if (!devServer) {\n        return;\n      }\n\n      devServer.app.use(evalSourceMapMiddleware(devServer));\n\n      if (fs.existsSync(paths.proxySetup)) {\n        require(paths.proxySetup)(devServer.app);\n      }\n    },\n    onAfterSetupMiddleware(devServer) {\n      if (!devServer) {\n        return;\n      }\n\n      devServer.app.use(redirectServedPath(paths.publicUrlOrPath));\n      devServer.app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));\n    },\n    setupMiddlewares(middlewares, devServer) {\n      if (!devServer) {\n        return middlewares;\n      }\n\n      devServer.app.use(evalSourceMapMiddleware(devServer));\n\n      if (fs.existsSync(paths.proxySetup)) {\n        require(paths.proxySetup)(devServer.app);\n      }\n\n      devServer.app.use(redirectServedPath(paths.publicUrlOrPath));\n      devServer.app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));\n\n      return middlewares;\n    },`;

const setupMiddlewaresSnippet = `    setupMiddlewares(middlewares, devServer) {\n      if (!devServer) {\n        return middlewares;\n      }\n\n      devServer.app.use(evalSourceMapMiddleware(devServer));\n\n      if (fs.existsSync(paths.proxySetup)) {\n        require(paths.proxySetup)(devServer.app);\n      }\n\n      devServer.app.use(redirectServedPath(paths.publicUrlOrPath));\n      devServer.app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));\n\n      return middlewares;\n    },`;

const httpsSnippet = '    https: getHttpsConfig(),';

const serverSnippet = `    server: (() => {\n      const httpsConfig = getHttpsConfig();\n\n      if (!httpsConfig) {\n        return { type: 'http' };\n      }\n\n      if (httpsConfig === true) {\n        return { type: 'https' };\n      }\n\n      return { type: 'https', options: httpsConfig };\n    })(),`;

const fileContents = fs.readFileSync(configPath, 'utf8');

let updated = fileContents;
let modified = false;

if (updated.includes(previousPatchedSnippet)) {
  updated = updated.replace(previousPatchedSnippet, setupMiddlewaresSnippet);
  modified = true;
} else if (updated.includes(originalSnippet)) {
  updated = updated.replace(originalSnippet, setupMiddlewaresSnippet);
  modified = true;
} else if (!updated.includes(setupMiddlewaresSnippet)) {
  throw new Error('Unexpected react-scripts webpackDevServer config format.');
}

if (updated.includes(httpsSnippet)) {
  updated = updated.replace(httpsSnippet, serverSnippet);
  modified = true;
} else if (!updated.includes(serverSnippet)) {
  throw new Error('Unable to locate https configuration snippet.');
}

if (modified) {
  fs.writeFileSync(configPath, updated);
}
