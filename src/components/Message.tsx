import { useState } from "react";
import { Trash } from "./../assets/icons/Trash";

interface MessageProps {
  textMessage: string;
  imageUrl?: string;
  timeOfMessage: Date;
}

const Message = ({ textMessage, imageUrl, timeOfMessage }: MessageProps) => {
  const [showDelete, setShowDelete] = useState(false);
  return (
    <div className="">
      <div
        className="relative inline-block max-w-sm bg-gray-200 "
        onMouseOver={() => {
          setShowDelete(true);
        }}
        onMouseLeave={() => {
          setShowDelete(false);
        }}
      >
        <div
          className="absolute -right-7 top-1 py-1 pl-7 "

        >
          {showDelete ? <Trash className="h-5 w-5" onClick={() => {}} /> : null}
        </div>
        <p className="p-2 text-sm">{textMessage}</p>
        {imageUrl ? (
          //   <Image
          //     width={20}
          //     height={20}
          //     className="max-w-sm"
          //     src={imageUrl ?? ""}
          //     alt="image-message"
          //   />
          <img src={imageUrl} />
        ) : null}
      </div>
      <p className=" mt-1 text-xs text-gray-500">
        {timeOfMessage.toDateString()}
      </p>
    </div>
  );
};

export default Message;
