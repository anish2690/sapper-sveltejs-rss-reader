var express = require('express')
const rrsList = new Set()
let Parser = require('rss-parser')
let parser = new Parser()

export default server => {
  var router = express.Router()
  router.post('/add', (req, res) => {
    const { url } = req.body
    if (rrsList.has(url)) {
      res.send({ added: false, rrsList: [...rrsList] })
      return
    }
    rrsList.add(url)
    console.log('adding url', url)
    res.send({ added: true, rrsList: [...rrsList] })
  })
  router.delete('/del', (req, res) => {
    const { url } = req.body
    console.log('removing url', url)
    if (!rrsList.has(url)) {
      res.send({ removed: false, rrsList: [...rrsList] })
      return
    }
    rrsList.delete(url)

    res.send({ removed: true, rrsList: [...rrsList] })
  })
  router.get('/refresh', async (req, res, next) => {
    try {
      const feeds = []
      for (const url of rrsList) {
        let feed = await parser.parseURL(url)
        console.log(feed.title)
        feeds.push(feed)
      }
      res.send(feeds)
    } catch (error) {
      next(erorr)
    }
  })
  router.get('/list', (req, res) => {
    res.send([...rrsList])
  })
  return router
}
