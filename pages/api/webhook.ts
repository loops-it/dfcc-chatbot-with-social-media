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
  // Parse the query params
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.statusCode = 403;
      res.end();
    }
  }
}
