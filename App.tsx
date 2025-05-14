import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {VoiceNoteItem} from './src/components/VoiceNoteItem';
import RNFS from 'react-native-fs';

const App = () => {
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [recording, setRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<any[]>([]);
  const audioPath = useRef<string>('');

  useEffect(() => {
    requestPermissions();
    loadNotes();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      if (
        granted['android.permission.RECORD_AUDIO'] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        Alert.alert('Permission denied to record audio');
      }
    }
  };

  const updateNoteTranscription = async (id: string, transcription: string) => {
    try {
      const updatedNotes = voiceNotes.map(note => {
        if (note.id === id) {
          return {...note, transcription};
        }
        return note;
      });
      setVoiceNotes(updatedNotes);
      await saveNotes(updatedNotes);
    } catch (error) {
      console.error('Error updating transcription:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem('voiceNotes');
      if (data) {
        setVoiceNotes(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load notes:', e);
    }
  };

  const saveNotes = async (notes: any) => {
    try {
      const jsonValue = JSON.stringify(notes);
      await AsyncStorage.setItem('voiceNotes', jsonValue);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const startRecording = async () => {
    const fileName = `note_${Date.now()}.mp3`;
    const path = Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/${fileName}`,
      android: `${RNFS.DownloadDirectoryPath}/${fileName}`,
    });

    if (!path) {
      return;
    }

    audioPath.current = path;
    setRecording(true);

    try {
      await audioRecorderPlayer.startRecorder(audioPath.current);
    } catch (err) {
      console.error('Recording error:', err);
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setRecording(false);

      const newNote = {
        id: Date.now().toString(),
        path: result,
        timestamp: new Date(),
        transcription: '',
      };

      const updatedNotes = [newNote, ...voiceNotes];
      setVoiceNotes(updatedNotes);
      saveNotes(updatedNotes);
    } catch (err) {
      console.error('Stop recording failed:', err);
    } finally {
      loadNotes();
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const updated = voiceNotes.filter(note => note.id !== id);
      setVoiceNotes(updated);
      saveNotes(updated);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      loadNotes();
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Notes</Text>
      <TouchableOpacity
        style={styles.recordingButton}
        onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.recordingText}>
          {recording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      {recording ? (
        <Text>Recording in Progress...</Text>
      ) : (
        <FlatList
          data={voiceNotes ?? []}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <VoiceNoteItem
              note={item}
              onDelete={() => deleteNote(item.id)}
              audioRecorderPlayer={audioRecorderPlayer}
              updateNoteTranscription={updateNoteTranscription}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  recordingButton: {
    height: 50,
    backgroundColor: 'primary',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  recordingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    overflow: 'hidden',
    elevation: 2,
  },
});

export default App;
