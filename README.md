Here’s the updated version of your **README** to include the transcription feature with a loading state:

---

# Voice Note App

A simple React Native app that allows users to record, play, pause, stop, skip forward/backward, and delete voice notes. The app also supports displaying timestamps for each note, adding a "NEW" badge for voice notes recorded in the last 60 seconds, and transcribing the audio to text.

## Features

- **Recording**: Start and stop audio recordings with a timestamp.
- **Playback**: Play, pause, stop, and skip forward/backward through the recording.
- **Progress**: See real-time progress of audio playback with a visual progress bar.
- **"NEW" Badge**: Automatically shows a "NEW" badge for voice notes recorded in the last 60 seconds.
- **Delete**: Option to delete voice notes.
- **Transcription**: Transcribe voice notes into text using speech-to-text functionality.
- **Permissions**: Requests the necessary permissions for recording audio and reading/writing to storage on Android.

## Tech Stack

- **React Native**: Framework for building the mobile app.
- **AudioRecorderPlayer**: Library for recording and playing audio.
- **AsyncStorage**: Stores voice notes locally on the device.
- **RNFS (React Native FS)**: For file system management and handling audio file paths.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/charlesrelleta/voice-note-app.git
   ```

2. **Install dependencies:**

   Navigate into the project directory and install the required packages:

   ```bash
   cd voice-note-app
   yarn install
   ```

   Or if you're using npm:

   ```bash
   npm install
   ```

3. **Install Android and iOS dependencies:**

   If you haven't already, install the necessary dependencies for Android and iOS:

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the app:**

   To run the app on a simulator/emulator or a physical device, use the following commands:

   For iOS:

   ```bash
   yarn ios
   ```

   Or for Android:

   ```bash
   yarn android
   ```

## Permissions

The app requires the following permissions:

- **Android**:

  - RECORD_AUDIO
  - WRITE_EXTERNAL_STORAGE
  - READ_EXTERNAL_STORAGE

  These permissions are requested when the app is first opened. Ensure that the user grants the permissions for the app to function correctly.

## App Flow

1. **Recording a note**:

   - Press "Start Recording" to begin recording.
   - Once done, press "Stop Recording" to save the note.
   - The note will be stored with a timestamp and file path.

2. **Playback**:

   - Press "Play" to listen to a recorded note.
   - During playback, you can press "Pause", "Stop", or "Skip Forward/Backward" (5 seconds).
   - The app displays a progress bar showing the current position and total duration of the note.

3. **"NEW" Badge**:

   - Any note created in the last 60 seconds will display a "NEW" badge next to its timestamp.

4. **Delete**:

   - Press "Delete" to remove a voice note from the list and from local storage.

5. **Transcription**:

   - Press "Transcribe" to convert the audio note to text.
   - During transcription, a loading state is displayed to inform the user that the audio is being transcribed.
   - Once the transcription is complete, the transcribed text will be shown below the audio controls, and the transcription will be saved in **AsyncStorage**.

   Example UI:

   ```tsx
   <View style={styles.transcription}>
     {transcription ? (
       <Text style={styles.transcriptionText}>{transcription}</Text>
     ) : isTranscribing ? (
       <View style={{flexDirection: 'row', alignItems: 'center'}}>
         <ActivityIndicator
           size="small"
           color="#000"
           style={{marginRight: 8}}
         />
         <Text>Transcribing...</Text>
       </View>
     ) : (
       <Button title="Transcribe" onPress={handleTranscription} />
     )}
   </View>
   ```

## Folder Structure

```bash
src/
├── components/
│   └── VoiceNoteItem.tsx        # Component for rendering each voice note
└── App.tsx                      # Main app file
```

## Future Enhancements

- **UI and Animation**

## LIMITS

https://www.assemblyai.com/docs/deployment/account-management#usage-limits
