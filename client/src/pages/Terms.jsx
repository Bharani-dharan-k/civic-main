import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Gavel, Security, Person } from '@mui/icons-material';

const Terms = () => {
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
            Terms of Service
          </Typography>
          <Typography variant="h6" className="mt-2 opacity-90">
            Terms and conditions for using CivicConnect
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
                <Gavel className="text-blue-600 text-3xl" />
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
                Please read these Terms of Service carefully before using the CivicConnect platform. 
                By accessing or using our service, you agree to be bound by these terms.
              </Typography>
            </CardContent>
          </Card>

          {/* Acceptance of Terms */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800 flex items-center gap-3">
                <Gavel className="text-green-600" />
                Acceptance of Terms
              </Typography>
              <Typography variant="body1" className="text-gray-700 mb-4">
                By accessing and using CivicConnect, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </Typography>
              <Typography variant="body1" className="text-gray-700">
                These terms apply to all users of the platform, including citizens, municipal staff, 
                administrators, and field workers.
              </Typography>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800 flex items-center gap-3">
                <Person className="text-blue-600" />
                User Accounts and Responsibilities
              </Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="h6" className="font-semibold mb-2 text-blue-600">
                    Account Creation
                  </Typography>
                  <Typography variant="body1" className="text-gray-700">
                    You must provide accurate, complete, and up-to-date information when creating 
                    your account. You are responsible for maintaining the security of your account 
                    credentials.
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6" className="font-semibold mb-2 text-green-600">
                    Appropriate Use
                  </Typography>
                  <Typography variant="body1" className="text-gray-700">
                    You agree to use CivicConnect only for legitimate civic reporting purposes. 
                    False reports, spam, or misuse of the platform is strictly prohibited.
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6" className="font-semibold mb-2 text-orange-600">
                    Content Responsibility
                  </Typography>
                  <Typography variant="body1" className="text-gray-700">
                    You are solely responsible for all content you submit, including photos, 
                    descriptions, and location data. Content must be truthful and relevant to 
                    civic issues.
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Usage */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800">
                Platform Usage Guidelines
              </Typography>
              <div className="space-y-3">
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  Report genuine civic issues that require municipal attention
                </Typography>
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Provide accurate location information and clear descriptions
                </Typography>
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  Upload relevant photos that help identify and resolve issues
                </Typography>
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  Respect privacy and avoid photographing individuals without consent
                </Typography>
                <Typography variant="body1" className="text-gray-700 flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  Do not submit duplicate reports for the same issue
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800 flex items-center gap-3">
                <Security className="text-red-600" />
                Prohibited Activities
              </Typography>
              <Typography variant="body1" className="text-gray-700 mb-4">
                The following activities are strictly prohibited when using CivicConnect:
              </Typography>
              <div className="space-y-3">
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-red-600">False Reporting:</strong> Submitting fake or misleading reports
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-red-600">Harassment:</strong> Using the platform to harass individuals or groups
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-red-600">Spam:</strong> Excessive or irrelevant submissions
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-red-600">Privacy Violation:</strong> Sharing personal information of others without consent
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong className="text-red-600">System Abuse:</strong> Attempting to hack, disrupt, or misuse platform features
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800">
                Service Availability and Modifications
              </Typography>
              <Typography variant="body1" className="text-gray-700 mb-4">
                CivicConnect strives to provide continuous service availability, but we do not 
                guarantee uninterrupted access. The platform may be temporarily unavailable for 
                maintenance, updates, or technical issues.
              </Typography>
              <Typography variant="body1" className="text-gray-700">
                We reserve the right to modify, suspend, or discontinue any aspect of the service 
                at any time, with or without notice. We may also update these terms periodically, 
                and continued use constitutes acceptance of the updated terms.
              </Typography>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800">
                Limitation of Liability
              </Typography>
              <Typography variant="body1" className="text-gray-700 mb-4">
                CivicConnect serves as a communication platform between citizens and municipal 
                authorities. We are not responsible for the resolution time, quality, or outcome 
                of reported civic issues.
              </Typography>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <Typography variant="body1" className="text-yellow-800">
                  <strong>Important:</strong> For emergency situations requiring immediate attention 
                  (fire, medical emergency, crime in progress), contact emergency services directly 
                  rather than using this platform.
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <Typography variant="h4" className="font-bold mb-4 text-gray-800">
                Questions About Terms
              </Typography>
              <Typography variant="body1" className="text-gray-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </Typography>
              <div className="space-y-2">
                <Typography variant="body1" className="text-gray-700">
                  <strong>Email:</strong> legal@civicconnect.gov
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong>Phone:</strong> 1800-CIVIC-HELP (1800-248-4243)
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  <strong>Mail:</strong> Legal Department, Municipal Corporation, City Hall, Main Street, Your City, State - 000000
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Terms;
