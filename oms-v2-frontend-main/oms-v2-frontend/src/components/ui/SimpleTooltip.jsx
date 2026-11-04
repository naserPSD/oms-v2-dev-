import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Wraps trigger content in a span so Radix never nests <button> inside <button>.
 * Works with ButtonTw, native buttons, icons, and text.
 * pointer-events-none ensures tooltip content never blocks user clicks or dropdowns.
 */
const SimpleTooltip = ({
    icon,
    text,
    children,
    className = "",
    disabled = false,
    open,
    side = "bottom",
    sideOffset = 4,
}) => {
    if (disabled || !text) {
        return children || icon || null;
    }

    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip open={open}>
                <TooltipTrigger asChild>
                    <span className="inline-flex items-center">
                        {children || icon}
                    </span>
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    sideOffset={sideOffset}
                    className="text-xs font-medium max-w-[300px] text-wrap z-50 pointer-events-none select-none"
                >
                    <p className={`${className}`}>{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default SimpleTooltip;
