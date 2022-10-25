const express = require('express')
const path = require('path')

const app = express()

app.use(express.static(path.join(__dirname, '..', 'docs'), {extensions: ['html']}))

app.listen(8080)