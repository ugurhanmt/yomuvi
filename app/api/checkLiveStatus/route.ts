import { NextRequest, NextResponse } from 'next/server';

// API'nin sunucu tarafında dinamik çalışmasını sağla
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // URL'den channelId'yi al
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json(
      { error: 'channelId parametresi gerekli' },
      { status: 400 }
    );
  }

  try {
    const debugInfo = await checkLiveStatus(channelId);
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Canlı durum kontrolü başarısız', message: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}

async function checkLiveStatus(channelId: string): Promise<any> {
  try {
    console.log(`Checking live status for channel: ${channelId}`);
    
    // Debug bilgisi
    const debugInfo: any = {
      channelId,
      environment: process.env.VERCEL ? 'Vercel' : 'Local',
      timestamp: new Date().toISOString(),
    };
    
    // YouTube kanalının canlı yayın sayfasına istek yap
    const fetchUrl = `https://www.youtube.com/channel/${channelId}/live`;
    debugInfo.fetchUrl = fetchUrl;
    
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    debugInfo.status = response.status;
    debugInfo.statusText = response.statusText;
    debugInfo.responseHeaders = Object.fromEntries([...response.headers.entries()]);
    
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      debugInfo.error = `YouTube API error: ${response.status}`;
      debugInfo.liveUrl = null;
      return debugInfo;
    }

    const html = await response.text();
    debugInfo.responseSize = html.length;
    
    // Bazı debug bilgilerini kaydet
    const firstFewChars = html.substring(0, 500);
    const lastFewChars = html.substring(html.length - 500);
    debugInfo.htmlStart = firstFewChars;
    debugInfo.htmlEnd = lastFewChars;
    
    // HTML içinden canonical link'teki video ID'sini yakalamaya çalış
    const match = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
    debugInfo.hasMatch = !!match;
    
    if (match) {
      debugInfo.matchGroups = match.length;
      if (match[1]) {
        const videoId = match[1];
        debugInfo.videoId = videoId;
        debugInfo.liveUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else {
        debugInfo.matchError = "Eşleşme bulundu ama videoId grubu yok";
        debugInfo.liveUrl = null;
      }
    } else {
      // Alternatif yöntemler deneyebiliriz
      // Bazen YouTube farklı biçimlerde canlı yayın ID'leri sunabilir
      const altMatch = html.match(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/);
      debugInfo.hasAltMatch = !!altMatch;
      
      if (altMatch && altMatch[1]) {
        const videoId = altMatch[1];
        debugInfo.altVideoId = videoId;
        debugInfo.liveUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else {
        debugInfo.liveUrl = null;
      }
    }
    
    console.log(`Live status result for ${channelId}: ${debugInfo.liveUrl ? 'Live' : 'Not live'}`);
    return debugInfo;
  } catch (error) {
    console.error('Error checking live status:', error);
    return {
      error: 'Error checking live status',
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      liveUrl: null
    };
  }
}