import util from 'util'
import fs from 'fs'

export const readFilePromise = util.promisify(fs.readFile)
