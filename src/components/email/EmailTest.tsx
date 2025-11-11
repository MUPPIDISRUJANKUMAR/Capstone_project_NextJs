'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export const EmailTest: React.FC = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: '',
    html: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendTestEmail = async () => {
    if (!formData.to || !formData.subject || !formData.text) {
      setResult({
        success: false,
        message: 'Please fill in all required fields (to, subject, text)'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          text: formData.text,
          html: formData.html || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Email sent successfully!',
          data: data
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to send email'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEmailConfig = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/email', {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok && data.configured) {
        setResult({
          success: true,
          message: `Email service is configured! Gmail user: ${data.gmailUser}`,
          data: data
        });
      } else {
        setResult({
          success: false,
          message: `Email service not configured: ${data.message || 'Unknown error'}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to check email configuration'
      });
    } finally {
      setLoading(false);
    }
  };

  const fillTestData = () => {
    setFormData({
      to: 'test@example.com',
      subject: 'Test Email from CampusConnect',
      text: 'This is a test email sent from the CampusConnect application using Gmail OAuth2 and Nodemailer.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Test Email</h2>
          <p>This is a <strong>test email</strong> sent from the CampusConnect application.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p>✅ Gmail OAuth2 authentication working</p>
            <p>✅ Nodemailer transporter configured</p>
            <p>✅ Email sent successfully</p>
          </div>
          <p>If you received this email, the email integration is working perfectly!</p>
        </div>
      `
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Test Component
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Check */}
          <div className="flex gap-2">
            <Button 
              onClick={checkEmailConfig} 
              variant="outline" 
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Email Configuration'}
            </Button>
            <Button 
              onClick={fillTestData} 
              variant="outline"
              disabled={loading}
            >
              Fill Test Data
            </Button>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                To Email *
              </label>
              <Input
                type="email"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="recipient@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subject *
              </label>
              <Input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Email subject"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Text Content *
              </label>
              <Textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Plain text content of the email"
                rows={4}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                HTML Content (optional)
              </label>
              <Textarea
                name="html"
                value={formData.html}
                onChange={handleInputChange}
                placeholder="HTML content of the email (optional)"
                rows={6}
                disabled={loading}
              />
            </div>
          </div>

          {/* Send Button */}
          <Button 
            onClick={sendTestEmail} 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Mail className="h-4 w-4 mr-2 animate-pulse" />
                Sending Email...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  <strong>{result.success ? 'Success' : 'Error'}:</strong> {result.message}
                  {result.data && (
                    <div className="mt-2 text-sm">
                      <strong>Message ID:</strong> {result.data.messageId}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Usage Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Usage Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Configure your Gmail OAuth2 credentials in .env.local</li>
              <li>Click "Check Email Configuration" to verify setup</li>
              <li>Fill in recipient email and content</li>
              <li>Click "Send Email" to test the functionality</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
