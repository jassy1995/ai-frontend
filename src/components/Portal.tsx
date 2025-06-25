import { useRef } from "react";
import { createPortal } from "react-dom";
import { useIsomorphicLayoutEffect } from "react-use";

export interface PortalProps {
  selector: string;
  children: React.ReactNode;
}

const Portal = ({ selector, children }: PortalProps) => {
  const elementRef: any = useRef(null);

  useIsomorphicLayoutEffect(() => {
    elementRef.current = document.querySelector(selector);
  }, []);

  if (!elementRef.current) return null;

  return createPortal(children, elementRef.current);
};

export default Portal;
