import { z } from "zod";
import messageModel, { Message } from "src/models/user.model";
import { createTRPCRouter, publicProcedure } from "Y/server/api/trpc";
import s3 from "src/utils/aws";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = process.env.IMAGE_STORAGE_S3_BUCKET ?? "chatimagesproject";

export const userRouter = createTRPCRouter({
  addMessage: publicProcedure
    .input(
      z.object({
        text: z.string({
          required_error: "Add your message",
        }),
        type: z.string().optional(),
        hasImage: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const imageId = uuidv4();
      const name = `images/${imageId}`;

      const { text, type, hasImage } = input;
      await messageModel().create({
        text,
        imageId: hasImage ? name : "",
      });

      if (hasImage) {
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
      }
    }),

  all: publicProcedure.query(async (): Promise<Message[]> => {
    const allMessages = await messageModel()
      .find({
        isDeleted: false,
      })
      .lean();
    const extendedImages = await Promise.all(
      allMessages.map(async (message) => {
        // console.log("message", message);

        if (message.imageId) {
          const name = message.imageId;

          const url = await s3.getSignedUrlPromise("getObject", {
            Bucket: BUCKET_NAME,
            Expires: 100000,
            Key: name,
          });

          return { url, ...message };
        }

        return message;
      })
    );

    return extendedImages;
  }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    console.log({ input });
    try {
      await messageModel().updateOne(
        {
          _id: input,
        },
        {
          $set: {
            isDeleted: true,
          },
        }
      );
    } catch (err) {
      console.log({ err });
    }
  }),
});

export default userRouter;
