import { z } from "zod";
import messageModel from "src/models/user.model";
import { createTRPCRouter, publicProcedure } from "Y/server/api/trpc";
import s3 from "src/utils/aws";

const BUCKET_NAME = process.env.IMAGE_STORAGE_S3_BUCKET ?? "chatimagesproject";

const UPLOAD_MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

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
        isDeleted: z.boolean(),
        type: z.string(z.enum(ACCEPTED_IMAGE_TYPES)),
      })
    )
    .mutation(async ({ input }) => {
      console.log("input", input);
      const { text, isDeleted, type } = input;
      const messageData = await messageModel().create({
        text,
        isDeleted,
      });
      const name = messageData._id.toString();

      const fileParams = {
        Bucket: BUCKET_NAME,
        Key: name,
        Expires: 600,
        ContentType: type,
        ACL: "private",
      };

      const url = await s3.getSignedUrlPromise("putObject", fileParams);
      return url;
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
  createPresignedUrl: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      //   const userId = ctx.session.user.id;
      //   const image = await prisma.image.create({
      //     data: {
      //       userId,
      //     }
      //   })
    }),
});

export default userRouter;
