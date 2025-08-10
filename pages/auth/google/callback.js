import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔍 CALLBACK PAGE LOADED!');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('❌ OAuth error:', error);
        // Try to close window or redirect
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error }, '*');
          window.close();
        } else {
          // If no opener, redirect to main app
          router.push('/?auth=error');
        }
        return;
      }

      if (code) {
        console.log('✅ Authorization code received:', code.substring(0, 20) + '...');
        
        try {
          // Exchange code for tokens
          const response = await fetch('/api/auth/google/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });

          const data = await response.json();
          console.log('🔍 Token exchange response status:', response.status);

          if (response.ok && data.access_token) {
            console.log('✅ Token exchange successful!');
            
            // Store tokens
            localStorage.setItem('google_access_token', data.access_token);
            if (data.refresh_token) {
              localStorage.setItem('google_refresh_token', data.refresh_token);
            }

            // Try different methods to close/communicate
            if (window.opener && !window.opener.closed) {
              // Method 1: PostMessage to parent
              window.opener.postMessage({ 
                type: 'GOOGLE_AUTH_SUCCESS', 
                tokens: { 
                  access_token: data.access_token,
                  refresh_token: data.refresh_token 
                }
              }, '*');
              
              // Small delay then close
              setTimeout(() => {
                try { window.close(); } catch (e) { console.log('Close failed:', e); }
              }, 500);
            } else {
              // Method 2: No opener - redirect to main app with success
              console.log('⚠️ No opener window - redirecting to main app');
              router.push('/?auth=success&token=' + encodeURIComponent(data.access_token));
            }
          } else {
            throw new Error(data.error || 'Token exchange failed');
          }
        } catch (error) {
          console.error('❌ Token exchange failed:', error);
          
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: error.message }, '*');
            window.close();
          } else {
            router.push('/?auth=error');
          }
        }
      } else {
        console.log('⚠️ No authorization code found');
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'No code received' }, '*');
          window.close();
        } else {
          router.push('/?auth=error');
        }
      }
    };

    // Run callback logic
    handleCallback();

    // Fallback: Auto-close after 10 seconds if still open
    const fallbackTimer = setTimeout(() => {
      console.log('🔄 Fallback: Attempting to close window after timeout');
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_TIMEOUT' }, '*');
        }
        window.close();
      } catch (e) {
        console.log('Fallback close failed:', e);
        router.push('/');
      }
    }, 10000);

    return () => clearTimeout(fallbackTimer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Completing Google Authentication...</h1>
        <p className="text-gray-400 mb-4">Please wait while we process your login</p>
        
        {/* Manual close button as fallback */}
        <button
          onClick={() => {
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_MANUAL_CLOSE' }, '*');
              }
              window.close();
            } catch (e) {
              window.location.href = '/';
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors">
          Close Window & Continue
        </button>
        
        <div className="mt-6 text-xs text-gray-500">
          {/* <p>If this window doesn't close automatically, click the button above</p> */}
        </div>
      </div>
    </div>
  );
}
