'use client'

import { useEffect } from 'react'
import Script from 'next/script'

const gaId = process.env.NEXT_PUBLIC_GA_ID
const gtmId = process.env.NEXT_PUBLIC_GTM_ID

export function GoogleAnalytics() {
  useEffect(() => {
    if (!gaId || typeof window === 'undefined') return

    const handleHashChange = () => {
      window.gtag?.('config', gaId, {
        page_path: window.location.pathname + window.location.hash,
        page_location: window.location.href,
      })
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (!gaId && !gtmId) return null

  return (
    <>
      {gtmId && (
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
      )}
      {gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', {
  page_path: window.location.pathname + window.location.hash,
  page_location: window.location.href
});`}
          </Script>
        </>
      )}
    </>
  )
}
