import { z } from "zod";
import messageModel from "src/models/user.model";
import { createTRPCRouter, publicProcedure } from "Y/server/api/trpc";
import s3 from "src/utils/aws";

const BUCKET_NAME = process.env.IMAGE_STORAGE_S3_BUCKET ?? "chatimagesproject";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const userRouter = createTRPCRouter({
  addMessage: publicProcedure
    .input(
      z.object({
        text: z.string({
          required_error: "Describe your todo",
        }),
        isDeleted: z.boolean(),
        type: z.string(z.enum(ACCEPTED_IMAGE_TYPES)),
        imageId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("input", input);
      const { text, isDeleted, type, imageId } = input;
      await messageModel().create({
        text,
        isDeleted,
        imageId,
      });
      const name = `images/${imageId}`;
      console.log("type", type);
      const fileParams = {
        Bucket: BUCKET_NAME,
        Key: name,
        Expires: 6000,
        ContentType: type,
        ACL: "private",
      };

      const url = await s3.getSignedUrlPromise("putObject", fileParams);
      return url;
    }),

  all: publicProcedure.query(async () => {
    const allMessages = await messageModel().find({
      isDeleted: false,
    });
    const extendedImages = await Promise.all(
      allMessages.map(async (message) => {
        const name = `images/${message.imageId}`;

        return {
          url: await s3.getSignedUrlPromise("getObject", {
            Bucket: BUCKET_NAME,
            Expires: 6000,
            Key: name,
          }),
          ...message,
        };
      })
    );
    return extendedImages;
  }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await messageModel().updateOne(
      {
        imageId: input,
      },
      {
        $set: {
          isDeleted: true,
        },
      }
    );
  }),
});

export default userRouter;
