
import { useSystemSettings } from "@/hooks/useSystemSettings";

export const useAnalytics = () => {
  const { getSetting } = useSystemSettings();
  
  // Check if analytics is enabled
  const isAnalyticsEnabled = () => {
    return getSetting<boolean>("analyticsEnabled", false);
  };
  
  // Log an event (only if analytics is enabled)
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!isAnalyticsEnabled()) return;
    
    // This would normally send to GTM, GA, etc.
    console.log(`[Analytics] ${eventName}`, properties);
    
    // Here you would integrate with your actual analytics provider
    // For example with Google Analytics:
    // window.gtag?.('event', eventName, properties);
  };
  
  // Track a page view
  const trackPageView = (path: string) => {
    if (!isAnalyticsEnabled()) return;
    
    console.log(`[Analytics] pageview: ${path}`);
    
    // Here you would integrate with your actual analytics provider
    // For example:
    // window.gtag?.('config', 'YOUR-GA-ID', {
    //   page_path: path
    // });
  };
  
  return {
    isAnalyticsEnabled,
    trackEvent,
    trackPageView
  };
};
