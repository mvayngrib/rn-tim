#!/usr/bin/env node

var fs = require('fs')
var spawn = require('child_process').spawn
var extend = require('xtend')
var find = require('findit')
var browser = require('./browser.json')
var pkg = require('./package.json')

installShims()
hackPackageJSONs()

function installShims () {
  for (var p in browser) {
    if (pkg.dependencies[p] !== browser[p]) {
      spawn('npm install', ['--save'], [p + '@' + browser[p]], { stdio: 'inherit' })
      break
    }
  }
}

function hackPackageJSONs () {
  var finder = find('./node_modules')

  finder.on('file', function (file) {
    if (!/\/package\.json$/.test(file)) return

    fs.readFile(path.resolve(file), { encoding: 'utf8' }, function (err, contents) {
      if (err) throw err

      var pkgJson
      try {
        pkgJson = JSON.parse(contents)
      } catch (err) {
        console.warn('failed to parse', file)
        return
      }

      if (typeof pkgJson.browser === 'string') {
        pkgJson[pkgJson]
      }

      var orgBrowser = pkgJson.browser
      var depBrowser
      if (typeof pkgJson.browser === 'string') {
        depBrowser = { main: pkgJson.browser }
      } else {
        depBrowser = extend({}, browser)
      }

      var save
      if (orgBrowser) {
        for (var p in depBrowser) {
          if (orgBrowser[p] !== depBrowser[p]) {
            save = true
            break
          }
        }
      } else {
        save = true
      }

      if (save) {
        pkgJson.browser = depBrowser
        fs.writeFile(file, JSON.stringify(pkgJson), rethrow)
      }
    })
  })
}

function rethrow (err) {
  if (err) throw err
}

