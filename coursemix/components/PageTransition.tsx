"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [displayChildren, setDisplayChildren] = useState<ReactNode>(children);
  const [transitionKey, setTransitionKey] = useState(pathname || "");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [oldContent, setOldContent] = useState<ReactNode>(null);
  const [newContent, setNewContent] = useState<ReactNode>(null);
  const [transitionPhase, setTransitionPhase] = useState<'none' | 'start' | 'swap' | 'end'>('none');
  const prevPathRef = useRef(pathname);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add/remove custom cursor class on body
  useEffect(() => {
    if (isTransitioning) {
      document.body.classList.add('loading-cursor');
    } else {
      document.body.classList.remove('loading-cursor');
    }
    
    return () => {
      document.body.classList.remove('loading-cursor');
    };
  }, [isTransitioning]);

  // Handle transitions between pages - this is the core logic
  useEffect(() => {
    if (!isClient) return;
    
    // Skip initial render
    if (prevPathRef.current === pathname) {
      return;
    }

    // Phase 1: Start transition - capture old content and show overlay
    setOldContent(displayChildren);
    setNewContent(children);
    setTransitionPhase('start');
    setIsTransitioning(true);
    
    // Phase 2: After overlay is visible, swap content (invisible to user)
    const swapTimer = setTimeout(() => {
      setTransitionPhase('swap');
      setDisplayChildren(children);
      setTransitionKey(pathname || "");
      
      // Phase 3: Begin removing overlay and showing new content
      const endTimer = setTimeout(() => {
        setTransitionPhase('end');
        
        // Phase 4: Complete transition
        const completeTimer = setTimeout(() => {
          setIsTransitioning(false);
          setTransitionPhase('none');
          setOldContent(null);
          setNewContent(null);
        }, 350);
        
        return () => clearTimeout(completeTimer);
      }, 200);
      
      return () => clearTimeout(endTimer);
    }, 200); // Give overlay time to fully appear
    
    // Store current path as previous for next transition
    prevPathRef.current = pathname;
    
    return () => clearTimeout(swapTimer);
  }, [pathname, children, isClient, displayChildren]);

  // During SSR or before hydration, render without animation
  if (!isClient) {
    return <>{children}</>;
  }

  // Determine direction of transition based on path
  const getTransitionDirection = () => {
    const currentPathParts = pathname?.split('/') || [];
    const prevPathParts = prevPathRef.current?.split('/') || [];
    
    // Going deeper into the app
    if (currentPathParts.length > prevPathParts.length) {
      return { y: 25 };
    }
    // Going up in the app
    else if (currentPathParts.length < prevPathParts.length) {
      return { y: -25 };
    }
    // Same level, use x-axis transition
    return { x: -15 };
  };

  const direction = getTransitionDirection();

  return (
    <div className="flex-grow w-full relative">
      {/* Current page content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={transitionKey}
          initial={{ opacity: 0, ...direction }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ 
            duration: 0.35,
            delay: 0.2, // Delay showing new content until overlay starts fading
            ease: "easeOut" 
          }}
          className="w-full"
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>

      {/* Full-screen transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-white z-[100] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: transitionPhase === 'end' ? 0 : 1 
            }}
            transition={{ 
              duration: transitionPhase === 'start' ? 0.15 : 0.25,
              ease: "easeInOut" 
            }}
          >
            <motion.div 
              className="w-12 h-12 rounded-full border-t-2 border-r-2 border-teal-600"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 