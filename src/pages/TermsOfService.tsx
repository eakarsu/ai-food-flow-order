
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-food-primary/10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-food-dark mb-2">Terms of Service</h1>
          <p className="text-gray-600 mb-6">Last updated: May 20, 2025</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="max-w-3xl mx-auto prose">
          <section className="mb-8">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing or using the BiteBot AI website, mobile application, or any other services provided by BiteBot AI (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2>Use of Services</h2>
            <p>
              BiteBot AI grants you a limited, non-exclusive, non-transferable, and revocable license to access and use the Services for personal, non-commercial purposes in accordance with these Terms.
            </p>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use the Services for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
              <li>Attempt to gain unauthorized access to any part of the Services</li>
              <li>Use any robot, spider, or other automated device to access the Services</li>
              <li>Create multiple accounts or impersonate any person or entity</li>
              <li>Use the Services in any manner that could disable, overburden, damage, or impair the Services</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2>User Accounts</h2>
            <p>
              You may need to create an account to use certain features of the Services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify BiteBot AI immediately of any unauthorized use of your account.
            </p>
            <p>
              BiteBot AI reserves the right to suspend or terminate your account at any time for any reason without notice or liability.
            </p>
          </section>
          
          <section className="mb-8">
            <h2>Orders and Payments</h2>
            <p>
              By placing an order through our Services, you agree to pay all charges associated with your order, including the price of the items, delivery fees, service fees, and applicable taxes. Payment must be made using an approved payment method.
            </p>
            <p>
              BiteBot AI reserves the right to refuse or cancel any order for any reason, including errors in product or pricing information. If we cancel an order for which you have already been charged, we will issue a refund.
            </p>
          </section>
          
          <section>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@bitebot.com<br />
              <strong>Address:</strong> 123 Food Street, Tasteville, TC 98765<br />
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
