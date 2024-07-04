import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Pressable, Modal, Animated, Vibration } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { validate as validateUUID } from 'uuid';
import { supabase } from '../utils/supabase';
import { Ionicons } from '@expo/vector-icons';

// Custom styling
import { Buttons } from '../constants/Buttons';
import { Modals } from '../constants/Modals';
import { Texts } from '../constants/Texts';


export default function Scan() {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(true);
	const [data, setData] = useState(null);
	const [scamModalVisible, setScamModalVisible] = useState(false);
	const [successModalVisible, setSuccessModalVisible] = useState(false);
	const [alreadyValidatedModalVisible, setAlreadyValidatedModalVisible] = useState(false);
	const [notValidModalVisible, setNotValidModalVisible] = useState(false);
	const [otherOrganizationModalVisible, setOtherOrganizationModalVisible] = useState(false);

	const shakeAnimationValue = new Animated.Value(0);

	const SCAM_PATTERN = [
		5,
		1 * 50,
		5,
		1 * 100,
		5,
		1 * 50,
		5,
		1 * 100,
		5,
		1 * 50,
		1 * 500,
	];

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
		Vibration.vibrate(100);
		setScanned(true);
		// Check if the scanned data is a valid UUID
		if (!validateUUID(data)) {
			setScamModalVisible(true);
			Vibration.vibrate(SCAM_PATTERN, true);
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
					setSuccessModalVisible(true);
				} else if(supabaseData.status === 'already_validated') {
					setAlreadyValidatedModalVisible(true);
				} else if(supabaseData.status === 'wrong_organization') {
					setOtherOrganizationModalVisible(true);
				} else {
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

			<TouchableOpacity onPress={() => setScanned(false)} activeOpacity={0.8} style={[Buttons.button, { maxHeight: 250 }, scanned ? styles.buttonScanned : styles.buttonNotScanned]}>
				{ scanned ? <Text style={ Buttons.buttonText }>Scan again</Text> : <Text style={ Buttons.buttonText }>Scan...</Text> }
			</TouchableOpacity>

			<View>
				{/* Scam */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={scamModalVisible}
					onRequestClose={() => {
						setScamModalVisible(!scamModalVisible);
						Vibration.cancel();
					}}>
					<View style={styles.centeredView}>
						<View style={Modals.modalView}>
							<Animated.View style={[styles.iconWrapper, { transform: [{ translateX: shakeAnimationValue }] }]}>
								<Ionicons name="alert-circle" size={100} color="red" />
							</Animated.View>
							<Text style={Modals.modalTitle}>Possible scam attempt</Text>
							<Text style={Modals.modalText}>You scanned a QR code which is not by Tempqr. Please be cautious as this might be a scam attempt</Text>
							<Text style={Modals.modalText}>Someone might have been notified about this error</Text>
							<TouchableOpacity
								activeOpacity={0.8}
								style={[Buttons.button, { backgroundColor: 'red'}]}
								onPress={() => { setScamModalVisible(!scamModalVisible); Vibration.cancel() }}>
								<Text style={Buttons.buttonText}>Ok</Text>
							</TouchableOpacity>
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
						<View style={Modals.modalView}>
							<Ionicons name="checkmark-circle" size={100} color="green" />
							<Text style={Modals.modalTitle}>Success</Text>
							<Text style={Modals.modalText}>You scanned a valid QR code. The database has been notified and the qr has been marked as used</Text>
							<TouchableOpacity
								activeOpacity={0.8}
								style={[Buttons.button, { backgroundColor: 'green'}]}
								onPress={() => setSuccessModalVisible(!successModalVisible)}>
								<Text style={Buttons.buttonText}>Ok</Text>
							</TouchableOpacity>
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
						<View style={Modals.modalView}>
							<Ionicons name="arrow-undo-circle" size={100} color="orange" />
							<Text style={Modals.modalTitle}>Already Validated</Text>
							<Text style={Modals.modalText}>You scanned an already scanned QR code. This might be positive or negative according to your implementation of TempQR</Text>
							<TouchableOpacity
								activeOpacity={0.8}
								style={[Buttons.button, { backgroundColor: 'orange'}]}
								onPress={() => setAlreadyValidatedModalVisible(!alreadyValidatedModalVisible)}>
								<Text style={Buttons.buttonText}>Ok</Text>
							</TouchableOpacity>
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
						<View style={Modals.modalView}>
							<Ionicons name="close-circle" size={100} color="red" />
							<Text style={Modals.modalTitle}>Error</Text>
							<Text style={Modals.modalText}>You scanned an invalid qr code. The content is plausible, but the database does not contain it</Text>
							<Text style={Modals.modalText}>Someone might have been notified about this error</Text>
							<TouchableOpacity
								activeOpacity={0.8}
								style={[Buttons.button, { backgroundColor: 'red'}]}
								onPress={() => setNotValidModalVisible(!notValidModalVisible)}>
								<Text style={Buttons.buttonText}>Ok</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>


				{/* Qr Code by another organization */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={otherOrganizationModalVisible}
					onRequestClose={() => {
						setOtherOrganizationModalVisible(!otherOrganizationModalVisible);
					}}>
					<View style={styles.centeredView}>
						<View style={Modals.modalView}>
							<Ionicons name="business" size={100} color="darkred" />
							<Text style={Modals.modalTitle}>Qr code not in your organization</Text>
							<Text style={Modals.modalText}>You scanned a valid qr code, but it's not in your organization. Try again with another TempQr account</Text>
							<Text style={Modals.modalText}>The qr code has <Text style={{fontWeight: 'bold'}}>not</Text> been marked as used</Text>
							<Text style={Modals.modalText}>Someone might have been notified about this error</Text>
							<TouchableOpacity
								activeOpacity={0.8}
								style={[Buttons.button, {backgroundColor: 'darkred'}]}
								onPress={() => setOtherOrganizationModalVisible(!otherOrganizationModalVisible)}>
								<Text style={Buttons.buttonText}>Ok</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
  	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
 	},
  	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
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