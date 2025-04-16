// app/index.tsx (Expo Router)
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Image, TouchableOpacity, Linking } from 'react-native';
import { Audio } from 'expo-av';

// client credentials:
import { getAccessToken } from '../../utils/spotifyAuth.js';
import { searchSongs } from '../../utils/spotifySearch.js';

export default function IndexScreen() {
  // Local state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Mock states for your range and health tip
  const [vocalRange, setVocalRange] = useState<{ low: string; high: string } | null>(null);
  const [healthTip, setHealthTip] = useState('');
  const [recommended, setRecommended] = useState<any[]>([]);

  // Start Recording with expo-av
  const handleStart = async () => {
    try {
      setIsRecording(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Audio permission not granted!');
        setIsRecording(false);
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  // Stop recording + mock a vocal range + fetch songs
  const handleStop = async () => {
    setIsRecording(false);
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stored at', uri);

      // Reset the recording instance
      setRecording(null);

      // TODO: do pitch detection or store the file here
      // For now, mock a range + tip
      setVocalRange({ low: 'C3', high: 'G4' });
      setHealthTip('Make sure to warm up for those upper notes!');

      // Example: fetch from Spotify
      const token = await getAccessToken(); // or skip if you haven't set that up
      if (token) {
        const results = await searchSongs('belting female vocal', token);
        setRecommended(results);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // A small helper to render recommended tracks from Spotify
  function SpotifyResults() {
    return (
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.album.images[0]?.url }}
              style={styles.albumArt}
            />
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.artists[0]?.name}</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(item.external_urls.spotify)}
            >
              <Text style={{ color: 'blue' }}>Open in Spotify</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lyra RN 🎙</Text>

      {isRecording ? (
        <Button title="Stop Recording" onPress={handleStop} />
      ) : (
        <Button title="Start Recording" onPress={handleStart} />
      )}

      {vocalRange && (
        <View style={styles.infoBox}>
          <Text>Your Vocal Range: {vocalRange.low} – {vocalRange.high}</Text>
          <Text>{healthTip}</Text>
        </View>
      )}

      {recommended.length > 0 && <SpotifyResults />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
    borderRadius: 6,
    width: 300,
  },
  albumArt: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginBottom: 6,
  },
});
