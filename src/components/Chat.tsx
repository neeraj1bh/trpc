import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { api } from "Y/utils/api";
import Messages from "./Messages";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Message } from "Y/types";
import { MessageDocument } from "Y/models/user.model";

const Chat = () => {
  const [image, setImage] = useState<File>();
  const [addMessages, setAddMessages] = useState<MessageDocument[]>();
  const [text, setText] = useState("");
  const trpc = api.useContext();

  const onAddMessages = useCallback((messages: MessageDocument[]) => {
    setAddMessages(messages);
  }, []);

  useEffect(() => {
    onAddMessages;
  }, [onAddMessages]);

  api.user.onAddMessage.useSubscription(undefined, {
    onData(messages) {
      onAddMessages([messages]);
    },
    onError: (err) => {
      console.error("Subscription error:", err);
      // we might have missed a message - invalidate cache
      //   await trpc.user.all.invalidate();
    },
  });

  const { mutateAsync: addMutation } = api.user.addMessage.useMutation({
    onMutate: async (newPost) => {
      await trpc.user.all.cancel();
      const prevMessageData = trpc.user.all.getData();

      trpc.user.all.setData(undefined, (prev) => {
        const newMessage: Message = {
          text,
          url: "https://via.placeholder.com/150",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          _id: uuidv4(),
        };
        if (!prev) return [newMessage];
        return [...prev, newMessage];
      });

      return { prevMessageData };
    },
    onError: (err, newPost, ctx) => {
      if (!ctx) return;
      trpc.user.all.setData(undefined, () => ctx.prevMessageData);
    },
  });

  const { mutate: deleteMutation } = api.user.delete.useMutation({
    onMutate: async (deleteId) => {
      await trpc.user.all.cancel();

      const prevMessageData = trpc.user.all.getData();

      trpc.user.all.setData(undefined, (prev) => {
        if (!prev) return prevMessageData;
        return prev.filter((t) => t._id.toString() !== deleteId);
      });

      return { prevMessageData };
    },
    onError: (err, newPost, ctx) => {
      if (!ctx) return;
      trpc.user.all.setData(undefined, () => ctx.prevMessageData);
    },
    onSettled: async () => {
      await trpc.user.all.invalidate();
    },
  });

  //   const {
  //     data: allMessages,
  //     isLoading,
  //     isError,
  //   } = api.user.all.useQuery(
  //     undefined,
  //     { staleTime: 600 * 1000 } // cache data for 600 seconds
  //   );

  function showPreview(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file) {
        setImage(file);
      }
    }
  }

  const handleSubmit = async () => {
    const UPLOAD_MAX_FILE_SIZE = 5000000;
    if (image && image.size > UPLOAD_MAX_FILE_SIZE) return;

    const props = {
      text,
      hasImage: !!image,
      type: image?.type,
    };

    const url = await addMutation(props);

    if (image && url) {
      await axios.put(url, image, {
        headers: {
          "Content-type": image.type,
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // await trpc.user.all.refetch();
  };

  return (
    <div className="flex max-w-xl flex-col rounded-xl border border-gray-300 shadow-2xl">
      <div className="relative h-96 overflow-hidden rounded-t-xl border-b border-gray-500 bg-gray-50  ">
        <div className="absolute bottom-0 flex max-h-96  w-full flex-col-reverse  gap-3 overflow-y-scroll p-4 pt-4 pb-2">
          {addMessages?.map((message) => {
            const { _id, text, createdAt } = message;
            return (
              <Messages
                key={_id.toString()}
                textMessage={text}
                imageUrl={message?.url}
                timeOfMessage={new Date(createdAt)}
                deleteRecord={deleteMutation}
                id={_id.toString()}
              />
            );
          })}
        </div>
      </div>
      <div className="flex space-x-2 rounded-b-xl bg-white p-4">
        <input
          type={"text"}
          value={text}
          tabIndex={1}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text) {
              return void handleSubmit();
            }
          }}
          placeholder="Enter Message ..."
          className="w-80 rounded border-2 border-gray-700 px-4 py-2"
        />
        <div className="relative h-11 w-11 rounded border-2 border-gray-700">
          <input
            type={"file"}
            id="image"
            className="absolute z-10 h-full w-full cursor-pointer opacity-0"
            accept="image/*"
            onChange={showPreview}
          />
          <label htmlFor="image" tabIndex={2} className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
              viewBox="0 0 256 256"
            >
              <rect width="256" height="256" fill="none"></rect>
              <path
                d="M160,80,76.7,164.7a16,16,0,0,0,22.6,22.6L198.6,86.6a32,32,0,0,0-45.2-45.2L54.1,142.1a47.9,47.9,0,0,0,67.8,67.8L204,128"
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="16"
              ></path>
            </svg>
          </label>
        </div>
        <button
          tabIndex={3}
          disabled={!text}
          className="w-24 cursor-pointer rounded bg-blue-500 px-4 py-2 text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-200"
          onClick={() => void handleSubmit()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
