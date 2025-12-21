    # Synapse Project Presentation Structure

    ## Slide 1: Title & Team

    **Project Name**: Synapse
    **Tagline**: *Synchronizing Minds, Amplifying Potential*

    *Team Members*:
    *   Nischal - Project Architect 
    *   Abhijeet - Backend Developer(FastAPI)
    *   Prateek - Frontend Developer(React)

    ---

    ## Slide 2: The Problem

    **"Why is online self-study so isolating?"**

    *   **The Issue**: 
        *   Students preparing for competitive exams (JEE, NEET, CAT) or learning programming often feel isolated.
        *   Doubts pile up with no instant resolution channel.
        *   Existing platforms like WhatsApp/Discord are distracted and disorganized; traditional LMS are static and boring.

    *   **Why we chose it**: 
        *   We recognized the "Loneliness Epidemic" in digital education.
        *   We wanted to bridge the gap between "Self-Paced Learning" and "Community Support".

    ---

    ## Slide 3: The Research & Insights

    **"What do students actually need?"**

    *   **Insight 1 (The Mental Health Crisis)**: In India, student suicides are rising (one every 42 minutes in 2020), with **isolation** and lack of support cited as primary causes among JEE/NEET aspirants.
    *   **Insight 2 (The Learning Pyramid)**: Research shows a **90% retention rate** when students teach others (Peer Learning), compared to only 5-10% for passive reading or lectures.
    *   **Insight 3 (The Distraction Trap)**: Online students are 2x more likely to multitask. Generic platforms like Discord/WhatsApp exacerbate this with constant non-study notifications.

    *   *(Sources: NCRB Data 2020 on Student Suicides; NTL Institute Learning Pyramid Study; NIH Study on E-learning & Isolation)*

    ---

    ## Slide 4: The Solution

    **"Synapse: The Collaborative Learning Collective"**

    *   **Overview**: A real-time, room-based web application where students join specific "Collectives" to learn together.
    *   **Key Features**:
        1.  **Dedicated Rooms**: Pre-configured spaces for JEE, 12th Boards, Programming, etc.
        2.  **Real-Time Chat**: Instant doubt resolution with peers (Socket/Polling based low-latency messaging).
        3.  **Resource Sharing**: Create structured posts to share notes, questions, and roadmaps.
        4.  **Community Vetting**: Upvote system to highlight high-quality answers and resources.

    *   **Tech Stack**: 
        *   **Frontend**: React + Vite + TailwindCSS (Glassmorphism Design).
        *   **Backend**: Python FastAPI (High performance async API).
        *   **Database**: PostgreSQL + Supabase (Scalable relational data).
        *   **Auth**: Secure JWT Authentication via Supabase.

    ---

    ## Slide 5: Future Roadmap (Extra Slide)

    **"What's Next for Synapse?"**

    1.  **Live Audio Rooms**: Voice channels for group study sessions.
    2.  **AI Doubt Assistant**: Integration of LLMs to provi    de hints when peers are offline.
    3.  **Pomodoro Timer Sync**: Shared study timers to synchronize work/break cycles for the whole room.
    4.  **Leaderboards**: Weekly gamification to reward the most helpful peer tutors.
