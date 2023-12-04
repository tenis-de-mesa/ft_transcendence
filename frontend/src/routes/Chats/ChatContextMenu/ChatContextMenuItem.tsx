function Separator() {
  return <hr className="my-2 bg-gray-600 border-gray-600" />;
}

interface ChatContextMenuItemProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: string | string[] | React.ReactElement | React.ReactElement[];
  separator?: boolean;
}

export default function ChatContextMenuItem({
  children,
  separator = false,
  ...props
}: ChatContextMenuItemProps) {
  return (
    <>
      {separator && <Separator />}
      <span
        className="p-2 cursor-pointer rounded text-left break-keep whitespace-nowrap hover:bg-gray-700"
        {...props}
      >
        {children}
      </span>
    </>
  );
}
