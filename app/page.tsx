"use client"

import type React from "react"

import { useState, useEffect, useRef, createContext, useContext } from "react"
import { PlusCircle, Menu, Volume2, VolumeX, X, Maximize, Minimize, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import https from 'https';
// Language translations
const translations = {
  en: {
    appTitle: "Multi-Channel Viewer",
    selectChannels: "Select channels to watch",
    noChannels: "No channels selected",
    selectFromMenu: "Select channels from the menu to start watching",
    openMenu: "Open Channel Menu",
    channelSelection: "Channel Selection",
    addNewChannel: "Add New Channel",
    channelName: "Channel Name (Optional)",
    youtubeUrl: "YouTube URL",
    addChannel: "Add Channel",
    applySelection: "Apply Selection",
    startWatching: "Start Watching",
    locked: "Locked",
    auto: "Auto",
    enterChannelName: "Enter channel name",
    enterYoutubeUrl: "Enter YouTube URL",
    invalidUrl: "Invalid YouTube URL. Please enter a valid YouTube video URL.",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    addedChannels: "Added Channels",
    cancel: "Cancel",
    channelNamePlaceholder: "Leave empty for auto-naming",
    addChannelTitle: "Add New Channel",
    addChannelDescription: "Enter the YouTube URL of the channel you want to add",
    live: "LIVE",
    notLive: "Not Live",
    checkingLiveStatus: "Checking live status...",
  },
  tr: {
    appTitle: "Çoklu Kanal İzleyici",
    selectChannels: "İzlemek için kanalları seçin",
    noChannels: "Hiç kanal seçilmedi",
    selectFromMenu: "İzlemeye başlamak için menüden kanal seçin",
    openMenu: "Kanal Menüsünü Aç",
    channelSelection: "Kanal Seçimi",
    addNewChannel: "Yeni Kanal Ekle",
    channelName: "Kanal Adı (İsteğe Bağlı)",
    youtubeUrl: "YouTube URL",
    addChannel: "Kanal Ekle",
    applySelection: "Seçimi Uygula",
    startWatching: "İzlemeye Başla",
    locked: "Kilitli",
    auto: "Otomatik",
    enterChannelName: "Kanal adını girin",
    enterYoutubeUrl: "YouTube URL'sini girin",
    invalidUrl: "Geçersiz YouTube URL'si. Lütfen geçerli bir YouTube video URL'si girin.",
    fullscreen: "Tam Ekran",
    exitFullscreen: "Tam Ekrandan Çık",
    addedChannels: "Eklenen Kanallar",
    cancel: "İptal",
    channelNamePlaceholder: "Otomatik isimlendirme için boş bırakın",
    addChannelTitle: "Yeni Kanal Ekle",
    addChannelDescription: "Eklemek istediğiniz kanalın YouTube URL'sini girin",
    live: "CANLI",
    notLive: "CANLI DEĞİL",
    checkingLiveStatus: "Canlı yayın durumu kontrol ediliyor...",
  },
}

// Kanal tipi tanımı
type ChannelType = {
  name: string
  url: string
  selected: boolean
  logo: string
  domain: string
  isLive?: boolean // Canlı yayın durumu
  liveChecked?: boolean // Canlı yayın kontrolü yapıldı mı
}

// Kategori tipi tanımı
type CategoryType = {
  category: string
  channels: ChannelType[]
}

// Language context
type LanguageContextType = {
  language: "en" | "tr"
  setLanguage: (lang: "en" | "tr") => void
  t: (key: keyof typeof translations.en) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
})

// Function to generate favicon URL
const getFaviconUrl = (domain: string) => {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`
}

// Default channels list with logos
const defaultChannels: CategoryType[] = [
  {
    category: "Haber",
    channels: [
      {
        name: "A Haber",
        url: "https://www.youtube.com/watch?v=nmY9i63t6qo",
        selected: false,
        logo: getFaviconUrl("ahaber.com.tr"),
        domain: "ahaber.com.tr",
      },
      {
        name: "Halk TV",
        url: "https://www.youtube.com/watch?v=ZSWPj9szKb8",
        selected: false,
        logo: getFaviconUrl("halktv.com.tr"),
        domain: "halktv.com.tr",
      },
      {
        name: "Sözcü TV",
        url: "https://www.youtube.com/watch?v=ztmY_cCtUl0",
        selected: false,
        logo: getFaviconUrl("szctv.com.tr"),
        domain: "szctv.com.tr",
      },
      {
        name: "NTV",
        url: "https://www.youtube.com/watch?v=DbQ4HGgr7Xo",
        selected: false,
        logo: getFaviconUrl("ntv.com.tr"),
        domain: "ntv.com.tr",
      },
      {
        name: "HaberTürk",
        url: "https://www.youtube.com/watch?v=RNVNlJSUFoE",
        selected: false,
        logo: getFaviconUrl("haberturk.com"),
        domain: "haberturk.com",
      },
      {
        name: "TRT Haber",
        url: "https://www.youtube.com/watch?v=vdIOVu437fM",
        selected: false,
        logo: getFaviconUrl("trthaber.com.tr"),
        domain: "trthaber.com.tr",
      },
      {
        name: "HaberGlobal",
        url: "https://www.youtube.com/watch?v=6BX-NUzBSp8",
        selected: false,
        logo: getFaviconUrl("haberglobal.com.tr"),
        domain: "haberglobal.com.tr",
      },
      {
        name: "Tele1",
        url: "https://www.youtube.com/watch?v=fNqmmqNNGp8",
        selected: false,
        logo: getFaviconUrl("tele1.com.tr"),
        domain: "tele1.com.tr",
      },
      {
        name: "TGRT Haber",
        url: "https://www.youtube.com/watch?v=2-PxQVVcr6A",
        selected: false,
        logo: getFaviconUrl("tgrthaber.com"),
        domain: "tgrthaber.com",
      },
      {
        name: "CNN Türk",
        url: "https://www.youtube.com/watch?v=VXMR3YQ7W3s",
        selected: false,
        logo: getFaviconUrl("cnnturk.com"),
        domain: "cnnturk.com",
      },
      {
        name: "Flash Haber",
        url: "https://www.youtube.com/watch?v=QeZEb0HMmMg",
        selected: false,
        logo: getFaviconUrl("flashhabertv.com.tr"),
        domain: "flashhabertv.com.tr",
      },
      {
        name: "24",
        url: "https://www.youtube.com/watch?v=ZIPYDataQZI",
        selected: false,
        logo: getFaviconUrl("yirmidort.tv"),
        domain: "yirmidort.tv",
      },
      {
        name: "Akit TV",
        url: "https://www.youtube.com/watch?v=SNt2GP7fN64",
        selected: false,
        logo: getFaviconUrl("akittv.com.tr"),
        domain: "akittv.com.tr",
      },
      {
        name: "tv100",
        url: "https://www.youtube.com/watch?v=6g_DvD8e2T0",
        selected: false,
        logo: getFaviconUrl("tv100.com"),
        domain: "tv100.com",
      },
      {
        name: "Ulusal",
        url: "https://www.youtube.com/watch?v=Fr0Dku2UZmI",
        selected: false,
        logo: getFaviconUrl("ulusal.com.tr"),
        domain: "ulusal.com.tr",
      },
      {
        name: "Ülke TV",
        url: "https://www.youtube.com/watch?v=TcQ1Mp4pmsg",
        selected: false,
        logo: getFaviconUrl("ulketv.com"),
        domain: "ulketv.com",
      },
      {
        name: "KRT TV",
        url: "https://www.youtube.com/watch?v=c5xgejA5PCg",
        selected: false,
        logo: getFaviconUrl("krttv.com.tr"),
        domain: "krttv.com.tr",
      },
      {
        name: "Ekol TV",
        url: "https://www.youtube.com/watch?v=tR0n3m6FqKo",
        selected: false,
        logo: getFaviconUrl("ekoltv.com.tr"),
        domain: "ekoltv.com.tr",
      },
    ]
  },
  {
    category: "Bireysel",
    channels: [
      {
        name: "Cüneyt Özdemir",
        url: "UCkwHQ7DWv9aqEtvAOSO74dQ",
        selected: false,
        logo: 'https://yt3.googleusercontent.com/0TSZT9vsYB0e_xaJrshcWxKvyXoRsb-mxsG0q_aYMVnvXkpvCebGKqj8BxCCKvB9Zpdru6xFVNI=s160-c-k-c0x00ffffff-no-rj',
        domain: "youtube.com",
      },
      {
        name: "Nevşin Mengü",
        url: "UCrG27KDq7eW4YoEOYsalU9g",
        selected: false,
        logo: 'https://yt3.googleusercontent.com/ExwZQT3MhMC4ev2DfXuVMXHmez4r1RJY2f9W0-JSjrVaMVEXeVk3ON2JEjE_yMyQEbRWhvEytA=s160-c-k-c0x00ffffff-no-rj',
        domain: "youtube.com",
      },
      {
        name: "Fatih Altaylı",
        url: "UCdS7OE5qbJQc7AG4SwlTzKg",
        selected: false,
        logo: 'https://yt3.googleusercontent.com/G3zBIDAZJWh4tTzYmEug_is4j0lylOcRpAFy9z8dRl6tPJwHtpnnQ5pZ221oXdrd9H6q0UN8Og=s160-c-k-c0x00ffffff-no-rj',
        domain: "youtube.com",
      },
      {
        name: "Abdurrahman Uzun",
        url: "UC6VKNvOHFbjj41jiSQ5wfAw",
        selected: false,
        logo: 'https://yt3.googleusercontent.com/OayiO_TO1ZQO5ppGjs12B53as7VRXSxuVwbO2Ms-U58gSFUIJlk33unWqQcZbwefULS9Ud_o=s160-c-k-c0x00ffffff-no-rj',
        domain: "youtube.com",
      },
      {
        name: "Memduh Bayraktaroğlu",
        url: "UCjBaQrNHgLzwAqjfR0pxNWw",
        selected: false,
        logo: 'https://yt3.googleusercontent.com/JqFnCZTTyGZTRdt5zQ4r7woPsdg0EKoyJpkr7XaC48kgWxrEwyxaLNEQ5lw3pQheG2j7l8rb=s160-c-k-c0x00ffffff-no-rj',
        domain: "youtube.com",
      },
      {
        name: "Özlem Gürses",
        url: "UCojOP7HHZvM2nZz4Rwnd6-Q",
        selected: false,
        logo: 'https://yt3.googleusercontent.com/bedQgukAqCMYyGwITBXkpjnPzRXDzBWLLCPSmg3zWC1FWZFo01ldVh6OvSfZN16x1tBTsgeS=s160-c-k-c0x00ffffff-no-rj',
        domain: "youtube.com",
      },
    ]
  }
]

// Extract YouTube video ID from URL
function extractVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function getLiveVideoLink(channelId: string) {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      // Tarayıcı ortamında çalışıyoruz, https modülünü doğrudan kullanamayız
      // Bu durumda backend API'ye istek yapalım
      
      // İsteği kendi backend'imize yönlendirelim
      fetch(`/api/checkLiveStatus?channelId=${channelId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('API yanıt vermedi');
          }
          return response.json();
        })
        .then(data => {
          if (data.liveUrl) {
            resolve(data.liveUrl);
          } else {
            resolve(null);
          }
        })
        .catch(error => {
          reject(error);
        });
    } else {
      const options = {
        hostname: 'www.youtube.com',
        path: `/channel/${channelId}/live`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      };
 
      let html = '';
 
      const req = https.request(options, (res) => {
        res.on('data', (chunk) => {
          html += chunk;
        });
 
        res.on('end', () => {
          // HTML içinden canonical link'teki video ID'sini yakalamaya çalış
          const match = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
          if (match && match[1]) {
            resolve(`https://www.youtube.com/watch?v=${match[1]}`);
          } else {
            resolve(null); // canlı yayın yok demektir
          }
        });
      });
 
      req.on('error', (err) => {
        reject(err);
      });
 
      req.end();
    }
  });
}
// Language provider component
function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "tr">("tr")

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage === "en" || savedLanguage === "tr") {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Hook to use language context
function useLanguage() {
  return useContext(LanguageContext)
}

export default function Home() {
  return (
    <LanguageProvider>
      <MultiChannelViewer />
    </LanguageProvider>
  )
}

function MultiChannelViewer() {
  const { language, setLanguage, t } = useLanguage()
  const [channels, setChannels] = useState<CategoryType[]>(defaultChannels)
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [initialSelectionDone, setInitialSelectionDone] = useState(false)
  const [newChannelUrl, setNewChannelUrl] = useState("")
  const [newChannelName, setNewChannelName] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false)
  const [addedChannels, setAddedChannels] = useState<ChannelType[]>([])
  const [isCheckingLiveStatus, setIsCheckingLiveStatus] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved channels from localStorage on initial render
  useEffect(() => {
    const savedChannels = localStorage.getItem("channels")
    const savedSelectedChannels = localStorage.getItem("selectedChannels")
    const savedAddedChannels = localStorage.getItem("addedChannels")

    if (savedChannels) {
      setChannels(JSON.parse(savedChannels))
    }

    if (savedSelectedChannels) {
      const selectedChannelsData = JSON.parse(savedSelectedChannels);
      // Eğer kanal listesi boş değilse yükle, aksi takdirde varsayılan durumu koru
      if (selectedChannelsData && selectedChannelsData.length > 0) {
        setSelectedChannels(selectedChannelsData)
        setInitialSelectionDone(true)
      }
    }

    if (savedAddedChannels) {
      setAddedChannels(JSON.parse(savedAddedChannels))
    }
  }, [])

  // Save to localStorage when selections change
  useEffect(() => {
    if (selectedChannels.length > 0) {
      localStorage.setItem("selectedChannels", JSON.stringify(selectedChannels))
    } else {
      // Seçili kanal kalmadıysa localStorage'dan kaldır
      localStorage.removeItem("selectedChannels")
    }

    localStorage.setItem("channels", JSON.stringify(channels))
    localStorage.setItem("addedChannels", JSON.stringify(addedChannels))
  }, [selectedChannels, channels, addedChannels])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Toggle fullscreen for the entire container
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // Handle channel selection
  const toggleChannelSelection = async (categoryIndex: number, channelIndex: number) => {
    const updatedChannels = [...channels];
    const channel = updatedChannels[categoryIndex].channels[channelIndex];
    const isBeingSelected = !channel.selected;
    
    // Bireysel kategorisi kontrolü
    if (updatedChannels[categoryIndex].category === "Bireysel" && isBeingSelected) {
      setIsCheckingLiveStatus(true);
      // Canlı olup olmadığını kontrol et
      channel.liveChecked = false; // Kontrole başladığını belirt
      updatedChannels[categoryIndex].channels[channelIndex] = { ...channel };
      setChannels(updatedChannels);
      
      try {
        // getLiveVideoLink ile canlı yayın linkini kontrol et
        const channelId = channel.url;

        const liveVideoUrl = await getLiveVideoLink(channelId);
        
        // Kontrol sonucunu işle
        const currentChannels = [...channels];
        const currentChannel = currentChannels[categoryIndex].channels[channelIndex];
        currentChannel.liveChecked = true;
        
        // liveVideoUrl bir string ise ve doluysa canlı kabul et
        if (liveVideoUrl && typeof liveVideoUrl === 'string') {
          // Canlı yayın var, URL'yi güncelle ve kanal seçimini etkinleştir
          currentChannel.url = liveVideoUrl;
          currentChannel.isLive = true;
          currentChannel.selected = isBeingSelected;
        } else {
          // Canlı yayın yoksa deaktif et
          currentChannel.isLive = false;
          currentChannel.selected = false;
        }
        
        currentChannels[categoryIndex].channels[channelIndex] = currentChannel;
        setChannels(currentChannels);
      } catch (error) {
        const currentChannels = [...channels];
        currentChannels[categoryIndex].channels[channelIndex].liveChecked = true;
        currentChannels[categoryIndex].channels[channelIndex].isLive = false;
        currentChannels[categoryIndex].channels[channelIndex].selected = false;
        setChannels(currentChannels);
      } finally {
        setIsCheckingLiveStatus(false);
      }
    } else {
      // Normal seçim davranışı
      channel.selected = isBeingSelected;
      updatedChannels[categoryIndex].channels[channelIndex] = channel;
      setChannels(updatedChannels);
    }
  };

  // Handle added channel selection
  const toggleAddedChannelSelection = (index: number) => {
    const updatedChannels = [...addedChannels]
    updatedChannels[index].selected = !updatedChannels[index].selected
    setAddedChannels(updatedChannels)
  }

  // Start watching selected channels
  const startWatching = () => {
    const selectedDefaultChannels = channels.flatMap(category => 
      category.channels.filter(channel => channel.selected)
    )
    const selectedAddedChannels = addedChannels.filter((channel) => channel.selected)
    setSelectedChannels([...selectedDefaultChannels, ...selectedAddedChannels])
    setInitialSelectionDone(true)
  }

  // Apply channel selection from sidebar
  const applyChannelSelection = () => {
    const selectedDefaultChannels = channels.flatMap(category => 
      category.channels.filter(channel => channel.selected)
    )
    const selectedAddedChannels = addedChannels.filter((channel) => channel.selected)
    setSelectedChannels([...selectedDefaultChannels, ...selectedAddedChannels])
    setSidebarOpen(false)
  }

  // Generate auto name for new channels
  const generateAutoName = () => {
    const addedCount = addedChannels.length + 1
    return `Eklenen ${addedCount}`
  }

  // Add a new channel from modal
  const addNewChannelFromModal = () => {
    if (newChannelUrl) {
      const videoId = extractVideoId(newChannelUrl)

      if (videoId) {
        const fullUrl = `https://www.youtube.com/watch?v=${videoId}`
        const channelName = newChannelName.trim() || generateAutoName()

        const newChannel = {
          name: channelName,
          url: fullUrl,
          selected: true, // Pre-select the newly added channel
          logo: "https://icons.duckduckgo.com/ip3/youtube.com.ico",
          domain: "example.com",
        }

        const updatedAddedChannels = [...addedChannels, newChannel]
        setAddedChannels(updatedAddedChannels)

        // Reset form
        setNewChannelUrl("")
        setNewChannelName("")
        setIsAddChannelModalOpen(false)
      } else {
        alert(t("invalidUrl"))
      }
    }
  }

  // Add a new channel from sidebar
  const addNewChannelFromSidebar = () => {
    if (newChannelUrl) {
      const videoId = extractVideoId(newChannelUrl)

      if (videoId) {
        const fullUrl = `https://www.youtube.com/watch?v=${videoId}`
        const channelName = newChannelName.trim() || generateAutoName()

        const newChannel = {
          name: channelName,
          url: fullUrl,
          selected: false,
          logo: "https://icons.duckduckgo.com/ip3/youtube.com.ico",
          domain: "example.com",
        }

        const updatedAddedChannels = [...addedChannels, newChannel]
        setAddedChannels(updatedAddedChannels)

        // Reset form
        setNewChannelUrl("")
        setNewChannelName("")
      } else {
        alert(t("invalidUrl"))
      }
    }
  }

  // Eklenen bir kanalı kaldır
  const removeAddedChannel = (index: number) => {
    const updatedChannels = [...addedChannels];
    updatedChannels.splice(index, 1);
    setAddedChannels(updatedChannels);
  }

  // Remove a channel from the viewing grid
  const removeChannel = (url: string) => {
    const updatedChannels = selectedChannels.filter((channel) => channel.url !== url)
    setSelectedChannels(updatedChannels)

    // If all channels are removed, show the selection screen again
    if (updatedChannels.length === 0) {
      setInitialSelectionDone(false)

      // Tüm kanallar kaldırıldığında localStorage'dan selectedChannels verisini sil
      localStorage.removeItem("selectedChannels")

      // Reset selection state in the channels list
      const resetDefaultChannels = channels.map(category => ({
        ...category,
        channels: category.channels.map(channel => ({
          ...channel,
          selected: false,
        }))
      }))

      const resetAddedChannels = addedChannels.map((channel) => ({
        ...channel,
        selected: false,
      }))

      setChannels(resetDefaultChannels)
      setAddedChannels(resetAddedChannels)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen h-screen bg-gray-900 text-white flex flex-col overflow-auto relative">
      {initialSelectionDone ? (
        <>
          <header className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h1 className="text-xl font-bold">{t("appTitle")}</h1>

            <div className="flex items-center gap-2">
              {/* Add Channel Button - Sadece seçili kanal yoksa göster */}
              {selectedChannels.length === 0 && (
                <Button variant="outline" onClick={() => setIsAddChannelModalOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t("addChannel")}
                </Button>
              )}
              
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem
                    className={`cursor-pointer text-white focus:bg-gray-700 focus:text-white ${language === "en" ? "bg-gray-700" : ""}`}
                    onClick={() => setLanguage("en")}
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`cursor-pointer text-white focus:bg-gray-700 focus:text-white ${language === "tr" ? "bg-gray-700" : ""}`}
                    onClick={() => setLanguage("tr")}
                  >
                    Türkçe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen Toggle */}
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>

              {/* Menu Button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[350px] sm:w-[450px] bg-gray-800 border-gray-700 p-6 overflow-y-auto"
                >
                  <SheetHeader className="mb-4">
                    <SheetTitle className="text-white">{t("channelSelection")}</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-2">
                      {/* Default channels */}
                      {channels.map((category, categoryIndex) => (
                        <div key={category.category} className="mb-8">
                          <h3 className="text-lg font-medium mb-3">
                            {category.category}
                            {category.category === "Bireysel" && isCheckingLiveStatus && (
                              <span className="ml-2 text-sm text-gray-400">({t("checkingLiveStatus")})</span>
                            )}
                          </h3>
                          <div className="grid grid-cols-1 gap-2 mb-6">
                            {category.channels.map((channel, channelIndex) => (
                              <div
                                key={channel.url}
                                className={`p-3 rounded-lg border ${
                                  channel.selected ? "border-blue-500 bg-gray-700" : "border-gray-700 bg-gray-800"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`sidebar-channel-${categoryIndex}-${channelIndex}`}
                                    checked={channel.selected}
                                    onCheckedChange={() => toggleChannelSelection(categoryIndex, channelIndex)}
                                    disabled={category.category === "Bireysel" && channel.liveChecked && !channel.isLive}
                                  />
                                  <Label 
                                    htmlFor={`sidebar-channel-${categoryIndex}-${channelIndex}`} 
                                    className={`flex-1 cursor-pointer flex items-center ${
                                      category.category === "Bireysel" && channel.liveChecked && !channel.isLive 
                                        ? "text-gray-500" 
                                        : ""
                                    }`}
                                  >
                                    {channel.name}
                                    {category.category === "Bireysel" && channel.liveChecked && (
                                      <span 
                                        className={`ml-2 inline-flex items-center`}
                                      >
                                        <span 
                                          className={`h-3 w-3 rounded-full ${
                                            channel.isLive 
                                              ? "bg-red-500 animate-pulse" 
                                              : "bg-gray-500"
                                          }`}
                                        ></span>
                                      </span>
                                    )}
                                  </Label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Added channels */}
                      {addedChannels.length > 0 && (
                        <>
                          <h3 className="text-sm font-medium mt-4 mb-2">{t("addedChannels")}</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {addedChannels.map((channel, index) => (
                              <div
                                key={`added-${channel.url}`}
                                className={`p-3 rounded-lg border ${
                                  channel.selected ? "border-blue-500 bg-gray-700" : "border-gray-700 bg-gray-800"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`sidebar-added-channel-${index}`}
                                    checked={channel.selected}
                                    onCheckedChange={() => toggleAddedChannelSelection(index)}
                                  />
                                  <Label htmlFor={`sidebar-added-channel-${index}`} className="flex-1 cursor-pointer">
                                    {channel.name}
                                  </Label>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-gray-400 hover:text-white hover:bg-red-500/20"
                                    onClick={() => removeAddedChannel(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="text-sm font-medium mb-2">{t("addNewChannel")}</h3>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="channelUrl">{t("youtubeUrl")}</Label>
                          <Input
                            id="channelUrl"
                            value={newChannelUrl}
                            onChange={(e) => setNewChannelUrl(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="channelName">{t("channelName")}</Label>
                          <Input
                            id="channelName"
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                            placeholder={t("channelNamePlaceholder")}
                          />
                        </div>
                        <Button onClick={addNewChannelFromSidebar} className="w-full">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          {t("addChannel")}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={applyChannelSelection}
                      disabled={
                        !channels.some(category => category.channels.some(channel => channel.selected)) &&
                        !addedChannels.some((channel) => channel.selected)
                      }
                      className="w-full mt-4"
                    >
                      {t("applySelection")}
                    </Button>
                  </div>
                  
                  {/* Kredilendirme - Sağ menüde */}
                  <div className="mt-6 pt-4 border-t border-gray-700 text-[10px] text-gray-500 opacity-70 hover:opacity-100 transition-opacity text-center">
                    <a 
                      href="https://x.com/ugurhanturker" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-gray-300 transition-colors"
                    >
                      ugurhanmt @ yomuvi
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <main className="flex-1 flex overflow-hidden">
            {selectedChannels.length > 0 ? (
              <VideoGrid channels={selectedChannels} onRemoveChannel={removeChannel} />
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <h2 className="text-xl font-semibold mb-4">{t("noChannels")}</h2>
                <p className="text-gray-400 mb-4">{t("selectFromMenu")}</p>
                <Button onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-4 w-4 mr-2" />
                  {t("openMenu")}
                </Button>
              </div>
            )}
          </main>
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          <header className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h1 className="text-xl font-bold">{t("appTitle")}</h1>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem
                  className={`cursor-pointer text-white focus:bg-gray-700 focus:text-white ${language === "en" ? "bg-gray-700" : ""}`}
                  onClick={() => setLanguage("en")}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`cursor-pointer text-white focus:bg-gray-700 focus:text-white ${language === "tr" ? "bg-gray-700" : ""}`}
                  onClick={() => setLanguage("tr")}
                >
                  Türkçe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 container mx-auto p-4 flex flex-col">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t("selectChannels")}</h2>
                <Button variant="outline" onClick={() => setIsAddChannelModalOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t("addChannel")}
                </Button>
              </div>

              {channels.map((category, categoryIndex) => (
                <div key={category.category} className="mb-8">
                  <h3 className="text-lg font-medium mb-3">
                    {category.category}
                    {category.category === "Bireysel" && isCheckingLiveStatus && (
                      <span className="ml-2 text-sm text-gray-400">({t("checkingLiveStatus")})</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {category.channels.map((channel, channelIndex) => (
                      <div
                        key={channel.url}
                        className={`p-3 rounded-lg border ${
                          channel.selected ? "border-blue-500 bg-gray-800" : "border-gray-700 bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`channel-${categoryIndex}-${channelIndex}`}
                            checked={channel.selected}
                            onCheckedChange={() => toggleChannelSelection(categoryIndex, channelIndex)}
                            disabled={category.category === "Bireysel" && channel.liveChecked && !channel.isLive}
                          />
                          <img
                            src={channel.logo || "https://icons.duckduckgo.com/ip3/youtube.com.ico"}
                            alt={channel.name}
                            className="w-8 h-8 rounded-full object-cover bg-white p-1"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "https://icons.duckduckgo.com/ip3/youtube.com.ico"
                            }}
                          />
                          <Label 
                            htmlFor={`channel-${categoryIndex}-${channelIndex}`} 
                            className={`flex-1 cursor-pointer flex items-center ${
                              category.category === "Bireysel" && channel.liveChecked && !channel.isLive 
                                ? "text-gray-500" 
                                : ""
                            }`}
                          >
                            {channel.name}
                            {category.category === "Bireysel" && channel.liveChecked && (
                              <span 
                                className={`ml-2 inline-flex items-center`}
                              >
                                <span 
                                  className={`h-3 w-3 rounded-full ${
                                    channel.isLive 
                                      ? "bg-red-500 animate-pulse" 
                                      : "bg-gray-500"
                                  }`}
                                ></span>
                              </span>
                            )}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Added channels section */}
              {addedChannels.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">{t("addedChannels")}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {addedChannels.map((channel, index) => (
                      <div
                        key={`added-${channel.url}`}
                        className={`p-3 rounded-lg border ${
                          channel.selected ? "border-blue-500 bg-gray-800" : "border-gray-700 bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`added-channel-${index}`}
                            checked={channel.selected}
                            onCheckedChange={() => toggleAddedChannelSelection(index)}
                          />
                          <img
                            src={channel.logo || "https://icons.duckduckgo.com/ip3/youtube.com.ico"}
                            alt={channel.name}
                            className="w-8 h-8 rounded-full object-cover bg-white p-1"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "https://icons.duckduckgo.com/ip3/youtube.com.ico"
                            }}
                          />
                          <Label htmlFor={`added-channel-${index}`} className="flex-1 cursor-pointer">
                            {channel.name}
                          </Label>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-red-500/20"
                            onClick={() => removeAddedChannel(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-between items-center">
                <Button
                  onClick={startWatching}
                  disabled={
                    !channels.some(category => category.channels.some(channel => channel.selected)) && 
                    !addedChannels.some((channel) => channel.selected)
                  }
                  className="ml-auto"
                >
                  {t("startWatching")}
                </Button>
              </div>
            </div>
          </main>

          {/* Add Channel Modal */}
          <Dialog open={isAddChannelModalOpen} onOpenChange={setIsAddChannelModalOpen}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>{t("addChannelTitle")}</DialogTitle>
                <DialogDescription className="text-gray-400">{t("addChannelDescription")}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-youtube-url">{t("youtubeUrl")}</Label>
                  <Input
                    id="modal-youtube-url"
                    value={newChannelUrl}
                    onChange={(e) => setNewChannelUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-channel-name">{t("channelName")}</Label>
                  <Input
                    id="modal-channel-name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder={t("channelNamePlaceholder")}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddChannelModalOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={addNewChannelFromModal}>{t("addChannel")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Kredilendirme - Footer */}
          <div className="mt-auto pt-4 text-[10px] text-gray-500 opacity-70 hover:opacity-100 transition-opacity text-center">
            <a 
              href="https://x.com/ugurhanturker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              ugurhanmt @ yomuvi
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

interface VideoGridProps {
  channels: ChannelType[]
  onRemoveChannel: (url: string) => void
}

function VideoGrid({ channels, onRemoveChannel }: VideoGridProps) {
  const { t } = useLanguage()
  const [activeSound, setActiveSound] = useState<string | null>(null)
  const [lockedSound, setLockedSound] = useState<string | null>(null)

  // Set initial sound to first channel
  useEffect(() => {
    if (channels.length > 0 && !activeSound && !lockedSound) {
      setActiveSound(channels[0].url)
    }
  }, [channels, activeSound, lockedSound])

  // Calculate grid columns based on number of videos
  const getGridCols = () => {
    const count = channels.length
    if (count <= 1) return "grid-cols-1"
    if (count <= 2) return "grid-cols-2"
    if (count <= 4) return "grid-cols-2"
    if (count <= 6) return "grid-cols-3"
    if (count <= 9) return "grid-cols-3"
    return "grid-cols-4"
  }

  // Handle mouse enter for a video
  const handleMouseEnter = (url: string) => {
    // Only change active sound if no sound is locked
    if (!lockedSound) {
      setActiveSound(url)
    }
  }

  // Toggle locked sound for a video
  const toggleLockSound = (url: string) => {
    if (lockedSound === url) {
      // Unlock if already locked
      setLockedSound(null)
      setActiveSound(url) // Keep this channel as active
    } else {
      // Lock this channel
      setLockedSound(url)
      setActiveSound(url)
    }
  }

  // Handle removing a channel
  const handleRemoveChannel = (url: string) => {
    // If we're removing the channel with locked or active sound, reset sound state
    if (lockedSound === url) {
      setLockedSound(null)
    }

    if (activeSound === url) {
      // Find another channel to set as active
      const otherChannel = channels.find((c) => c.url !== url)
      setActiveSound(otherChannel ? otherChannel.url : null)
    }

    onRemoveChannel(url)
  }

  return (
    <div className="w-full h-full p-1">
      <div className={`grid ${getGridCols()} gap-1 h-full`}>
        {channels.map((channel) => (
          <VideoPlayer
            key={channel.url}
            channel={channel}
            isMuted={activeSound !== channel.url}
            isLocked={lockedSound === channel.url}
            onMouseEnter={() => handleMouseEnter(channel.url)}
            onToggleLock={() => toggleLockSound(channel.url)}
            onRemove={() => handleRemoveChannel(channel.url)}
          />
        ))}
      </div>
    </div>
  )
}

interface VideoPlayerProps {
  channel: ChannelType
  isMuted: boolean
  isLocked: boolean
  onMouseEnter: () => void
  onToggleLock: () => void
  onRemove: () => void
}

function VideoPlayer({ channel, isMuted, isLocked, onMouseEnter, onToggleLock, onRemove }: VideoPlayerProps) {
  const { t } = useLanguage()
  const videoId = extractVideoId(channel.url)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Use postMessage to control YouTube iframe API
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // Function to send commands to YouTube iframe
    const postMessage = (action: string) => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: action,
          args: [],
        }),
        "*",
      )
    }

    // Set volume based on mute state
    if (isMuted) {
      postMessage("mute")
    } else {
      postMessage("unMute")
    }
  }, [isMuted])

  if (!videoId) return null

  return (
    <div className="relative bg-black h-full w-full overflow-hidden" onMouseEnter={onMouseEnter}>
      {/* Channel name and close button */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-600 p-0"
          onClick={onRemove}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="bg-black/70 px-2 py-1 rounded text-sm flex items-center gap-2">
          <img
            src={channel.logo || "https://icons.duckduckgo.com/ip3/youtube.com.ico"}
            alt={channel.name}
            className="w-5 h-5 rounded-full bg-white p-0.5"
            onError={(e) => {
              // Fallback if favicon fails to load
              ;(e.target as HTMLImageElement).src = "https://icons.duckduckgo.com/ip3/youtube.com.ico"
            }}
          />
          {channel.name}
        </div>
      </div>

      {/* Sound control */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-black/70 px-3 py-2 rounded">
        {!isMuted ? <Volume2 className="h-5 w-5 text-green-400" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
        <div className="text-xs font-medium mr-1">{isLocked ? t("locked") : t("auto")}</div>
        <Checkbox
          checked={isLocked}
          onCheckedChange={() => onToggleLock()}
          className="h-5 w-5 data-[state=checked]:bg-green-500"
        />
      </div>

      <iframe
        ref={iframeRef}
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1&origin=${window.location.origin}`}
        title={channel.name}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

