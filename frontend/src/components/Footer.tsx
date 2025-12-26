import { Instagram, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative py-12 px-6 z-10 border-t border-primary/5 bg-background">
            <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-3 items-center gap-8 text-center md:text-left">

                {/* Left side: About & Instagram */}
                <div className="space-y-6 group">
                    <div>
                        <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] mb-2 font-sans">
                            About Synapse
                        </h4>
                        <p className="text-foreground/50 text-xs font-sans leading-relaxed max-w-[280px] mx-auto md:mx-0 font-medium italic opacity-80">
                            A minimalist space for collaborative learning—zero distractions, just meaningful academic growth.
                        </p>
                    </div>
                    <div>
                        <a
                            href="https://www.instagram.com/ig.synapse?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 text-foreground/30 hover:text-primary transition-all duration-500 group/link"
                        >
                            <div className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center group-hover/link:border-primary/30 group-hover/link:bg-primary/5 transition-all duration-500">
                                <Instagram className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-sans">Instagram</span>
                        </a>
                    </div>
                </div>

                {/* Middle: Removed as per request */}
                <div className="hidden md:block" />

                {/* Right side: Contact Us */}
                <div className="flex flex-col items-center gap-3 w-full md:items-center">
                    <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] font-sans">
                        Contact Us
                    </h4>
                    <a
                        href="mailto:synapsedesk@gmail.com"
                        className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-500 group/btn shadow-sm"
                    >
                        <Mail className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                        <span className="text-xs font-bold font-sans lowercase opacity-80">synapsedesk@gmail.com</span>
                    </a>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-primary/5 flex flex-col md:flex-row justify-center items-center gap-4">
                <div className="text-[9px] uppercase tracking-[0.4em] text-foreground/20 font-sans font-black">
                    @2025 Synapse
                </div>
            </div>
        </footer>
    );
}
