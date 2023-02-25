import Image from "next/image";

interface MessageProps {
  textMessage: string;
  imageUrl?: string;
  timeOfMessage: Date;
}

const Message = ({ textMessage, imageUrl, timeOfMessage }: MessageProps) => {
  return (
    <div className="">
      <div className="inline-block max-w-sm bg-gray-200 ">
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
