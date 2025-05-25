import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';

const About = () => {
  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About OrderlyBite",
    "description": "Learn about OrderlyBite's mission to revolutionize food ordering with AI technology",
    "url": "https://orderlybite.com/about"
  };

  return (
    <>
      <SEO
        title="About OrderlyBite - AI-Powered Food Ordering Revolution"
        description="Learn about OrderlyBite's mission to revolutionize food ordering with AI technology, SMS ordering, and phone ordering capabilities."
        keywords="about OrderlyBite, AI food ordering company, restaurant technology, food delivery innovation"
        structuredData={aboutStructuredData}
      />
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <div className="bg-food-primary/10 py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-food-dark mb-2">About OrderlyBite AI</h1>
            <p className="text-gray-600 mb-6">Learn about our mission to revolutionize food ordering</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs />
        </div>
        
        <main className="container mx-auto px-4 py-10 flex-grow">
          <div className="max-w-3xl mx-auto">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-food-dark mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4">
                BiteBot AI was founded in 2023 with a simple mission: make food ordering smarter and more personalized. 
                We combine cutting-edge AI technology with a passion for great food to create a platform that truly understands what you're craving.
              </p>
              <p className="text-gray-700">
                Our team of food enthusiasts and tech innovators works tirelessly to bring you recommendations that match your taste preferences, 
                dietary requirements, and mood - all while supporting local restaurants and food providers.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-food-dark mb-4">Our Vision</h2>
              <p className="text-gray-700">
                We envision a world where finding the perfect meal is effortless and delightful. By harnessing the power of artificial intelligence, 
                we're creating a future where food ordering is not just a transaction, but an experience tailored precisely to you.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-food-dark mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-food-primary mb-2">Customer First</h3>
                  <p className="text-gray-700">
                    Everything we do is designed with your satisfaction and convenience in mind.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-food-primary mb-2">Innovation</h3>
                  <p className="text-gray-700">
                    We continuously push the boundaries of what's possible with AI and food ordering.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-food-primary mb-2">Quality</h3>
                  <p className="text-gray-700">
                    We partner with the best restaurants to ensure every meal is exceptional.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-food-primary mb-2">Community</h3>
                  <p className="text-gray-700">
                    We support local businesses and foster connections through shared culinary experiences.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;
