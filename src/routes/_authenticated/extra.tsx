import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Trash2, FileText, Plus, Image as ImageIcon, Type, Link as LinkIcon } from "lucide-react";
import { extraConfigStore, extraContentStore } from "@/stores";
import { uid } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/extra")({
  ssr: false,
  component: ExtraPage,
});

function ExtraPage() {
  const { isAdmin } = useAuth();
  const configList = extraConfigStore.use();
  const config = configList[0] || { id: "config", name: "Resources" };
  const contents = extraContentStore.use();

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(config.name);
  const [draftLocation, setDraftLocation] = useState<"toolbar" | "dropdown">(config.location || "dropdown");

  function saveName() {
    if (!draftName.trim()) return;
    if (configList.length === 0) {
      extraConfigStore.update(p => [{ id: "config", name: draftName.trim(), location: draftLocation }]);
    } else {
      extraConfigStore.update(p => p.map(x => x.id === "config" ? { ...x, name: draftName.trim(), location: draftLocation } : x));
    }
    setIsEditingName(false);
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-10 flex items-center gap-4">
          {isEditingName ? (
            <div className="flex flex-col gap-4">
              <input 
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                className="font-serif text-4xl glass rounded-xl px-4 py-2 bg-transparent outline-none"
                autoFocus
                onKeyDown={e => e.key === "Enter" && saveName()}
              />
              <div className="flex items-center gap-4">
                <select 
                  value={draftLocation} 
                  onChange={e => setDraftLocation(e.target.value as any)}
                  className="glass rounded-xl px-4 py-2 text-sm bg-transparent outline-none"
                >
                  <option value="dropdown">Show in Dropdown Menu</option>
                  <option value="toolbar">Show in Main Toolbar</option>
                </select>
                <button onClick={saveName} className="btn-phoenix px-6 py-2 rounded-full text-sm">Save Settings</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 group">
              <h1 className="font-serif text-4xl mt-1">{config.name}</h1>
              {isAdmin && (
                <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition text-rose-gold text-sm underline">
                  Rename
                </button>
              )}
            </div>
          )}
        </div>

        {isAdmin && <AdminAdder />}

        <div className="space-y-8">
          {contents.length === 0 && (
             <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
               Nothing here yet.
             </div>
          )}
          {contents.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(c => (
            <div key={c.id} className="relative group">
              {isAdmin && (
                <button 
                  onClick={() => { if(confirm("Delete this block?")) extraContentStore.update(p => p.filter(x => x.id !== c.id)) }} 
                  className="absolute -right-4 -top-4 z-10 p-2 glass rounded-full text-muted-foreground hover:text-crimson opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              {c.type === "text" && (
                <div className="glass-strong rounded-3xl p-6 md:p-8 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {c.content}
                </div>
              )}
              
              {c.type === "image" && (
                <div className="glass-strong rounded-3xl overflow-hidden p-2">
                  <img src={c.content} alt="Resource" className="w-full h-auto rounded-2xl object-cover" />
                </div>
              )}
              
              {c.type === "pdf" && (
                <a href={c.content} target="_blank" rel="noopener noreferrer" className="block glass-strong rounded-3xl p-6 hover:border-rose-gold/40 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-gold/10 text-rose-gold flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-serif text-xl">PDF Document</div>
                      <div className="text-sm text-muted-foreground mt-1">Click to view or download</div>
                    </div>
                  </div>
                </a>
              )}
              
              {c.type === "video" && (
                <div className="glass-strong rounded-3xl overflow-hidden p-2 aspect-video">
                  {c.content.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/) ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${c.content.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/)![1]}`} 
                      className="w-full h-full rounded-2xl border-0" 
                      allowFullScreen 
                    />
                  ) : (
                    <video src={c.content} controls className="w-full h-full rounded-2xl bg-black" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function AdminAdder() {
  const [type, setType] = useState<"text"|"image"|"pdf"|"video">("text");
  const [content, setContent] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    extraContentStore.update(p => [{
      id: uid(),
      type,
      content: content.trim(),
      createdAt: new Date().toISOString()
    }, ...p]);
    setContent("");
  }

  return (
    <form onSubmit={submit} className="glass-strong rounded-3xl p-6 mb-10">
      <div className="text-xs font-mono uppercase tracking-widest text-rose-gold mb-4">Admin: Add Block</div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button type="button" onClick={() => setType("text")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${type === "text" ? "bg-rose-gold text-white" : "glass"}`}>
          <Type className="w-4 h-4" /> Text
        </button>
        <button type="button" onClick={() => setType("image")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${type === "image" ? "bg-rose-gold text-white" : "glass"}`}>
          <ImageIcon className="w-4 h-4" /> Image URL
        </button>
        <button type="button" onClick={() => setType("pdf")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${type === "pdf" ? "bg-rose-gold text-white" : "glass"}`}>
          <LinkIcon className="w-4 h-4" /> PDF Link
        </button>
        <button type="button" onClick={() => setType("video")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${type === "video" ? "bg-rose-gold text-white" : "glass"}`}>
          <LinkIcon className="w-4 h-4" /> Video Link
        </button>
      </div>

      {type === "text" ? (
        <textarea 
          value={content} onChange={e => setContent(e.target.value)} 
          placeholder="Write your content here..." 
          rows={5}
          className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none resize-none mb-4" 
        />
      ) : (
        <input 
          value={content} onChange={e => setContent(e.target.value)} 
          placeholder={type === "image" ? "Paste image URL..." : type === "video" ? "Paste YouTube/Video URL..." : "Paste PDF link..."}
          className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none mb-4" 
        />
      )}

      <button type="submit" className="btn-phoenix px-6 py-2.5 rounded-full text-sm flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add to page
      </button>
    </form>
  );
}
