import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Security, Info, Policy } from '@mui/icons-material';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-6">
        <Container maxWidth="lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
            >
              <ArrowBack />
              Back to Home
            </button>
          </div>
          <Typography variant="h3" component="h1" className="font-bold mt-4">
            Privacy Policy
          </Typography>
          <Typography variant="h6" className="mt-2 opacity-90">
            Your privacy and data protection are our priority
          </Typography>
        </Container>
      </div>

      {/* Content */}
      <Container maxWidth="lg" className="py-12">
        <div className="max-w-4xl mx-auto">
          {/* Last Updated */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Info className="text-blue-600 text-3xl" />
                <div>
                  <Typography variant="h5" className="font-bold">
                    Last Updated
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    September 6, 2025
                  </Typography>
                </div>
              </div>
              <Typography variant="body1" className="text-gray-700">
                This Privacy Policy describes how CivicConnect collects, uses, and protects 
                your information when you use our civic engagement platform.
              </Typography>
            </CardContent>
          </Card>

          {/* Information Collection */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800 flex items-center gap-3">
                <Security className="text-green-600" />
                Information We Collect
              </Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="h6" className="font-semibold mb-2 text-blue-600">
                    Personal Information
                  </Typography>
                  <Typography variant="body1" className="text-gray-700">
                    We collect information you provide directly to us, such as when you create an account, 
                    report a civic issue, or contact us. This may include your name, email address, 
                    phone number, and location data.
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6" className="font-semibold mb-2 text-green-600">
                    Location Data
                  </Typography>
                  <Typography variant="body1" className="text-gray-700">
                    When you report civic issues, we collect precise location information to ensure 
                    accurate routing to appropriate municipal departments. This data is essential for 
                    effective issue resolution.
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6" className="font-semibold mb-2 text-orange-600">
                    Photos and Media
                  </Typography>
                  <Typography variant="body1" className="text-gray-700">
                    Photos uploaded with issue reports are stored securely and used only for 
                    documentation and resolution purposes. We do not use these images for any 
                    other commercial purposes.
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800 flex items-center gap-3">
                <Policy className="text-blue-600" />
                How We Use Your Information
              </Typography>
              <div className="space-y-3">
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  To process and route your civic issue reports to appropriate authorities
                </Typography>
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  To provide you with status updates and notifications about your reports
                </Typography>
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  To improve our services and identify patterns in civic issues
                </Typography>
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  To communicate with you about your account and our services
                </Typography>
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  To comply with legal obligations and maintain public safety
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800">
                Data Security
              </Typography>
              <Typography variant="body1" className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect 
                your personal information against unauthorized access, alteration, disclosure, or destruction.
              </Typography>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Typography variant="body1" className="text-blue-800">
                  <strong>Security Measures Include:</strong> Encrypted data transmission, secure server infrastructure, 
                  regular security audits, access controls, and staff training on data protection.
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800">
                Your Privacy Rights
              </Typography>
              <div className="space-y-3">
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-blue-600">Access:</strong> You can request access to your personal information
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-green-600">Correction:</strong> You can update or correct your information
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-orange-600">Deletion:</strong> You can request deletion of your account and data
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-purple-600">Portability:</strong> You can request a copy of your data
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800">
                Contact Us About Privacy
              </Typography>
              <Typography variant="body1" className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </Typography>
              <div className="space-y-2">
                <Typography variant="body1" className="text-gray-700">
                  <strong>Email:</strong> privacy@civicconnect.gov
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong>Phone:</strong> 1800-PRIVACY (1800-774-8229)
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong>Mail:</strong> Privacy Officer, Municipal Corporation, City Hall, Main Street, Your City, State - 000000
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Privacy;
