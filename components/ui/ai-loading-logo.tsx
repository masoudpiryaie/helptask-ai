import { Sparkles } from "lucide-react";

type AiLoadingLogoProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
};

const sizeClasses = {
  sm: {
    wrapper: "h-12 w-12 rounded-2xl",
    inner: "h-8 w-8 rounded-xl",
    icon: 18,
    ring: "h-12 w-12",
  },
  md: {
    wrapper: "h-16 w-16 rounded-3xl",
    inner: "h-11 w-11 rounded-2xl",
    icon: 24,
    ring: "h-16 w-16",
  },
  lg: {
    wrapper: "h-20 w-20 rounded-[28px]",
    inner: "h-14 w-14 rounded-3xl",
    icon: 30,
    ring: "h-20 w-20",
  },
};

export function AiLoadingLogo({
  size = "md",
  label = "MindTask AI",
  sublabel = "Thinking gently...",
}: AiLoadingLogoProps) {
  const classes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center">
        <div
          className={`absolute ${classes.ring} animate-ping rounded-[28px] bg-[#4F8DFD]/20`}
        />

        <div
          className={`relative flex ${classes.wrapper} items-center justify-center bg-white shadow-sm`}
        >
          <div
            className={`flex ${classes.inner} items-center justify-center bg-[#EAF3FF]`}
          >
            <Sparkles
              size={classes.icon}
              className="animate-pulse text-[#4F8DFD]"
            />
          </div>
        </div>
      </div>

      {label ? (
        <p className="mt-5 text-base font-semibold text-[#1F2937]">{label}</p>
      ) : null}

      {sublabel ? (
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{sublabel}</p>
      ) : null}

      <div className="mt-5 flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#4F8DFD] [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#64C59A] [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#A78BFA]" />
      </div>
    </div>
  );
}
