import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Modal({
  isOpen,
  onClose,
  title,
  // description,
  children,
  footer,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showClose className={"hidden-scrollbar"}>
        {" "}
        <DialogHeader>
          <DialogTitle className="text-xl mt-4  text-gray-600 font-bold">
            {title}
          </DialogTitle>
          {/* {description && <DialogDescription>{description}</DialogDescription>} */}
        </DialogHeader>
        <div className="max-w-2xl w-[95%] sm:max-w-[720px] max-h-[90vh] sm:max-h-[60vh] overflow-y-auto rounded-xl p-6 sm:p-8">
          {children}
        </div>
        {footer && <DialogFooter className="pt-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
