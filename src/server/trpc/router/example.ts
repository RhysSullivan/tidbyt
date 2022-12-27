import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import puppeteer from "puppeteer";
import { resizeBase64Image } from "../../../utils/image";
import sharp from "sharp";


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
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
      )
      const page = await browser.newPage()

      await page.goto('http://localhost:3000/example')
      await page.waitForSelector('#capture-container')
      // wait 3 seconds 
      await page.waitForTimeout(3000)
      const data = await page.screenshot({ omitBackground: true, fullPage: false, clip: { x: 0, y: 0, width: 64 * 6, height: 32 * 6 } })
      await browser.close()
      const resized = await (await sharp(data).resize(64, 32).toBuffer()).toString('base64')
      console.log(resized)
      const response = await fetch(`https://api.tidbyt.com/v0/devices/${process.env.TIDBYT_DEVICE_ID}/push`, {
        method: 'POST',
        body: JSON.stringify({
          image: resized
        }),
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.TIDBYT_API_KEY}` }
      });
      return resized
    }),
});
