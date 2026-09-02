import { useEffect, useState, RefObject } from 'react';
import { supabase } from '../lib/supabase';

interface UseGoogleDocOptions {
  publishedUrl: string;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const useGoogleDoc = ({ publishedUrl, containerRef }: UseGoogleDocOptions) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const injectedStyles: HTMLStyleElement[] = [];

    // Helper function to namespace CSS string content
    const namespaceCss = (cssText: string, prefix: string): string => {
      // 1. Preserve and separate @import / @charset statements at the top
      const importRules: string[] = [];
      let cleanCss = cssText.replace(/@import[^;]+;/g, (match) => {
        importRules.push(match);
        return '';
      });

      // 2. Process remaining CSS rules
      const namespacedRules = cleanCss.replace(/([^{}]+)\s*\{/g, (match, selector) => {
        const trimmedSelector = selector.trim();

        // Skip keyframes, media query blocks, etc.
        if (trimmedSelector.startsWith('@') || trimmedSelector.includes(prefix)) {
          return match;
        }

        const transformedSelectors = trimmedSelector
          .split(',')
          .map((s: string) => {
            const item = s.trim();

            // Map root elements directly to the prefix class
            if (item === 'body' || item === 'html') {
              return prefix;
            }

            // Replace body/html tag prefixes (e.g., "body p" or "body.c1" -> ".gdoc-content p" or ".gdoc-content.c1")
            if (item.startsWith('body ') || item.startsWith('html ')) {
              return `${prefix} ${item.replace(/^(body|html)\s+/, '')}`;
            }
            if (item.startsWith('body.') || item.startsWith('html.')) {
              return `${prefix}${item.replace(/^(body|html)/, '')}`;
            }

            return `${prefix} ${item}`;
          })
          .join(', ');

        return `${transformedSelectors} {`;
      });

      // Re-attach @import statements at the very top of the stylesheet
      return [...importRules, namespacedRules].join('\n');
    };

    const loadDoc = async () => {
      try {
        setLoading(true);
        setError(null);

        // Encode the publishedUrl parameter directly in the invocation path
        const functionPath = `fetch-doc?url=${encodeURIComponent(publishedUrl)}`;

        // Call the Supabase Edge Function
        const { data, error: fnError } = await supabase!.functions.invoke(functionPath, {
            method: 'GET',
        });

        if (fnError) throw new Error(fnError.message);
        if (!data) throw new Error('No content returned from edge function');

        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const contentElement = doc.querySelector('#contents');

        if (!contentElement) {
          throw new Error('Unable to locate #contents element in published document.');
        }

        if (!isMounted) return;

        if (containerRef.current) {
          // 1. Process and remove any inline <style> tags nested INSIDE #content
          const inlineStyles = contentElement.querySelectorAll('style');
          inlineStyles.forEach((styleTag) => {
            const scopedStyle = document.createElement('style');
            scopedStyle.setAttribute('data-gdoc-style', 'true');
            scopedStyle.textContent = namespaceCss(styleTag.textContent || '', '.gdoc-content');

            document.head.appendChild(scopedStyle);
            injectedStyles.push(scopedStyle);

            // Remove the un-namespaced tag from content so it isn't injected into the DOM
            styleTag.remove();
          });

          // 2. Process document <head> <style> tags as before
          const headStyles = doc.querySelectorAll('head style');
          headStyles.forEach((style) => {
            const scopedStyle = document.createElement('style');
            scopedStyle.setAttribute('data-gdoc-style', 'true');
            scopedStyle.textContent = namespaceCss(style.textContent || '', '.gdoc-content');

            document.head.appendChild(scopedStyle);
            injectedStyles.push(scopedStyle);
          });

          // 3. Inject cleaned HTML into container (now 100% free of un-namespaced <style> tags)
          containerRef.current.innerHTML = contentElement.innerHTML;
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (publishedUrl) {
      loadDoc();
    }

    return () => {
      isMounted = false;
      injectedStyles.forEach((styleTag) => {
        if (styleTag.parentNode) {
          styleTag.parentNode.removeChild(styleTag);
        }
      });
    };
  }, [publishedUrl, containerRef]);

  return { loading, error };
};
