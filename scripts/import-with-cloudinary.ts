import { PrismaClient } from "@prisma/client";
import fs from "fs";
import csv from "csv-parser";
import cloudinary from "../src/lib/cloudinary";
import path from "path";

const prisma = new PrismaClient();

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const results: any[] = [];

fs.createReadStream(path.resolve(process.cwd(), "artworks.csv"))
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {

    for (const art of results) {
      try {
        console.log("Uploading:", art.title);


        const uploadRes = await cloudinary.uploader.upload(
          art.imageUrl,
          {
            folder: "artworks",
            timeout: 60000,
          }
        );

        const imageUrl = uploadRes.secure_url;

        
        await prisma.artwork.create({
          data: {
            id: art.id,
            title: art.title,
            description: art.description || null,
            imageUrl,
            artist: art.artist || null,
            year: art.year ? Number(art.year) : null,
            category: art.category || null,
            tags: art.tags
              ? art.tags.replace("{", "").replace("}", "").split(",").map((t: string) => t.trim())
              : [],
            userId: art.userId || null,
          },
        });

        console.log("✔ Done:", art.title);

  
        await sleep(2000);

      } catch (err) {
        console.error("❌ Error:", art.title, err);


        await sleep(4000);
      }
    }

    await prisma.$disconnect();
    console.log("ALL DONE");
  });