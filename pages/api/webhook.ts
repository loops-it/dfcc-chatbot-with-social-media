import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

interface WebhookRequestBody {
  object: string;
  entry: {
    id: string;
    time: number;
    messaging: {
      sender: {
        id: string;
      };
      message: {
        text: string;
      };
    }[];
  }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Verify the webhook
    const VERIFY_TOKEN = 'your-verification-token'; // Replace with your verification token
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
      res.statusCode = 200;
      res.end(challenge);
    } else {
      res.statusCode = 403;
      res.end();
    }
  } else if (req.method === 'POST') {
    // Process incoming messages
    const VERIFY_TOKEN = 'your-verification-token'; // Replace with your verification token
    const APP_SECRET = 'your-app-secret'; // Replace with your app secret
    const PAGE_ACCESS_TOKEN = 'your-page-access-token'; // Replace with your page access token

    const signature = req.headers['x-hub-signature'] as string;
    const [hashMethod, hash] = signature.split('=');
    const hmac = crypto.createHmac(hashMethod, APP_SECRET);
    hmac.update(await req.body.toString());
    const calculatedHash = hmac.digest('hex');

    if (hash === calculatedHash) {
      const body: WebhookRequestBody = JSON.parse(req.body);

      body.entry.forEach((entry) => {
        const { messaging } = entry;

        messaging.forEach(async (event) => {
          const senderId = event.sender.id;
          const messageText = event.message.text;

          // Add your logic here to process the incoming message and generate a response
          // You can use the "senderId" and "messageText" variables to access the user's message

          // Send a response back to the user
          const response = {
            recipient: {
              id: senderId,
            },
            message: {
              text: 'This is your chatbot response!',
            },
          };

          try {
            await fetch(`https://graph.facebook.com/v14.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            });
          } catch (error) {
            console.error('Error sending message:', error);
          }
        });
      });

      res.statusCode = 200;
      res.end();
    } else {
      res.statusCode = 403;
      res.end();
    }
  } else {
    res.statusCode = 404;
    res.end();
  }
}
