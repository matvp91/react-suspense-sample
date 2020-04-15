import React, { useTransition } from "react";

export default function NavButton({ onClick, children, preload, ...rest }) {
  const [startTransition, isPending] = useTransition({
    timeoutMs: 2000,
  });

  const performPreload = () => {
    if (preload) {
      preload();
    }
  };

  return (
    <button
      onClick={() => {
        startTransition(() => {
          onClick();
        });
      }}
      disabled={isPending}
      onMouseEnter={performPreload}
      onFocus={performPreload}
    >
      {children}
    </button>
  );
}
