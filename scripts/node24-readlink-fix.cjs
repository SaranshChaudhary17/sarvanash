function isNode24WindowsReadlinkError(error) {
  return (
    process.platform === "win32" &&
    error &&
    error.code === "EISDIR" &&
    error.syscall === "readlink"
  );
}

function normalizeReadlinkError(error) {
  if (!isNode24WindowsReadlinkError(error)) {
    return error;
  }

  const normalizedError = new Error(error.message.replace("EISDIR", "EINVAL"));
  normalizedError.code = "EINVAL";
  normalizedError.errno = error.errno;
  normalizedError.path = error.path;
  normalizedError.syscall = error.syscall;
  return normalizedError;
}

function patchFs(fs) {
  if (!fs || fs.__node24ReadlinkPatched) {
    return;
  }

  const originalReadlink = fs.readlink;
  const originalReadlinkSync = fs.readlinkSync;

  fs.readlink = function readlink(path, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = undefined;
    }

    return originalReadlink.call(fs, path, options, (error, linkString) => {
      callback(normalizeReadlinkError(error), linkString);
    });
  };

  fs.readlinkSync = function readlinkSync(path, options) {
    try {
      return originalReadlinkSync.call(fs, path, options);
    } catch (error) {
      throw normalizeReadlinkError(error);
    }
  };

  Object.defineProperty(fs, "__node24ReadlinkPatched", {
    value: true,
  });
}

function patchFsPromises(fsPromises) {
  if (!fsPromises || fsPromises.__node24ReadlinkPatched) {
    return;
  }

  const originalReadlink = fsPromises.readlink.bind(fsPromises);

  fsPromises.readlink = async function readlink(path, options) {
    try {
      return await originalReadlink(path, options);
    } catch (error) {
      throw normalizeReadlinkError(error);
    }
  };

  Object.defineProperty(fsPromises, "__node24ReadlinkPatched", {
    value: true,
  });
}

const fs = require("fs");
patchFs(fs);
patchFs(require("node:fs"));
patchFsPromises(fs.promises);
patchFsPromises(require("fs/promises"));
patchFsPromises(require("node:fs/promises"));
