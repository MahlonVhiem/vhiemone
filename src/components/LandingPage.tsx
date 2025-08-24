import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

export function LandingPage() {
  const roles = [
    {
      id: "shopper" as const,
      title: "Shopper",
      description: "Connect with Christian businesses and find faith-based products and services in your community",
      icon: "🛍️",
      gradient: "from-blue-500 to-purple-600",
      features: [
        "Discover local Christian businesses",
        "Earn points for community engagement",
        "Share testimonies and prayers",
        "Connect with fellow believers"
      ]
    },
    {
      id: "business" as const,
      title: "Business Owner",
      description: "Share your Christian business and connect with the faith community",
      icon: "🏪",
      gradient: "from-green-500 to-blue-500",
      features: [
        "Showcase your Christian business",
        "Connect with local customers",
        "Build community relationships",
        "Share your business testimony"
      ]
    },
    {
      id: "delivery_driver" as const,
      title: "Delivery Driver",
      description: "Serve the community by providing delivery services with a heart for ministry",
      icon: "🚗",
      gradient: "from-yellow-500 to-orange-500",
      features: [
        "Serve your local community",
        "Earn points for deliveries",
        "Build meaningful connections",
        "Be a blessing through service"
      ]
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Show different content based on auth state */}
      <SignedIn>
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Welcome back to Vhiem!
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Continue your faith journey in the community
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
          >
            <span>Go to Dashboard</span>
            <span>→</span>
          </Link>
        </div>
      </SignedIn>

      <SignedOut>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent mb-6">
          Welcome to Vhiem
        </h2>
        <p className="text-2xl text-white/90 mb-4">
          A gamified social platform for followers of Jesus Christ
        </p>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Connect, share, and grow in faith while earning points and building community. 
          Choose your role and start your journey today!
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          Choose Your Path
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.id}
              className="group cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
            >
              <Link to="/signup" onClick={() => localStorage.setItem('vhiem-preselected-role', role.id)}>
              <div className={`bg-gradient-to-br ${role.gradient} p-8 rounded-2xl text-white h-full relative overflow-hidden border-2 border-transparent hover:border-yellow-400/50 transition-all duration-300`}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                
                {/* Click indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">→</span>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-6 group-hover:animate-bounce">{role.icon}</div>
                  <h4 className="text-2xl font-bold mb-4">{role.title}</h4>
                  <p className="text-white/90 mb-6 leading-relaxed">{role.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-white/80">
                        <span className="text-yellow-300">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Call to action */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center group-hover:bg-white/30 transition-colors duration-300">
                    <span className="font-bold text-sm">Click to Join as {role.title}</span>
                  </div>
                </div>
              </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-12">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          Why Join Vhiem?
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🙏</div>
            <h4 className="text-lg font-bold text-white mb-2">Faith Community</h4>
            <p className="text-white/70 text-sm">Connect with believers in your area</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-lg font-bold text-white mb-2">Gamified Experience</h4>
            <p className="text-white/70 text-sm">Earn points and level up your faith journey</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🏪</div>
            <h4 className="text-lg font-bold text-white mb-2">Local Business</h4>
            <p className="text-white/70 text-sm">Support Christian-owned businesses</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">❤️</div>
            <h4 className="text-lg font-bold text-white mb-2">Serve Others</h4>
            <p className="text-white/70 text-sm">Make a difference in your community</p>
          </div>
        </div>
      </div>

      {/* Alternative CTA */}
      <div className="text-center">
        <p className="text-white/60 text-lg mb-4">
          Ready to get started?
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center space-x-3 py-3 px-6 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
        >
          <span>👆</span>
          <span>Join the Community</span>
        </Link>
      </div>
      </SignedOut>
    </div>
  );
}