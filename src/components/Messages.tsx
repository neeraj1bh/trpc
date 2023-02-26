import Image from "next/image";
import { useState } from "react";
import { Trash } from "Y/assets/icons/Trash";

interface MessageProps {
  textMessage: string;
  imageUrl?: string;
  timeOfMessage: Date;
  deleteRecord: (id: string) => void;
  id: string;
}

const Messages = ({
  textMessage,
  imageUrl,
  timeOfMessage,
  deleteRecord,
  id,
}: MessageProps) => {
  console.log({ textMessage, id, imageUrl });
  return (
    <div className="group">
      <div className="relative inline-block max-w-sm  ">
        <div className="top-1 -right-7 hidden group-hover:absolute group-hover:block">
          <Trash className="h-5 w-6" onClick={() => deleteRecord(id)} />
        </div>

        <p className="bg-gray-200 p-2 text-sm">{textMessage}</p>
        {imageUrl ? (
          <img className="max-w-sm" src={imageUrl} alt="image-message" />
        ) : null}
      </div>
      <p className="mt-1  text-xs text-gray-500">
        {timeOfMessage.toDateString()}
      </p>
    </div>
  );
};

export default Messages;
