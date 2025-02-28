"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { navigationEvents } from "./NavigationProgress";

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
    
    // Preload common navigation paths on initial page load
    preloadCommonPaths();

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, [currentPath]);

  // Preload commonly accessed pages
  const preloadCommonPaths = () => {
    const commonPaths = [
      '/protected/dashboard',
      '/protected/course-registration',
      '/protected/my-courses',
      '/protected/grades',
      '/protected/course-reviews',
      '/protected/profile',
      '/',
      '/sign-in',
      '/sign-up'
    ];
    
    // Filter out the current path and prefetch others with minimal delay
    commonPaths
      .filter(path => path !== currentPath)
      .forEach((path, index) => {
        // Stagger prefetching to avoid network congestion, but make it faster
        setTimeout(() => {
          try {
            router.prefetch(path);
          } catch (error) {
            console.error(`Failed to prefetch ${path}:`, error);
          }
        }, index * 75); // Reduced from 150ms for faster prefetching
      });
  };

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
      
      // Aggressively prefetch immediately for important navigation elements
      if (
        link.closest('nav') || 
        link.closest('header') || 
        link.classList.contains('main-nav') ||
        link.getAttribute('role') === 'navigation'
      ) {
        setTimeout(() => {
          try {
            router.prefetch(href);
          } catch (error) {
            console.error(`Failed to prefetch ${href}:`, error);
          }
        }, 50); // Reduced from 100ms for faster prefetching
      }
      
      // Preload on mouseenter with immediate navigation progress indicator
      link.addEventListener('mouseenter', () => {
        try {
          router.prefetch(href);
        } catch (error) {
          console.error(`Failed to prefetch on hover ${href}:`, error);
        }
      });
      
      // Also preload on touchstart for mobile devices
      link.addEventListener('touchstart', () => {
        try {
          router.prefetch(href);
        } catch (error) {
          console.error(`Failed to prefetch on touch ${href}:`, error);
        }
      });
    });
  };

  return null; // No UI, just functionality
} 