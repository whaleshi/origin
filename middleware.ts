import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getRestrictedHtml(lang: string): string {
    const isZh = lang.includes("zh");
    const message = isZh
        ? "很抱歉，由于当地法规限制，我们无法在您所在的地区提供服务。您无法访问 ori.supply。"
        : "We're sorry, due to local regulations, we are unable to provide services in your region. You cannot access ori.supply.";

    return `
    <!DOCTYPE html>
    <html lang="${isZh ? "zh" : "en"}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ori.supply - Access Restricted</title>
    </head>
    <body style="width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0; background: #0D0F13; margin: 0;">
      <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: #0D0F13;">
        <div class="content-box">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #1A1D21; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#868789" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
          <div style="color: #868789; font-size: 16px; line-height: 1.6; text-align: center;">
            ${message}
          </div>
        </div>
      </div>

      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        .content-box {
          background: #1A1D21;
          border-radius: 20px;
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          width: 90%;
          max-width: 600px;
          margin: 20px;
        }

        @media (min-width: 768px) {
          .content-box {
            width: auto;
          }
        }
      </style>
    </body>
    </html>
  `;
}

export function middleware(request: NextRequest) {
    const country = request.headers.get("x-vercel-ip-country") || "";
    const restrictedCountries = process.env.NEXT_PUBLIC_RESTRICTED_COUNTRIES || "CN";
    const acceptLanguage = request.headers.get("accept-language") || "en";
    const { pathname } = request.nextUrl;

    // 将受限国家字符串转换为数组进行精确匹配
    const restrictedCountriesArray = restrictedCountries.split(",").map((c) => c.trim());

    if (country && restrictedCountriesArray.includes(country)) {
        return new NextResponse(getRestrictedHtml(acceptLanguage), {
            status: 403,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if (!pathname.startsWith("/preheat")) {
        return NextResponse.redirect(new URL("/preheat", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
