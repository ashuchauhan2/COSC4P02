"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function LinkPreloader() {
  const router = useRouter();
  const currentPath = usePathname();

  useEffect(() => {
    // Create a mutation observer to watch for new links
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          setupLinkPreloading();
        }
      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Initial setup for links already on the page
    setupLinkPreloading();

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  // Setup preloading behavior for all internal links
  const setupLinkPreloading = () => {
    const links = document.querySelectorAll('a[href^="/"]:not([data-preload-setup])');
    
    links.forEach(link => {
      // Mark as processed
      link.setAttribute('data-preload-setup', 'true');
      
      // Get the href
      const href = link.getAttribute('href');
      if (!href || href === currentPath) return;
      
      // Don't preload external links or anchor links
      if (href.startsWith('http') || href.startsWith('#')) return;
      
      // Preload the page on mouse hover
      link.addEventListener('mouseenter', () => {
        router.prefetch(href);
      });
    });
  };

  return null; // No UI, just functionality
} 