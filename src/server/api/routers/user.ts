import { z } from "zod";
import messageModel, { MessageDocument } from "src/models/user.model";
import { createTRPCRouter, publicProcedure } from "Y/server/api/trpc";
import s3 from "src/utils/aws";
import { v4 as uuidv4 } from "uuid";
import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

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
      const message = await messageModel().create({
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
        ee.emit("add", message);

        return url;
      }
      ee.emit("add", message);
    }),

  onAddMessage: publicProcedure.subscription(() => {
    // `resolve()` is triggered for each client when they start subscribing `onAdd`

    // return an `observable` with a callback which is triggered immediately
    return observable<MessageDocument>((emit) => {
      const onAdd = (data: MessageDocument) => {
        // emit data to client
        emit.next(data);
      };

      // trigger `onAdd()` when `add` is triggered in our event emitter
      ee.on("add", onAdd);

      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("add", onAdd);
      };
    });
  }),

  all: publicProcedure.query(async (): Promise<MessageDocument[]> => {
    const allMessages = await messageModel()
      .find({
        isDeleted: false,
      })
      .sort({
        createdAt: -1,
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
