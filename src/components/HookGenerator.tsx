
import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Zap, Filter, Copy, ListVideo } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

type HookPlatform = "youtube" | "tiktok" | "instagram" | "google";
type HookTone = "formal" | "friendly" | "casual" | "professional" | "diplomatic" | "confident" | "middleschool" | "highschool" | "academic" | "simplified" | "vivid" | "empathetic" | "luxury" | "engaging" | "direct" | "persuasive";

const TONE_ICONS: Record<HookTone, string> = {
  formal: "👔",
  friendly: "🙂",
  casual: "😎",
  professional: "💼",
  diplomatic: "🤝",
  confident: "💪",
  middleschool: "📕",
  highschool: "📗",
  academic: "🎓",
  simplified: "📖",
  vivid: "🦄",
  empathetic: "🤗",
  luxury: "💎",
  engaging: "👍",
  direct: "➡️",
  persuasive: "🎯"
};

const PLATFORM_ICONS: Record<HookPlatform, string> = {
  youtube: "📺",
  tiktok: "📱",
  instagram: "📸",
  google: "🔍"
};

export function HookGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<HookPlatform>("youtube");
  const [tone, setTone] = useState<HookTone>("engaging");
  const [isLoading, setIsLoading] = useState(false);
  const [hooks, setHooks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const isInIframe = () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  };

  const generateHooks = async () => {
    if (!topic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "We need a topic to generate hooks for you.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-hooks', {
        body: {
          topic,
          platform,
          tone
        }
      });

      if (error) throw error;
      setHooks(data.hooks);
      toast({
        title: "Hooks generated!",
        description: "Copy and use instantly to boost your content."
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      toast({
        title: "Error generating hooks",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (hook: string) => {
    navigator.clipboard.writeText(hook);
    toast({
      title: "Copied to clipboard!",
      description: "The hook has been copied to your clipboard."
    });
  };

  const copyAllHooks = () => {
    if (hooks.length === 0) return;
    const allHooks = hooks.join("\n\n");
    navigator.clipboard.writeText(allHooks);
    toast({
      title: "All hooks copied!",
      description: "All hooks have been copied to your clipboard."
    });
  };

  const inIframe = isInIframe();
  const cardClasses = inIframe ? "w-full max-w-full p-3 space-y-3 backdrop-blur-sm bg-white/95 my-1 mx-1" : "w-full max-w-2xl p-4 space-y-4 backdrop-blur-sm bg-indigo-50 my-2 mx-2";

  return <Card className={cardClasses}>
      <div className="space-y-2">
        <Input placeholder="Enter your topic or idea..." value={topic} onChange={e => setTopic(e.target.value)} className="w-full" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-2 md:justify-between py-0 mx-[5px] my-[36px]">
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto flex items-center gap-1 text-xs md:text-sm">
                <ListVideo className="h-3 w-3 md:h-4 md:w-4" />
                {PLATFORM_ICONS[platform]} {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup value={platform} onValueChange={value => setPlatform(value as HookPlatform)}>
                {Object.entries(PLATFORM_ICONS).map(([platformKey, icon]) => <DropdownMenuRadioItem key={platformKey} value={platformKey} className="capitalize text-xs md:text-sm">
                    {icon} {platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}
                  </DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto flex items-center gap-1 text-xs md:text-sm">
                <Filter className="h-3 w-3 md:h-4 md:w-4" />
                {TONE_ICONS[tone]} {tone.charAt(0).toUpperCase() + tone.slice(1)} Tone
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup value={tone} onValueChange={value => setTone(value as HookTone)}>
                {Object.entries(TONE_ICONS).map(([toneKey, icon]) => <DropdownMenuRadioItem key={toneKey} value={toneKey} className="capitalize text-xs md:text-sm">
                    {icon} {toneKey.charAt(0).toUpperCase() + toneKey.slice(1)}
                  </DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button 
          onClick={generateHooks} 
          disabled={isLoading} 
          className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-xs md:text-sm"
        >
          {isLoading ? (
            <>Loading...</>
          ) : (
            <>Generate Hooks <Zap className="ml-1 h-3 w-3 md:h-4 md:w-4" /></>
          )}
        </Button>
      </div>

      {/* Error message display */}
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-600 text-sm">
          <p className="font-semibold mb-1">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Text Hooks Section */}
      {hooks.length > 0 && <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-medium text-gray-900">Your viral-ready hooks 👇</h3>
            <Button variant="outline" size="sm" onClick={copyAllHooks} className="flex items-center gap-1 text-xs">
              <Copy className="h-3 w-3" /> Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {hooks.map((hook, index) => <div key={index} onClick={() => copyToClipboard(hook)} className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 text-xs md:text-sm">
                {hook}
              </div>)}
          </div>
        </div>}

      {/* What Is a Hook Section */}
      {/* <div className="mt-6 px-4 text-left text-sm text-gray-700 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">What Is a Hook?</h2>
        <p>
          A hook is the first sentence or idea that pulls your audience in. It's what makes someone stop scrolling, keep watching, or continue reading. In today's attention economy, a great hook can be the difference between going viral or getting ignored.
        </p>
        
        <h3 className="text-base font-semibold text-gray-900 mt-4">How the AI Hook Generator Works</h3>
        <p>
          Just type in your topic or idea, choose a platform (like YouTube or TikTok), pick a tone (e.g., engaging, professional, witty), and hit Generate Hooks. Our AI will instantly give you several high-performing hook suggestions, ready to copy and use.
        </p>
      </div> */}

      {/* Example Hooks and Why They Matter */}
      {/* <div className="mt-12 space-y-8 pb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Example Hooks That Convert</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">"I made $0 for 6 months straight, then this ONE change 10x'd my channel."</p>
                <span className="text-xs text-blue-600 mt-1 block">Perfect for: Business/Growth</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-700">"The 30-second morning habit that Japanese centenarians swear by..."</p>
                <span className="text-xs text-purple-600 mt-1 block">Perfect for: Health/Lifestyle</span>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700">"Watch a pro chef's reaction to the most viral cooking hack of 2024"</p>
                <span className="text-xs text-green-600 mt-1 block">Perfect for: Food/Entertainment</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Why Great Hooks Matter</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-blue-100 rounded-lg">📈</div>
                <div>
                  <h4 className="font-medium text-gray-900">Higher Watch Time</h4>
                  <p className="text-sm text-gray-600">Strong hooks keep viewers watching longer, boosting your content in algorithms</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-green-100 rounded-lg">🎯</div>
                <div>
                  <h4 className="font-medium text-gray-900">Better Engagement</h4>
                  <p className="text-sm text-gray-600">Compelling openings drive more likes, comments, and shares</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-purple-100 rounded-lg">🚀</div>
                <div>
                  <h4 className="font-medium text-gray-900">Faster Growth</h4>
                  <p className="text-sm text-gray-600">Hook-optimized content tends to perform better in recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pro Tips Section */}
        {/* <div className="space-y-4 bg-blue-50 p-5 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900">Pro Tips for Using Hooks</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex gap-2 items-start">
                <div className="text-xl">🔍</div>
                <div>
                  <h4 className="text-sm font-medium">Test Multiple Hooks</h4>
                  <p className="text-xs text-gray-600">Create 3-5 different hooks for the same content and test which performs best</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <div className="text-xl">⏱️</div>
                <div>
                  <h4 className="text-sm font-medium">Keep It Brief</h4>
                  <p className="text-xs text-gray-600">The best hooks deliver maximum impact in minimum words</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2 items-start">
                <div className="text-xl">🎭</div>
                <div>
                  <h4 className="text-sm font-medium">Match Your Brand Voice</h4>
                  <p className="text-xs text-gray-600">Adjust generated hooks to fit your unique style and audience</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <div className="text-xl">🔄</div>
                <div>
                  <h4 className="text-sm font-medium">Combine Text & Visual Hooks</h4>
                  <p className="text-xs text-gray-600">For maximum impact, pair a strong visual with compelling text</p>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      {/* </div> */}
    </Card>;
}
