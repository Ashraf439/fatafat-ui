import { Toaster as Sonner } from "sonner";

function Toaster(props) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border-border !bg-card !text-foreground !shadow-lg !font-sans",
          description: "!text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
