import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Email, Phone, LocationOn, Send } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    toast.success('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

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
            Contact Us
          </Typography>
          <Typography variant="h6" className="mt-2 opacity-90">
            Get in touch with the CivicConnect team
          </Typography>
        </Container>
      </div>

      {/* Content */}
      <Container maxWidth="lg" className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <Typography variant="h4" component="h2" className="font-bold mb-6 text-gray-800">
              Get in Touch
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-8">
              Have questions about CivicConnect? Need technical support? Want to provide feedback? 
              We're here to help!
            </Typography>

            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Email className="text-blue-600 text-3xl" />
                    <div>
                      <Typography variant="h6" className="font-bold">
                        Email
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        support@civicconnect.gov
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Phone className="text-green-600 text-3xl" />
                    <div>
                      <Typography variant="h6" className="font-bold">
                        Phone
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        1800-CIVIC-HELP<br />
                        (1800-24842-4357)
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <LocationOn className="text-orange-600 text-3xl" />
                    <div>
                      <Typography variant="h6" className="font-bold">
                        Office
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Municipal Corporation<br />
                        City Hall, Main Street<br />
                        Your City, State - 000000
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <Typography variant="h4" component="h2" className="font-bold mb-6 text-gray-800">
                  Send us a Message
                </Typography>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </div>
                  </div>
                  
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                  
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Send />}
                    sx={{
                      backgroundColor: '#FF9933',
                      '&:hover': { backgroundColor: '#e6842d' },
                      borderRadius: '50px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem'
                    }}
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Box className="mt-8">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <Typography variant="h5" className="font-bold mb-6 text-gray-800">
                    Frequently Asked Questions
                  </Typography>
                  <div className="space-y-4">
                    <div>
                      <Typography variant="h6" className="font-semibold mb-2 text-blue-600">
                        How do I report a civic issue?
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Simply click on "Report an Issue" from the homepage, take a photo of the problem, 
                        add location details, and submit. You'll receive a tracking number to monitor progress.
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="h6" className="font-semibold mb-2 text-green-600">
                        How long does it take to resolve issues?
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Resolution times vary by issue type and complexity. Most minor issues are resolved 
                        within 3-7 business days, while major infrastructure issues may take longer.
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="h6" className="font-semibold mb-2 text-orange-600">
                        Can I track my report status?
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Yes! Log into your citizen dashboard to see real-time status updates, photos from 
                        field staff, and estimated completion times for all your reports.
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Contact;
