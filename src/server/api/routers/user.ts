import { z } from "zod";
import messageModel from "src/models/user.model";
import { createTRPCRouter, publicProcedure } from "Y/server/api/trpc";

export const userRouter = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        data: `hello ${input.text}`,
      };
    }),

  addMessage: publicProcedure
    .input(
      z.object({
        text: z.string({
          required_error: "Describe your todo",
        }),
        imageUrl: z.string(),
        isDeleted: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return await messageModel().create(input);
    }),

  all: publicProcedure.query(async () => {
    return await messageModel().find({
      isDeleted: false,
    });
  }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await messageModel().updateOne({
      where: {
        _id: input,
      },
      isDeleted: true,
    });
  }),
});

export default userRouter;
