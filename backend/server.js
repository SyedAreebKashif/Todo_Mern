require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = require("./src/app");
const dbConnection = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await dbConnection();
  app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
  });
};

if (require.main === module || !process.env.VERCEL) {
  startServer();
}

module.exports = app;

