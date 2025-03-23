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
    const liveUrl = await checkLiveStatus(channelId);
    return NextResponse.json({ liveUrl });
  } catch (error) {
    return NextResponse.json(
      { error: 'Canlı durum kontrolü başarısız' },
      { status: 500 }
    );
  }
}

async function checkLiveStatus(channelId: string): Promise<string | null> {
  try {
    // fetch kullanarak YouTube kanalının canlı yayın sayfasına istek yap
    const response = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Tüm kanallar için farklı regex desenleri dene
    
    // 1. HTML içinden canonicalLink'i yakalamaya çalış (en yaygın durum)
    const canonicalMatch = html.match(/link rel="canonical".*?href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/i);
    if (canonicalMatch && canonicalMatch[1]) {
      const videoId = canonicalMatch[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // 2. Alternatif olarak videoId'yi direkt JSON formatında yakalamaya çalış
    const jsonMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (jsonMatch && jsonMatch[1]) {
      const videoId = jsonMatch[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // 3. Player argümanlarında videoId'yi yakalamaya çalış
    const playerMatch = html.match(/player_params.*"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (playerMatch && playerMatch[1]) {
      const videoId = playerMatch[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // 4. "isLiveNow":true yakınında videoId'yi arayalım
    const liveNowMatch = html.match(/isLiveNow":true.*"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (liveNowMatch && liveNowMatch[1]) {
      const videoId = liveNowMatch[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    // 5. "liveChunkReadahead":true yakınında videoId'yi arayalım
    const liveChunkMatch = html.match(/liveChunkReadahead":true.*"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (liveChunkMatch && liveChunkMatch[1]) {
      const videoId = liveChunkMatch[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // Hiçbir eşleşme bulunamadıysa, canlı yayın yok demektir
    return null;
  } catch (error) {
    console.error('Error checking live status:', error);
    return null;
  }
}