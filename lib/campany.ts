import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { ref, push } from "firebase/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { companyName, phoneNumber } = req.body;

    if (!companyName || !phoneNumber) {
      return res.status(400).json({ success: false, message: "값이 없습니다." });
    }

    try {
      const companiesRef = ref(db, "companies");
      const newRef = push(companiesRef, {
        companyName,
        phoneNumber,
        createdAt: new Date().toISOString(),
      });

      res.status(200).json({ success: true, id: newRef.key });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "저장 실패" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}