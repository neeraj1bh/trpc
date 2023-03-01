import { ChangeEvent, useState } from "react";
import { api } from "Y/utils/api";
import Messages from "./Messages";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Message } from "Y/types";
import { toast, Toaster } from "react-hot-toast";
import MessageInput from "./MessageInput";

const Chat = () => {
  const [image, setImage] = useState<File>();
  const [text, setText] = useState("");
  const trpc = api.useContext();

  const { mutateAsync: addMutation } = api.user.addMessage.useMutation({
    onMutate: async () => {
      await trpc.user.all.cancel();
      const prevMessageData = trpc.user.all.getData();

      trpc.user.all.setData(undefined, (prev) => {
        const newMessage: Message = {
          text,
          url: image ? "https://via.placeholder.com/150" : "",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          _id: uuidv4(),
        };
        if (!prev) return [newMessage];
        return [newMessage, ...prev];
      });

      return { prevMessageData };
    },
    onError: (err, newPost, ctx) => {
      if (err) {
        toast.error(err.message);
      }
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
      if (err) {
        toast.error(err.message);
      }
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

  function addImage(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file) {
        setImage(file);
      }
    }
  }

  const handleSubmit = async () => {
    const UPLOAD_MAX_FILE_SIZE = 5000000;

    if (image && image.size > UPLOAD_MAX_FILE_SIZE) {
      toast.error("Image size needs to be less than 5MB");
      setImage(undefined);

      return;
    }

    const props = {
      text,
      hasImage: !!image,
      type: image?.type,
    };

    try {
      const url = await addMutation(props);

      if (image && url) {
        await axios.put(url, image, {
          headers: {
            "Content-type": image.type,
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      await trpc.user.all.refetch();
      setText("");
      setImage(undefined);
    } catch (err) {
      console.log({ err });
    }
  };

  return (
    <div className="flex max-w-xl flex-col rounded-xl border border-gray-300 shadow-2xl">
      <div className="relative h-96 overflow-hidden rounded-t-xl border-b border-gray-500 bg-gray-50  ">
        <div className="absolute bottom-0 flex h-96 w-full flex-col-reverse gap-3 overflow-y-scroll  px-4 pt-4 pb-2">
          {allMessages.map((message) => {
            const { _id, text, createdAt } = message;
            return (
              <Messages
                hasImage={!!message?.url}
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
      <MessageInput
        onSubmit={handleSubmit}
        onFileSelect={addImage}
        text={text}
        setText={setText}
      />
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Chat;
