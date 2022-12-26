import { z } from "zod";

import { router, publicProcedure } from "../trpc";

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

  )
});
