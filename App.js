import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Appearance,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MailComposer from 'expo-mail-composer';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [subject, setSubject] = useState('CREDIT');
  const isDarkMode = Appearance.getColorScheme() === 'dark';

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async (label) => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setCapturedPhotos((prevPhotos) => [
        ...prevPhotos,
        { uri: photo.uri, label },
      ]);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setCapturedPhotos((prevPhotos) => [
        ...prevPhotos,
        { uri: result.uri, label: 'License Plate' },
      ]);
    }
  };

  const clearPhotos = () => {
    setCapturedPhotos([]);
  };

  const sendEmail = async () => {
    if (capturedPhotos.length > 0) {
      const attachments = capturedPhotos.map((photo, index) => photo.uri);

      try {
        const isAvailable = await MailComposer.isAvailableAsync();

        if (isAvailable) {
          const mailOptions = {
            recipients: ['info@evo.ca'],
            subject: subject,
            body: 'Thank you!',
            isHtml: false,
            attachments: attachments,
          };

          await MailComposer.composeAsync(mailOptions);
          console.log('Email sent successfully!');
        } else {
          console.log('Email composer is not available on this device.');
        }
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  };

  if (hasCameraPermission === null) {
    return <View />;
  }

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
      <ScrollView
          contentContainerStyle={[
            styles.container,
            isDarkMode && styles.darkContainer,
          ]}
      >
        <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ref={(ref) => setCamera(ref)}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[styles.button, isDarkMode && styles.darkButton]}
                onPress={() => takePicture('Receipt')}
            >
              <Text style={[styles.text, isDarkMode && styles.darkText]}>
                Take Receipt Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, isDarkMode && styles.darkButton]}
                onPress={() => takePicture('License Plate')}
            >
              <Text style={[styles.text, isDarkMode && styles.darkText]}>
                Take License Plate Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, isDarkMode && styles.darkButton]}
                onPress={clearPhotos}
            >
              <Text style={[styles.text, isDarkMode && styles.darkText]}>
                Clear Photos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, isDarkMode && styles.darkButton]}
                onPress={sendEmail}
            >
              <Text style={[styles.text, isDarkMode && styles.darkText]}>
                Send Email
              </Text>
            </TouchableOpacity>
          </View>
        </Camera>
        <View style={styles.imageContainer}>
          {capturedPhotos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Text style={[styles.labelText, isDarkMode && styles.darkLabelText]}>
                  {photo.label}
                </Text>
                <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              </View>
          ))}
        </View>
        <View style={styles.subjectInputContainer}>
          <Text style={[styles.labelText, isDarkMode && styles.darkLabelText]}>
            Subject:
          </Text>
          <TextInput
              style={[
                styles.subjectInput,
                isDarkMode && styles.darkSubjectInput,
              ]}
              value={subject}
              onChangeText={(text) => setSubject(text)}
          />
        </View>
      </ScrollView>
  );
}

const commonStyles = {
  borderRadius: 8,
  marginVertical: 10,
  paddingHorizontal: 20,
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 0.24,
    padding: 10,
    backgroundColor: '#4285F4',
    ...commonStyles,
  },
  darkButton: {
    backgroundColor: '#1a1a1a',
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
  darkText: {
    color: '#d1d1d1',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoContainer: {
    marginBottom: 20,
  },
  labelText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  darkLabelText: {
    color: '#d1d1d1',
  },
  previewImage: {
    width: 300,
    height: 300,
    ...commonStyles,
  },
  subjectInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    ...commonStyles,
  },
  subjectInput: {
    flex: 1,
    marginLeft: 10,
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  darkSubjectInput: {
    backgroundColor: '#1a1a1a',
    color: '#d1d1d1',
  },
});
