import { Link } from 'react-router-dom';
import Header from '../components/Header';

// Asset Imports
import concentrateImg from '../assets/concentrate.png';
import syncImg from '../assets/sync.png';
import resourceHubImg from '../assets/resource-hub.png';
import peerImg from '../assets/peer.png';
import easyImg from '../assets/easy.png';
import logo from '../assets/logo.png';

export default function Home() {
    return (
        <div className="min-h-screen bg-background transition-colors duration-500 overflow-x-hidden pt-20">
            <Header />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 px-6 z-10 border-b border-primary/10">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block px-6 py-2 mb-8 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-bold animate-fade-in tracking-[0.2em] uppercase">
                        Collab • Learn • Sync
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-bold mb-10 tracking-tight animate-slide-up leading-[0.9] text-foreground">
                        Crafting Future
                        <br />
                        Together.
                    </h1>
                    <p className="text-lg md:text-2xl text-foreground/70 mb-14 max-w-2xl mx-auto animate-slide-up [animation-delay:200ms] leading-relaxed px-4">
                        Synapse is a minimalist space for collaborative learning.
                        Zero distractions, just meaningful academic growth.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-slide-up [animation-delay:400ms]">
                        <Link to="/register" className="btn-primary text-lg px-12 py-5 uppercase tracking-widest">
                            Register
                        </Link>
                    </div>
                </div>
            </section>

            {/* Image Features Section (Mimicking the reference) */}
            <section className="relative py-32 px-6 z-10 bg-primary text-primary-foreground">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-12 md:20 leading-tight px-4">
                        Highlight quality, simplicity, <br className="hidden md:block" /> and artisan approach.
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 md:gap-16">
                        {[
                            { name: 'Pure Focus', desc: 'Zero distractions for your deep work sessions.', img: concentrateImg },
                            { name: 'Live Sync', desc: 'Real-time collaboration across all your devices.', img: syncImg },
                            { name: 'Resource Hub', desc: 'A central library for all your study materials.', img: resourceHubImg },
                            { name: 'Peer Support', desc: 'Learn from mentors and fellow students.', img: peerImg },
                            { name: 'Easy Path', desc: 'Streamlined workflows for academic success.', img: easyImg }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center space-y-6">
                                <div className="w-20 h-20 rounded-full border-2 border-primary-foreground/30 flex items-center justify-center overflow-hidden bg-white/10 group hover:scale-110 transition-transform duration-500">
                                    <img src={item.img} alt={item.name} className="w-12 h-12 object-contain brightness-0 invert" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest mb-2 font-sans">{item.name}</h4>
                                    <p className="text-[10px] uppercase tracking-wider opacity-60 leading-tight font-sans">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="relative py-32 px-6 z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8">Simple steps that feel personal & smooth</h2>
                        <Link to="/register" className="btn-primary mt-4 py-4 px-10">Register</Link>
                    </div>
                    <div className="space-y-16 py-10">
                        {[
                            { n: '01', t: 'Explore', d: 'Discover study groups tailored to your curriculum and academic interests.' },
                            { n: '02', t: 'Collaborate', d: 'Engage in real-time discussions and share valuable resources with your peers.' },
                            { n: '03', t: 'Achieve', d: 'Reach your academic goals through collective effort and shared wisdom.' }
                        ].map((step) => (
                            <div key={step.n} className="flex gap-12 items-start group">
                                <span className="text-4xl sm:text-6xl font-normal italic opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all duration-500 shrink-0">{step.n}</span>
                                <div className="pt-2">
                                    <h4 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-4 font-sans">{step.t}</h4>
                                    <p className="text-foreground/60 leading-relaxed font-sans text-sm max-w-sm">{step.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="relative py-24 px-6 z-10 border-t border-primary/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="h-10">
                        <img src={logo} alt="Synapse" className="h-full w-auto object-contain brightness-0" />
                    </div>
                    <div className="flex gap-12 text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 font-sans">
                        <Link to="#" className="hover:text-primary">About</Link>
                        <Link to="#" className="hover:text-primary">Contact</Link>
                        <Link to="#" className="hover:text-primary">Privacy</Link>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-foreground/30 font-sans">
                        © 2025 Collective Knowledge.
                    </div>
                </div>
            </footer>
        </div>
    );
}
