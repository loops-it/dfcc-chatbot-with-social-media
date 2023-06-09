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
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN; 
    const mode = req.query['hub.mode'];
    const token = req.query[`hub.verify_token`];
    const challenge = req.query['hub.challenge'];

    if (mode === "subscribe" && token === "dfcc-chat-bot-test_8_gH") {
      res.statusCode = 200;
      res.end(challenge);
    } else {
      res.statusCode = 403;
      res.end();
    }
  } else if (req.method === 'POST') {
    // Process incoming messages
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const APP_SECRET = process.env.APP_SECRET || ''; 
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; 

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
            console.log('Message sent successfully');
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
