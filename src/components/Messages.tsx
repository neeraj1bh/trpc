import Image from "next/image";
import TimeAgo from "timeago-react";
import { Trash } from "Y/assets/icons/Trash";

interface MessageProps {
  textMessage: string;
  imageUrl?: string;
  hasImage: boolean;
  timeOfMessage: Date;
  deleteRecord: (id: string) => void;
  id: string;
}

const Messages = ({
  textMessage,
  imageUrl,
  timeOfMessage,
  hasImage,
  deleteRecord,
  id,
}: MessageProps) => {
  return (
    <div className="group">
      <div className="relative inline-block max-w-sm ">
        <div className="top-1 -right-7 hidden group-hover:absolute group-hover:block">
          <Trash className="h-5 w-6" onClick={() => deleteRecord(id)} />
        </div>

        <p className="break-words bg-gray-200 py-2 px-4 text-sm">
          {textMessage}
        </p>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="image-message"
            className="object-contain"
            width={384}
            height={200}
          />
        ) : null}
      </div>
      <div>
        <TimeAgo
          className="ml-1 mt-1 text-xs text-gray-500"
          datetime={timeOfMessage}
        />
      </div>
    </div>
  );
};

export default Messages;
