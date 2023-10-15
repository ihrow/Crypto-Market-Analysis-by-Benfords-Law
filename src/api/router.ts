import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();

router.get("/api", (_, res: Response) => {
  res.send("Hello World");
});

router.get("/api/digits", async (_, res: Response) => {
  const digits = await prisma.digit.findMany();
  res.json(digits.sort((a, b) => a.digit - b.digit));
});

router.put("/api/digits/:digit", async (req: Request, res: Response) => {
  const { digit } = req.params;
  const { amount } = req.body;

  const existingDigit = await prisma.digit.findUnique({
    where: { digit: Number(digit) },
  });
  const newAmount = existingDigit!.amount + parseInt(amount);
  const updatedDigit = await prisma.digit.update({
    where: { digit: Number(digit) },
    data: { amount: newAmount },
  });

  res.json(updatedDigit);
});

router.get("/api/reset", async (_, res: Response) => {
  const digits = await prisma.digit.findMany();
  digits.forEach(async (digit) => {
    await prisma.digit.update({
      where: { digit: digit.digit },
      data: { amount: 0 },
    });
  });
  res.send("Reset");
});

export default router;
