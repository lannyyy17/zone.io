import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check on mount (client-side) and add event listener
    checkSize();
    window.addEventListener("resize", checkSize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", checkSize);
  }, []); // Empty dependency array ensures this runs only on the client

  return isMobile;
}
