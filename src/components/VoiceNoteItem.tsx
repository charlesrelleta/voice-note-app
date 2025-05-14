import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {transcribeAudio} from '../api/useTranscribe';
interface Props {
  note: {
    id: any;
    path: string;
    timestamp: string;
    transcription?: string;
  };
  onDelete: () => void;
  audioRecorderPlayer: any;
  updateNoteTranscription: (id: any, transcription: string) => void;
}

export const VoiceNoteItem: React.FC<Props> = ({
  note,
  onDelete,
  audioRecorderPlayer,
  updateNoteTranscription,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(1); // prevent NaN
  const [transcription, setTranscription] = useState<string | undefined>(
    note.transcription,
  );
  const [isTranscribing, setIsTranscribing] = useState(false);
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [audioRecorderPlayer]);

  const formatMillis = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  };

  const playNote = async () => {
    try {
      await audioRecorderPlayer.startPlayer(note.path);
      setIsPlaying(true);

      listenerRef.current = audioRecorderPlayer.addPlayBackListener(
        (e: {
          duration: React.SetStateAction<number>;
          currentPosition: React.SetStateAction<number>;
          isFinished: any;
        }) => {
          if (e.duration && !isNaN(Number(e.duration))) {
            setDuration(Number(e.duration));
            setCurrentPosition(Number(e.currentPosition));
          }

          if (e.isFinished) {
            audioRecorderPlayer.removePlayBackListener();
            setIsPlaying(false);
            setCurrentPosition(0);
            setDuration(1); // reset duration to prevent NaN
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
          }
        },
      );
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const pauseNote = async () => {
    try {
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
    } catch (err) {
      console.error('Pause error:', err);
    }
  };

  const resumeNote = async () => {
    try {
      await audioRecorderPlayer.resumePlayer();
      setIsPlaying(true);
    } catch (err) {
      console.error('Resume error:', err);
    }
  };

  const stopNote = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setCurrentPosition(0);
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  const isNew = () => {
    const created = new Date(note.timestamp).getTime();
    const now = new Date().getTime();
    return now - created < 60 * 1000;
  };
  const handleTranscription = async () => {
    setIsTranscribing(true);
    if (!note.transcription) {
      try {
        const text = await transcribeAudio(note.path);
        setTranscription(text ?? '');

        updateNoteTranscription(note.id, text);

        console.log('Transcription updated in AsyncStorage');
      } catch (error) {
        console.error('Transcription failed:', error);
        setTranscription('Transcription failed');
      } finally {
        setIsTranscribing(false);
      }
    }
  };
  return (
    <View style={styles.note}>
      <View style={styles.header}>
        <Text style={styles.timestamp}>
          {new Date(note.timestamp).toUTCString()}
        </Text>
        {isNew() && <Text style={styles.newBadge}>NEW</Text>}
      </View>

      <View style={styles.controls}>
        {isPlaying ? (
          <View style={styles.rowEvenly}>
            <Button title="Pause" onPress={pauseNote} />
            <Button title="Stop" onPress={stopNote} />
          </View>
        ) : currentPosition > 0 ? (
          <View style={styles.rowEvenly}>
            <Button title="Resume" onPress={resumeNote} />
            <Button title="Stop" onPress={stopNote} />
          </View>
        ) : (
          <Button title="Play" onPress={playNote} />
        )}
      </View>

      <View style={styles.progress}>
        <Text>{formatMillis(currentPosition)}</Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${(currentPosition / duration) * 100}%`,
              },
            ]}
          />
        </View>
        <Text>{formatMillis(duration)}</Text>
      </View>

      <View style={styles.transcription}>
        <View style={styles.transcription}>
          {transcription ? (
            <Text style={styles.transcriptionText}>{transcription}</Text>
          ) : isTranscribing ? (
            <Text style={styles.transcriptionText}>Transcribing...</Text>
          ) : (
            <Button title="Transcribe" onPress={handleTranscription} />
          )}
        </View>
      </View>

      <View style={styles.deleteButton}>
        <Button title="Delete" onPress={onDelete} color="#d11a2a" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  note: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timestamp: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  newBadge: {
    backgroundColor: 'red',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
    borderRadius: 3,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  deleteButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  transcription: {
    marginTop: 10,
  },
  transcriptionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
  },
  errorText: {
    color: 'red',
  },
  rowEvenly: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});
