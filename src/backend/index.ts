import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import * as dotenv from "dotenv";
import router from "./router";
import cron from "node-cron";

import { symbols } from "./constants/symbols";
import { SymbolsResponse } from "../types";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(router);

function getFirstDigit(price: string): number {
  // Remove leading zeros and the decimal point (if present)
  const normalizedPrice = price.replace(/^0.|0+/g, "");
  return parseInt(normalizedPrice[0]);
}

cron.schedule("*/10 * * * * *", async () => {
  console.log("Running a task...");
  const amountOfDigits = [
    { digit: 1, amount: 0 },
    { digit: 2, amount: 0 },
    { digit: 3, amount: 0 },
    { digit: 4, amount: 0 },
    { digit: 5, amount: 0 },
    { digit: 6, amount: 0 },
    { digit: 7, amount: 0 },
    { digit: 8, amount: 0 },
    { digit: 9, amount: 0 },
  ];

  for (const symbol of symbols) {
    try {
      const URL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbol.join(
        ","
      )}&tsyms=USDT&api_key=${process.env.VITE_CRYPTOCOMPARE_API_KEY}`;
      const response = await axios.get(URL);
      const data = response.data as SymbolsResponse;
      for (const symbol in data) {
        const price = data[symbol].USDT.toString();
        const firstDigit = getFirstDigit(price);
        amountOfDigits[firstDigit - 1].amount++;
      }
    } catch (error: any) {
      console.log("ERROR: " + error.message);
    }
  }

  for (const digit of amountOfDigits) {
    axios.put(`http://localhost:5000/api/digits/${digit.digit}`, {
      amount: digit.amount,
    });
  }
});

app.listen(5000, async () => {
  console.log("Server running on port 5000");
});
