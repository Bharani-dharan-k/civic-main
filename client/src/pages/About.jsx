import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, People, Flag, Lightbulb } from '@mui/icons-material';

const About = () => {
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
            About CivicConnect
          </Typography>
          <Typography variant="h6" className="mt-2 opacity-90">
            Empowering citizens through technology-driven civic engagement
          </Typography>
        </Container>
      </div>

      {/* Content */}
      <Container maxWidth="lg" className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Typography variant="h4" component="h2" className="font-bold mb-6 text-gray-800">
              Our Mission
            </Typography>
            <Typography variant="body1" className="text-gray-600 text-lg leading-relaxed mb-8">
              CivicConnect is a comprehensive digital platform designed to bridge the gap between 
              citizens and municipal authorities. We believe that effective civic engagement is 
              the cornerstone of thriving communities, and technology can make this engagement 
              more accessible, transparent, and efficient.
            </Typography>

            <Typography variant="body1" className="text-gray-600 text-lg leading-relaxed mb-8">
              Our platform empowers citizens to report civic issues directly to the appropriate 
              authorities, track the progress of their reports, and participate actively in the 
              improvement of their neighborhoods. By providing real-time updates, transparent 
              communication, and data-driven insights, we're transforming how communities work 
              together to solve problems.
            </Typography>
          </div>

          <div>
            <Box className="space-y-6">
              <Card className="shadow-lg">
                <CardContent className="text-center p-6">
                  <People className="text-blue-600 text-6xl mb-4" />
                  <Typography variant="h5" className="font-bold mb-2">
                    Community First
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Every feature is designed with community needs at the center
                  </Typography>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="text-center p-6">
                  <Flag className="text-green-600 text-6xl mb-4" />
                  <Typography variant="h5" className="font-bold mb-2">
                    Results Driven
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Focused on delivering measurable improvements to civic life
                  </Typography>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="text-center p-6">
                  <Lightbulb className="text-orange-600 text-6xl mb-4" />
                  <Typography variant="h5" className="font-bold mb-2">
                    Innovation
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Leveraging cutting-edge technology for civic solutions
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </div>
        </div>

        {/* Features Section */}
        <Box className="mt-16">
          <Typography variant="h4" component="h2" className="font-bold mb-8 text-center text-gray-800">
            What Makes Us Different
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-bold mb-3 text-blue-600">
                    Real-time Tracking
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Monitor the progress of your civic reports from submission to resolution 
                    with live status updates and notifications.
                  </Typography>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-bold mb-3 text-green-600">
                    Smart Routing
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Issues are automatically routed to the appropriate municipal department 
                    based on location and category for faster resolution.
                  </Typography>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-bold mb-3 text-orange-600">
                    Data Insights
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Advanced analytics help administrators identify patterns and allocate 
                    resources more effectively for community improvement.
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </div>
        </Box>
      </Container>
    </div>
  );
};

export default About;
