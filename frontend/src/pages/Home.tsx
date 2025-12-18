import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm bg-opacity-95">
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <img src={logo} alt="Synapse Logo" className="h-12 w-auto object-contain" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="px-5 py-2 text-black font-medium hover:text-gray-600 transition-colors duration-300">
                            Login
                        </Link>
                        <Link to="/register" className="btn-primary">
                            Register
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 animate-fade-in">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight animate-slide-up">
                        Learn Together,
                        <br />
                        <span className="text-gradient">Grow Together</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Synapse connects students in collaborative study groups, enabling knowledge sharing,
                        peer learning, and academic growth through an intuitive social platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link to="/register" className="btn-primary text-lg px-8 py-3">
                            Get Started
                        </Link>
                        <button className="btn-secondary text-lg px-8 py-3">
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* About Section - Group Study Features */}
            <section className="section-container bg-gray-50">
                <div className="text-center mb-16">
                    <h3 className="text-4xl md:text-5xl font-bold mb-4">Why Synapse?</h3>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        A revolutionary platform designed for collaborative learning and knowledge exchange
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="card animate-slide-in" style={{ animationDelay: '0.1s' }}>
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h4 className="text-2xl font-bold mb-3">Study Groups</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Create or join study groups based on subjects, courses, or topics. Collaborate with peers who share your academic goals and learning pace.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="card animate-slide-in" style={{ animationDelay: '0.2s' }}>
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="text-2xl font-bold mb-3">Knowledge Sharing</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Share notes, resources, and insights with your study community. Build a collective knowledge base that benefits everyone.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="card animate-slide-in" style={{ animationDelay: '0.3s' }}>
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h4 className="text-2xl font-bold mb-3">Real-time Updates</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Stay connected with instant notifications, live discussions, and real-time collaboration tools that keep your study sessions productive.
                        </p>
                    </div>
                </div>
            </section>

            {/* Post Feed Section */}
            <section className="section-container">
                <div className="text-center mb-16">
                    <h3 className="text-4xl md:text-5xl font-bold mb-4">Recent Activity</h3>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        See what your peers are learning and sharing
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Post 1 */}
                    <article className="post-card">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold">AK</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-bold text-lg">Alex Kumar</h5>
                                    <span className="text-sm text-gray-500">2 hours ago</span>
                                </div>
                                <p className="text-gray-700 mb-3">
                                    Just finished reviewing calculus derivatives! Here are my notes on the chain rule and product rule.
                                    Hope this helps anyone preparing for midterms 📚
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <button className="flex items-center space-x-2 hover:text-black transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span>24</span>
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-black transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>8</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Post 2 */}
                    <article className="post-card">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold">SM</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-bold text-lg">Sarah Martinez</h5>
                                    <span className="text-sm text-gray-500">5 hours ago</span>
                                </div>
                                <p className="text-gray-700 mb-3">
                                    Looking for study partners for the upcoming Physics exam! Anyone interested in forming a study group
                                    for quantum mechanics? Let's tackle this together! 🔬
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <button className="flex items-center space-x-2 hover:text-black transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span>42</span>
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-black transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>15</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Post 3 */}
                    <article className="post-card">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold">JP</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-bold text-lg">James Park</h5>
                                    <span className="text-sm text-gray-500">1 day ago</span>
                                </div>
                                <p className="text-gray-700 mb-3">
                                    Pro tip: Use the Feynman Technique when studying complex topics. Explain concepts in simple terms
                                    as if teaching someone else. It really helps solidify understanding! 💡
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <button className="flex items-center space-x-2 hover:text-black transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span>67</span>
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-black transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>22</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-12 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <img src={logo} alt="Synapse Logo" className="h-12 w-auto object-contain" />
                    </div>
                    <p className="text-gray-600 mb-6">
                        Empowering students through collaborative learning
                    </p>
                    <p className="text-sm text-gray-500">
                        © 2025 Synapse. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
