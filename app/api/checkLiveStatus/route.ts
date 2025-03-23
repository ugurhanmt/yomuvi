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
    // https modülü yerine fetch kullanarak YouTube kanalının canlı yayın sayfasına istek yap
    const response = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // HTML içinden canonical link'teki video ID'sini yakalamaya çalış
    const match = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
    
    if (match && match[1]) {
      const videoId = match[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    } else {
      return null; // canlı yayın yok
    }
  } catch (error) {
    console.error('Error checking live status:', error);
    return null;
  }
}