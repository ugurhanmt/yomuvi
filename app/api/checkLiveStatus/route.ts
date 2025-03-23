import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

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

function checkLiveStatus(channelId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    
    const options = {
      hostname: 'www.youtube.com',
      path: `/channel/${channelId}/live`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let html = '';

      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        const match = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
        if (match && match[1]) {
          const videoId = match[1];
          resolve(`https://www.youtube.com/watch?v=${videoId}`);
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}