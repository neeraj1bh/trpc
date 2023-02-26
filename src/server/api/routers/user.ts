import { z } from "zod";
import messageModel from "src/models/user.model";
import { createTRPCRouter, publicProcedure } from "Y/server/api/trpc";
import { AWS } from "src/utils/aws";
import { PresignedPost } from "aws-sdk/clients/s3";
import FormData from "form-data";

const s3 = new AWS.S3();

const BUCKET_NAME = process.env.IMAGE_STORAGE_S3_BUCKET ?? "chatimagesproject";
const UPLOADING_TIME_LIMIT = 30;
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
        image: z.any(),
        //   .refine((files) => files?.length == 1, "Image is required.")
        //   .refine(
        //     (files) => files?.[0]?.size <= UPLOAD_MAX_FILE_SIZE,
        //     `Max file size is 5MB.`
        //   )
        //   .refine(
        //     (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        //     ".jpg, .jpeg, .png and .webp files are accepted."
        //   ),
      })
    )
    .mutation(async ({ input }) => {
      console.log("input", input);
      const { text, isDeleted, image } = input;
      const messageData = await messageModel().create({
        text,
        isDeleted,
      });

      const { url, fields }: { url: string; fields: any } = await new Promise(
        (resolve, reject) => {
          s3.createPresignedPost(
            {
              Fields: {
                key: `${messageData._id}`,
              },
              Conditions: [
                ["starts-with", "$Content-Type", "image/"],
                ["content-length-range", 0, UPLOAD_MAX_FILE_SIZE],
              ],
              Expires: UPLOADING_TIME_LIMIT,
              Bucket: BUCKET_NAME,
            },
            (err, signed) => {
              if (err) return reject(err);
              resolve(signed);
            }
          );
        }
      );
      //   const { url, fields }: { url: string; fields: any } = await preSigned;
      const data = {
        ...fields,
        "Content-Type": image.type,
        ...image,
      };
      console.log(data, image);
      const formData = new FormData();
      for (const name in data) {
        formData.append(name, data[name]);
      }
      await fetch(url, {
        method: "POST",
        body: formData,
      });
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
