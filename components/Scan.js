import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Pressable, Modal, Animated } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { validate as validateUUID } from 'uuid';
import { supabase } from '../utils/supabase';
import { Ionicons } from '@expo/vector-icons';


export default function Scan() {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(true);
	const [data, setData] = useState(null);
	const [scamModalVisible, setScamModalVisible] = useState(false);
	const [successModalVisible, setSuccessModalVisible] = useState(false);
	const [alreadyValidatedModalVisible, setAlreadyValidatedModalVisible] = useState(false);
	const [notValidModalVisible, setNotValidModalVisible] = useState(false);

	const shakeAnimationValue = new Animated.Value(0);

	useEffect(() => {
		const getCameraPermissions = async () => {
		  const { status } = await Camera.requestCameraPermissionsAsync();
		  setHasPermission(status === "granted");
		};
	
		getCameraPermissions();
	}, []);

	useEffect(() => {
		// Function to handle animation
		const shakeIcon = () => {
		  // Reset animation value
		  shakeAnimationValue.setValue(0);
	
		  // Shake animation sequence
		  Animated.loop(
			Animated.sequence([
				Animated.timing(shakeAnimationValue, { toValue: 20, duration: 50, useNativeDriver: true }),
				Animated.timing(shakeAnimationValue, { toValue: -20, duration: 100, useNativeDriver: true }),
				Animated.timing(shakeAnimationValue, { toValue: 10, duration: 50, useNativeDriver: true }),
				Animated.timing(shakeAnimationValue, { toValue: -10, duration: 100, useNativeDriver: true }),
				Animated.timing(shakeAnimationValue, { toValue: 0, duration: 50, useNativeDriver: true }),
				Animated.timing(shakeAnimationValue, { toValue: 0, duration: 500, useNativeDriver: true }),
			])
		  ).start()
		};
	
		// Start animation when scam modal becomes visible
		if (scamModalVisible) {
			shakeIcon();
		} else {
		// Stop animation and reset value when modal is hidden
		shakeAnimationValue.setValue(0);
		}
	  
		// Cleanup animation on component unmount or modal hide
		return () => {
		shakeAnimationValue.setValue(0);
		};
	  }, [scamModalVisible]);

	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	const handleBarCodeScanned = async ({ type, data }) => {
		setScanned(true);
		// Check if the scanned data is a valid UUID
		if (!validateUUID(data)) {
			setScamModalVisible(true);
			return;
		}
		
		console.log("the qr contains an uuid, checking...");
		
		
		try {
			const { data: supabaseData, error } = await supabase.rpc('check_qr', {qr_uuid: data})
			
			if (error) {
				throw error;
			} else {
				setData(supabaseData);
				console.log(supabaseData);

				if(supabaseData.status === 'ok') {
					console.log(`Qr exists`);
					setSuccessModalVisible(true);
				} else if(supabaseData.status === 'already_validated') {
					console.log(`Qr already validated`);
					setAlreadyValidatedModalVisible(true);
				} else {
					console.log(`Qr not exists`);
					setNotValidModalVisible(true);
				}
				
			}
		} catch (error) {
			console.error('Error fetching data from Supabase:', error.message);
		}
	};

	return (
		<View style={styles.container}>
			<CameraView
				onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
				barcodeScannerSettings={{
					barcodeTypes: ["qr", "pdf417"],
				}}
				style={{width: 430, height: 100, flex: 1}} // Very temporary fix, i hate this fix
			/>
			<View>
				{/* Scam */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={scamModalVisible}
					onRequestClose={() => {
						setScamModalVisible(!scamModalVisible);
					}}>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Animated.View style={[styles.iconWrapper, { transform: [{ translateX: shakeAnimationValue }] }]}>
								<Ionicons name="alert-circle" size={100} color="red" />
							</Animated.View>
							<Text style={styles.modalTitle}>Possible scam attempt</Text>
							<Text style={styles.modalText}>You scanned a QR code which is not by Tempqr. Please be cautious as this might be a scam attempt</Text>
							<Text style={styles.modalText}>Someone might have been notified about this error</Text>
							<Pressable
								style={[styles.button, { backgroundColor: 'red'}]}
								onPress={() => setScamModalVisible(!scamModalVisible)}>
								<Text style={styles.text}>Hide Modal</Text>
							</Pressable>
						</View>
					</View>
				</Modal>

				{/* Success */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={successModalVisible}
					onRequestClose={() => {
						setSuccessModalVisible(!successModalVisible);
					}}>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Ionicons name="checkmark-circle" size={100} color="green" />
							<Text style={styles.modalTitle}>Success</Text>
							<Text style={styles.modalText}>You scanned a valid QR code. The database has been notified and the qr has been marked as used</Text>
							<Pressable
								style={[styles.button, { backgroundColor: 'green'}]}
								onPress={() => setSuccessModalVisible(!successModalVisible)}>
								<Text style={styles.text}>Hide Modal</Text>
							</Pressable>
						</View>
					</View>
				</Modal>

				{/* Qr Code already validated */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={alreadyValidatedModalVisible}
					onRequestClose={() => {
						setAlreadyValidatedModalVisible(!alreadyValidatedModalVisible);
					}}>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Ionicons name="arrow-undo-circle" size={100} color="orange" />
							<Text style={styles.modalTitle}>Already Validated</Text>
							<Text style={styles.modalText}>You scanned an already scanned QR code. This might be positive or negative according to your implementation of TempQR</Text>
							<Pressable
								style={[styles.button, { backgroundColor: 'orange'}]}
								onPress={() => setAlreadyValidatedModalVisible(!alreadyValidatedModalVisible)}>
								<Text style={styles.text}>Hide Modal</Text>
							</Pressable>
						</View>
					</View>
				</Modal>

				{/* Qr Code not valid */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={notValidModalVisible}
					onRequestClose={() => {
						setNotValidModalVisible(!notValidModalVisible);
					}}>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Ionicons name="close-circle" size={100} color="red" />
							<Text style={styles.modalTitle}>Error</Text>
							<Text style={styles.modalText}>You scanned an invalid qr code. The content is plausible, but the database does not contain it</Text>
							<Text style={styles.modalText}>Someone might have been notified about this error</Text>
							<Pressable
								style={[styles.button, { backgroundColor: 'red'}]}
								onPress={() => setNotValidModalVisible(!notValidModalVisible)}>
								<Text style={styles.text}>Hide Modal</Text>
							</Pressable>
						</View>
					</View>
				</Modal>
			</View>



			<TouchableOpacity onPress={() => setScanned(false)} activeOpacity={0.8} style={[styles.button, { maxHeight: 250 }, scanned ? styles.buttonScanned : styles.buttonNotScanned]}>
				 { scanned ? <Text style={ styles.text }>Scan again</Text> : <Text style={ styles.text }>Scan...</Text> }
			</TouchableOpacity>

		</View>
	);
}

const styles = StyleSheet.create({
  	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
 	},
  	button: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 4,
		elevation: 3,
		backgroundColor: 'black',
  	},
  	text: {
		fontSize: 16,
		lineHeight: 21,
		fontWeight: 'bold',
		letterSpacing: 0.25,
		color: 'white',
  	},
  	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
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
	buttonScanned: {
		backgroundColor: 'blue',
	},
	buttonNotScanned: {
		backgroundColor: 'red',
	},
	iconWrapper: {
		marginBottom: 20,
	},
});