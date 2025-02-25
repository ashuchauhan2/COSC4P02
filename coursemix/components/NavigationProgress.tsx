"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Inner component that uses hooks that need Suspense
function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prevPathname, setPrevPathname] = useState("");
  
  // Reset and trigger loading on route change
  useEffect(() => {
    // Only trigger on actual route changes, not on initial load
    if (prevPathname && prevPathname !== pathname) {
      setIsLoading(true);
      setProgress(0);
      
      // Immediately jump to 20% to show instant feedback
      setProgress(20);
      
      // Fast initial progress to 75% - this happens during the white overlay phase
      setTimeout(() => {
        // Rapid progress during initial transition
        const initialJump = setInterval(() => {
          setProgress(prev => {
            if (prev < 75) return prev + 5;
            return prev;
          });
        }, 15);
        
        // Complete the animation right as content is starting to appear
        const completeTimer = setTimeout(() => {
          clearInterval(initialJump);
          
          // Quick finish
          setProgress(100);
          
          // Hide after completion animation finishes
          setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
          }, 200);
        }, 450); // Align with the start of the new content fade-in
        
        return () => {
          clearInterval(initialJump);
          clearTimeout(completeTimer);
        };
      }, 50);
    }
    
    // Update previous pathname for comparison
    setPrevPathname(pathname);
  }, [pathname, searchParams, prevPathname]);
  
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div 
          className="fixed top-0 left-0 right-0 z-[101] h-1.5 bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="h-full bg-teal-600"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 0.08,
              ease: "easeOut"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export the component wrapped in Suspense
export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
} 