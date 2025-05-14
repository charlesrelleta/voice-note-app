// useTranscribe.ts
import axios from 'axios';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer';

global.Buffer = global.Buffer || Buffer;

const baseUrl = 'https://api.assemblyai.com/v2';
const API_KEY = '6c5457124d944c7e8a19d0d3bf573334'; // Replace this securely

const headers = {
  authorization: API_KEY,
  'Content-Type': 'application/octet-stream',
};

export const transcribeAudio = async (filePath: string): Promise<string> => {
  try {
    // Step 1: Read audio file
    const audioData = await RNFS.readFile(filePath, 'base64');
    const base64Audio = Buffer.from(audioData, 'base64');

    const formData = new FormData();
    formData.append('file', `data:audio/mp3;base64,${base64Audio}`);
    // Step 2: Upload audio to AssemblyAI
    const uploadResponse = await axios.post(`${baseUrl}/upload`, base64Audio, {
      headers,
    });

    const uploadUrl = uploadResponse.data.upload_url;

    // Step 3: Send for transcription
    const data = {
      audio_url: uploadUrl,
      speech_model: 'slam-1',
    };

    const response = await axios.post(`${baseUrl}/transcript`, data, {
      headers: {
        authorization: API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const transcriptId = response.data.id;
    const pollingEndpoint = `${baseUrl}/transcript/${transcriptId}`;

    // Step 4: Poll for completion
    while (true) {
      const pollingResponse = await axios.get(pollingEndpoint, {
        headers: {
          authorization: API_KEY,
        },
      });

      const status = pollingResponse.data.status;
      if (status === 'completed') {
        return pollingResponse.data.text;
      } else if (status === 'error') {
        throw new Error(`Transcription failed: ${pollingResponse.data.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};
