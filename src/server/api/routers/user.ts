import { z } from "zod";
import userModel, { IUser } from "src/models/user.model";
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
        text: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userModelData: IUser[] = await userModel().create({
        input,
      });
      return userModelData;
    }),
  getData: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userModelData: IUser[] = await userModel().find({});
      return userModelData;
    }),
});

export default userRouter;
