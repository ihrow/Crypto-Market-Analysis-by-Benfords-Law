import express from "express";
import axios from "axios";
import cron from "node-cron";
import * as dotenv from "dotenv";

const URL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=USD&api_key=${process.env.VITE_CRYPTOCOMPARE_API_KEY}`;

dotenv.config();
const app = express();

cron.schedule("*/5 * * * * *", async () => {
  try {
    const response = await axios.get(URL);
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
});

app.listen(5000, async () => {
  console.log("Server running on port 5000");
});
