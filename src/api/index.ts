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
  const normalizedPrice = price.replace(/^0.|0+/g, "");
  return parseInt(normalizedPrice[0]);
}

async function fetchCoinData(
  symbol: string[]
): Promise<SymbolsResponse | null> {
  try {
    const URL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbol.join(
      ","
    )}&tsyms=USDT&api_key=${process.env.VITE_CRYPTOCOMPARE_API_KEY}`;
    const response = await axios.get(URL);
    return response.data;
  } catch (error: any) {
    console.log("ERROR: " + error.message);
    return null;
  }
}

function updateDatabase(amountOfDigits: any) {
  for (const digit of amountOfDigits) {
    axios.put(`http://localhost:5000/api/digits/${digit.digit}`, {
      amount: digit.amount,
    });
  }
}

cron.schedule("*/5 * * * * *", async () => {
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
    await fetchCoinData(symbol)
      .then((data) => {
        if (data) {
          for (const key in data) {
            const digit = getFirstDigit(data[key].USDT.toString());
            const index = amountOfDigits.findIndex(
              (digitObj) => digitObj.digit === digit
            );
            amountOfDigits[index].amount += 1;
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  updateDatabase(amountOfDigits);
});

app.listen(5000, async () => {
  console.log("Server running on port 5000");
});
