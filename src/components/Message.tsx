import Image from "next/image";

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
  return (
    <div className="" onClick={() => deleteRecord(id)}>
      <div className="inline-block max-w-sm bg-gray-200 ">
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
