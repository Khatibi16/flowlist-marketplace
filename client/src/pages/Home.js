import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Sparkles, 
  MessageCircle, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  Users,
  ShoppingBag
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Camera className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Listing",
      description: "Snap photos and get instant descriptions, pricing suggestions, and smart categorization."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "Chat-Based Shopping",
      description: "Guided shopping experience with mix-and-match styling and smart recommendations."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Smart Pricing",
      description: "AI-driven price optimization and market analysis for maximum sales potential."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Secure Transactions",
      description: "Safe and secure payment processing with buyer protection and seller guarantees."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Sellers" },
    { number: "50K+", label: "Products Listed" },
    { number: "95%", label: "AI Accuracy" },
    { number: "4.9★", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Turn Excess Stock Into
              <span className="block text-yellow-300">Sales</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              AI-driven marketplace helping retailers sell faster with intelligent automation, 
              smart pricing, and seamless buyer experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-purple-600 hover:bg-gray-100">
                Start Selling <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/buyer" className="btn border-2 border-white text-white hover:bg-white hover:text-purple-600">
                Start Shopping <ShoppingBag className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our multi-agent AI system automates listing, pricing, and customer interactions 
              to make resale fast, personalized, and profitable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How FlowList Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fast, and intelligent selling and buying experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Sellers */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Sellers</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p>Snap photos of your items</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p>AI generates descriptions and pricing</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p>List automatically across channels</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p>AI handles customer interactions</p>
                </div>
              </div>
            </div>

            {/* For Buyers */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Buyers</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p>Chat with AI shopping assistant</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p>Get personalized recommendations</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p>Mix and match styling options</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p>Secure checkout and delivery</p>
                </div>
              </div>
            </div>

            {/* AI Benefits */}
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Benefits</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <p>Automated listing generation</p>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <p>Dynamic pricing optimization</p>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <p>Intelligent customer support</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <p>Fraud detection and prevention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Retail Business?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of retailers already using FlowList to maximize their sales potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-purple-600 hover:bg-gray-100">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/buyer" className="btn border-2 border-white text-white hover:bg-white hover:text-purple-600">
              Explore Products <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
