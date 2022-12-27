import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import puppeteer from "puppeteer";
import sharp from "sharp";
import { createGif } from 'sharp-gif'

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
  push: publicProcedure.input(z.string()).mutation(
    async ({ input, ctx }) => {

      // post to https://api.tidbyt.com/v0/devices/{device.id}/push

      const response = await fetch(`https://api.tidbyt.com/v0/devices/${process.env.TIDBYT_DEVICE_ID}/push`, {
        method: 'POST',
        body: JSON.stringify({
          image: input
        }),
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TIDBYT_API_KEY}` }
      });
      return response;
    }
  ),
  render: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(async ({ input }) => {
      const browser = await puppeteer.launch(
        {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium'],
        }
      )
      const page = await browser.newPage()
      const FPS = 10
      const gif = await createGif({
        width: 64,
        height: 32,
        quality: 1,
        delay: Math.trunc(1000 / FPS),
        repeat: 0,
      })
      const duration = 10
      const frames = FPS * duration
      await page.goto('http://localhost:3000/example')
      for (let i = 0; i < frames; i++) {
        const data = await page.screenshot({ omitBackground: true, fullPage: false, clip: { x: 0, y: 0, width: 64 * 6, height: 32 * 6 }, path: `./test/${i}.png` })
        const resized = sharp(data).resize(64, 32).png()
        gif.addFrame(resized)
        console.log(`frame ${i} of ${frames} (${Math.trunc(i / frames * 100)}%)`)
        await new Promise((resolve) => setTimeout(resolve, 1000 / FPS))
      }

      const gifBuffer = (await (await gif.toSharp()).webp({
        nearLossless: true, quality: 50

      }).toBuffer()).toString('base64')
      await browser.close()
      const response = await fetch(`https://api.tidbyt.com/v0/devices/${process.env.TIDBYT_DEVICE_ID}/push`, {
        method: 'POST',
        body: JSON.stringify({
          image: gifBuffer
        }),
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TIDBYT_API_KEY}` }
      });
      return gifBuffer
    }),
});
