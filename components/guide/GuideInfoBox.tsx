import Image from "next/image";
import { ReactNode } from "react";
export function GuideInfoBox(props: { children: ReactNode; image?: string; title?: string }) {
  return (
    <div className="max-w-[768px] w-full overflow-hidden flex-col gap-5 flex text-md my-16 mx-auto">
      {props.title && (
        <div className="text-4xl text-center">
          <span className="font-semibold">{props.title}</span>
        </div>
      )}

      <div className="text-sm max-w-[600px] mx-auto text-center">{props.children}</div>
      {props.image && (
        <div className="w-full h-full items-center justify-center flex">
          <Image src={props.image} alt="Image" width={200} height={300} />
        </div>
      )}
    </div>
  );
}
