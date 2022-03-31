/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const glob = require('glob');

const ROOT_PATH = path.resolve(__dirname, '../')

const seekViewPath = (viewPath, cb) => {
  const fileList = glob.sync(path.resolve(__dirname, viewPath));
  if (fileList.length > 0) {
    fileList.forEach((file) => {
      const entryFileMatch = file.match(/(.*\/(.*))\/(entry\.js)$/i);
      const parentPath = viewPath.replace(/\*/, '');
      if (entryFileMatch && entryFileMatch[2]) {
        const [, entryPath, entryName, entryFileName] = entryFileMatch;
        const relPath = `../${entryPath.replace(ROOT_PATH, '').replace(/^\/|\/$/, '')}`;
        cb && cb({
          name: entryName,
          entryFileName,
          entryAbsPath: entryPath,
          entryRelPath: relPath,
        })
      } else {
        const reg = new RegExp(parentPath + '(.*)', 'i');
        const folder = file.match(reg)[1];
        if (!file.match(/.*\/(.*?)\..*/)) {
          seekViewPath(parentPath + folder + '/*', cb);
        }
      }
    });
  }
};

exports.seekViewPath = seekViewPath;