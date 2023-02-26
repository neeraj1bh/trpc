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

const Message = ({
  textMessage,
  imageUrl,
  timeOfMessage,
  deleteRecord,
  id,
}: MessageProps) => {
  const [showDelete, setShowDelete] = useState(false);
  console.log("imageUrl", imageUrl);
  return (
    <div
      className=""
      //  onClick={() => deleteRecord(id)}
      onMouseOver={() => {
        setShowDelete(true);
      }}
      onMouseLeave={() => {
        setShowDelete(false);
      }}
    >
      <div className="relative inline-block max-w-sm bg-gray-200 ">
        {showDelete ? <Trash className="h-5 w-5" onClick={() => {}} /> : null}
        <p className="p-2 text-sm">{textMessage}</p>
        {imageUrl ? (
          <Image
            width={150}
            height={150}
            className="max-w-sm"
            src={imageUrl ?? ""}
            alt="image-message"
          />
        ) : null}
      </div>
      <p className=" mt-1 text-xs text-gray-500">
        {timeOfMessage.toDateString()}
      </p>
    </div>
  );
};

export default Message;
