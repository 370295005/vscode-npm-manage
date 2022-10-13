const crypto = require('crypto')
const path = require('path')

const createHash = (input, limit = 5) => {
  const hash = crypto.createHash('md5')
  hash.update(input)
  return hash.digest('hex').substring(0, limit)
}

const generateScopedName = (name, filename) => {
  const hash = createHash(filename + name)
  let basename = path.basename(filename, '.less')
  if (basename.endsWith('.module')) {
    basename = basename.slice(0, -7)
  }
  return `${basename}__${name}___${hash}`
}

module.exports = generateScopedName
