import React, { useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Buttons } from '../constants/Buttons';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  icon?: string;
  title: string;
  text: string;
  buttonColor: string;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ visible, onClose, icon, title, text, buttonColor }) => {
  const shakeAnimationValue = new Animated.Value(0);

  useEffect(() => {
    const shakeIcon = () => {
      shakeAnimationValue.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnimationValue, { toValue: 20, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimationValue, { toValue: -20, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimationValue, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimationValue, { toValue: -10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimationValue, { toValue: 0, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimationValue, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    };

    if (visible) {
      shakeIcon();
    } else {
      shakeAnimationValue.setValue(0);
    }

    return () => {
      shakeAnimationValue.setValue(0);
    };
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {icon && (
            <Animated.View style={[styles.iconWrapper, { transform: [{ translateX: shakeAnimationValue }] }]}>
              <Ionicons name={icon as any} size={100} color={buttonColor} />
            </Animated.View>
          )}
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{text}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[Buttons.button, { backgroundColor: buttonColor }]}
            onPress={onClose}
          >
            <Text style={Buttons.buttonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  iconWrapper: {
    marginBottom: 20,
  },

  modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
		width: 0,
		height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTitle: {
		marginBottom: 15,
		textAlign: 'center',
		fontSize: 24,
		fontWeight: 'bold',
	},
	modalText: {
		marginBottom: 15,
		textAlign: 'center',
		fontSize: 20,
	},
});

export default ModalComponent;
