
import { useEffect } from "react";

export function useTitle(title: string) {
  useEffect(() => {
    // Save the previous title
    const previousTitle = document.title;
    
    // Set the new title
    document.title = title;
    
    // Restore the previous title when the component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
