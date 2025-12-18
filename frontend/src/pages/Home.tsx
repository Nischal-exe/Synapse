import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Home() {
    return (
        <div className="min-h-screen bg-background transition-colors duration-500 overflow-x-hidden">
            <Header />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[0%] left-[20%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-6 z-10">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold animate-fade-in tracking-wide uppercase">
                        The future of collaborative learning
                    </div>
                    <h2 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight animate-slide-up leading-[1.1]">
                        Learn Together,
                        <br />
                        <span className="text-gradient">Grow Together</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-slide-up [animation-delay:200ms]">
                        Synapse connects students in collaborative study groups, enabling knowledge sharing,
                        peer learning, and academic growth through an intuitive social platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up [animation-delay:400ms]">
                        <Link to="/register" className="btn-primary text-xl px-10 py-4 shadow-xl">
                            Unlock Your Potential
                        </Link>
                        <Link to="/login" className="btn-secondary text-xl px-10 py-4">
                            Log In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 px-6 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 animate-fade-in">
                        <h3 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Synapse?</h3>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Designed to streamline your academic journey through powerful collaboration.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card p-8 group transition-all duration-500 hover:-translate-y-2 hover:border-primary/50" style={{ animationDelay: '0.1s' }}>
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="text-2xl font-bold mb-4">Study Groups</h4>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Create or join study groups based on subjects, courses, or topics. Collaborate with peers who share your academic goals.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-8 group transition-all duration-500 hover:-translate-y-2 hover:border-primary/50" style={{ animationDelay: '0.2s' }}>
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="text-2xl font-bold mb-4">Knowledge Sharing</h4>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Share notes, resources, and insights with your study community. Build a collective knowledge base that benefits everyone.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-8 group transition-all duration-500 hover:-translate-y-2 hover:border-primary/50" style={{ animationDelay: '0.3s' }}>
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h4 className="text-2xl font-bold mb-4">Real-time Updates</h4>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Stay connected with instant notifications, live discussions, and real-time collaboration tools that keep sessions productive.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="relative py-20 px-6 z-10 border-t border-border bg-background/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="text-3xl font-extrabold mb-8 text-primary tracking-tighter">SYNAPSE</div>
                    <p className="text-muted-foreground mb-8 text-lg">
                        Empowering students through the power of collaboration.
                    </p>
                    <div className="text-sm text-muted-foreground/60">
                        © 2025 Synapse. All rights reserved. Made with ❤️ for students.
                    </div>
                </div>
            </footer>
        </div>
    );
}
