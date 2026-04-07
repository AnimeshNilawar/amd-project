import FoodAdvisor from "@/components/FoodAdvisor";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 pointer-events-none mix-blend-screen"></div>
      
      <div className="w-full max-w-5xl z-10 space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-brand-500/10 rounded-2xl mb-4 border border-brand-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <span className="text-brand-400 font-bold tracking-widest uppercase text-xs">AI-Powered</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-500 to-emerald-300 tracking-tight drop-shadow-sm">
            Smart Food Advisor
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Snap a photo or describe your meal. Get instant, accurate nutritional analysis and actionable advice tailored to your personal goals.
          </p>
        </header>

        <FoodAdvisor />
      </div>

      
    </main>
  );
}
