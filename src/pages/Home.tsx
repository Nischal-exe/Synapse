import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Home() {
    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-100/50 to-transparent dark:from-zinc-900/30 pointer-events-none" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h2 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight animate-slide-up text-zinc-900 dark:text-white">
                        Learn Together,
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">Grow Together</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Synapse connects students in collaborative study groups, enabling knowledge sharing,
                        peer learning, and academic growth through an intuitive social platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link to="/register" className="btn-primary text-lg px-8 py-3 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section - Group Study Features */}
            <section className="section-container bg-zinc-50 dark:bg-zinc-900/50">
                <div className="text-center mb-16">
                    <h3 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">Why Synapse?</h3>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        A revolutionary platform designed for collaborative learning and knowledge exchange
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="card animate-slide-in group dark:bg-black dark:border-zinc-800" style={{ animationDelay: '0.1s' }}>
                        <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h4 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">Study Groups</h4>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Create or join study groups based on subjects, courses, or topics. Collaborate with peers who share your academic goals.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="card animate-slide-in group dark:bg-black dark:border-zinc-800" style={{ animationDelay: '0.2s' }}>
                        <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">Knowledge Sharing</h4>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Share notes, resources, and insights with your study community. Build a collective knowledge base that benefits everyone.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="card animate-slide-in group dark:bg-black dark:border-zinc-800" style={{ animationDelay: '0.3s' }}>
                        <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h4 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">Real-time Updates</h4>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Stay connected with instant notifications, live discussions, and real-time collaboration tools that keep sessions productive.
                        </p>
                    </div>
                </div>
            </section>

            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 px-6 bg-zinc-50 dark:bg-zinc-900/30">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        Empowering students through collaborative learning
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-600">
                        © 2025 Synapse. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
