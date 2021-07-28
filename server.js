const express = require("express")

const server = express()

server.all("/", (req, res) => {
  res.send("Bot is running!")
})

function refreshBot() {
  server.listen(6000, () => {
    console.log("Server is ready.")
  })
}

module.exports = refreshBot