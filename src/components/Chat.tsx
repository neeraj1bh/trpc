import { ChangeEvent, useState } from "react";
import { api } from "Y/utils/api";
import { Message as MessageType } from "Y/types";
import Message from "./Message";

const Chat = () => {
  const [image, setImage] = useState<File>();
  const [text, setText] = useState("");
  const trpc = api.useContext();

  const { mutate: addMutation } = api.user.addMessage.useMutation({
    onMutate: async (newPost) => {
      await trpc.user.all.cancel();
      const prevMessageData = trpc.user.all.getData();

      trpc.user.all.setData(undefined, (prev) => {
        const newMessage = {
          _id: "message-id",
          text: "placeholder",
          imageUrl: "https://via.placeholder.com/150",
          isDeleted: false,
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
    onSettled: async () => {
      await trpc.user.all.invalidate();
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

  const { data: allMessages, isLoading, isError } = api.user.all.useQuery();

  if (isLoading) return <div>Loading messages 🔄</div>;
  if (isError) return <div>Error fetching messages ❌</div>;

  function showPreview(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file) {
        setImage(file);
        // const reader = new FileReader();
        // reader.readAsDataURL(file);
        // reader.onload = () => {
        //   setImgSrc(reader.result as string);
        // };
      }
    }
  }

  const handleSubmit = async () => {
    // check image exists upload to s3
    // db call
    if (!image) return;
    console.log("image", image);
    addMutation({
      text,
      isDeleted: false,
      image,
    });
  };

  return (
    <div className="flex max-w-xl flex-col rounded-xl border border-gray-300">
      <div className="flex h-96 max-h-96 flex-col gap-3 overflow-y-scroll rounded-t-xl border-b border-gray-500 bg-gray-50 px-4 py-4 shadow-lg">
        {allMessages.map((message) => (
          <Message
            key={message._id.toString()}
            textMessage={message.text}
            imageUrl={"https://via.placeholder.com/150"}
            timeOfMessage={new Date(message.createdAt)}
            deleteRecord={deleteMutation}
            id={message._id.toString()}
          />
        ))}
      </div>
      <div className="flex space-x-2 rounded-b-xl bg-white p-4">
        <input
          type={"text"}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          placeholder="Enter Message ..."
          className="w-80 rounded border-2 border-gray-700 px-4 py-2"
        />
        <div className="rounded border-2 border-gray-700 p-2">
          <input
            type={"file"}
            tabIndex={0}
            id="image"
            className="hidden"
            accept="image/*"
            onChange={showPreview}
          />
          <label htmlFor="image" tabIndex={1} className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              // fill="#000000"
              className=" fill-blue-600 text-blue-600"
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
          tabIndex={2}
          disabled={!text}
          className="w-24 cursor-pointer rounded bg-blue-500 px-4 py-2 text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-200"
          onClick={handleSubmit}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
