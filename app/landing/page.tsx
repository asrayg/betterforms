import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mic, BarChart3, FileText, Zap, Shield, Share2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="BetterForms"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-primary-600">BetterForms</span>
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Create Forms with
            <span className="text-primary-600"> Voice Answers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Build beautiful forms like Google Forms, but with the power of voice recording and AI transcription. 
            Perfect for surveys, feedback, and data collection.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-lg font-medium flex items-center gap-2"
            >
              Start Creating Forms
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-lg font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create, share, and analyze forms
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 bg-primary-100 rounded-full w-fit mb-4">
              <Mic className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Voice Recording</h3>
            <p className="text-gray-600">
              Let respondents answer long questions with their voice. Automatic transcription powered by OpenAI Whisper.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 bg-blue-100 rounded-full w-fit mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Question Types</h3>
            <p className="text-gray-600">
              Short answer, long answer, multiple choice, checkbox, email, number, date, time, and linear scale.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 bg-green-100 rounded-full w-fit mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
            <p className="text-gray-600">
              View response trends, completion rates, and detailed analytics for each question.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 bg-yellow-100 rounded-full w-fit mb-4">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Form Builder</h3>
            <p className="text-gray-600">
              Drag-and-drop interface to create forms quickly. Add, reorder, and customize questions with ease.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 bg-purple-100 rounded-full w-fit mb-4">
              <Share2 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Shareable Links</h3>
            <p className="text-gray-600">
              Generate shareable links and QR codes. No sign-up required for respondents.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 bg-red-100 rounded-full w-fit mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your data is secure with Supabase. Control who can view and respond to your forms.
            </p>
          </div>
        </div>

        {/* Screenshot Features */}
        <div className="space-y-20">
          {/* Feature 1: Form Builder */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Intuitive Form Builder</h3>
              <p className="text-lg text-gray-600 mb-6">
                Create professional forms in minutes with our easy-to-use form builder. Add questions, 
                customize settings, and publish with just a few clicks.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">9 different question types</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Drag-and-drop reordering</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Form-wide settings and validation</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <Image
                src="/Screenshot 2025-11-27 at 8.37.11 PM.png"
                alt="Form Builder"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Feature 2: Analytics */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <Image
                src="/Screenshot 2025-11-27 at 8.37.40 PM.png"
                alt="Analytics Dashboard"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Powerful Analytics</h3>
              <p className="text-lg text-gray-600 mb-6">
                Get insights into your form performance with detailed analytics. Track responses, 
                completion rates, and response trends over time.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Response trends and charts</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Question-level analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Export data to CSV</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Form Submission */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Voice-Powered Responses</h3>
              <p className="text-lg text-gray-600 mb-6">
                Respondents can answer long questions by speaking. Our AI automatically transcribes 
                their voice, and they can edit the transcript before submitting.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">One-click voice recording</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Real-time transcription</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Editable transcripts</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <Image
                src="/Screenshot 2025-11-27 at 8.38.00 PM.png"
                alt="Form Submission with Voice"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Feature 4: Response Management */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <Image
                src="/Screenshot 2025-11-27 at 8.38.33 PM.png"
                alt="Response Management"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Response Management</h3>
              <p className="text-lg text-gray-600 mb-6">
                View and manage all responses in one place. Listen to audio recordings, 
                read transcripts, and export data for further analysis.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">View all responses in one place</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Play audio recordings</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <span className="text-gray-700">Export to CSV format</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Create your first form in minutes. No credit card required.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 rounded-md hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            Start Creating Forms
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="BetterForms"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
              <span className="text-lg font-semibold text-white">BetterForms</span>
            </div>
            <p className="text-sm">© 2025 BetterForms. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

