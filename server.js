const express = require('express')
const app = express()
const { Cluster } = require('puppeteer-cluster')
const { check, validationResult } = require('express-validator/check')
const { sanitizeQuery } = require('express-validator/filter')
const validator = require('validator')
const urlBeginPattern = /^((http|https):\/\/)/;

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    timeout: 10000,
    puppeteerOptions: {
      headless: true,
      args: [
        '--no-sandbox'
      ]
    }
  })
  await cluster.task(async ({ page, data }) => {
    const { url, width, height, fullpage, lang, type, quality } = data
    var options = {
      fullPage: fullpage,
      type: type,
      quality: quality
    }

    // make a screenshot
    await page.setExtraHTTPHeaders({
      'Accept-Language': lang
    })
    await page.goto(url)
    await page.setViewport({ width: width, height: height })
    if (type === 'png') {
      options = {
        fullPage: fullpage,
        type: type
      }
    }

    const screen = await page.screenshot(options)
    return screen
  })

  // setup server
  app.get('/api', [
    check('url').isURL().custom(value => {
      if (!urlBeginPattern.test(value)) {
        throw new Error('Url must begin with http:// or https://')
      }
      return true
    }),
    check('height').isInt({ min: 0, max: 1080 }),
    check('width').isInt({ min: 0, max: 1920 }),
    check('fullpage').optional().isBoolean(),
    check('lang').isIn(validator.isAlphaLocales),
    check('type').optional().isIn(['jpeg', 'png']),
    check('quality').optional().isInt({ min: 0, max: 100 }),
    sanitizeQuery('height').toInt(),
    sanitizeQuery('width').toInt(),
    sanitizeQuery('fullpage').toBoolean(),
    sanitizeQuery('quality').toInt()
  ], async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    try {
      const screen = await cluster.execute({
        url: req.query.url,
        width: req.query.width,
        height: req.query.height,
        fullpage: req.query.fullpage,
        lang: req.query.lang,
        type: req.query.type,
        quality: req.query.quality
      })

      // respond with image
      res.writeHead(200, {
        'Content-Type': 'image/' + req.query.type,
        'Content-Length': screen.length
      })
      res.end(screen)
    } catch (err) {
      // catch error
      res.status(400).json({ 'error': err.message })
    }
  })

  app.listen(3000, function () {
    console.log('Screenshot server listening on port 3000.')
  })
})()
