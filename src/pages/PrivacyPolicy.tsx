
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-food-primary/10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-food-dark mb-2">Privacy Policy</h1>
          <p className="text-gray-600 mb-6">Last updated: May 20, 2025</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="max-w-3xl mx-auto prose">
          <section className="mb-8">
            <h2>Introduction</h2>
            <p>
              OrderlyBite AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by OrderlyBite AI when you use our website, mobile application, and other online products and services (collectively, the "Services").
            </p>
            <p>
              Please read this Privacy Policy carefully. By using our Services, you agree to the practices described in this policy. If you do not agree with our policies and practices, please do not use our Services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2>Information We Collect</h2>
            <p>We collect several types of information from and about users of our Services, including:</p>
            <ul>
              <li>
                <strong>Personal Information:</strong> We may collect your name, email address, postal address, phone number, payment information, and other information you provide when you create an account, place an order, or otherwise interact with our Services.
              </li>
              <li>
                <strong>Order Information:</strong> When you place an order, we collect information about the food you ordered, delivery address, special instructions, and payment details.
              </li>
              <li>
                <strong>Usage Data:</strong> We automatically collect information about your interactions with our Services, including the pages you visit, the features you use, and the time spent on our platform.
              </li>
              <li>
                <strong>Device Information:</strong> We collect information about your device, including IP address, browser type, operating system, and device identifiers.
              </li>
              <li>
                <strong>Location Data:</strong> With your consent, we may collect precise location data to provide location-based services, such as finding nearby restaurants.
              </li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Provide, maintain, and improve our Services</li>
              <li>Personalize your experience and deliver content and product offerings relevant to your interests</li>
              <li>Communicate with you about orders, promotions, and events</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Comply with our legal obligations</li>
            </ul>
          </section>
          
          <section>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> eakarsu@orderlybite.com<br />
              <strong>Address:</strong> 2807 Hampton Woods Dr Henrico 23233<br />
              <strong>Phone:</strong> 1 (804) 360-1129
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
